import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import Text from '../../../components/StyledText';
import Colors from '../../../constants/colors';
import useTheme from '../../../hooks/useTheme';
import { VerifiedShieldIcon, UnverifiedShieldIcon } from '../../../icons';
import { useProfile, useUpdateProfile } from '../../../api/queries/profile';
import SectionHeading from './SectionHeading';
import SettingsField from './SettingsField';
import { getSettingsSectionCardBackground } from '../utils/sectionCardStyle';

const EMPTY_BASIC = {
  firstName: '',
  middleName: '',
  lastName: '',
  address1: '',
  address2: '',
  city: '',
  zip: '',
  country: '',
  email: '',
  phone: '',
};

const EMPTY_BUSINESS = {
  name: '',
  title: '',
  address1: '',
  address2: '',
  city: '',
  zip: '',
  country: '',
};

function mapProfile(profile) {
  if (!profile) return { basic: EMPTY_BASIC, business: EMPTY_BUSINESS, avatar: '', verified: false };
  const b = profile.business || {};
  return {
    basic: {
      firstName: profile.first_name || '',
      middleName: profile.middle_name || '',
      lastName: profile.last_name || '',
      address1: profile.address_1 || profile.address1 || profile.address || '',
      address2: profile.address_2 || profile.address2 || '',
      city: profile.city || '',
      zip: profile.zip || profile.post_code || profile.postcode || '',
      country: profile.country || '',
      email: profile.email || '',
      phone: profile.phone || profile.telephone || '',
    },
    business: {
      name: b.name || profile.business_name || '',
      title: b.title || profile.job_title || '',
      address1: b.address_1 || b.address1 || '',
      address2: b.address_2 || b.address2 || '',
      city: b.city || '',
      zip: b.zip || b.post_code || '',
      country: b.country || '',
    },
    avatar: profile.avatar || profile.avatar_url || profile.photo || '',
    verified: String(profile.persona_status || '').toLowerCase() === 'approved'
      || profile.email_verified === true
      || profile.is_verified === true,
  };
}

