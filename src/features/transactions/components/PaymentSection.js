import React, { useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Text from '../../../components/StyledText';
import Colors from '../../../constants/colors';
import { TimeQuarterIcon } from '../../../icons';
import { formatAmount } from '../utils/formatters';

function formatPlainAmount(amount) {
  return Number(amount || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatRole(role) {
  if (!role) return 'Buyer';
  return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
}

function getEscrowFee(transaction) {
  return Number(
    transaction?.escrow_fee ??
      transaction?.escrow_fee_amount ??
      transaction?.fee ??
      transaction?.fees?.escrow_fee ??
      0,
  );
}

function getAmountInEscrow(transaction) {
  return Number(
    transaction?.amount_in_escrow ??
      transaction?.escrow_amount ??
      transaction?.amount_transferred_to_escrow ??
      0,
  );
}

export default function PaymentSection({
  totalDue,
  transaction,
  myRole,
  theme,
  isDark,
  styles,
}) {
  const router = useRouter();
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [detailsExpanded, setDetailsExpanded] = useState(false);
  const roleLabel = formatRole(myRole?.role);
  const displayName = `${myRole?.first_name || ''} ${myRole?.last_name || ''}`.trim();
  const displayLabel = displayName || roleLabel;
  const currencyLabel = transaction.currency === 'USD' ? 'US$' : (transaction.currency || 'US$');
  const balanceDue = Number(totalDue || 0);
  const escrowFee = getEscrowFee(transaction);
  const amountInEscrow = getAmountInEscrow(transaction);
  const dueBeforeEscrow = balanceDue + escrowFee;
  const finalDue = Math.max(dueBeforeEscrow - amountInEscrow, 0);

  const cardBackground = isDark ? 'rgba(53, 53, 53, 1)' : 'rgba(91, 95, 199, 0.1)';
  const primaryText = isDark ? Colors.white : Colors.black;
  const secondaryText = isDark ? Colors.white : Colors.gray;
  const accentColor = isDark ? Colors.white : Colors.danger;
  const dividerColor = isDark ? Colors.grayLight : 'rgba(91, 95, 199, 0.3)';

  return (
    <View style={styles.sectionContainer}>
      <Text style={[styles.sectionTitle, { color: isDark ? theme.text : Colors.primary }]}>Payment</Text>

      <View
        style={[
          styles.paymentCard,
          { backgroundColor: cardBackground },
        ]}
      >
        <View style={styles.paymentAmountRow}>
          <TimeQuarterIcon size={20} color={accentColor} />
          <View style={{ marginLeft: 8 }}>
            <Text style={[styles.paymentAmount, { color: accentColor }]}>
              {formatAmount(dueBeforeEscrow, transaction.currency, transaction)}
            </Text>
          </View>
        </View>
        <Text style={[styles.paymentLabel, { color: accentColor }]} numberOfLines={1} ellipsizeMode="tail">
          Balance Due from {displayLabel}:
        </Text>

        <TouchableOpacity
          style={styles.paymentBtn}
          activeOpacity={0.85}
          onPress={() => router.push(`/escrow-transfer/${transaction.id}`)}
        >
          <Text style={styles.paymentBtnText}>Transfer Payment to Escrow</Text>
        </TouchableOpacity>

        <Text style={[styles.paymentNote, { color: secondaryText }]}>
          Your payment will be held in an Escrow Account with one of our Partner Banks until you authorize disbursement to the relevant counterparty/counterparties.
        </Text>

        <TouchableOpacity
          style={styles.paymentDetailsRow}
          onPress={() => setDetailsExpanded((current) => !current)}
          activeOpacity={0.8}
        >
          <Text style={styles.paymentDetailsLink}>View Details</Text>
          <Ionicons
            name={detailsExpanded ? 'chevron-up' : 'chevron-down'}
            size={14}
            color={Colors.primary}
          />
        </TouchableOpacity>

        {detailsExpanded ? (
          <View style={styles.paymentBreakdownCard}>
          <View style={styles.paymentTableHeader}>
            <Text style={[styles.paymentTableHeaderText, { color: primaryText }]}>Description</Text>
            <Text style={[styles.paymentTableHeaderText, { color: primaryText }]}>{currencyLabel}</Text>
          </View>
          <View style={[styles.paymentTableDivider, { backgroundColor: dividerColor }]} />

          <View style={styles.paymentTableRow}>
            <View style={styles.paymentTableLabelWrap}>
              <Text style={[styles.paymentTableText, { color: primaryText }]}>Balance Due</Text>
              <Text style={styles.paymentTableSubText}>(Before Escrow Fee)</Text>
            </View>
            <Text style={[styles.paymentTableValue, { color: primaryText }]}>{formatPlainAmount(balanceDue)}</Text>
          </View>

          <View style={styles.paymentTableRow}>
            <Text style={[styles.paymentTableText, { color: primaryText }]}>Escrow Fee</Text>
            <Text style={[styles.paymentTableValue, { color: primaryText }]}>{formatPlainAmount(escrowFee)}</Text>
          </View>

          <View style={[styles.paymentTableDivider, { backgroundColor: dividerColor }]} />

          <View style={styles.paymentTableRow}>
            <Text
              style={[styles.paymentTableEmphasis, { color: primaryText }]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              Due from {displayLabel}
            </Text>
            <Text style={[styles.paymentTableEmphasis, { color: primaryText }]}>{formatPlainAmount(dueBeforeEscrow)}</Text>
          </View>

          <View style={styles.paymentTableRow}>
            <Text style={[styles.paymentTableText, { color: primaryText }]}>Less: Amount In Escrow</Text>
            <Text style={[styles.paymentTableValue, { color: primaryText }]}>
              {amountInEscrow > 0 ? formatPlainAmount(amountInEscrow) : '-'}
            </Text>
          </View>

          <View style={[styles.paymentTableDivider, { backgroundColor: dividerColor }]} />

          <View style={styles.paymentTableRow}>
            <View style={styles.paymentTableLabelWrap}>
              <Text
                style={[styles.paymentTableEmphasis, { color: primaryText }]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                Due from {displayLabel}
              </Text>
              <Text style={styles.paymentTableSubText}>(Before Transfer Charges)</Text>
            </View>
            <Text style={[styles.paymentTableEmphasis, { color: primaryText }]}>{formatPlainAmount(finalDue)}</Text>
          </View>

          <View style={[styles.paymentTableDoubleDivider, { borderColor: dividerColor }]} />

          <TouchableOpacity
            style={styles.paymentTermsRow}
            activeOpacity={0.8}
            onPress={() => setTermsAccepted((current) => !current)}
          >
            <View style={[styles.paymentTermsCheckbox, termsAccepted && styles.paymentTermsCheckboxChecked]}>
              {termsAccepted ? <Ionicons name="checkmark" size={12} color={Colors.white} /> : null}
            </View>
            <Text style={[styles.paymentTermsText, { color: secondaryText }]}>
              Check to confirm that you accept the{' '}
              <Text style={styles.paymentTermsLink}>Terms and Conditions.</Text>
            </Text>
          </TouchableOpacity>
          </View>
        ) : null}
      </View>
    </View>
  );
}
