import React from 'react';
import { StyleSheet, View } from 'react-native';
import AuthShell from '../components/AuthShell';
import AuthPrimaryButton from '../components/AuthPrimaryButton';
import Text from '../../../components/StyledText';
import Colors from '../../../constants/colors';
import EmailVerificationIllustration from '../../../icons/EmailVerificationIllustration';
import { useResendVerification } from '../../../api/queries/auth';
import getApiErrorMessage from '../utils/getApiErrorMessage';

export default function EmailVerificationScreen({ email = '' }) {
  const resendMutation = useResendVerification();

  const onResend = async () => {
    if (!email) return;
    try {
      await resendMutation.mutateAsync({ email });
    } catch {
      // error available via resendMutation.error
    }
  };

  return (
    <AuthShell title="Email Verification" cardStyle={styles.card}>
      <View style={styles.content}>
        <View style={styles.illustrationCircle}>
          <EmailVerificationIllustration size={60} />
        </View>

        <Text style={styles.heading}>Verify your email</Text>

        <Text style={styles.sentText}>
          A verification email has been sent to <Text style={styles.emailBold}>{email}</Text>
        </Text>

        <Text style={styles.instructionText}>
          Kindly follow the link to verify your account. If you don't see it, click the resend button below.
        </Text>

        {resendMutation.isSuccess ? (
          <Text style={styles.successText}>Verification email resent!</Text>
        ) : null}

        {resendMutation.error ? (
          <Text style={styles.errorText}>
            {getApiErrorMessage(resendMutation.error, 'Failed to resend. Please try again.')}
          </Text>
        ) : null}

        <AuthPrimaryButton title="Resend" onPress={onResend} loading={resendMutation.isPending} style={styles.button} />
      </View>
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  content: {
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingTop: 20,
  },
  card: {
    minHeight: 760,
  },
  illustrationCircle: {
    width: 150,
    height: 150,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  heading: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.black,
    marginBottom: 12,
  },
  sentText: {
    fontSize: 13,
    color: Colors.black,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 16,
  },
  emailBold: {
    fontWeight: '700',
  },
  instructionText: {
    fontSize: 13,
    color: Colors.black,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  successText: {
    color: '#059669',
    fontSize: 12,
    marginBottom: 12,
    textAlign: 'center',
  },
  errorText: {
    color: Colors.error,
    fontSize: 12,
    marginBottom: 12,
    textAlign: 'center',
  },
  button: {
    width: 390,
    maxWidth: '100%',
    height: 45,
    borderRadius: 5,
    padding: 10,
  },
});
