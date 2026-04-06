import React, { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import AuthShell from '../components/AuthShell';
import AuthField from '../components/AuthField';
import AuthPrimaryButton from '../components/AuthPrimaryButton';
import Text from '../../../components/StyledText';
import Colors from '../../../constants/colors';
import { passwordChecks, signUpSchema } from '../schemas/auth.schema';
import { useRegister } from '../../../api/queries/auth';

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

export default function SignUpScreen() {
  const router = useRouter();
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

  const password = watch('password');
  const checks = useMemo(
    () => passwordChecks.map((check) => ({ ...check, passed: check.test(password || '') })),
    [password],
  );

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
    <AuthShell title="Sign Up">
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

            {registerMutation.error ? (
              <Text style={styles.errorText}>
                {registerMutation.error?.response?.data?.message || 'Registration failed. Please try again.'}
              </Text>
            ) : null}

            <AuthPrimaryButton title="Sign up" onPress={onSubmit} loading={registerMutation.isPending} style={styles.primaryButton} />

            <View style={styles.footerRow}>
              <Text style={styles.footerText}>Have an account? </Text>
              <Pressable onPress={() => router.push('/log-in')}>
                <Text style={styles.footerLink}>Log In</Text>
              </Pressable>
            </View>
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
  repeatTrailing: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  repeatTrailingButton: {
    width: 66,
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
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    marginBottom: 4,
  },
  footerText: {
    color: Colors.black,
    fontSize: 12,
  },
  footerLink: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '500',
  },
});
