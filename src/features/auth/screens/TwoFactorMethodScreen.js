import React, { useEffect, useMemo } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import AuthShell from '../components/AuthShell';
import AuthPrimaryButton from '../components/AuthPrimaryButton';
import TwoFactorMethodOption from '../components/TwoFactorMethodOption';
import Text from '../../../components/StyledText';
import Colors from '../../../constants/colors';
import { twoFactorMethodSchema } from '../schemas/auth.schema';
import { useGet2FAMethods, useSend2FAChallenge } from '../../../api/queries/auth';
import useAuthStore from '../../../stores/authStore';
import useTheme from '../../../hooks/useTheme';
import { mapTwoFactorMethods } from '../constants/twoFactorMethods';

export default function TwoFactorMethodScreen() {
  const router = useRouter();
  const theme = useTheme();
  const sessionId = useAuthStore((state) => state.sessionId);
  const methodsMutation = useGet2FAMethods();
  const challengeMutation = useSend2FAChallenge();

  useEffect(() => {
    if (sessionId) {
      methodsMutation.mutate({ session_id: sessionId });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  const methodOptions = useMemo(() => {
    return mapTwoFactorMethods(methodsMutation.data?.methods);
  }, [methodsMutation.data]);

  const { control, handleSubmit } = useForm({
    resolver: zodResolver(twoFactorMethodSchema),
    defaultValues: {
      method: 'authenticator',
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (data.method === 'recovery_code') {
        await challengeMutation.mutateAsync({ session_id: sessionId, method: data.method });
        router.push('/recovery-code');
        return;
      }

      await challengeMutation.mutateAsync({ session_id: sessionId, method: data.method });
      router.push('/two-factor-code');
    } catch {
      // error available via challengeMutation.error
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
            Select your preferred method for two-factor authentication
          </Text>

          {methodsMutation.isPending ? (
            <ActivityIndicator size="small" color={Colors.primary} style={styles.loading} />
          ) : (
            <Controller
              control={control}
              name="method"
              render={({ field: { onChange, value } }) => (
                <View style={styles.options}>
                  {methodOptions.map((option) => (
                    <TwoFactorMethodOption
                      key={option.value}
                      title={option.title}
                      description={option.description}
                      selected={value === option.value}
                      onPress={() => onChange(option.value)}
                    />
                  ))}
                </View>
              )}
            />
          )}

          {challengeMutation.error ? (
            <Text style={styles.errorText}>
              {challengeMutation.error?.response?.data?.message || 'Request failed. Please try again.'}
            </Text>
          ) : null}

          <AuthPrimaryButton title="Proceed" onPress={onSubmit} loading={challengeMutation.isPending} />
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
  loading: {
    marginVertical: 20,
  },
  options: {
    marginBottom: 16,
  },
  errorText: {
    color: Colors.error,
    fontSize: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
});
