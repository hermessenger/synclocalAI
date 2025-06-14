
import React, { useState, useCallback, useMemo } from 'react';
import type { Voice, Avatar, SupportedLanguage, JobCreationPayload } from '../types';
import { JobCreationInputType } from '../types';
import { SPEAKING_STYLES, INPUT_TYPE_OPTIONS, SIMULATED_AUDIO_URL, SIMULATED_VIDEO_URL } from '../constants';
import { Button } from './Button';
import { FileUploader } from './FileUploader';
import { SelectInput } from './SelectInput';
import { TextAreaInput } from './TextAreaInput';
import { RangeInput } from './RangeInput';
import { TextInput } from './TextInput'; // Might be needed if URLs are manually entered, but FileUploader is primary for files
import { IconUpload, IconPlayerPlay, IconSettings, IconLanguage, IconUsers, IconMoodHappy, IconVolume, IconFileText, IconMusic } from './IconComponents';


interface LipSyncFormProps {
  voices: Voice[];
  avatars: Avatar[];
  languages: SupportedLanguage[];
  onSubmit: (payload: JobCreationPayload) => void;
  isLoading: boolean;
}

export const LipSyncForm: React.FC<LipSyncFormProps> = ({
  voices,
  avatars,
  languages,
  onSubmit,
  isLoading,
}) => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrlInput, setVideoUrlInput] = useState<string>(''); // For URL input option

  const [audioSourceType, setAudioSourceType] = useState<JobCreationInputType>(JobCreationInputType.AUDIO);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrlInput, setAudioUrlInput] = useState<string>(''); // For URL input option
  const [textInput, setTextInput] = useState<string>('');
  
  const [selectedLanguage, setSelectedLanguage] = useState<string>(languages[0]?.code || 'en');
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>('');
  const [selectedAvatarId, setSelectedAvatarId] = useState<string>('');
  
  const [emotionIntensity, setEmotionIntensity] = useState<number>(0.5);
  const [speakingStyle, setSpeakingStyle] = useState<string>(SPEAKING_STYLES[0] || 'Normal');
  
  const [formError, setFormError] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

  const availableVoices = useMemo(() => {
    if (!selectedLanguage) return voices;
    return voices.filter(voice => voice.language_support.includes(selectedLanguage) || voice.language_support.includes('*')); // '*' for universal voices
  }, [voices, selectedLanguage]);

  const handleSubmit = useCallback((event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);

    let finalVideoInputUrl = videoFile ? videoFile.name : videoUrlInput.trim();
    if (!finalVideoInputUrl) {
      setFormError('Video source (file or URL) is required.');
      return;
    }
     // Use placeholder if URL is empty and file is selected (as filename is used as placeholder)
    if (!videoUrlInput && videoFile) finalVideoInputUrl = `placeholder_video_${videoFile.name}`;
    else if(videoUrlInput && !videoFile) finalVideoInputUrl = videoUrlInput;


    let finalAudioInputUrl: string | undefined = undefined;
    let finalTextIpnut: string | undefined = undefined;

    if (audioSourceType === JobCreationInputType.AUDIO) {
      finalAudioInputUrl = audioFile ? audioFile.name : audioUrlInput.trim();
      if (!finalAudioInputUrl) {
        setFormError('Audio source (file or URL) is required when "Audio File" is selected.');
        return;
      }
      if (!audioUrlInput && audioFile) finalAudioInputUrl = `placeholder_audio_${audioFile.name}`;
      else if(audioUrlInput && !audioFile) finalAudioInputUrl = audioUrlInput;

    } else if (audioSourceType === JobCreationInputType.TEXT) {
      if (!textInput.trim()) {
        setFormError('Text script is required when "Text Script" is selected.');
        return;
      }
      finalTextIpnut = textInput.trim();
    }

    if (!selectedLanguage) {
      setFormError('Target language is required.');
      return;
    }

    const payload: JobCreationPayload = {
      video_input_url: finalVideoInputUrl || SIMULATED_VIDEO_URL, // Fallback to ensure it's always string
      audio_input_url: audioSourceType === JobCreationInputType.AUDIO ? (finalAudioInputUrl || SIMULATED_AUDIO_URL) : undefined,
      text_input: audioSourceType === JobCreationInputType.TEXT ? finalTextIpnut : undefined,
      target_language: selectedLanguage,
      voice_id: selectedVoiceId || undefined, // Send undefined if empty to use default
      character_id: selectedAvatarId || undefined, // Send undefined if empty
      emotion_intensity: showAdvanced ? emotionIntensity : undefined,
      speaking_style: showAdvanced ? speakingStyle : undefined,
    };
    onSubmit(payload);
  }, [
    videoFile, videoUrlInput,
    audioSourceType, audioFile, audioUrlInput, textInput,
    selectedLanguage, selectedVoiceId, selectedAvatarId,
    emotionIntensity, speakingStyle, showAdvanced, onSubmit
  ]);
  
  const handleAudioSourceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAudioSourceType(event.target.value as JobCreationInputType);
    setAudioFile(null); // Reset other source
    setTextInput('');   // Reset other source
    setAudioUrlInput(''); // Reset URL input
    setFormError(null); // Clear errors related to audio source
  };

  const voiceOptions = useMemo(() => [
    { value: '', label: 'Default Voice for Language' },
    ...availableVoices.map(v => ({ value: v.voice_id, label: `${v.name} (${v.type === 'CLONED_USER' ? 'Cloned' : 'Preset'})` }))
  ], [availableVoices]);

  const avatarOptions = useMemo(() => [
    { value: '', label: 'Default Avatar / Original Video' },
    ...avatars.map(a => ({ value: a.avatar_id, label: a.name }))
  ], [avatars]);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {formError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{formError}</span>
        </div>
      )}

      {/* Video Input */}
      <fieldset className="border border-slate-300 p-4 rounded-md">
        <legend className="text-sm font-medium text-slate-700 px-1">Video Source</legend>
        <FileUploader
          id="video-file"
          label="Upload Video File (MP4, MOV, AVI)"
          onFileSelect={setVideoFile}
          acceptedFileTypes="video/mp4,video/quicktime,video/x-msvideo"
          required={!videoUrlInput}
        />
        <div className="mt-2 text-center text-sm text-slate-500">OR</div>
        <TextInput
          id="video-url"
          label="Enter Video URL"
          value={videoUrlInput}
          onChange={(e) => setVideoUrlInput(e.target.value)}
          placeholder="https://example.com/myvideo.mp4"
          type="url"
          disabled={!!videoFile}
        />
      </fieldset>

      {/* Audio Input Type Selection */}
      <fieldset className="border border-slate-300 p-4 rounded-md">
        <legend className="text-sm font-medium text-slate-700 px-1">Audio Source</legend>
        <div className="flex space-x-4 mb-4">
          {INPUT_TYPE_OPTIONS.map((option) => (
            <label key={option.id} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="audioSourceType"
                value={option.id === 'audio' ? JobCreationInputType.AUDIO : JobCreationInputType.TEXT}
                checked={audioSourceType === (option.id === 'audio' ? JobCreationInputType.AUDIO : JobCreationInputType.TEXT)}
                onChange={handleAudioSourceChange}
                className="focus:ring-sky-500 h-4 w-4 text-sky-600 border-slate-300"
              />
              <span className="text-sm text-slate-700">{option.label}</span>
            </label>
          ))}
        </div>

        {audioSourceType === JobCreationInputType.AUDIO && (
          <div className="space-y-4">
            <FileUploader
              id="audio-file"
              label="Upload Audio File (MP3, WAV)"
              onFileSelect={setAudioFile}
              acceptedFileTypes="audio/mpeg,audio/wav"
              required={!audioUrlInput}
            />
             <div className="mt-2 text-center text-sm text-slate-500">OR</div>
            <TextInput
              id="audio-url"
              label="Enter Audio URL"
              value={audioUrlInput}
              onChange={(e) => setAudioUrlInput(e.target.value)}
              placeholder="https://example.com/myaudio.mp3"
              type="url"
              disabled={!!audioFile}
            />
          </div>
        )}

        {audioSourceType === JobCreationInputType.TEXT && (
          <TextAreaInput
            id="text-script"
            label="Enter Text Script"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Enter the speech content here..."
            rows={4}
            required
          />
        )}
      </fieldset>
      
      {/* Core Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SelectInput
          id="target-language"
          label="Target Language"
          value={selectedLanguage}
          onChange={(e) => {
            setSelectedLanguage(e.target.value);
            setSelectedVoiceId(''); // Reset voice when language changes
          }}
          options={languages.map(lang => ({ value: lang.code, label: lang.name }))}
          required
          Icon={IconLanguage}
        />
        <SelectInput
          id="voice-id"
          label="Voice"
          value={selectedVoiceId}
          onChange={(e) => setSelectedVoiceId(e.target.value)}
          options={voiceOptions}
          disabled={availableVoices.length === 0 && !selectedLanguage}
          Icon={IconVolume}
        />
      </div>

      {/* Advanced Settings Toggle */}
      <div className="pt-4">
        <Button 
            type="button" 
            variant="ghost" 
            onClick={() => setShowAdvanced(!showAdvanced)} 
            className="text-sm text-sky-600 hover:text-sky-700 flex items-center"
        >
          <IconSettings className="w-4 h-4 mr-2" />
          {showAdvanced ? 'Hide' : 'Show'} Advanced Options
        </Button>
      </div>

      {/* Advanced Settings */}
      {showAdvanced && (
        <div className="space-y-6 pt-4 border-t border-slate-200 animate-fadeIn">
           <SelectInput
            id="avatar-id"
            label="Avatar / Character (Optional)"
            value={selectedAvatarId}
            onChange={(e) => setSelectedAvatarId(e.target.value)}
            options={avatarOptions}
            Icon={IconUsers}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <RangeInput
              id="emotion-intensity"
              label={`Emotion Intensity: ${emotionIntensity.toFixed(2)}`}
              value={emotionIntensity}
              min="0"
              max="1"
              step="0.05"
              onChange={(e) => setEmotionIntensity(parseFloat(e.target.value))}
            />
            <SelectInput
              id="speaking-style"
              label="Speaking Style"
              value={speakingStyle}
              onChange={(e) => setSpeakingStyle(e.target.value)}
              options={SPEAKING_STYLES.map(style => ({ value: style, label: style }))}
            />
          </div>
        </div>
      )}

      <div className="pt-6 border-t">
        <Button type="submit" disabled={isLoading} variant="primary" className="w-full flex items-center justify-center">
          {isLoading ? <IconUpload className="animate-spin w-5 h-5 mr-2" /> : <IconPlayerPlay className="w-5 h-5 mr-2" />}
          Generate Lip-Sync Video
        </Button>
      </div>
       <p className="text-xs text-slate-500 mt-4 text-center">
        File uploads are simulated. URLs can be placeholders. Final output is a sample video.
      </p>
    </form>
  );
};
