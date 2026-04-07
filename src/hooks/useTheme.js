import useUiStore from '../stores/uiStore';

const light = {
  isDark: false,
  background: '#FAFAFA',
  cardBg: '#FFFFFF',
  modalBg: '#FFFFFF',
  inputBg: '#FFFFFF',
  text: '#212121',
  textSecondary: '#707070',
  surfaceLight: '#F5F5F5',
  primaryLight: '#E8E9F7',
  primary5: 'rgba(91, 95, 199, 0.05)',
  primary10: 'rgba(91, 95, 199, 0.1)',
  accent17: 'rgba(255, 166, 0, 0.17)',
  headerBg: '#5B5FC7',
  logoColor: '#FFFFFF',
  logoAccent: '#FFA600',
  summaryCardBg: 'rgba(91, 95, 199, 0.1)',
  actionButtonBg: '#FFFFFF',
  actionButtonText: '#5B5FC7',
  icon: '#5B5FC7',
  iconMuted: '#979797',
  divider: '#D5D5D5',
};

const dark = {
  isDark: true,
  background: '#212121',
  cardBg: '#FFFFFF1A',
  modalBg: '#2B2B2B',
  inputBg: '#2B2B2B',
  text: '#FFFFFF',
  textSecondary: '#FFFFFF',
  surfaceLight: '#FFFFFF1A',
  primaryLight: '#5B5FC780',
  primary5: '#FFFFFF1A',
  primary10: '#FFFFFF1A',
  accent17: 'rgba(255, 166, 0, 0.5)',
  headerBg: '#212121',
  logoColor: '#5B5FC7',
  logoAccent: '#FFA600',
  summaryCardBg: '#5B5FC780',
  actionButtonBg: '#5B5FC7',
  actionButtonText: '#FFFFFF',
  icon: '#FFFFFF',
  iconMuted: '#FFFFFF',
  divider: '#FFFFFF1A',
};

export default function useTheme() {
  const darkMode = useUiStore((s) => s.darkMode);
  return darkMode ? dark : light;
}
