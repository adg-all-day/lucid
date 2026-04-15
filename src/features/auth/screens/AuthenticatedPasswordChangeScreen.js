import React, { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { BlurTargetView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import AuthField from '../components/AuthField';
import AuthPrimaryButton from '../components/AuthPrimaryButton';
import PasswordRules from '../components/PasswordRules';
import TransactionOverlayShell from '../../transactions/components/TransactionOverlayShell';
import TransactionResultModal from '../../transactions/components/TransactionResultModal';
import Text from '../../../components/StyledText';
import Colors from '../../../constants/colors';
import { createAuthenticatedPasswordChangeSchema } from '../schemas/auth.schema';
import { useChangePassword } from '../../../api/queries/auth';
import useTheme from '../../../hooks/useTheme';
import usePasswordChecks from '../hooks/usePasswordChecks';

export default function AuthenticatedPasswordChangeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const theme = useTheme();
  const changePassword = useChangePassword();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [blurTargetRef, setBlurTargetRef] = useState(null);
  const [resultModal, setResultModal] = useState({
    visible: false,
    title: '',
    message: '',
    onClose: null,
  });

  const schema = useMemo(() => createAuthenticatedPasswordChangeSchema(t), [t]);

  const { control, handleSubmit, watch } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      currentPassword: '',
      password: '',
      repeatPassword: '',
    },
  });

  const checks = usePasswordChecks(watch('password'));

  const showResultModal = (title, message, onClose = null) => {
    setResultModal({
      visible: true,
      title,
      message,
      onClose,
    });
  };

  const closeResultModal = () => {
    const closeHandler = resultModal.onClose;
    setResultModal({
      visible: false,
      title: '',
      message: '',
      onClose: null,
    });
    changePassword.reset?.();

    if (closeHandler) {
      closeHandler();
    }
  };

  const onSubmit = handleSubmit(async (data) => {
    setIsSubmitting(true);
    try {
      const result = await changePassword.mutateAsync({
        current_password: data.currentPassword,
        new_password: data.password,
        repeat_password: data.repeatPassword,
      });

      setIsSubmitting(false);
      showResultModal(
        t('common.success'),
        result?.message || result?.data?.message || t('auth.changePassword.successMessage'),
        () => router.back(),
      );
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        t('auth.changePassword.errorMessage');

      setIsSubmitting(false);
      showResultModal(t('common.error'), message);
    }
  });

  return (
    <>
      <BlurTargetView ref={setBlurTargetRef} style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.header, { backgroundColor: theme.headerBg }]}>
          <View style={styles.headerContent}>
            <View style={styles.headerSide}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.back()}
                activeOpacity={0.7}
              >
                <Ionicons name="arrow-back-circle-outline" size={28} color={Colors.white} />
              </TouchableOpacity>
            </View>
            <Text style={styles.headerTitle}>{t('auth.changePassword.title')}</Text>
            <View style={styles.headerSide} />
          </View>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.flex}
        >
          <ScrollView
            style={styles.body}
            contentContainerStyle={styles.bodyContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View
              style={[
                styles.card,
                {
                  backgroundColor: theme.modalBg,
                  borderColor: theme.isDark ? theme.divider : 'transparent',
                },
              ]}
            >
              <View style={styles.form}>
                <AuthField
                  control={control}
                  name="currentPassword"
                  label={t('auth.changePassword.currentPassword')}
                  secureTextEntry={!showCurrentPassword}
                  trailing={
                    <Ionicons
                      name={showCurrentPassword ? 'eye-outline' : 'eye-off-outline'}
                      size={18}
                      color={theme.iconMuted}
                      onPress={() => setShowCurrentPassword((value) => !value)}
                    />
                  }
                />

                <AuthField
                  control={control}
                  name="password"
                  label={t('auth.changePassword.newPassword')}
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
                  label={t('auth.changePassword.repeatPassword')}
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

                <AuthPrimaryButton
                  title={t('auth.changePassword.title')}
                  onPress={onSubmit}
                  loading={isSubmitting || changePassword.isPending}
                />
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </BlurTargetView>

      <TransactionOverlayShell
        visible={resultModal.visible}
        blurTarget={blurTargetRef}
        onClose={closeResultModal}
      >
        <TransactionResultModal
          title={resultModal.title}
          message={resultModal.message}
          theme={theme}
          isDark={theme.isDark}
          onClose={closeResultModal}
        />
      </TransactionOverlayShell>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 38,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#FFFFFF',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  headerSide: {
    width: 40,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  backButton: {
    width: 28,
    height: 28,
  },
  headerTitle: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 18,
  },
  flex: {
    flex: 1,
  },
  body: {
    flex: 1,
  },
  bodyContent: {
    width: '100%',
    paddingHorizontal: 8,
    paddingTop: 15,
    paddingBottom: 30,
  },
  form: {
    paddingBottom: 6,
  },
  card: {
    minHeight: 760,
    borderRadius: 9,
    padding: 12,
    borderWidth: 1,
  },
  rulesBlock: {
    marginTop: -4,
    marginBottom: 8,
  },
});
