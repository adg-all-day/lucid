import React, { useEffect, useMemo, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import AuthShell from '../components/AuthShell';
import AuthField from '../components/AuthField';
import AuthPrimaryButton from '../components/AuthPrimaryButton';
import Text from '../../../components/StyledText';
import Colors from '../../../constants/colors';
import { passwordChecks, passwordChangeSchema } from '../schemas/auth.schema';
import { useSetPassword, useVerifyResetToken } from '../../../api/queries/auth';

function PasswordRule({ label, passed }) {
  return (
    <View style={styles.ruleRow}>
      <Ionicons
        name="checkmark-circle"
        size={16}
        color={passed ? '#059669' : '#A0A0A0'}
      />
      <Text style={[styles.ruleText, passed && styles.ruleTextPassed]}>{label}</Text>
    </View>
  );
}

export default function PasswordChangeScreen({ resetToken }) {
  const router = useRouter();
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

  const password = watch('password');
  const checks = useMemo(
    () => passwordChecks.map((check) => ({ ...check, passed: check.test(password || '') })),
    [password],
  );

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
      <AuthShell title="Password Change">
        <View style={styles.missingTokenContent}>
          <Text style={styles.errorText}>Invalid or expired reset link.</Text>
          <Pressable style={styles.backButton} onPress={() => router.replace('/log-in')}>
            <Text style={styles.backButtonText}>Back to Login</Text>
          </Pressable>
        </View>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Password Change">
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
                  color={Colors.grayMedium}
                  onPress={() => setShowPassword((value) => !value)}
                />
              }
            />

            <View style={styles.rulesBlock}>
              {checks.map((check) => (
                <PasswordRule key={check.key} label={check.label} passed={check.passed} />
              ))}
            </View>

            <AuthField
              control={control}
              name="repeatPassword"
              label="Retype Password"
              secureTextEntry={!showRepeatPassword}
              trailing={
                <Ionicons
                  name={showRepeatPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={18}
                  color={Colors.grayMedium}
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
  rulesBlock: {
    marginTop: -4,
    marginBottom: 8,
    gap: 4,
  },
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ruleText: {
    marginLeft: 7,
    fontSize: 11.5,
    color: '#A0A0A0',
  },
  ruleTextPassed: {
    color: '#059669',
  },
  missingTokenContent: {
    alignItems: 'center',
    paddingTop: 30,
    gap: 16,
  },
  backButton: {
    backgroundColor: Colors.primary,
    borderRadius: 5,
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  errorText: {
    color: Colors.error,
    fontSize: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
});
