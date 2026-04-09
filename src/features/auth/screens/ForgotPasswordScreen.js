import React from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, View } from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import AuthShell from '../components/AuthShell';
import AuthField from '../components/AuthField';
import AuthPrimaryButton from '../components/AuthPrimaryButton';
import Text from '../../../components/StyledText';
import Colors from '../../../constants/colors';
import MailIcon from '../../../icons/MailIcon';
import { forgotPasswordSchema } from '../schemas/auth.schema';
import { useForgotPassword } from '../../../api/queries/auth';
import useTheme from '../../../hooks/useTheme';

export default function ForgotPasswordScreen() {
  const theme = useTheme();
  const forgotMutation = useForgotPassword();
  const { control, handleSubmit } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = handleSubmit(async (data) => {
    try {
      await forgotMutation.mutateAsync({ email: data.email });
    } catch {
      // error available via forgotMutation.error
    }
  });

  return (
    <AuthShell title="Forgot Password" cardStyle={styles.card}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <View style={styles.form}>
          <Text style={[styles.instruction, { color: theme.text }]}>
            Enter the email address linked to to your account
          </Text>

          <AuthField
            control={control}
            name="email"
            label="Email"
            trailing={<MailIcon size={18} color={theme.iconMuted} />}
            autoCapitalize="none"
          />

          <Text style={[styles.helperText, { color: theme.text }]}>
            A link to recover your account will be sent to your email address
          </Text>

          {forgotMutation.isSuccess ? (
            <Text style={styles.successText}>
              If the email exists, recovery instructions have been sent.
            </Text>
          ) : null}

          {forgotMutation.error ? (
            <Text style={styles.errorText}>
              {forgotMutation.error?.response?.data?.message || 'Request failed. Please try again.'}
            </Text>
          ) : null}

          <AuthPrimaryButton title="Send Recovery Link" onPress={onSubmit} loading={forgotMutation.isPending} textStyle={styles.buttonText} />

          <View style={styles.footerRow}>
            <Text style={[styles.footerText, { color: theme.text }]}>Not yet registered? </Text>
            <Pressable onPress={() => router.push('/sign-up')}>
              <Text style={styles.footerLink}>Sign Up</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  flex: {
    width: '100%',
  },
  form: {
    paddingBottom: 6,
  },
  card: {
    minHeight: 760,
  },
  instruction: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 16,
  },
  helperText: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: -4,
    marginBottom: 20,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '400',
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
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 14,
  },
  footerText: {
    fontSize: 14,
    fontWeight: '500',
  },
  footerLink: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
});
