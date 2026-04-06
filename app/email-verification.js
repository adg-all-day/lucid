import { useLocalSearchParams } from 'expo-router';
import EmailVerificationScreen from '../src/features/auth/screens/EmailVerificationScreen';

export default function EmailVerificationRoute() {
  const { email } = useLocalSearchParams();
  return <EmailVerificationScreen email={email} />;
}
