import React from 'react';
import { Alert, View, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import Text from '../../../components/StyledText';
import Colors from '../../../constants/colors';
import useTheme from '../../../hooks/useTheme';
import SectionHeading from './SectionHeading';
import RowActions from './RowActions';
import {
  useSignatures,
  useUploadSignature,
  useDeleteSignature,
} from '../../../api/queries/signatures';
import {
  useStamps,
  useUploadStamp,
  useDeleteStamp,
} from '../../../api/queries/stamps';
import { getSettingsSectionCardBackground } from '../utils/sectionCardStyle';

function AddButton({ label, onPress, disabled }) {
  const theme = useTheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
      style={[
        styles.addBtn,
        { borderColor: Colors.primary, backgroundColor: theme.cardBg, opacity: disabled ? 0.6 : 1 },
      ]}
    >
      {disabled ? (
        <ActivityIndicator size="small" color={Colors.primary} />
      ) : (
        <Ionicons name="add" size={16} color={Colors.primary} />
      )}
      <Text style={styles.addBtnText}>{label}</Text>
    </TouchableOpacity>
  );
}

function EmptyState({ label, theme }) {
  return (
    <View style={styles.emptyState}>
      <Text style={[styles.emptyText, { color: theme.textSecondary }]}>{label}</Text>
    </View>
  );
}

async function pickImage(t) {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    Alert.alert(t('settings.signatures.permissionNeeded'), t('settings.signatures.photoPermission'));
    return null;
  }
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    quality: 0.8,
  });
  if (result.canceled || !result.assets?.length) return null;
  return result.assets[0];
}

function buildImageFormData(fieldName, asset, extraFields) {
  const formData = new FormData();
  const fileName = asset.fileName || `${fieldName}-${Date.now()}.jpg`;
  const mimeType = asset.mimeType || 'image/jpeg';
  formData.append(fieldName, {
    uri: asset.uri,
    name: fileName,
    type: mimeType,
  });
  if (extraFields) {
    Object.entries(extraFields).forEach(([k, v]) => formData.append(k, String(v)));
  }
  return formData;
}

function pullList(payload) {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload.items)) return payload.items;
  return [];
}