const ProfileSection = forwardRef(function ProfileSection(_props, ref) {
  const { t } = useTranslation();
  const theme = useTheme();
  const sectionCardBackground = getSettingsSectionCardBackground(theme);
  const { data: profile } = useProfile();
  const updateProfile = useUpdateProfile();
  const [basic, setBasic] = useState(EMPTY_BASIC);
  const [business, setBusiness] = useState(EMPTY_BUSINESS);
  const [avatar, setAvatar] = useState('');
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    const mapped = mapProfile(profile);
    setBasic(mapped.basic);
    setBusiness(mapped.business);
    setAvatar(mapped.avatar);
    setVerified(mapped.verified);
  }, [profile]);

  const updateBasic = (k) => (v) => setBasic((p) => ({ ...p, [k]: v }));
  const updateBiz = (k) => (v) => setBusiness((p) => ({ ...p, [k]: v }));

  useImperativeHandle(ref, () => ({
    async save() {
      try {
        const formData = new FormData();
        formData.append('first_name', basic.firstName || '');
        formData.append('middle_name', basic.middleName || '');
        formData.append('last_name', basic.lastName || '');
        formData.append('address', basic.address1 || '');
        formData.append('address_two', basic.address2 || '');
        formData.append('city', basic.city || '');
        formData.append('zip', basic.zip || '');
        formData.append('country', basic.country || '');
        formData.append('phone', basic.phone || '');
        formData.append('business_name', business.name || '');
        formData.append('job_title', business.title || '');
        formData.append('business_address', business.address1 || '');
        formData.append('business_address_two', business.address2 || '');
        formData.append('business_city', business.city || '');
        formData.append('business_zip', business.zip || '');
        formData.append('business_country', business.country || '');
        if (avatar) formData.append('avatar_url', avatar);

        const result = await updateProfile.mutateAsync(formData);
        return {
          ok: true,
          title: t('common.saved'),
          message: result?.message || result?.data?.message || t('settings.profile.profileUpdated'),
        };
      } catch (error) {
        return {
          ok: false,
          title: t('common.error'),
          message:
            error?.response?.data?.message ||
            error?.response?.data?.error ||
            t('settings.profile.profileUpdateError'),
        };
      }
    },
  }), [basic, business, avatar, updateProfile, t]);

  return (
    <View>
      <SectionHeading title={t('settings.profile.basicInformation')} />

      <View style={[styles.card, { backgroundColor: sectionCardBackground }]}>
        <View style={styles.fieldGap}><SettingsField label={t('settings.profile.firstName')} required value={basic.firstName} onChangeText={updateBasic('firstName')} /></View>
        <View style={styles.fieldGap}><SettingsField label={t('settings.profile.middleName')} value={basic.middleName} onChangeText={updateBasic('middleName')} /></View>
        <View style={styles.fieldGap}><SettingsField label={t('settings.profile.lastName')} required value={basic.lastName} onChangeText={updateBasic('lastName')} /></View>
        <View style={styles.fieldGap}><SettingsField label={t('settings.profile.address1')} required value={basic.address1} onChangeText={updateBasic('address1')} /></View>
        <View style={styles.fieldGap}><SettingsField label={t('settings.profile.address2')} value={basic.address2} onChangeText={updateBasic('address2')} /></View>
        <View style={styles.fieldGap}><SettingsField label={t('settings.profile.city')} required value={basic.city} onChangeText={updateBasic('city')} /></View>
        <View style={styles.fieldGap}><SettingsField label={t('settings.profile.zipPostCode')} required value={basic.zip} onChangeText={updateBasic('zip')} /></View>
        <View style={styles.fieldGap}><SettingsField label={t('settings.profile.country')} required value={basic.country} onChangeText={updateBasic('country')} /></View>

        <View style={styles.fieldGap}><SettingsField label={t('settings.profile.emailAddress')} required value={basic.email} onChangeText={updateBasic('email')} /></View>
        <TouchableOpacity activeOpacity={0.7}>
          <Text style={styles.changeEmailLink}>{t('settings.profile.changeEmail')}</Text>
        </TouchableOpacity>

        <View style={styles.fieldGap}><SettingsField label={t('settings.profile.telephoneOptional')} value={basic.phone} onChangeText={updateBasic('phone')} keyboardType="phone-pad" /></View>

        <View style={styles.avatarWrap}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.imageUpload, { borderColor: theme.divider, backgroundColor: theme.cardBgSolid }]}
          >
            {avatar ? (
              <Image source={{ uri: avatar }} style={styles.avatarImage} />
            ) : (
              <Ionicons name="person-outline" size={40} color={theme.iconMuted} />
            )}
          </TouchableOpacity>
          <View style={[styles.verifiedBadge, { backgroundColor: theme.cardBg }]}>
            {verified ? <VerifiedShieldIcon size={20} /> : <UnverifiedShieldIcon size={20} />}
          </View>
        </View>
      </View>

      <SectionHeading title={t('settings.profile.businessInformation')} />

      <View style={[styles.card, { backgroundColor: sectionCardBackground }]}>
        <View style={styles.fieldGap}><SettingsField label={t('settings.profile.businessName')} required value={business.name} onChangeText={updateBiz('name')} /></View>
        <View style={styles.fieldGap}><SettingsField label={t('settings.profile.jobTitle')} required value={business.title} onChangeText={updateBiz('title')} /></View>
        <View style={styles.fieldGap}><SettingsField label={t('settings.profile.address1')} required value={business.address1} onChangeText={updateBiz('address1')} /></View>
        <View style={styles.fieldGap}><SettingsField label={t('settings.profile.address2')} value={business.address2} onChangeText={updateBiz('address2')} /></View>
        <View style={styles.fieldGap}><SettingsField label={t('settings.profile.city')} required value={business.city} onChangeText={updateBiz('city')} /></View>
        <View style={styles.fieldGap}><SettingsField label={t('settings.profile.zipPostCode')} required value={business.zip} onChangeText={updateBiz('zip')} /></View>
        <View style={styles.fieldGap}><SettingsField label={t('settings.profile.country')} required value={business.country} onChangeText={updateBiz('country')} /></View>

        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.imageUpload, { borderColor: theme.divider, backgroundColor: theme.cardBgSolid }]}
        >
          <Ionicons name="briefcase-outline" size={40} color={theme.iconMuted} />
        </TouchableOpacity>
      </View>
    </View>
  );
});

export default ProfileSection;

const styles = StyleSheet.create({
  card: {
    borderRadius: 8,
    padding: 14,
  },
  fieldGap: {
    marginBottom: 10,
  },
  changeEmailLink: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 6,
    textDecorationLine: 'underline',
  },
  avatarWrap: {
    marginTop: 20,
    width: 88,
    height: 88,
  },
  imageUpload: {
    width: 88,
    height: 88,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 6,
  },
  verifiedBadge: {
    position: 'absolute',
    right: -6,
    bottom: -6,
    borderRadius: 14,
    padding: 2,
  },
});
