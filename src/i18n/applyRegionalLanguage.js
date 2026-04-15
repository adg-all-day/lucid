import client from '../api/client';
import { changeAppLanguage } from './index';
import { getSupportedLanguage } from './languageUtils';

export default async function applyRegionalLanguage(user = {}) {
  try {
    const regional = await client.get('/profile/regional');
    const regionalData = regional?.data ?? regional;
    const language = regionalData?.language;
    if (!language) return null;

    return changeAppLanguage(getSupportedLanguage(language), user?.id || user?.email);
  } catch {
    // Language preferences should never block a valid authenticated session.
    return null;
  }
}
