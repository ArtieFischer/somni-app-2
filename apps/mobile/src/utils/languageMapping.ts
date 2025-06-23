// Mapping from 2-letter ISO codes to 3-letter codes as expected by ElevenLabs
// ElevenLabs Scribe v1 supports 99 languages with automatic language detection
export const LANGUAGE_CODE_MAPPING: Record<string, string> = {
  // Major languages
  'en': 'eng', // English
  'es': 'spa', // Spanish
  'fr': 'fra', // French
  'de': 'deu', // German
  'it': 'ita', // Italian
  'pt': 'por', // Portuguese
  'pl': 'pol', // Polish
  'zh': 'zho', // Chinese (Mandarin)
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
  
  // Additional European languages
  'cs': 'ces', // Czech
  'el': 'ell', // Greek
  'hu': 'hun', // Hungarian
  'ro': 'ron', // Romanian
  'bg': 'bul', // Bulgarian
  'hr': 'hrv', // Croatian
  'sk': 'slk', // Slovak
  'sl': 'slv', // Slovenian
  'et': 'est', // Estonian
  'lv': 'lav', // Latvian
  'lt': 'lit', // Lithuanian
  'uk': 'ukr', // Ukrainian
  'sr': 'srp', // Serbian
  'ca': 'cat', // Catalan
  'eu': 'eus', // Basque
  'gl': 'glg', // Galician
  
  // Asian languages
  'th': 'tha', // Thai
  'vi': 'vie', // Vietnamese
  'id': 'ind', // Indonesian
  'ms': 'msa', // Malay
  'tl': 'tgl', // Tagalog/Filipino
  'bn': 'ben', // Bengali
  'ta': 'tam', // Tamil
  'te': 'tel', // Telugu
  'ur': 'urd', // Urdu
  'fa': 'fas', // Persian/Farsi
  'he': 'heb', // Hebrew
  'my': 'mya', // Burmese
  'km': 'khm', // Khmer
  'lo': 'lao', // Lao
  'ne': 'nep', // Nepali
  'si': 'sin', // Sinhala
  
  // African languages
  'sw': 'swa', // Swahili
  'am': 'amh', // Amharic
  'yo': 'yor', // Yoruba
  'zu': 'zul', // Zulu
  'xh': 'xho', // Xhosa
  'af': 'afr', // Afrikaans
  'ha': 'hau', // Hausa
  'ig': 'ibo', // Igbo
  
  // Other languages
  'is': 'isl', // Icelandic
  'ga': 'gle', // Irish
  'cy': 'cym', // Welsh
  'mt': 'mlt', // Maltese
  'sq': 'sqi', // Albanian
  'mk': 'mkd', // Macedonian
  'hy': 'hye', // Armenian
  'ka': 'kat', // Georgian
  'az': 'aze', // Azerbaijani
  'kk': 'kaz', // Kazakh
  'ky': 'kir', // Kyrgyz
  'uz': 'uzb', // Uzbek
  'mn': 'mon', // Mongolian
};

export const getElevenLabsLanguageCode = (twoLetterCode: string): string => {
  return LANGUAGE_CODE_MAPPING[twoLetterCode] || 'eng'; // Default to English if not found
};