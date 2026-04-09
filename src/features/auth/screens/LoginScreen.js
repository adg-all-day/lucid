import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import AuthShell from '../components/AuthShell';
import AuthField from '../components/AuthField';
import AuthPrimaryButton from '../components/AuthPrimaryButton';
import Text from '../../../components/StyledText';
import Colors from '../../../constants/colors';
import { loginSchema } from '../schemas/auth.schema';
import { useLogin } from '../../../api/queries/auth';
import useAuthStore from '../../../stores/authStore';
import getApiErrorMessage from '../utils/getApiErrorMessage';
import useTheme from '../../../hooks/useTheme';

export default function LoginScreen() {
  const router = useRouter();
  const theme = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const loginMutation = useLogin();
  const { control, handleSubmit } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    try {
      const result = await loginMutation.mutateAsync({
        email: data.email,
        password: data.password,
      });
      const payload = result?.data ?? result;

      if (payload?.requires_2fa) {
        useAuthStore.getState().setSessionId(payload.session_id);
        router.push('/two-factor-authentication');
        return;
      }
      router.replace('/(tabs)');
    } catch {
      // error is available via loginMutation.error
    }
  });

  return (
    <AuthShell title="Log In" cardStyle={styles.card}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <View style={styles.form}>
          <AuthField
            control={control}
            name="email"
            label="Email or Username"
            icon="mail-outline"
            autoCapitalize="none"
            autoFocus
            highlighted
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

          <Pressable onPress={() => router.push('/forgot-password')}>
            <Text style={styles.linkText}>Forgot Password?</Text>
          </Pressable>

          {loginMutation.error ? (
            <Text style={styles.errorText}>
              {getApiErrorMessage(loginMutation.error, 'Login failed. Please try again.')}
            </Text>
          ) : null}

          <AuthPrimaryButton title="Login" onPress={onSubmit} loading={loginMutation.isPending} />

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
  linkText: {
    color: Colors.primary,
    fontSize: 12,
    marginTop: -1,
    marginBottom: 24,
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
    fontSize: 12,
  },
  footerLink: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '500',
  },
});