export default function SignaturesStampsSection() {
  const { t } = useTranslation();
  const theme = useTheme();
  const sectionCardBackground = getSettingsSectionCardBackground(theme);
  const { data: sigData, isLoading: loadingSigs } = useSignatures();
  const { data: stampData, isLoading: loadingStamps } = useStamps();
  const uploadSignature = useUploadSignature();
  const uploadStamp = useUploadStamp();
  const deleteSignature = useDeleteSignature();
  const deleteStamp = useDeleteStamp();

  const signatures = pullList(sigData);
  const stamps = pullList(stampData);

  const handleAddSignature = async () => {
    const asset = await pickImage(t);
    if (!asset) return;
    const formData = buildImageFormData('signature', asset);
    try {
      await uploadSignature.mutateAsync(formData);
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        t('settings.signatures.uploadSignatureError');
      Alert.alert(t('common.error'), message);
    }
  };

  const handleAddStamp = async () => {
    const asset = await pickImage(t);
    if (!asset) return;
    const fallbackName = (asset.fileName || t('settings.signatures.stamp')).replace(/\.[^.]+$/, '');
    const formData = buildImageFormData('file', asset, {
      name: fallbackName || t('settings.signatures.stamp'),
      height: 40,
    });
    try {
      await uploadStamp.mutateAsync(formData);
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        t('settings.signatures.uploadStampError');
      Alert.alert(t('common.error'), message);
    }
  };

  const confirmDelete = (label, onConfirm) => {
    Alert.alert(t('settings.signatures.deleteTitle', { label }), t('settings.signatures.deleteWarning'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.delete'), style: 'destructive', onPress: onConfirm },
    ]);
  };

  const handleDeleteSignature = (id) => {
    if (!id) return;
    confirmDelete(t('settings.signatures.signature'), async () => {
      try {
        await deleteSignature.mutateAsync(id);
      } catch (error) {
        Alert.alert(t('common.error'), error?.response?.data?.message || t('settings.signatures.deleteSignatureError'));
      }
    });
  };

  const handleDeleteStamp = (id) => {
    if (!id) return;
    confirmDelete(t('settings.signatures.stamp'), async () => {
      try {
        await deleteStamp.mutateAsync(id);
      } catch (error) {
        Alert.alert(t('common.error'), error?.response?.data?.message || t('settings.signatures.deleteStampError'));
      }
    });
  };

  return (
    <View>
      <SectionHeading
        title={t('settings.signatures.savedSignatures')}
        right={<AddButton label={t('settings.signatures.addSignature')} onPress={handleAddSignature} disabled={uploadSignature.isPending} />}
      />

      <View style={[styles.card, { backgroundColor: sectionCardBackground }]}>
        {loadingSigs ? (
          <ActivityIndicator color={Colors.primary} style={{ paddingVertical: 20 }} />
        ) : signatures.length === 0 ? (
          <EmptyState label={t('settings.signatures.noSignatures')} theme={theme} />
        ) : (
          signatures.map((sig, i) => {
            const fullName = sig.full_name
              || sig.name
              || [sig.first_name, sig.middle_name, sig.last_name].filter(Boolean).join(' ')
              || t('settings.signatures.signature');
            const initials = sig.initials
              || fullName.split(' ').map((p) => p[0]).filter(Boolean).join('').toUpperCase();
            const code = sig.digital_signature_id || sig.code || sig.reference || sig.id;
            const preview = sig.file_url || sig.url || sig.image_url;
            return (
              <View key={sig.id || `sig-${i}`}>
                <View style={styles.sigRow}>
                  <View style={{ flex: 1.3 }}>
                    {preview ? (
                      <Image source={{ uri: preview }} style={styles.sigImage} resizeMode="contain" />
                    ) : null}
                    <Text style={[styles.sigLabel, { color: theme.text }]}>
                      {t('settings.signatures.signedBy')} <Text style={[styles.sigScript, { color: theme.text }]}>{fullName}</Text>
                    </Text>
                    {code ? (
                      <Text style={[styles.sigCode, { color: theme.textSecondary }]} numberOfLines={1}>
                        {String(code)}
                      </Text>
                    ) : null}
                  </View>
                  <View style={{ flex: 1, alignItems: 'flex-end' }}>
                    <Text style={[styles.sigLabel, { color: theme.text }]}>
                      {t('settings.signatures.initials')} <Text style={[styles.sigScript, { color: theme.text }]}>{initials}</Text>
                    </Text>
                    <RowActions
                      style={{ marginTop: 10 }}
                      onDelete={() => handleDeleteSignature(sig.id)}
                    />
                  </View>
                </View>
                {i < signatures.length - 1 ? (
                  <View style={[styles.divider, { backgroundColor: theme.divider }]} />
                ) : null}
              </View>
            );
          })
        )}
      </View>

      <SectionHeading
        title={t('settings.signatures.savedStamps')}
        right={<AddButton label={t('settings.signatures.addStamp')} onPress={handleAddStamp} disabled={uploadStamp.isPending} />}
      />

      <View style={[styles.card, { backgroundColor: sectionCardBackground }]}>
        {loadingStamps ? (
          <ActivityIndicator color={Colors.primary} style={{ paddingVertical: 20 }} />
        ) : stamps.length === 0 ? (
          <EmptyState label={t('settings.signatures.noStamps')} theme={theme} />
        ) : (
          stamps.map((stamp, i) => {
            const preview = stamp.image_url || stamp.url || stamp.file_url;
            const name = stamp.name || stamp.label || t('settings.signatures.stamp');
            return (
              <View key={stamp.id || `st-${i}`}>
                <View style={styles.stampRow}>
                  <View style={[styles.stampPreview, { borderColor: theme.divider }]}>
                    {preview ? (
                      <Image source={{ uri: preview }} style={styles.stampImage} resizeMode="contain" />
                    ) : (
                      <Ionicons name="ribbon-outline" size={22} color={theme.iconMuted} />
                    )}
                  </View>
                  <Text style={[styles.stampName, { color: theme.text }]} numberOfLines={1}>
                    {name}
                  </Text>
                  <RowActions onDelete={() => handleDeleteStamp(stamp.id)} />
                </View>
                {i < stamps.length - 1 ? (
                  <View style={[styles.divider, { backgroundColor: theme.divider }]} />
                ) : null}
              </View>
            );
          })
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 8,
    padding: 14,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: 6,
    gap: 4,
  },
  addBtnText: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  emptyState: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
  },
  sigRow: {
    flexDirection: 'row',
    paddingVertical: 12,
  },
  sigLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  sigScript: {
    fontFamily: 'Satoshi-Medium',
    fontStyle: 'italic',
    fontWeight: '600',
  },
  sigCode: {
    fontSize: 11,
    marginTop: 6,
  },
  sigImage: {
    width: 120,
    height: 40,
    marginBottom: 8,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 4,
  },
  stampRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  stampPreview: {
    width: 44,
    height: 44,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  stampImage: {
    width: '100%',
    height: '100%',
  },
  stampName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
});
