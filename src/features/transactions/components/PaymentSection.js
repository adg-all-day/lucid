import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import Text from '../../../components/StyledText';
import Colors from '../../../constants/colors';
import { TimeQuarterIcon } from '../../../icons';
import useUserStore from '../../../stores/userStore';
import { formatAmount } from '../utils/formatters';

export default function PaymentSection({
  totalDue,
  transaction,
  myRole,
  theme,
  isDark,
  styles,
}) {
  const router = useRouter();
  const userName = useUserStore((state) => state.name);
  const resolvedName = userName || 'Current User';

  return (
    <View style={styles.sectionContainer}>
      <Text style={[styles.sectionTitle, { color: isDark ? theme.text : Colors.primary }]}>Payment</Text>

      <View style={[styles.paymentCard, { backgroundColor: theme.primary10 }]}>
        <View style={styles.paymentAmountRow}>
          <TimeQuarterIcon size={20} color={isDark ? theme.icon : Colors.danger} />
          <View style={{ marginLeft: 8 }}>
            <Text style={[styles.paymentAmount, { color: theme.text }]}>
              {formatAmount(totalDue, transaction.currency, transaction)}
            </Text>
          </View>
        </View>
        <Text style={[styles.paymentLabel, { color: theme.text }]}>
          Balance Due from {resolvedName}:
        </Text>

        <TouchableOpacity style={styles.paymentBtn}>
          <Text style={styles.paymentBtnText}>Transfer Payment to Escrow</Text>
        </TouchableOpacity>

        <Text style={[styles.paymentNote, { color: theme.text }]}>
          Your payment will be held in an Escrow Account with one of our Partner Banks until you authorize disbursement to the relevant counterparty/counterparties.
        </Text>

        <TouchableOpacity onPress={() => router.push(`/payment-details/${transaction.id}`)}>
          <Text style={styles.paymentDetailsLink}>View Payment Details</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
