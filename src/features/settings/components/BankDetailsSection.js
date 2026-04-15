// No design reference was provided for Bank Details, so this follows the
// same layout language as Signatures/Stamps: section heading with an
// "Add" button on the right, then a list of rows with edit/delete actions.

import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import Text from '../../../components/StyledText';
import Colors from '../../../constants/colors';
import useTheme from '../../../hooks/useTheme';
import SectionHeading from './SectionHeading';
import RowActions from './RowActions';
import { getSettingsSectionCardBackground } from '../utils/sectionCardStyle';

const BANK_SAMPLES = [
  { id: 'b1', bank: 'Barclays', name: 'John W. Doe', masked: '•••• 4321', primary: true },
  { id: 'b2', bank: 'Chase', name: 'John W. Doe', masked: '•••• 9087', primary: false },
];

function AddButton({ label }) {
  const theme = useTheme();
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={[styles.addBtn, { borderColor: Colors.primary, backgroundColor: theme.cardBg }]}
    >
      <Ionicons name="add" size={16} color={Colors.primary} />
      <Text style={styles.addBtnText}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function BankDetailsSection() {
  const { t } = useTranslation();
  const theme = useTheme();
  const sectionCardBackground = getSettingsSectionCardBackground(theme);
  const [banks] = useState(BANK_SAMPLES);

  return (
    <View>
      <SectionHeading title={t('settings.bank.savedBankAccounts')} right={<AddButton label={t('settings.bank.addBank')} />} />

      <View style={[styles.card, { backgroundColor: sectionCardBackground }]}>
        {banks.map((b, i) => (
          <View key={b.id}>
            <View style={styles.row}>
              <View style={[styles.logo, { backgroundColor: theme.primaryLight }]}>
                <Ionicons name="business-outline" size={22} color={Colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.rowHeader}>
                  <Text style={[styles.bankName, { color: theme.text }]}>{b.bank}</Text>
                  {b.primary ? (
                    <View style={[styles.primaryBadge, { backgroundColor: theme.primaryLight }]}>
                      <Text style={styles.primaryBadgeText}>{t('settings.bank.primary')}</Text>
                    </View>
                  ) : null}
                </View>
                <Text style={[styles.accountHolder, { color: theme.textSecondary }]}>{b.name}</Text>
                <Text style={[styles.accountNumber, { color: theme.text }]}>{b.masked}</Text>
              </View>
              <RowActions />
            </View>
            {i < banks.length - 1 ? (
              <View style={[styles.divider, { backgroundColor: theme.divider }]} />
            ) : null}
          </View>
        ))}
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 12,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bankName: {
    fontSize: 14,
    fontWeight: '700',
  },
  primaryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  primaryBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.primary,
  },
  accountHolder: {
    fontSize: 12,
    marginTop: 2,
  },
  accountNumber: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
    letterSpacing: 1,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 4,
  },
});
