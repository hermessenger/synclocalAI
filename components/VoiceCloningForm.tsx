
import React, { useState, useCallback } from 'react';
import type { VoiceClonePayload, SupportedLanguage, JobStatusUpdate } from '../types';
import { Button } from './Button';
import { FileUploader } from './FileUploader';
import { TextInput } from './TextInput';
import { SelectInput } from './SelectInput'; // Assuming you might want to specify target languages for cloning
import { IconClone, IconCheckCircle, IconXCircle } from './IconComponents';

interface VoiceCloningFormProps {
  onClone: (payload: VoiceClonePayload) => Promise<JobStatusUpdate>;
  isLoading: boolean;
  languages: SupportedLanguage[];
}

export const VoiceCloningForm: React.FC<VoiceCloningFormProps> = ({ onClone, isLoading, languages }) => {
  const [audioSampleFile, setAudioSampleFile] = useState<File | null>(null);
  const [voiceName, setVoiceName] = useState<string>('');
  const [targetLanguages, setTargetLanguages] = useState<string[]>([]); // Optional
  const [formError, setFormError] = useState<string | null>(null);
  const [cloneStatus, setCloneStatus] = useState<JobStatusUpdate | null>(null);

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setTargetLanguages(selectedOptions);
  };

  const handleSubmit = useCallback(async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);
    setCloneStatus(null);

    if (!audioSampleFile) {
      setFormError('Audio sample file is required for cloning.');
      return;
    }
    if (!voiceName.trim()) {
      setFormError('Voice name is required.');
      return;
    }

    const payload: VoiceClonePayload = {
      audio_sample_url: audioSampleFile.name, // Using filename as placeholder
      voice_name: voiceName.trim(),
      target_languages: targetLanguages.length > 0 ? targetLanguages : undefined,
    };

    try {
      const result = await onClone(payload);
      setCloneStatus(result);
      if (result.success) {
        // Optionally reset form
        setAudioSampleFile(null);
        // Find a way to reset FileUploader's internal state if it holds a visual preview
        const fileInput = document.getElementById('audio-sample-file-input') as HTMLInputElement;
        if(fileInput) fileInput.value = '';
        setVoiceName('');
        setTargetLanguages([]);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setFormError(`Cloning submission failed: ${errorMessage}`);
      setCloneStatus({ message: `Cloning submission failed: ${errorMessage}`, success: false });
    }
  }, [audioSampleFile, voiceName, targetLanguages, onClone]);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {formError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{formError}</span>
        </div>
      )}
      {cloneStatus && (
        <div className={`p-4 rounded-md flex items-start space-x-3 ${cloneStatus.success ? 'bg-green-50 border-green-300 text-green-700' : 'bg-red-50 border-red-300 text-red-700'} border`}>
          {cloneStatus.success ? <IconCheckCircle className="w-5 h-5 mt-0.5" /> : <IconXCircle className="w-5 h-5 mt-0.5" />}
          <p>{cloneStatus.message}</p>
        </div>
      )}

      <FileUploader
        id="audio-sample-file"
        label="Upload Audio Sample (High-quality, clear, MP3/WAV)"
        onFileSelect={setAudioSampleFile}
        acceptedFileTypes="audio/mpeg,audio/wav"
        required
      />

      <TextInput
        id="voice-name"
        label="Voice Name"
        value={voiceName}
        onChange={(e) => setVoiceName(e.target.value)}
        placeholder="e.g., My Custom Voice, Brand Voice X"
        required
      />
      
      {/* This is a basic multi-select. A more user-friendly one might use checkboxes or a multi-select library */}
      <div>
        <label htmlFor="target-clone-languages" className="block text-sm font-medium text-slate-700">
          Target Languages for Optimization (Optional, Ctrl/Cmd + Click to select multiple)
        </label>
        <select
          id="target-clone-languages"
          multiple
          value={targetLanguages}
          onChange={handleLanguageChange}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm rounded-md shadow-sm"
          size={5}
        >
          {languages.map(lang => (
            <option key={lang.code} value={lang.code}>{lang.name}</option>
          ))}
        </select>
         <p className="mt-1 text-xs text-slate-500">Optimizing for specific languages can improve cloning quality for those languages.</p>
      </div>


      <div className="pt-6 border-t">
        <Button type="submit" disabled={isLoading} variant="primary" className="w-full flex items-center justify-center">
          {isLoading ? <IconClone className="animate-spin w-5 h-5 mr-2" /> : <IconClone className="w-5 h-5 mr-2" /> }
          Start Voice Cloning
        </Button>
      </div>
      <p className="text-xs text-slate-500 mt-4 text-center">
        Voice cloning is a complex process. This demo simulates the request.
      </p>
    </form>
  );
};
