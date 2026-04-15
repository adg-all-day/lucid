import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import en from './resources/en.json';
import fr from './resources/fr.json';
import { getCachedLanguage, setCachedLanguage } from './languageStorage';
import { DEFAULT_LANGUAGE, getSupportedLanguage } from './languageUtils';

const resources = {
  en: { translation: en },
  fr: { translation: fr },
};

let initPromise = null;

function getDeviceLanguage() {
  const locales = Localization.getLocales?.() || [];
  return getSupportedLanguage(locales[0]?.languageTag || locales[0]?.languageCode);
}

export function initI18n() {
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const isDevelopment = typeof __DEV__ !== 'undefined' && __DEV__;
    let cachedLanguage = null;
    try {
      cachedLanguage = await getCachedLanguage();
    } catch (error) {
      if (isDevelopment) {
        console.warn('[i18n] Could not read cached language.', error);
      }
    }
    const initialLanguage = getSupportedLanguage(cachedLanguage || getDeviceLanguage());
    const baseConfig = {
      resources,
      lng: initialLanguage,
      fallbackLng: DEFAULT_LANGUAGE,
      compatibilityJSON: 'v4',
      interpolation: {
        escapeValue: false,
      },
      saveMissing: isDevelopment,
      missingKeyHandler: (_languages, _namespace, key) => {
        if (isDevelopment) {
          // Keep missing translations visible during the incremental migration.
          console.warn(`[i18n] Missing translation: ${key}`);
        }
      },
    };

    try {
      await i18n.use(initReactI18next).init(baseConfig);
    } catch (error) {
      if (isDevelopment) {
        console.warn('[i18n] Falling back to default language.', error);
      }
      await i18n.init({
        ...baseConfig,
        lng: DEFAULT_LANGUAGE,
        saveMissing: false,
      });
    }

    try {
      await setCachedLanguage(initialLanguage);
    } catch (error) {
      if (isDevelopment) {
        console.warn('[i18n] Could not cache initial language.', error);
      }
    }
    return i18n;
  })();

  return initPromise;
}

export async function changeAppLanguage(language, userKey = null) {
  const nextLanguage = getSupportedLanguage(language);
  await i18n.changeLanguage(nextLanguage);
  await setCachedLanguage(nextLanguage);
  if (userKey) {
    await setCachedLanguage(nextLanguage, userKey);
  }
  return nextLanguage;
}

export default i18n;
