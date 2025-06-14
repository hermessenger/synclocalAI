
import React from 'react';
import type { Job } from '../types';
import { JobStatus } from '../types';
import { VideoPlayer } from './VideoPlayer';
import { LoadingSpinner } from './LoadingSpinner';
import { IconCheckCircle, IconXCircle, IconClock, IconProcessing } from './IconComponents';
import { Button } from './Button'; // Added import for Button

interface JobStatusDisplayProps {
  job: Job | null;
  isLoading: boolean; // True if the job is actively being submitted or polled (and not terminal)
}

const StatusIndicator: React.FC<{ status: JobStatus }> = ({ status }) => {
  switch (status) {
    case JobStatus.PENDING:
    case JobStatus.ACCEPTED:
      return <div className="flex items-center text-sm text-yellow-600 bg-yellow-100 px-3 py-1 rounded-full"><IconClock className="w-4 h-4 mr-2" /> {status}</div>;
    case JobStatus.PROCESSING:
      return <div className="flex items-center text-sm text-blue-600 bg-blue-100 px-3 py-1 rounded-full"><IconProcessing className="w-4 h-4 mr-2 animate-spin" /> {status}</div>;
    case JobStatus.COMPLETED:
      return <div className="flex items-center text-sm text-green-600 bg-green-100 px-3 py-1 rounded-full"><IconCheckCircle className="w-4 h-4 mr-2" /> {status}</div>;
    case JobStatus.FAILED:
      return <div className="flex items-center text-sm text-red-600 bg-red-100 px-3 py-1 rounded-full"><IconXCircle className="w-4 h-4 mr-2" /> {status}</div>;
    default:
      return <div className="flex items-center text-sm text-slate-600 bg-slate-100 px-3 py-1 rounded-full">{status}</div>;
  }
};

export const JobStatusDisplay: React.FC<JobStatusDisplayProps> = ({ job, isLoading }) => {
  if (isLoading && !job) {
    return <LoadingSpinner text="Submitting job..." />;
  }
  
  if (!job) {
    return <p className="text-slate-500 text-center py-10">Submit a lip-sync job to see its status here.</p>;
  }

  const progress = job.progress ?? (job.status === JobStatus.PROCESSING ? 50 : (job.status === JobStatus.COMPLETED ? 100 : 0));


  return (
    <div className="space-y-6">
      <div className="p-4 border border-slate-200 rounded-lg bg-slate-50 shadow">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold text-slate-700">Job ID: <span className="font-mono text-sky-600">{job.job_id}</span></h3>
          <StatusIndicator status={job.status} />
        </div>
        
        {(job.status === JobStatus.PROCESSING || (isLoading && job.status !== JobStatus.COMPLETED && job.status !== JobStatus.FAILED)) && (
          <div className="w-full bg-slate-200 rounded-full h-2.5 mb-4">
            <div 
              className="bg-sky-500 h-2.5 rounded-full transition-all duration-500 ease-out" 
              style={{ width: `${job.status === JobStatus.ACCEPTED || job.status === JobStatus.PENDING ? 10 : progress}%` }}
            ></div>
          </div>
        )}

        {job.input_payload_echo && (
            <div className="text-xs text-slate-600 bg-slate-100 p-3 rounded-md mb-3 max-h-32 overflow-y-auto">
                <p className="font-medium mb-1">Submitted Parameters:</p>
                <ul className="list-disc list-inside">
                    <li>Video: {job.input_payload_echo.video_input_url}</li>
                    {job.input_payload_echo.audio_input_url && <li>Audio: {job.input_payload_echo.audio_input_url}</li>}
                    {job.input_payload_echo.text_input && <li>Text: "{job.input_payload_echo.text_input.substring(0,30)}..."</li>}
                    <li>Language: {job.input_payload_echo.target_language}</li>
                    {job.input_payload_echo.voice_id && <li>Voice ID: {job.input_payload_echo.voice_id}</li>}
                    {job.input_payload_echo.character_id && <li>Character ID: {job.input_payload_echo.character_id}</li>}
                </ul>
            </div>
        )}
        
        {job.status === JobStatus.COMPLETED && job.output_video_url && (
          <div className="mt-6">
            <h4 className="text-xl font-semibold text-green-700 mb-3">Video Ready!</h4>
            <VideoPlayer src={job.output_video_url} />
            {job.processing_time_seconds && (
              <p className="text-sm text-slate-500 mt-2">Processing time: {job.processing_time_seconds.toFixed(2)} seconds (simulated).</p>
            )}
            <Button 
              onClick={() => job.output_video_url && window.open(job.output_video_url, '_blank')} 
              variant="secondary" 
              className="mt-4 w-full"
              disabled={!job.output_video_url}
            >
              Download Video
            </Button>
          </div>
        )}

        {job.status === JobStatus.FAILED && (
          <div className="mt-4 p-4 bg-red-50 border border-red-300 rounded-md text-red-700">
            <h4 className="font-bold text-lg mb-1">Job Failed</h4>
            <p>{job.error_message || 'An unknown error occurred.'}</p>
          </div>
        )}
         {(isLoading && job.status !== JobStatus.COMPLETED && job.status !== JobStatus.FAILED) && job.status !== JobStatus.PROCESSING &&(
             <div className="mt-6 text-center">
                <LoadingSpinner text={`Job status: ${job.status}... Please wait.`} />
             </div>
         )}
      </div>
    </div>
  );
};
