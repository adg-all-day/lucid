import React, { useEffect } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AuthShell from '../components/AuthShell';
import Text from '../../../components/StyledText';
import Colors from '../../../constants/colors';
import { useVerifyEmail } from '../../../api/queries/auth';

export default function VerifyEmailResultScreen({ token }) {
  const router = useRouter();
  const verifyMutation = useVerifyEmail();

  useEffect(() => {
    if (token) {
      verifyMutation.mutate({ token });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const goToLogin = () => router.replace('/log-in');

  return (
    <AuthShell title="Email Verification">
      <View style={styles.content}>
        {!token ? (
          <>
            <Ionicons name="close-circle" size={48} color={Colors.error} />
            <Text style={styles.heading}>Invalid Link</Text>
            <Text style={styles.message}>This verification link is invalid.</Text>
            <Pressable style={styles.button} onPress={goToLogin}>
              <Text style={styles.buttonText}>Go to Login</Text>
            </Pressable>
          </>
        ) : verifyMutation.isPending ? (
          <>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.heading}>Verifying your email...</Text>
          </>
        ) : verifyMutation.isSuccess ? (
          <>
            <Ionicons name="checkmark-circle" size={48} color="#059669" />
            <Text style={styles.heading}>Email Verified</Text>
            <Text style={styles.message}>Your email has been verified successfully. You can now log in.</Text>
            <Pressable style={styles.button} onPress={goToLogin}>
              <Text style={styles.buttonText}>Go to Login</Text>
            </Pressable>
          </>
        ) : verifyMutation.isError ? (
          <>
            <Ionicons name="close-circle" size={48} color={Colors.error} />
            <Text style={styles.heading}>Verification Failed</Text>
            <Text style={styles.message}>
              {verifyMutation.error?.response?.data?.message || 'This link may be invalid or expired. Please request a new verification email.'}
            </Text>
            <Pressable style={styles.button} onPress={goToLogin}>
              <Text style={styles.buttonText}>Go to Login</Text>
            </Pressable>
          </>
        ) : null}
      </View>
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  content: {
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingTop: 30,
    gap: 12,
  },
  heading: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.black,
  },
  message: {
    fontSize: 13,
    color: Colors.black,
    textAlign: 'center',
    lineHeight: 20,
  },
  button: {
    marginTop: 12,
    backgroundColor: Colors.primary,
    borderRadius: 5,
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
});
