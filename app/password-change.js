import { useLocalSearchParams } from 'expo-router';
import PasswordChangeScreen from '../src/features/auth/screens/PasswordChangeScreen';

export default function PasswordChangeRoute() {
  const { token } = useLocalSearchParams();
  return <PasswordChangeScreen resetToken={token} />;
}
