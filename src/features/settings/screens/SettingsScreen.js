// Single-screen settings hub. Five tabs live inside this screen; each tab
// renders a Section component that owns its own form state. Save/Cancel
// at the bottom is a placeholder until backend endpoints are wired up.

import React, { useRef, useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import Text from '../../../components/StyledText';
import Colors from '../../../constants/colors';
import useTheme from '../../../hooks/useTheme';
import ProfileSection from '../components/ProfileSection';
import SecuritySection from '../components/SecuritySection';
import SignaturesStampsSection from '../components/SignaturesStampsSection';
import BankDetailsSection from '../components/BankDetailsSection';
import LanguageRegionSection from '../components/LanguageRegionSection';
import ResultModal from '../../../components/ResultModal';

const TABS = [
  { key: 'profile', labelKey: 'settings.tabs.profile' },
  { key: 'security', labelKey: 'settings.tabs.security' },
  { key: 'signatures', labelKey: 'settings.tabs.signatures' },
  { key: 'bank', labelKey: 'settings.tabs.bank' },
  { key: 'language', labelKey: 'settings.tabs.language' },
];

export default function SettingsScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const isDark = theme.isDark;
  const [activeTab, setActiveTab] = useState('profile');
  const [saving, setSaving] = useState(false);
  const [resultModal, setResultModal] = useState(null);
  const showFooter = activeTab === 'profile' || activeTab === 'language';
  const languageRef = useRef(null);
  const profileRef = useRef(null);

  const handleSave = async () => {
    const target =
      activeTab === 'language' ? languageRef.current :
      activeTab === 'profile' ? profileRef.current :
      null;
    if (!target?.save) return;
    setSaving(true);
    try {
      const result = await target.save();
      if (result) {
        setResultModal({
          visible: true,
          title: result.title,
          message: result.message,
          variant: result.ok ? 'success' : 'error',
        });
      }
    } finally {
      setSaving(false);
    }
  };

  const renderSection = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileSection ref={profileRef} />;
      case 'security':
        return <SecuritySection />;
      case 'signatures':
        return <SignaturesStampsSection />;
      case 'bank':
        return <BankDetailsSection />;
      case 'language':
        return <LanguageRegionSection ref={languageRef} />;
      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.headerBg }]}>
        <View style={styles.headerSide} />
        <Text style={styles.headerTitle}>{t('settings.title')}</Text>
        <View style={styles.headerSide} />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabStrip}
        style={[styles.tabStripWrap, { backgroundColor: theme.background }]}
      >
        {TABS.map((tab) => {
          const active = tab.key === activeTab;
          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              activeOpacity={0.8}
              style={[
                styles.tabChip,
                {
                  backgroundColor: active ? theme.primaryLight : theme.cardBg,
                  borderColor: active ? Colors.primary : theme.divider,
                },
              ]}
            >
              <Text
                style={[
                  styles.tabChipText,
                  {
                    color: active
                      ? isDark ? Colors.white : Colors.primary
                      : isDark ? theme.text : Colors.black,
                  },
                ]}
              >
                {t(tab.labelKey)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.bodyContent}
        showsVerticalScrollIndicator={false}
      >
        {renderSection()}
        {showFooter ? (
          <View style={styles.inlineFooter}>
            <TouchableOpacity
              style={[styles.saveBtn, saving && { opacity: 0.8 }]}
              activeOpacity={0.85}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <Text style={styles.saveBtnText}>{t('common.save')}</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : null}
        <View style={{ height: 24 }} />
      </ScrollView>

      <ResultModal
        visible={!!resultModal?.visible}
        title={resultModal?.title || ''}
        message={resultModal?.message || ''}
        variant={resultModal?.variant || 'success'}
        onClose={() => setResultModal(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 14,
  },
  headerSide: {
    width: 32,
    alignItems: 'center',
  },
  headerTitle: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  tabStripWrap: {
    maxHeight: 72,
  },
  tabStrip: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
    alignItems: 'center',
  },
  tabChip: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 0,
  },
  tabChipText: {
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '500',
    paddingBottom: 2,
  },
  body: {
    flex: 1,
  },
  bodyContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 24,
  },
  inlineFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingTop: 24,
    paddingBottom: 8,
  },
  saveBtn: {
    width: '42%',
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveBtnText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
});
