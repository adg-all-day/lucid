import { useLocalSearchParams } from 'expo-router';
import VerifyEmailResultScreen from '../src/features/auth/screens/VerifyEmailResultScreen';

export default function VerifyEmailRoute() {
  const { token } = useLocalSearchParams();
  return <VerifyEmailResultScreen token={token} />;
}
