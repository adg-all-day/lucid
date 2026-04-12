import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Text from '../../../components/StyledText';
import Colors from '../../../constants/colors';
import useTheme from '../../../hooks/useTheme';
import useTransactionDetailViewModel from '../hooks/useTransactionDetailViewModel';
import { formatAmount } from '../utils/formatters';

function formatPlainAmount(amount) {
  return Number(amount || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function PaymentDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const theme = useTheme();
  const isDark = theme.isDark;

  const {
    transactionQuery,
    transaction,
    totalDue,
    myRole,
  } = useTransactionDetailViewModel(id);

  if (transactionQuery.isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!transaction) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.textSecondary }}>Payment details not found</Text>
      </View>
    );
  }

  const dueLabel = myRole?.role
    ? `Due from [${myRole.role.charAt(0).toUpperCase() + myRole.role.slice(1)}]`
    : 'Due from [Buyer]';
  const currencyLabel = transaction.currency === 'USD' ? 'US$' : (transaction.currency || 'US$');
  const balanceDue = totalDue || 0;
  const fee = 0;
  const transferCharges = 0;
  const netDue = balanceDue - fee - transferCharges;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.background }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.75}>
          <Ionicons name="arrow-back" size={20} color={Colors.primary} />
        </TouchableOpacity>
        <View style={styles.headerTitleWrap}>
          <Ionicons name="document-text-outline" size={16} color={Colors.primary} />
          <Text style={styles.headerTitle}>Payment Details</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View
          style={[
            styles.card,
            {
              backgroundColor: isDark ? '#FFFFFF1A' : '#EEF3FF',
            },
          ]}
        >
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.tableHeaderLabel, { color: theme.text }]}>Description</Text>
            <Text style={[styles.tableHeaderCurrency, { color: theme.text }]}>{currencyLabel}</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: Colors.grayLight }]} />

          <View style={styles.row}>
            <View style={styles.rowLabelWrap}>
              <Text style={[styles.rowLabel, { color: theme.textSecondary }]}>Balance Due</Text>
              <Text style={[styles.rowSubLabel, { color: theme.textSecondary }]}>(Before Charges and Fees)</Text>
            </View>
            <Text style={[styles.rowValue, { color: theme.textSecondary }]}>{formatPlainAmount(balanceDue)}</Text>
          </View>

          <View style={styles.row}>
            <Text style={[styles.rowLabel, { color: theme.textSecondary }]}>Fee</Text>
            <Text style={[styles.rowValue, { color: theme.textSecondary }]}>({formatPlainAmount(fee)})</Text>
          </View>

          <View style={styles.row}>
            <Text style={[styles.rowLabel, { color: theme.textSecondary }]}>Transfer Charges</Text>
            <Text style={[styles.rowValue, { color: theme.textSecondary }]}>({formatPlainAmount(transferCharges)})</Text>
          </View>

          <View style={[styles.divider, { backgroundColor: Colors.grayLight }]} />

          <View style={styles.row}>
            <Text style={[styles.emphasisLabel, { color: theme.text }]}>{dueLabel}</Text>
            <Text style={[styles.emphasisValue, { color: theme.text }]}>{formatPlainAmount(netDue)}</Text>
          </View>

          <View style={styles.row}>
            <Text style={[styles.rowLabel, { color: theme.textSecondary }]}>Less: Amount Transferred to Escrow</Text>
            <Text style={[styles.rowValue, { color: theme.textSecondary }]}>-</Text>
          </View>

          <View style={[styles.divider, { backgroundColor: Colors.grayLight }]} />

          <View style={styles.row}>
            <Text style={[styles.emphasisLabel, { color: theme.text }]}>{dueLabel}</Text>
            <Text style={[styles.emphasisValue, { color: theme.text }]}>{formatPlainAmount(netDue)}</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    height: 92,
    paddingTop: 42,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
  headerSpacer: {
    width: 28,
  },
  body: {
    paddingHorizontal: 12,
    paddingTop: 6,
    paddingBottom: 24,
  },
  card: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 8,
  },
  tableHeaderLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  tableHeaderCurrency: {
    fontSize: 13,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    marginVertical: 6,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 4,
  },
  rowLabelWrap: {
    flex: 1,
    paddingRight: 12,
  },
  rowLabel: {
    fontSize: 12,
    fontWeight: '400',
    flex: 1,
    paddingRight: 12,
  },
  rowSubLabel: {
    fontSize: 10,
    fontWeight: '400',
    marginTop: 1,
  },
  rowValue: {
    fontSize: 12,
    fontWeight: '400',
    textAlign: 'right',
  },
  emphasisLabel: {
    fontSize: 12,
    fontWeight: '700',
    flex: 1,
    paddingRight: 12,
  },
  emphasisValue: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'right',
  },
});
