import React, { useEffect, useState } from 'react';
import { Alert, View, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import Text from '../../../components/StyledText';
import Colors from '../../../constants/colors';
import useTheme from '../../../hooks/useTheme';
import { useProfile } from '../../../api/queries/profile';
import { useRecoveryCodes } from '../../../api/queries/auth';
import SectionHeading from './SectionHeading';
import SettingsField from './SettingsField';
import RowActions from './RowActions';
import { getSettingsSectionCardBackground } from '../utils/sectionCardStyle';

function IconLabel({ icon, title, description, theme }) {
  return (
    <View style={styles.iconLabel}>
      <Ionicons name={icon} size={20} color={theme.text} style={{ marginTop: 2 }} />
      <View style={{ flex: 1, marginLeft: 10 }}>
        <Text style={[styles.iconLabelTitle, { color: theme.text }]}>{title}</Text>
        {description ? (
          <Text style={[styles.iconLabelDesc, { color: theme.textSecondary }]}>{description}</Text>
        ) : null}
      </View>
    </View>
  );
}

function formatRecoveryCodes(payload) {
  if (!payload) return '';
  if (Array.isArray(payload)) return payload.join('\n');
  if (Array.isArray(payload.codes)) return payload.codes.join('\n');
  if (Array.isArray(payload.recovery_codes)) return payload.recovery_codes.join('\n');
  if (typeof payload.code === 'string') return payload.code;
  if (typeof payload === 'string') return payload;
  return '';
}

export default function SecuritySection() {
  const { t } = useTranslation();
  const theme = useTheme();
  const sectionCardBackground = getSettingsSectionCardBackground(theme);
  const router = useRouter();
  const { data: profile } = useProfile();
  const recoveryCodes = useRecoveryCodes();

  const [primaryEmail, setPrimaryEmail] = useState('');
  const [newDevice, setNewDevice] = useState(true);
  const [twoFa, setTwoFa] = useState(false);
  const [phone, setPhone] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState('call'); // 'text' | 'call'
  const [secondaryEmail, setSecondaryEmail] = useState('');

  useEffect(() => {
    if (!profile) return;
    setPrimaryEmail(profile.email || '');
    setPhone(profile.phone || profile.telephone || '');
    setSecondaryEmail(profile.secondary_email || profile.alternate_email || '');
    if (typeof profile.two_factor_enabled === 'boolean') setTwoFa(profile.two_factor_enabled);
    if (typeof profile.new_device_verification === 'boolean') setNewDevice(profile.new_device_verification);
  }, [profile]);

  const handleChangePassword = () => router.push('/change-password');
  const handleActivityLog = () => router.push('/activity-log');

  const handleShowRecoveryCodes = async () => {
    try {
      const result = await recoveryCodes.mutateAsync();
      const formatted = formatRecoveryCodes(result);
      Alert.alert(
        t('settings.security.yourRecoveryCodes'),
        formatted || t('settings.security.noRecoveryCodes'),
        [{ text: t('common.done') }],
      );
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        t('settings.security.recoveryCodesError');
      Alert.alert(t('common.error'), message);
    }
  };

  return (
    <View>
      <SectionHeading title={t('settings.security.defaultSecurity')} />
      <View style={[styles.card, { backgroundColor: sectionCardBackground }]}>
        <SettingsField label={t('settings.security.primaryEmail')} value={primaryEmail} onChangeText={setPrimaryEmail} />

        <View style={{ marginTop: 18 }}>
          <IconLabel icon="key-outline" title={t('settings.security.password')} description={t('settings.security.passwordDescription')} theme={theme} />
          <TouchableOpacity
            onPress={handleChangePassword}
            activeOpacity={0.8}
            style={[styles.softBtn, { backgroundColor: theme.primaryLight }]}
          >
            <Text style={styles.softBtnText}>{t('settings.security.changePassword')}</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.innerDivider, { backgroundColor: theme.divider }]} />

        <IconLabel
          icon="document-text-outline"
          title={t('settings.security.recoveryCode')}
          description={t('settings.security.recoveryCodeDescription')}
          theme={theme}
        />
        <TouchableOpacity
          onPress={handleShowRecoveryCodes}
          disabled={recoveryCodes.isPending}
          activeOpacity={0.8}
          style={[styles.softBtn, { backgroundColor: theme.primaryLight }]}
        >
          <Text style={styles.softBtnText}>
            {recoveryCodes.isPending ? t('common.loading') : t('settings.security.showCode')}
          </Text>
        </TouchableOpacity>
      </View>

      <SectionHeading title={t('settings.security.loginSecurity')} />
      <View style={[styles.card, { backgroundColor: sectionCardBackground }]}>
        <View style={styles.toggleRow}>
          <View style={styles.toggleLabel}>
            <IconLabel
              icon="tv-outline"
              title={t('settings.security.newDeviceVerification')}
              description={t('settings.security.newDeviceVerificationDescription')}
              theme={theme}
            />
          </View>
          <Switch
            value={newDevice}
            onValueChange={setNewDevice}
            trackColor={{ true: Colors.primary, false: Colors.grayLight }}
            thumbColor={Colors.white}
            style={styles.switch}
          />
        </View>
        <View style={[styles.innerDivider, { backgroundColor: theme.divider }]} />
        <View style={styles.toggleRow}>
          <View style={styles.toggleLabel}>
            <IconLabel
              icon="shield-checkmark-outline"
              title={t('settings.security.twoFactorAuthentication')}
              description={t('settings.security.twoFactorAuthenticationDescription')}
              theme={theme}
            />
          </View>
          <Switch
            value={twoFa}
            onValueChange={setTwoFa}
            trackColor={{ true: Colors.primary, false: Colors.grayLight }}
            thumbColor={Colors.white}
            style={styles.switch}
          />
        </View>
      </View>

      <SectionHeading title={t('settings.security.verificationMethods')} />
      <View style={[styles.card, { backgroundColor: sectionCardBackground }]}>
        <IconLabel
          icon="call-outline"
          title={t('settings.security.phoneNumber')}
          description={t('settings.security.phoneNumberDescription')}
          theme={theme}
        />
        <SettingsField label={t('settings.profile.telephoneOptional')} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        <Text style={[styles.smallQuestion, { color: theme.text }]}>{t('settings.security.receiveCodeQuestion')}</Text>
        <View style={styles.radioRow}>
          <TouchableOpacity
            style={styles.radioOption}
            activeOpacity={0.7}
            onPress={() => setDeliveryMethod('text')}
          >
            <View style={[styles.radioOuter, deliveryMethod === 'text' && styles.radioOuterActive]}>
              {deliveryMethod === 'text' && <View style={styles.radioInner} />}
            </View>
            <Text style={[styles.radioLabel, { color: theme.text }]}>{t('settings.security.textMessage')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.radioOption}
            activeOpacity={0.7}
            onPress={() => setDeliveryMethod('call')}
          >
            <View style={[styles.radioOuter, deliveryMethod === 'call' && styles.radioOuterActive]}>
              {deliveryMethod === 'call' && <View style={styles.radioInner} />}
            </View>
            <Text style={[styles.radioLabel, { color: theme.text }]}>{t('settings.security.phoneCall')}</Text>
          </TouchableOpacity>
        </View>
        <RowActions style={{ alignSelf: 'flex-end', marginTop: 10 }} />

        <View style={[styles.innerDivider, { backgroundColor: theme.divider }]} />

        <IconLabel
          icon="mail-outline"
          title={t('settings.security.secondaryEmail')}
          description={t('settings.security.secondaryEmailDescription')}
          theme={theme}
        />
        <SettingsField label={t('settings.security.email')} value={secondaryEmail} onChangeText={setSecondaryEmail} />
        <RowActions style={{ alignSelf: 'flex-end', marginTop: 10 }} />

        <View style={[styles.innerDivider, { backgroundColor: theme.divider }]} />

        <IconLabel
          icon="finger-print-outline"
          title={t('settings.security.passkey')}
          description={t('settings.security.passkeyDescription')}
          theme={theme}
        />
        <RowActions style={{ alignSelf: 'flex-end', marginTop: 10 }} />

        <View style={[styles.innerDivider, { backgroundColor: theme.divider }]} />

        <IconLabel
          icon="apps-outline"
          title={t('settings.security.authenticatorApp')}
          description={t('settings.security.authenticatorAppDescription')}
          theme={theme}
        />
        <TouchableOpacity activeOpacity={0.8} style={[styles.softBtn, { backgroundColor: theme.primaryLight }]}>
          <Text style={styles.softBtnText}>{t('settings.security.setup2fa')}</Text>
        </TouchableOpacity>
      </View>

      <SectionHeading title={t('settings.security.eventLog')} />
      <View style={[styles.card, { backgroundColor: sectionCardBackground }]}>
        <IconLabel
          icon="time-outline"
          title={t('settings.security.recentActivityLog')}
          description={t('settings.security.recentActivityLogDescription')}
          theme={theme}
        />
        <TouchableOpacity
          onPress={handleActivityLog}
          activeOpacity={0.8}
          style={[styles.softBtn, { backgroundColor: theme.primaryLight }]}
        >
          <Text style={styles.softBtnText}>{t('settings.security.viewActivityLog')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 8,
    padding: 14,
  },
  iconLabel: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconLabelTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  iconLabelDesc: {
    fontSize: 12,
    marginTop: 4,
    lineHeight: 16,
  },
  softBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 6,
    marginTop: 10,
  },
  softBtnText: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  innerDivider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 18,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  toggleLabel: {
    flex: 1,
  },
  switch: {
    alignSelf: 'center',
  },
  smallQuestion: {
    fontSize: 13,
    marginTop: 14,
    fontWeight: '500',
  },
  radioRow: {
    flexDirection: 'row',
    gap: 28,
    marginTop: 8,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: Colors.grayMedium,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  radioOuterActive: {
    borderColor: Colors.primary,
  },
  radioInner: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: Colors.primary,
  },
  radioLabel: {
    fontSize: 13,
  },
});
