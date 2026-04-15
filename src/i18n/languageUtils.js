export const DEFAULT_LANGUAGE = 'en';

export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'Français' },
];

const LANGUAGE_ALIASES = {
  english: 'en',
  en: 'en',
  'en-us': 'en',
  'en-gb': 'en',
  french: 'fr',
  francais: 'fr',
  'français': 'fr',
  fr: 'fr',
  'fr-fr': 'fr',
};

export function normalizeLanguageCode(value) {
  const raw = String(value || '').trim().toLowerCase();
  if (!raw) return '';

  const normalized = raw.replace('_', '-');
  return LANGUAGE_ALIASES[normalized] || LANGUAGE_ALIASES[normalized.split('-')[0]] || normalized.split('-')[0];
}

export function getSupportedLanguage(value) {
  const normalized = normalizeLanguageCode(value);
  return SUPPORTED_LANGUAGES.some((language) => language.code === normalized)
    ? normalized
    : DEFAULT_LANGUAGE;
}

export function getLanguageLabel(code) {
  const normalized = normalizeLanguageCode(code);
  return SUPPORTED_LANGUAGES.find((language) => language.code === normalized)?.label || code;
}
