import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Text from '../../../components/StyledText';
import Colors from '../../../constants/colors';

function InstructionRow({ label, value }) {
  return (
    <View style={styles.row}>
      <View style={styles.valueWrap}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}</Text>
      </View>
      <Ionicons name="copy-outline" size={14} color={Colors.primary} />
    </View>
  );
}

export default function EscrowInstructionsCard({
  title,
  subtitle,
  amount,
  accountName,
  accountNumber,
  transactionId,
  method = 'bank',
}) {
  const isWire = method === 'wire';

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.logoMark}>
          <Ionicons name={isWire ? 'swap-horizontal' : 'business'} size={10} color={Colors.white} />
        </View>
        <View>
          <Text style={styles.bankTitle}>{title}</Text>
          <Text style={styles.headerSubtitle}>{subtitle}</Text>
        </View>
      </View>

      <Text style={styles.bodyText}>
        Please transfer <Text style={styles.bold}>{amount}</Text> using the following details and include the{' '}
        <Text style={styles.bold}>Transaction ID</Text> in the Reference/Remark section of your transfer instruction.
      </Text>

      <InstructionRow label="Bank Name" value={title} />
      <InstructionRow label="Account Name" value={accountName} />
      <InstructionRow label="Account Number" value={accountNumber} />
      {isWire ? <InstructionRow label="Account Swift" value="BOFAUS3N" /> : null}
      <InstructionRow label="Transaction ID (Reference/Remark)" value={transactionId} />
      <InstructionRow label="Amount" value={amount} />

      <Text style={styles.note}>
        Upon successful transfer, click “I’ve made the payment” button to enable us confirm your funds transfer.
      </Text>
      <Text style={styles.note}>
        Please note transaction may take up to 3 business days to reflect in our account.
      </Text>
      <Text style={styles.note}>
        Your funds are held in this dedicated Escrow Account until you authorize disbursement to your counterparty/counterparties.
      </Text>

      <TouchableOpacity style={styles.button} activeOpacity={0.85}>
        <Text style={styles.buttonText}>I’ve made the payment</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 3,
    paddingTop: 14,
    paddingHorizontal: 14,
    paddingBottom: 20,
  },
  cardHeader: {
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.18)',
    paddingBottom: 12,
    marginBottom: 20,
  },
  logoMark: {
    width: 16,
    height: 12,
    backgroundColor: '#F15B2A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  bankTitle: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
  headerSubtitle: {
    color: Colors.white,
    fontSize: 8,
    textAlign: 'center',
    marginTop: 3,
  },
  bodyText: {
    color: Colors.white,
    fontSize: 11,
    lineHeight: 16,
    marginBottom: 12,
  },
  bold: {
    fontWeight: '700',
  },
  row: {
    minHeight: 37,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.28)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  valueWrap: {
    flex: 1,
  },
  label: {
    color: Colors.white,
    fontSize: 9,
  },
  value: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  note: {
    color: Colors.white,
    fontSize: 10,
    lineHeight: 15,
    marginTop: 10,
  },
  button: {
    height: 35,
    borderRadius: 5,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
    alignSelf: 'center',
    width: 220,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
});
