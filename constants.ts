import type { SupportedLanguage, Voice, Avatar } from './types';
import { VoiceType } from './types';

export const MOCK_LANGUAGES: SupportedLanguage[] = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "zh", name: "Chinese (Mandarin)" },
  { code: "hi", name: "Hindi" },
  { code: "ar", name: "Arabic" },
  { code: "pt", name: "Portuguese" },
];

export const MOCK_VOICES: Voice[] = [
  { voice_id: "voice_001", name: "Standard Male (US English)", language_support: ["en"], type: VoiceType.AI_PRESET, description: "A clear, standard male voice.", sample_url: "https://example.com/sample_male_en.mp3" },
  { voice_id: "voice_002", name: "Standard Female (US English)", language_support: ["en"], type: VoiceType.AI_PRESET, description: "A clear, standard female voice.", sample_url: "https://example.com/sample_female_en.mp3" },
  { voice_id: "voice_003", name: "Narrator Male (Spanish)", language_support: ["es"], type: VoiceType.AI_PRESET, description: "A warm male voice for narration in Spanish.", sample_url: "https://example.com/sample_male_es.mp3" },
  { voice_id: "voice_004", name: "Announcer Female (French)", language_support: ["fr"], type: VoiceType.AI_PRESET, description: "An energetic female voice for announcements in French.", sample_url: "https://example.com/sample_female_fr.mp3" },
];

export const MOCK_AVATARS: Avatar[] = [
  { avatar_id: "avatar_001", name: "Neutral Humanoid", description: "A generic humanoid avatar.", supported_viseme_profiles: ["oculus_15", "standard_v1"], thumbnail_url: "https://picsum.photos/seed/avatar1/100/100" },
  { avatar_id: "avatar_002", name: "Stylized Character A", description: "A cartoonish character.", supported_viseme_profiles: ["oculus_15"], thumbnail_url: "https://picsum.photos/seed/avatar2/100/100" },
  { avatar_id: "avatar_003", name: "Realistic MetaHuman", description: "A high-fidelity MetaHuman style avatar.", supported_viseme_profiles: ["standard_v1", "metahuman_default"], thumbnail_url: "https://picsum.photos/seed/avatar3/100/100" },
];

export const SPEAKING_STYLES: string[] = [
  "Normal", "Fast", "Slow", "Emphatic", "Conversational", "Whisper", "Shout"
];

export const JOB_POLL_INTERVAL_MS = 3000;
export const SIMULATED_VIDEO_URL = "https://www.w3schools.com/html/mov_bbb.mp4"; // Placeholder video
export const SIMULATED_AUDIO_URL = "https://www.w3schools.com/html/horse.mp3"; // Placeholder audio

export const INPUT_TYPE_OPTIONS = [
  { id: "audio", label: "Audio File" },
  { id: "text", label: "Text Script" },
];
