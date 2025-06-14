
import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { LipSyncForm }  from './components/LipSyncForm';
import { VoiceCloningForm } from './components/VoiceCloningForm';
import { JobStatusDisplay } from './components/JobStatusDisplay';
import { LoadingSpinner } from './components/LoadingSpinner';
import type { Job, Voice, Avatar, JobCreationPayload, VoiceClonePayload, SupportedLanguage, JobStatusUpdate } from './types';
import { JobStatus } from './types';
import { MOCK_LANGUAGES, MOCK_AVATARS, MOCK_VOICES, JOB_POLL_INTERVAL_MS } from './constants';
import * as LipSyncApiService from './services/lipSyncApiService';

const App: React.FC = () => {
  const [currentJob, setCurrentJob] = useState<Job | null>(null);
  const [voices, setVoices] = useState<Voice[]>([]);
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [languages, setLanguages] = useState<SupportedLanguage[]>(MOCK_LANGUAGES);
  
  const [isLoadingVoices, setIsLoadingVoices] = useState<boolean>(true);
  const [isLoadingAvatars, setIsLoadingAvatars] = useState<boolean>(true);
  const [isSubmittingJob, setIsSubmittingJob] = useState<boolean>(false);
  const [isCloningVoice, setIsCloningVoice] = useState<boolean>(false);
  const [appError, setAppError] = useState<string | null>(null);

  const fetchInitialData = useCallback(async () => {
    try {
      setAppError(null);
      setIsLoadingVoices(true);
      const fetchedVoices = await LipSyncApiService.getVoices();
      setVoices(fetchedVoices);
    } catch (error) {
      console.error("Failed to fetch voices:", error);
      setAppError("Failed to load voice data. Please try again later.");
      setVoices(MOCK_VOICES); // Fallback to mock data
    } finally {
      setIsLoadingVoices(false);
    }

    try {
      setIsLoadingAvatars(true);
      const fetchedAvatars = await LipSyncApiService.getAvatars();
      setAvatars(fetchedAvatars);
    } catch (error) {
      console.error("Failed to fetch avatars:", error);
      setAppError("Failed to load avatar data. Please try again later.");
      setAvatars(MOCK_AVATARS); // Fallback to mock data
    } finally {
      setIsLoadingAvatars(false);
    }
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const pollJobStatus = useCallback(async (jobId: string) => {
    try {
      const jobUpdate = await LipSyncApiService.getJobStatus(jobId);
      setCurrentJob(jobUpdate);
      if (jobUpdate.status !== JobStatus.COMPLETED && jobUpdate.status !== JobStatus.FAILED) {
        setTimeout(() => pollJobStatus(jobId), JOB_POLL_INTERVAL_MS);
      } else {
        setIsSubmittingJob(false); // Enable form again once job is terminal
      }
    } catch (error) {
      console.error("Failed to poll job status:", error);
      setAppError(`Failed to update job status for ${jobId}.`);
      setCurrentJob(prevJob => prevJob ? {...prevJob, status: JobStatus.FAILED, error_message: 'Polling failed'} : null);
      setIsSubmittingJob(false);
    }
  }, []);

  const handleJobSubmit = async (payload: JobCreationPayload) => {
    if (isSubmittingJob) return;
    setIsSubmittingJob(true);
    setAppError(null);
    setCurrentJob(null); // Clear previous job
    try {
      const initialJobStatus = await LipSyncApiService.submitLipSyncJob(payload);
      // Create a temporary job object to show "ACCEPTED" status immediately
      const tempJob: Job = {
        job_id: initialJobStatus.job_id,
        status: initialJobStatus.status,
        input_payload_echo: payload,
      };
      setCurrentJob(tempJob);
      if (initialJobStatus.status !== JobStatus.FAILED) { // Only poll if not immediately failed
        pollJobStatus(initialJobStatus.job_id);
      } else {
        setIsSubmittingJob(false); // if job failed on submission, stop loading
      }
    } catch (error) {
      console.error("Failed to submit job:", error);
      setAppError("Failed to submit lip-sync job. Please try again.");
      setIsSubmittingJob(false);
    }
  };

  const handleCloneVoice = async (payload: VoiceClonePayload): Promise<JobStatusUpdate> => {
    if (isCloningVoice) throw new Error("Voice cloning already in progress.");
    setIsCloningVoice(true);
    setAppError(null);
    try {
      const response = await LipSyncApiService.cloneVoice(payload);
      // Refresh voices list to include the new cloning voice
      const updatedVoices = await LipSyncApiService.getVoices();
      setVoices(updatedVoices);
      return { message: `Voice cloning initiated for "${payload.voice_name}". ID: ${response.voice_id}. Status: ${response.status}`, success: true };
    } catch (error) {
      console.error("Failed to clone voice:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error during voice cloning.";
      setAppError(`Voice cloning failed: ${errorMessage}`);
      return { message: `Voice cloning failed: ${errorMessage}`, success: false };
    } finally {
      setIsCloningVoice(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center p-4 selection:bg-sky-200 selection:text-sky-900">
      <Header />
      <main className="w-full max-w-6xl mt-8 space-y-12">
        {appError && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md shadow-md" role="alert">
            <p className="font-bold">Application Error</p>
            <p>{appError}</p>
          </div>
        )}

        {(isLoadingVoices || isLoadingAvatars) && <LoadingSpinner text="Loading initial data..." />}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <section id="lip-sync-form" aria-labelledby="lip-sync-heading" className="bg-white p-6 rounded-lg shadow-lg">
            <h2 id="lip-sync-heading" className="text-2xl font-semibold text-slate-700 mb-6 border-b pb-3">Create Lip-Sync Video</h2>
            <LipSyncForm
              voices={voices}
              avatars={avatars}
              languages={languages}
              onSubmit={handleJobSubmit}
              isLoading={isSubmittingJob || isLoadingVoices || isLoadingAvatars}
            />
          </section>
          
          <section id="job-status" aria-labelledby="job-status-heading" className="bg-white p-6 rounded-lg shadow-lg">
            <h2 id="job-status-heading" className="text-2xl font-semibold text-slate-700 mb-6 border-b pb-3">Job Status & Output</h2>
            <JobStatusDisplay job={currentJob} isLoading={isSubmittingJob && currentJob?.status !== JobStatus.COMPLETED && currentJob?.status !== JobStatus.FAILED} />
          </section>
        </div>

        <section id="voice-cloning-form" aria-labelledby="voice-cloning-heading" className="bg-white p-6 rounded-lg shadow-lg">
          <h2 id="voice-cloning-heading" className="text-2xl font-semibold text-slate-700 mb-6 border-b pb-3">Clone a Voice</h2>
          <VoiceCloningForm 
            onClone={handleCloneVoice} 
            isLoading={isCloningVoice}
            languages={languages}
          />
        </section>
        
        <footer className="text-center py-8 text-slate-500 text-sm">
          <p>&copy; {new Date().getFullYear()} AI Lip-Sync Studio. Inspired by Sync.so capabilities.</p>
          <p>This is a demo application. Actual AI processing is simulated.</p>
        </footer>
      </main>
    </div>
  );
};

export default App;
