import React from 'react';
import {
  View,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Text from '../../../components/StyledText';
import Colors from '../../../constants/colors';
import useTheme from '../../../hooks/useTheme';
import ModalBlurBackdrop from '../../../components/ModalBlurBackdrop';

const BLUE = Colors.primary;
const BLUE_BG = Colors.primary10;

export default function SettlementStatementModal({
  visible,
  onClose,
  settlements,
  transaction,
  statementData,
  loading,
  blurTarget,
}) {
  const theme = useTheme();
  const containerBg = theme.isDark ? '#2B2B2B' : theme.modalBg;
  const currency = transaction?.currency || 'USD';
  const items = statementData?.settlements || settlements || [];

  let totalCredits = 0;
  let totalDebits = 0;

  const rows = items.map((item) => {
    const amount =
      item.amount_type === 'percentage'
        ? ((item.value || 0) / 100) * (transaction?.amount || 0)
        : item.actual_amount || item.value || 0;

    const effectiveIsCredit = item.is_credit !== undefined
      ? item.is_credit
      : item.settlement_type === 'credit';

    if (effectiveIsCredit) {
      totalCredits += amount;
    } else {
      totalDebits += amount;
    }

    return { ...item, amount, isCredit: effectiveIsCredit };
  });

  const displayCredits = statementData?.total_credits ?? totalCredits;
  const displayDebits = statementData?.total_debits ?? totalDebits;
  const balanceDue = statementData?.balance_due ?? (displayCredits - displayDebits);
  const balanceLabel = statementData?.balance_label || 'Balance Due from [Buyer]';

  const formatNum = (num) =>
    Number(num || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <ModalBlurBackdrop isDark={theme.isDark} blurTarget={blurTarget} />
        <View style={[styles.container, { backgroundColor: containerBg }]}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color={BLUE} />
            </TouchableOpacity>
            <Text style={styles.title}>Settlement Statement</Text>
            <View style={{ width: 24 }} />
          </View>

          {loading ? (
            <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
          ) : (
            <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
              {/* Main Table */}
              <View style={[styles.tableCard, { backgroundColor: theme.primary10 }]}>
                {/* Header row */}
                <View style={styles.tableHeaderRow}>
                  <Text style={[styles.tableHeaderLabel, { color: theme.text }]}>Description</Text>
                  <Text style={[styles.tableHeaderCurrency, { color: theme.text }]}>{currency}</Text>
                </View>
                <View style={styles.grayDivider} />

                {/* Settlement rows */}
                {rows.map((item, index) => (
                  <View key={item.id || `row-${index}`}>
                    <View style={styles.tableRow}>
                      <Text style={[styles.rowLabel, { color: theme.text }]}>
                        {item.description || `Settlement ${index + 1}`}
                      </Text>
                      <Text style={[styles.rowValue, { color: theme.text }]}>
                        {item.isCredit
                          ? `${formatNum(item.amount)}  CR`
                          : `(${formatNum(item.amount)})  DR`}
                      </Text>
                    </View>
                    <View style={styles.grayDivider} />
                  </View>
                ))}
              </View>

              {/* Summary */}
              <View style={[styles.summaryCard, { backgroundColor: theme.primary10 }]}>
                {/* Summary header */}
                <Text style={styles.summaryTitle}>Summary</Text>
                <View style={styles.summaryUnderline} />

                {/* Currency header */}
                <View style={styles.summaryCurrencyRow}>
                  <Text style={styles.summaryCurrency}>{currency}</Text>
                </View>
                <View style={styles.blueDivider} />

                {/* Total Credits */}
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Total Credits (CR)</Text>
                  <Text style={styles.summaryValue}>{formatNum(displayCredits)}</Text>
                </View>

                {/* Total Debits */}
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Total Debits (DR)</Text>
                  <Text style={styles.summaryValue}>({formatNum(displayDebits)})</Text>
                </View>
                <View style={styles.blueDivider} />
                <View style={[styles.blueDivider, { marginTop: 2 }]} />

                {/* Balance Due */}
                <View style={styles.balanceRow}>
                  <Text style={styles.balanceLabel}>{balanceLabel}</Text>
                  <Text style={styles.balanceValue}>{formatNum(balanceDue)}</Text>
                </View>

                {/* Footnote */}
                <View style={styles.footnoteRow}>
                  <Ionicons name="alert-circle-outline" size={14} color="#FFA600" />
                  <Text style={styles.footnote}>Before Transfer Charges and  Fee</Text>
                </View>
              </View>

              <View style={{ height: 30 }} />
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    overflow: 'hidden',
  },
  container: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    maxHeight: '90%',
    width: '100%',
    paddingBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingTop: 20,
    paddingBottom: 16,
  },
  backBtn: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: BLUE,
  },
  body: {
    paddingHorizontal: 15,
  },

  // Main table
  tableCard: {
    backgroundColor: BLUE_BG,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 20,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  tableHeaderLabel: {
    fontSize: 14,
    fontWeight: '400',
    color: '#212121',
  },
  tableHeaderCurrency: {
    fontSize: 14,
    fontWeight: '400',
    color: '#212121',
  },
  grayDivider: {
    height: 1,
    backgroundColor: '#D5D5D5',
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  rowLabel: {
    fontSize: 14,
    fontWeight: '400',
    color: '#212121',
    flex: 1,
    marginRight: 8,
  },
  rowValue: {
    fontSize: 14,
    fontWeight: '400',
    color: '#212121',
    textAlign: 'right',
  },

  // Summary
  summaryCard: {
    backgroundColor: BLUE_BG,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: BLUE,
    textAlign: 'center',
    paddingTop: 4,
    marginBottom: 4,
  },
  summaryUnderline: {
    height: 2,
    backgroundColor: BLUE,
    alignSelf: 'center',
    width: 160,
    marginBottom: 12,
  },
  summaryCurrencyRow: {
    alignItems: 'flex-end',
    paddingBottom: 6,
  },
  summaryCurrency: {
    fontSize: 14,
    fontWeight: '400',
    color: BLUE,
  },
  blueDivider: {
    height: 1,
    backgroundColor: BLUE,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: '400',
    color: BLUE,
    flex: 1,
    marginRight: 8,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '400',
    color: BLUE,
    textAlign: 'right',
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  balanceLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: BLUE,
    flex: 1,
    marginRight: 8,
  },
  balanceValue: {
    fontSize: 14,
    fontWeight: '700',
    color: BLUE,
    textAlign: 'right',
  },
  footnoteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  footnote: {
    fontSize: 12,
    fontWeight: '400',
    color: '#FFA600',
  },
});
