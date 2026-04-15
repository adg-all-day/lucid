import React from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import AuthShell from '../components/AuthShell';
import AuthField from '../components/AuthField';
import AuthPrimaryButton from '../components/AuthPrimaryButton';
import Text from '../../../components/StyledText';
import Colors from '../../../constants/colors';
import MailIcon from '../../../icons/MailIcon';
import { twoFactorCodeSchema } from '../schemas/auth.schema';
import { useVerify2FA } from '../../../api/queries/auth';
import useAuthStore from '../../../stores/authStore';
import useTheme from '../../../hooks/useTheme';
import applyRegionalLanguage from '../../../i18n/applyRegionalLanguage';

export default function TwoFactorCodeScreen() {
  const router = useRouter();
  const theme = useTheme();
  const sessionId = useAuthStore((state) => state.sessionId);
  const verify2FAMutation = useVerify2FA();
  const { control, handleSubmit } = useForm({
    resolver: zodResolver(twoFactorCodeSchema),
    defaultValues: {
      code: '',
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    try {
      const result = await verify2FAMutation.mutateAsync({ session_id: sessionId, code: data.code });
      const payload = result?.data ?? result;
      await applyRegionalLanguage(payload?.user);
      router.replace('/(tabs)');
    } catch {
      // error available via verify2FAMutation.error
    }
  });

  return (
    <AuthShell title="Two-Factor Authentication" cardStyle={styles.card}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <View style={styles.form}>
          <Text style={[styles.heading, { color: theme.text }]}>
            Enter the code from your preferred authentication method
          </Text>

          <AuthField
            control={control}
            name="code"
            label="Enter Code"
            autoCapitalize="characters"
            autoFocus
            highlighted
            trailing={<MailIcon size={16} color={theme.iconMuted} />}
          />

          {verify2FAMutation.error ? (
            <Text style={styles.errorText}>
              {verify2FAMutation.error?.response?.data?.message || 'Verification failed. Please try again.'}
            </Text>
          ) : null}

          <AuthPrimaryButton title="Login" onPress={onSubmit} loading={verify2FAMutation.isPending} style={styles.button} />

          <View style={styles.recoveryRow}>
            <Text style={[styles.recoveryText, { color: theme.text }]}>Can&apos;t access your verification methods? </Text>
            <Pressable onPress={() => router.push('/recovery-code')}>
              <Text style={styles.recoveryLink}>Use Recovery Code</Text>
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
    paddingBottom: 2,
  },
  card: {
    minHeight: 760,
  },
  heading: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
    marginBottom: 18,
  },
  errorText: {
    color: Colors.error,
    fontSize: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  button: {
    marginTop: 2,
  },
  recoveryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 14,
  },
  recoveryText: {
    fontSize: 12.5,
    fontWeight: '500',
  },
  recoveryLink: {
    color: '#5B5FC7',
    fontSize: 12.5,
    fontWeight: '500',
  },
});
