import React, { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import AuthShell from '../components/AuthShell';
import AuthField from '../components/AuthField';
import AuthPrimaryButton from '../components/AuthPrimaryButton';
import PasswordRules from '../components/PasswordRules';
import ResetLinkInvalidState from '../components/ResetLinkInvalidState';
import Text from '../../../components/StyledText';
import Colors from '../../../constants/colors';
import { passwordChangeSchema } from '../schemas/auth.schema';
import { useSetPassword, useVerifyResetToken } from '../../../api/queries/auth';
import useTheme from '../../../hooks/useTheme';
import usePasswordChecks from '../hooks/usePasswordChecks';

export default function PasswordChangeScreen({ resetToken }) {
  const router = useRouter();
  const theme = useTheme();
  const verifyTokenMutation = useVerifyResetToken();
  const setPasswordMutation = useSetPassword();
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);

  useEffect(() => {
    if (resetToken) {
      verifyTokenMutation.mutate({ token: resetToken });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetToken]);
  const { control, handleSubmit, watch } = useForm({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      password: '',
      repeatPassword: '',
    },
  });

  const checks = usePasswordChecks(watch('password'));

  const onSubmit = handleSubmit(async (data) => {
    try {
      await setPasswordMutation.mutateAsync({
        token: resetToken,
        password: data.password,
        repeat_password: data.repeatPassword,
      });
      Alert.alert('Success', 'Password updated successfully.', [
        { text: 'OK', onPress: () => router.replace('/log-in') },
      ]);
    } catch {
      // error available via setPasswordMutation.error
    }
  });

  if (!resetToken) {
    return (
      <AuthShell title="Password Change" cardStyle={styles.card}>
        <ResetLinkInvalidState onBackToLogin={() => router.replace('/log-in')} />
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Password Change" cardStyle={styles.card}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.form}>
            <AuthField
              control={control}
              name="password"
              label="Enter New Password"
              secureTextEntry={!showPassword}
              trailing={
                <Ionicons
                  name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={18}
                  color={theme.iconMuted}
                  onPress={() => setShowPassword((value) => !value)}
                />
              }
            />

            <PasswordRules checks={checks} style={styles.rulesBlock} />

            <AuthField
              control={control}
              name="repeatPassword"
              label="Retype Password"
              secureTextEntry={!showRepeatPassword}
              trailing={
                <Ionicons
                  name={showRepeatPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={18}
                  color={theme.iconMuted}
                  onPress={() => setShowRepeatPassword((value) => !value)}
                />
              }
            />

            {verifyTokenMutation.error ? (
              <Text style={styles.errorText}>
                {verifyTokenMutation.error?.response?.data?.message || 'Invalid or expired reset link.'}
              </Text>
            ) : null}

            {setPasswordMutation.error ? (
              <Text style={styles.errorText}>
                {setPasswordMutation.error?.response?.data?.message || 'Reset failed. Please try again.'}
              </Text>
            ) : null}

            <AuthPrimaryButton
              title="Set New Password"
              onPress={onSubmit}
              loading={setPasswordMutation.isPending}
              disabled={verifyTokenMutation.isPending || !!verifyTokenMutation.error}
            />
          </View>
        </ScrollView>
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
  rulesBlock: {
    marginTop: -4,
    marginBottom: 8,
  },
  errorText: {
    color: Colors.error,
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 8,
    textAlign: 'center',
  },
});
