
import type { Job, Voice, Avatar, JobCreationPayload, ClonedVoiceResponse, VoiceClonePayload } from '../types';
import { JobStatus, VoiceType } from '../types';
import { MOCK_VOICES, MOCK_AVATARS, SIMULATED_VIDEO_URL } from '../constants';

let jobsDB: Record<string, Job> = {};
let voicesDB: Voice[] = [...MOCK_VOICES]; // Initialize with mock data
let avatarsDB: Avatar[] = [...MOCK_AVATARS]; // Initialize with mock data
let nextJobId = 1;
let nextVoiceId = MOCK_VOICES.length + 1;

const simulateDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const submitLipSyncJob = async (payload: JobCreationPayload): Promise<{ job_id: string, status: JobStatus }> => {
  await simulateDelay(500); // Simulate network latency for submission
  const jobId = `job_${String(nextJobId++).padStart(3, '0')}`;
  
  const newJob: Job = {
    job_id: jobId,
    status: JobStatus.ACCEPTED,
    input_payload_echo: payload,
    progress: 0,
  };
  jobsDB[jobId] = newJob;

  // Simulate background processing
  (async () => {
    await simulateDelay(1500); // Initial processing delay
    jobsDB[jobId] = { ...jobsDB[jobId], status: JobStatus.PROCESSING, progress: 25 };

    await simulateDelay(3000);
    jobsDB[jobId] = { ...jobsDB[jobId], status: JobStatus.PROCESSING, progress: 60 };
    
    // Simulate potential failure for specific inputs (e.g., a certain video name)
    if (payload.video_input_url.includes("fail_case")) {
        await simulateDelay(1500);
        jobsDB[jobId] = { 
            ...jobsDB[jobId], 
            status: JobStatus.FAILED, 
            error_message: "Simulated processing failure: Invalid video content.",
            progress: 100 
        };
        return;
    }

    await simulateDelay(2500);
    jobsDB[jobId] = { 
      ...jobsDB[jobId], 
      status: JobStatus.COMPLETED, 
      output_video_url: SIMULATED_VIDEO_URL, // Use a generic placeholder video
      processing_time_seconds: (500 + 1500 + 3000 + 2500) / 1000,
      progress: 100
    };
  })();

  return { job_id: jobId, status: JobStatus.ACCEPTED };
};

export const getJobStatus = async (jobId: string): Promise<Job> => {
  await simulateDelay(300); // Simulate network latency for polling
  if (jobsDB[jobId]) {
    return jobsDB[jobId];
  }
  throw new Error(`Job with ID ${jobId} not found.`);
};

export const getVoices = async (): Promise<Voice[]> => {
  await simulateDelay(400);
  return [...voicesDB]; // Return a copy to prevent direct mutation
};

export const cloneVoice = async (payload: VoiceClonePayload): Promise<ClonedVoiceResponse> => {
  await simulateDelay(1000); // Simulate initial processing for cloning
  const newVoiceId = `cloned_voice_${String(nextVoiceId++).padStart(3, '0')}`;
  const newClonedVoice: Voice = {
    voice_id: newVoiceId,
    name: payload.voice_name,
    language_support: payload.target_languages || ['en'], // Default to English if not specified
    type: VoiceType.CLONED_USER,
    description: `User cloned voice: ${payload.voice_name}. Original sample: ${payload.audio_sample_url}. (Status: CLONING_PENDING)`,
  };
  voicesDB.push(newClonedVoice);

  // Simulate longer background cloning process (not directly reflected in UI beyond initial status)
  (async () => {
    await simulateDelay(10000 + Math.random() * 5000); // 10-15 seconds
    const voiceIndex = voicesDB.findIndex(v => v.voice_id === newVoiceId);
    if (voiceIndex !== -1) {
      if(Math.random() > 0.2) { // 80% success rate
        voicesDB[voiceIndex].description = `User cloned voice: ${payload.voice_name}. (Status: AVAILABLE)`;
      } else {
        voicesDB[voiceIndex].description = `User cloned voice: ${payload.voice_name}. (Status: CLONING_FAILED)`;
      }
    }
  })();

  return { voice_id: newVoiceId, status: "CLONING_PENDING" };
};

export const getAvatars = async (): Promise<Avatar[]> => {
  await simulateDelay(300);
  return [...avatarsDB]; // Return a copy
};

// Function to reset DB for testing if needed (not for production use)
export const resetMockData = (): void => {
  jobsDB = {};
  voicesDB = [...MOCK_VOICES];
  avatarsDB = [...MOCK_AVATARS];
  nextJobId = 1;
  nextVoiceId = MOCK_VOICES.length + 1;
};
