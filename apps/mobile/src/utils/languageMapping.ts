// Mapping from 2-letter ISO codes to 3-letter codes as expected by ElevenLabs
export const LANGUAGE_CODE_MAPPING: Record<string, string> = {
  'en': 'eng', // English
  'es': 'spa', // Spanish
  'fr': 'fra', // French
  'de': 'deu', // German
  'it': 'ita', // Italian
  'pt': 'por', // Portuguese
  'pl': 'pol', // Polish
  'zh': 'zho', // Chinese
  'ja': 'jpn', // Japanese
  'ko': 'kor', // Korean
  'hi': 'hin', // Hindi
  'ar': 'ara', // Arabic
  'ru': 'rus', // Russian
  'tr': 'tur', // Turkish
  'nl': 'nld', // Dutch
  'sv': 'swe', // Swedish
  'da': 'dan', // Danish
  'no': 'nor', // Norwegian
  'fi': 'fin', // Finnish
};

export const getElevenLabsLanguageCode = (twoLetterCode: string): string => {
  return LANGUAGE_CODE_MAPPING[twoLetterCode] || 'eng'; // Default to English if not found
};