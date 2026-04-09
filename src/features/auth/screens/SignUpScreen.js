import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import AuthShell from '../components/AuthShell';
import AuthField from '../components/AuthField';
import AuthPrimaryButton from '../components/AuthPrimaryButton';
import AuthFooterLink from '../components/AuthFooterLink';
import PasswordRules from '../components/PasswordRules';
import Text from '../../../components/StyledText';
import Colors from '../../../constants/colors';
import { signUpSchema } from '../schemas/auth.schema';
import { useRegister } from '../../../api/queries/auth';
import useTheme from '../../../hooks/useTheme';
import usePasswordChecks from '../hooks/usePasswordChecks';

export default function SignUpScreen() {
  const router = useRouter();
  const theme = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  const registerMutation = useRegister();
  const { control, handleSubmit, watch } = useForm({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      repeatPassword: '',
    },
  });

  const checks = usePasswordChecks(watch('password'));

  const onSubmit = handleSubmit(async (data) => {
    try {
      await registerMutation.mutateAsync({
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        password: data.password,
        repeat_password: data.repeatPassword,
      });
      router.push({ pathname: '/email-verification', params: { email: data.email } });
    } catch {
      // error available via registerMutation.error
    }
  });

  return (
    <AuthShell title="Sign Up" cardStyle={styles.card}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.form}>
            <AuthField
              control={control}
              name="firstName"
              label="First Name"
              autoCapitalize="words"
            />
            <AuthField
              control={control}
              name="lastName"
              label="Last Name"
              autoCapitalize="words"
            />
            <AuthField
              control={control}
              name="email"
              label="Email"
              icon="at-circle-outline"
            />
            <AuthField
              control={control}
              name="password"
              label="Password"
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

            {registerMutation.error ? (
              <Text style={styles.errorText}>
                {registerMutation.error?.response?.data?.message || 'Registration failed. Please try again.'}
              </Text>
            ) : null}

            <AuthPrimaryButton title="Sign up" onPress={onSubmit} loading={registerMutation.isPending} style={styles.primaryButton} />

            <AuthFooterLink
              prompt="Have an account?"
              actionLabel="Log In"
              onPress={() => router.push('/log-in')}
              style={styles.footerRow}
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
  scrollContent: {
    paddingBottom: 6,
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
    marginBottom: 8,
    textAlign: 'center',
  },
  primaryButton: {
    marginTop: 4,
  },
  footerRow: {
    marginTop: 16,
    marginBottom: 4,
  },
});
