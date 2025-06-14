export interface SupportedLanguage {
  code: string; // ISO 639-1 code
  name: string;
}

export enum VoiceType {
  AI_PRESET = "AI_PRESET",
  CLONED_USER = "CLONED_USER",
}

export interface Voice {
  voice_id: string;
  name: string;
  language_support: string[]; // Array of ISO 639-1 codes
  type: VoiceType;
  description: string;
  sample_url?: string; // Optional: URL to a sample of the voice
}

export interface Avatar {
  avatar_id: string;
  name: string;
  description: string;
  supported_viseme_profiles: string[]; // e.g., ["oculus_15", "custom_profile_v1"]
  thumbnail_url?: string; // Optional: URL to an avatar thumbnail
}

export enum JobCreationInputType {
  AUDIO = "AUDIO",
  TEXT = "TEXT",
}

export interface JobCreationPayload {
  video_input_url: string; // URL or placeholder like filename for uploaded video
  audio_input_url?: string; // URL or placeholder for uploaded audio
  text_input?: string;      // Text for TTS
  target_language: string;  // ISO 639-1 code
  voice_id?: string;
  character_id?: string;
  custom_viseme_mapping_id?: string;
  emotion_intensity?: number; // 0.0 - 1.0
  speaking_style?: string;    // e.g., "fast", "emphatic"
  callback_url?: string;
}

export enum JobStatus {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED", // As per API spec
  PROCESSING = "PROCESSING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}

export interface Job {
  job_id: string;
  status: JobStatus;
  output_video_url?: string;
  processing_time_seconds?: number;
  error_message?: string;
  input_payload_echo?: JobCreationPayload; // For displaying what was submitted
  progress?: number; // 0-100 for UI display
}

export interface VoiceClonePayload {
  audio_sample_url: string; // URL or placeholder for uploaded audio sample
  voice_name: string;
  target_languages?: string[]; // Array of ISO 639-1 codes for optimization
}

export interface ClonedVoiceResponse {
  voice_id: string;
  status: string; // e.g., "CLONING_PENDING"
}

export interface JobStatusUpdate {
  message: string;
  success: boolean;
}
