import React from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import AuthShell from '../components/AuthShell';
import AuthField from '../components/AuthField';
import AuthPrimaryButton from '../components/AuthPrimaryButton';
import Text from '../../../components/StyledText';
import Colors from '../../../constants/colors';
import { recoveryCodeSchema } from '../schemas/auth.schema';
import { useVerify2FA } from '../../../api/queries/auth';
import useAuthStore from '../../../stores/authStore';
import useTheme from '../../../hooks/useTheme';
import applyRegionalLanguage from '../../../i18n/applyRegionalLanguage';

export default function RecoveryCodeScreen() {
  const router = useRouter();
  const theme = useTheme();
  const sessionId = useAuthStore((state) => state.sessionId);
  const recoveryMutation = useVerify2FA();
  const { control, handleSubmit } = useForm({
    resolver: zodResolver(recoveryCodeSchema),
    defaultValues: {
      code: '',
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    try {
      const result = await recoveryMutation.mutateAsync({ session_id: sessionId, code: data.code });
      const payload = result?.data ?? result;
      await applyRegionalLanguage(payload?.user);
      router.replace('/(tabs)');
    } catch {
      // error available via recoveryMutation.error
    }
  });

  return (
    <AuthShell title="Recovery Code" cardStyle={styles.card}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <View style={styles.form}>
          <Text style={[styles.heading, { color: theme.text }]}>
            Paste the recovery code saved on your device
          </Text>

          <AuthField
            control={control}
            name="code"
            label="Recovery Code"
            placeholder="XXXX-XXXX-XXXX-XXXX-XXXX"
            autoCapitalize="characters"
            autoFocus
            highlighted
          />

          {recoveryMutation.error ? (
            <Text style={styles.errorText}>
              {recoveryMutation.error?.response?.data?.message || 'Recovery failed. Please try again.'}
            </Text>
          ) : null}

          <AuthPrimaryButton title="Login" onPress={onSubmit} loading={recoveryMutation.isPending} style={styles.button} />
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
});
