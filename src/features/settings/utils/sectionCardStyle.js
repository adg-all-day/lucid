export const SETTINGS_SECTION_CARD_LIGHT = 'rgba(245, 245, 245, 1)';

export function getSettingsSectionCardBackground(theme) {
  return theme.isDark ? theme.cardBg : SETTINGS_SECTION_CARD_LIGHT;
}
