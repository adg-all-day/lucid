import AsyncStorage from '@react-native-async-storage/async-storage';

const GLOBAL_LANGUAGE_KEY = 'lucid.language.global';
const userLanguageKey = (userKey) => `lucid.language.user.${String(userKey || '').toLowerCase()}`;

export async function getCachedLanguage(userKey = null) {
  if (userKey) {
    const userLanguage = await AsyncStorage.getItem(userLanguageKey(userKey));
    if (userLanguage) return userLanguage;
  }

  return AsyncStorage.getItem(GLOBAL_LANGUAGE_KEY);
}

export async function setCachedLanguage(language, userKey = null) {
  if (userKey) {
    await AsyncStorage.setItem(userLanguageKey(userKey), language);
    return;
  }

  await AsyncStorage.setItem(GLOBAL_LANGUAGE_KEY, language);
}
