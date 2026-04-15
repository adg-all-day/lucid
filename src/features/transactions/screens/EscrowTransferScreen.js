import React, { useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Text from '../../../components/StyledText';
import Colors from '../../../constants/colors';
import useTheme from '../../../hooks/useTheme';
import useTransactionDetailViewModel from '../hooks/useTransactionDetailViewModel';
import { formatAmount } from '../utils/formatters';
import EscrowTransferSummaryCard from '../components/EscrowTransferSummaryCard';
import EscrowPaymentMethodTabs from '../components/EscrowPaymentMethodTabs';
import EscrowProviderList from '../components/EscrowProviderList';
import EscrowInstructionsCard from '../components/EscrowInstructionsCard';

const BANK_PROVIDERS = [
  { id: 'guaranty', name: 'Guaranty Trust Bank Plc.', color: '#F15B2A', icon: 'business' },
  { id: 'first', name: 'First Bank', color: '#2356A4', icon: 'business' },
  { id: 'access', name: 'Access Bank', color: '#F37021', icon: 'business' },
  { id: 'uba', name: 'United Bank for Africa', color: '#B91C1C', icon: 'business' },
  { id: 'zenith', name: 'Zenith Bank Plc.', color: '#B91C1C', icon: 'business' },
];

const WIRE_PROVIDERS = [
  { id: 'bofa', name: 'Bank of America', color: '#D71920', icon: 'swap-horizontal' },
  { id: 'chase', name: 'Chase Bank', color: '#126BC4', icon: 'business' },
  { id: 'usbank', name: 'US Bank', color: '#D61F2B', icon: 'business' },
  { id: 'wells', name: 'Wells Fargo', color: '#C81E1E', icon: 'business' },
];

const CARD_PROVIDERS = [
  { id: 'paystack', logo: 'paystack', color: '#111827' },
  { id: 'stripe', logo: 'stripe', color: '#635BFF' },
  { id: 'flutterwave', logo: 'flutterwave', color: '#F5A623' },
  { id: 'paypal', logo: 'PayPal', color: '#0070BA' },
  { id: 'moniepoint', logo: 'Moniepoint', color: '#3155FF' },
  { id: 'interswitch', logo: 'Interswitch', color: '#005DAA' },
  { id: 'opay', logo: 'OPay', color: '#00B875' },
  { id: 'apple', logo: 'Pay', color: '#111111' },
];

function getReference(transaction) {
  return (
    transaction?.reference ||
    transaction?.reference_id ||
    transaction?.transaction_reference ||
    transaction?.id ||
    ''
  );
}

function getSelectedProvider(method, selectedBankId, selectedWireId) {
  if (method === 'wire') {
    return WIRE_PROVIDERS.find((provider) => provider.id === selectedWireId) || WIRE_PROVIDERS[0];
  }

  return BANK_PROVIDERS.find((provider) => provider.id === selectedBankId) || BANK_PROVIDERS[0];
}

export default function EscrowTransferScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const theme = useTheme();
  const [method, setMethod] = useState('bank');
  const [selectedBankId, setSelectedBankId] = useState(BANK_PROVIDERS[0].id);
  const [selectedWireId, setSelectedWireId] = useState(WIRE_PROVIDERS[0].id);
  const [selectedCardId, setSelectedCardId] = useState(CARD_PROVIDERS[0].id);
  const [wireType, setWireType] = useState('international');

  const {
    transactionQuery,
    transaction,
    totalDue,
  } = useTransactionDetailViewModel(id);

  const amount = useMemo(
    () => formatAmount(totalDue || transaction?.amount || 0, transaction?.currency, transaction),
    [totalDue, transaction],
  );

  const selectedProvider = getSelectedProvider(method, selectedBankId, selectedWireId);

  if (transactionQuery.isLoading) {
    return (
      <View style={[styles.loading, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!transaction) {
    return (
      <View style={[styles.loading, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.text }}>Transaction not found</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.headerBg }]}>
        <View style={styles.headerContent}>
          <View style={styles.headerSide}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.75}>
              <Ionicons name="arrow-back-circle-outline" size={28} color={Colors.white} />
            </TouchableOpacity>
          </View>
          <Text style={styles.headerTitle}>Funds Transfer to Escrow</Text>
          <View style={styles.headerSide} />
        </View>
      </View>

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent} showsVerticalScrollIndicator={false}>
        <EscrowTransferSummaryCard transaction={transaction} totalDue={totalDue} />

        <Text style={styles.sectionTitle}>Payment Methods</Text>
        <View style={styles.methodsCard}>
          <EscrowPaymentMethodTabs selected={method} onSelect={setMethod} />

          {method === 'wire' ? (
            <View style={styles.wireTypeRow}>
              <TouchableOpacity
                style={[styles.wireTypeButton, wireType === 'international' && styles.wireTypeButtonActive]}
                activeOpacity={0.85}
                onPress={() => setWireType('international')}
              >
                <Text style={[styles.wireTypeText, wireType === 'international' && styles.wireTypeTextActive]}>
                  International Wire
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.wireTypeButton, wireType === 'swift' && styles.wireTypeButtonActive]}
                activeOpacity={0.85}
                onPress={() => setWireType('swift')}
              >
                <Text style={[styles.wireTypeText, wireType === 'swift' && styles.wireTypeTextActive]}>
                  SWIFT Transfer
                </Text>
              </TouchableOpacity>
            </View>
          ) : null}

          <Text style={styles.instructionText}>
            {method === 'card'
              ? 'Please select any of the following Payment Service Providers and click Proceed to transfer the escrow funds.'
              : 'Please select any of the following Partner Banks and transfer the escrow funds using the details in the transfer instructions section.'}
          </Text>

          {method === 'card' ? (
            <>
              <EscrowProviderList
                providers={CARD_PROVIDERS}
                selectedId={selectedCardId}
                onSelect={setSelectedCardId}
                cardMode
              />
              <TouchableOpacity style={styles.proceedButton} activeOpacity={0.85}>
                <Text style={styles.proceedButtonText}>Proceed</Text>
              </TouchableOpacity>
            </>
          ) : (
            <EscrowProviderList
              providers={method === 'wire' ? WIRE_PROVIDERS : BANK_PROVIDERS}
              selectedId={method === 'wire' ? selectedWireId : selectedBankId}
              onSelect={method === 'wire' ? setSelectedWireId : setSelectedBankId}
            />
          )}
        </View>

        {method !== 'card' ? (
          <>
            <Text style={styles.sectionTitle}>
              {method === 'wire' ? 'International Wire Transfer Instructions' : 'Transfer Instructions'}
            </Text>
            <EscrowInstructionsCard
              method={method}
              title={selectedProvider.name}
              subtitle={method === 'wire' ? 'Escrow Funds Transfer Instructions' : 'Escrow Funds Transfer Instructions'}
              amount={amount}
              accountName={method === 'wire' ? 'Wizer-BoA Escrow' : 'Wizer-Guaranty Trust Bank Escrow'}
              accountNumber={method === 'wire' ? '90451687356' : '0635687356'}
              transactionId={String(getReference(transaction))}
            />
          </>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    paddingTop: 38,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#FFFFFF',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  headerSide: {
    width: 40,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  backButton: {
    width: 28,
    height: 28,
  },
  headerTitle: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  body: {
    flex: 1,
  },
  bodyContent: {
    paddingHorizontal: 10,
    paddingTop: 14,
    paddingBottom: 28,
  },
  sectionTitle: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  methodsCard: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 3,
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 20,
    marginBottom: 22,
  },
  wireTypeRow: {
    flexDirection: 'row',
    gap: 7,
    marginBottom: 12,
  },
  wireTypeButton: {
    flex: 1,
    height: 26,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wireTypeButtonActive: {
    borderBottomColor: Colors.white,
  },
  wireTypeText: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 11,
    fontWeight: '700',
  },
  wireTypeTextActive: {
    color: Colors.white,
  },
  instructionText: {
    color: Colors.white,
    fontSize: 11,
    lineHeight: 16,
    marginBottom: 12,
  },
  proceedButton: {
    width: 250,
    height: 35,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  proceedButtonText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
});
