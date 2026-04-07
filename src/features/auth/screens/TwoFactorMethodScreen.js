import React, { useEffect, useMemo } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import AuthShell from '../components/AuthShell';
import AuthPrimaryButton from '../components/AuthPrimaryButton';
import Text from '../../../components/StyledText';
import Colors from '../../../constants/colors';
import { twoFactorMethodSchema } from '../schemas/auth.schema';
import { useGet2FAMethods, useSend2FAChallenge } from '../../../api/queries/auth';
import useAuthStore from '../../../stores/authStore';

const FALLBACK_OPTIONS = [
  {
    value: 'authenticator',
    title: 'Authenticator App',
    description: 'Get one-time codes from your authorised authenticator app',
  },
  {
    value: 'sms',
    title: 'SMS or WhatsApp',
    description: "We'll send a code to the number registered to your account",
  },
  {
    value: 'email',
    title: 'Email Address',
    description: "We'll send a code to email address registered to your account",
  },
];

const METHOD_LABELS = {
  authenticator: { title: 'Authenticator App', description: 'Get one-time codes from your authorised authenticator app' },
  sms: { title: 'SMS or WhatsApp', description: "We'll send a code to the number registered to your account" },
  email: { title: 'Email Address', description: "We'll send a code to email address registered to your account" },
};

function MethodOption({ title, description, selected, onPress }) {
  return (
    <Pressable style={styles.optionRow} onPress={onPress}>
      <View style={[styles.radioOuter, selected && styles.radioOuterSelected]}>
        {selected ? <View style={styles.radioInner} /> : null}
      </View>
      <View style={styles.optionTextBlock}>
        <Text style={styles.optionTitle}>{title}</Text>
        <Text style={styles.optionDescription}>{description}</Text>
      </View>
    </Pressable>
  );
}

export default function TwoFactorMethodScreen() {
  const router = useRouter();
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
    const apiMethods = methodsMutation.data?.methods;
    if (Array.isArray(apiMethods) && apiMethods.length > 0) {
      return apiMethods.map((m) => ({
        value: m,
        title: METHOD_LABELS[m]?.title || m,
        description: METHOD_LABELS[m]?.description || '',
      }));
    }
    return FALLBACK_OPTIONS;
  }, [methodsMutation.data]);

  const { control, handleSubmit } = useForm({
    resolver: zodResolver(twoFactorMethodSchema),
    defaultValues: {
      method: 'authenticator',
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    try {
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
          <Text style={styles.heading}>
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
                    <MethodOption
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
    color: '#3A3A3A',
    fontWeight: '500',
    marginBottom: 18,
  },
  loading: {
    marginVertical: 20,
  },
  options: {
    marginBottom: 16,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 18,
  },
  radioOuter: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#D6D6D6',
    marginTop: 2,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: {
    borderColor: Colors.primary,
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  optionTextBlock: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 14,
    color: '#2E2E2E',
    fontWeight: '700',
    marginBottom: 2,
  },
  optionDescription: {
    fontSize: 13,
    lineHeight: 18,
    color: '#525252',
  },
  errorText: {
    color: Colors.error,
    fontSize: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
});
