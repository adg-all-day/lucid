import React, { useMemo, useState } from 'react';
import {
  Alert,
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import Text from '../../../components/StyledText';
import Header from '../../../components/Header';
import Colors from '../../../constants/colors';
import useTheme from '../../../hooks/useTheme';
import {
  StepAcceptanceIcon,
  StepAgreementIcon,
  StepDeliveryIcon,
  StepDisbursementIcon,
  StepEscrowIcon,
} from '../../../icons';
import useUserStore from '../../../stores/userStore';
import {
  useTransaction,
  useTransactionHistory,
  useSettlementStatement,
  useResendCounterpartyEmail,
} from '../../../api/queries/transactions';
import SettlementStatementModal from '../components/SettlementStatementModal';
import TransactionHistoryModal from '../components/TransactionHistoryModal';
import TransactionSummarySection from '../components/TransactionSummarySection';
import TransactionStatusSection from '../components/TransactionStatusSection';
import CounterpartiesSection from '../components/CounterpartiesSection';
import DocumentsSection from '../components/DocumentsSection';
import SettlementsSection from '../components/SettlementsSection';
import PaymentSection from '../components/PaymentSection';
import AcknowledgementSection from '../components/AcknowledgementSection';
import { STAGE_LABELS } from '../utils/constants';

const STEP_ICONS = [
  StepAgreementIcon,
  StepEscrowIcon,
  StepDeliveryIcon,
  StepAcceptanceIcon,
  StepDisbursementIcon,
];

// Maps API stages to chevron index:
// 0=Agreement, 1=Escrow, 2=Delivery, 3=Acceptance, 4=Disbursement
const STAGE_TO_CHEVRON = {
  DRAFT: 0,
  STAGING: 0,
  AWAITING_SIGNATURES: 0,
  AWAITING_FUNDS: 1,
  AWAITING_DISBURSEMENT: 2,
  COMPLETED: 4,
};

export default function TransactionDetailScreen() {
  const { id } = useLocalSearchParams();
  const theme = useTheme();
  const isDark = theme.isDark;
  const userEmail = useUserStore((state) => state.email);
  const userName = useUserStore((state) => state.name);
  const [amountHidden, setAmountHidden] = useState(false);
  const [expandedPreconditions, setExpandedPreconditions] = useState({});
  const [statementVisible, setStatementVisible] = useState(false);
  const [historyVisible, setHistoryVisible] = useState(false);

  const transactionQuery = useTransaction(id);
  const statementQuery = useSettlementStatement(id);
  const historyQuery = useTransactionHistory(id);
  const resendCounterpartyEmail = useResendCounterpartyEmail();
  const transaction = transactionQuery.data;

  const stepData = useMemo(() => {
    const stage = transaction?.current_stage || transaction?.status;
    const currentStageIndex = STAGE_TO_CHEVRON[stage] ?? -1;

    return STAGE_LABELS.map((label, index) => ({
      label,
      completed: index < currentStageIndex,
      active: index === currentStageIndex,
      renderIcon: (color) => {
        const Icon = STEP_ICONS[index];
        const iconSize = index === 0 ? 18 : index === STEP_ICONS.length - 1 ? 32 : 20;
        const node = <Icon size={iconSize} color={color} />;
        if (index === STEP_ICONS.length - 1) {
          return <View style={{ marginLeft: 6 }}>{node}</View>;
        }
        return node;
      },
    }));
  }, [transaction]);

  if (transactionQuery.isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!transaction) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background }]}>
        <Text style={{ color: theme.textSecondary }}>Transaction not found</Text>
      </View>
    );
  }

  const counterparties = transaction.counterparties || [];
  const documents = transaction.documents || [];
  const settlements = transaction.settlements || [];
  const totalDue = settlements.reduce((sum, s) => {
    if (s.amount_type === 'percentage') {
      return sum + ((s.value || 0) / 100) * (transaction.amount || 0);
    }
    return sum + (s.actual_amount || s.value || 0);
  }, 0);
  const myRole = counterparties.find(
    (item) => item.email?.toLowerCase() === userEmail?.toLowerCase(),
  );

  // Map emails to full names for settlement due_from / due_to display
  const emailToName = {};
  counterparties.forEach((cp) => {
    if (cp.email) {
      emailToName[cp.email.toLowerCase()] = `${cp.first_name || ''} ${cp.last_name || ''}`.trim();
    }
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header name={userName} />

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        <TransactionSummarySection
          transaction={transaction}
          amountHidden={amountHidden}
          setAmountHidden={setAmountHidden}
          myRole={myRole}
          theme={theme}
          isDark={isDark}
          styles={styles}
        />

        <TransactionStatusSection
          transaction={transaction}
          stepData={stepData}
          theme={theme}
          isDark={isDark}
          onOpenHistory={() => setHistoryVisible(true)}
          styles={styles}
        />

        <CounterpartiesSection
          counterparties={counterparties}
          theme={theme}
          isDark={isDark}
          resendPending={resendCounterpartyEmail.isPending}
          onNudge={async (counterparty) => {
            try {
              const result = await resendCounterpartyEmail.mutateAsync({
                transactionId: transaction.id,
                counterpartyId: counterparty.id,
              });
              const message =
                result?.message ||
                result?.data?.message ||
                'Reminder email sent successfully.';
              Alert.alert('Nudge Sent', message);
            } catch (error) {
              Alert.alert(
                'Failed to Send Nudge',
                error?.response?.data?.error ||
                  error?.response?.data?.message ||
                  error?.message ||
                  'Unable to send reminder email.',
              );
            }
          }}
          styles={styles}
        />

        <DocumentsSection
          documents={documents}
          theme={theme}
          isDark={isDark}
          styles={styles}
        />

        <SettlementsSection
          settlements={settlements}
          transaction={transaction}
          emailToName={emailToName}
          expandedPreconditions={expandedPreconditions}
          setExpandedPreconditions={setExpandedPreconditions}
          theme={theme}
          isDark={isDark}
          onOpenStatement={() => setStatementVisible(true)}
          styles={styles}
        />

        <PaymentSection
          totalDue={totalDue}
          transaction={transaction}
          myRole={myRole}
          theme={theme}
          isDark={isDark}
          styles={styles}
        />

        <AcknowledgementSection
          counterparties={counterparties}
          myRole={myRole}
          theme={theme}
          isDark={isDark}
          styles={styles}
        />

        <View style={{ height: 30 }} />
      </ScrollView>

      <SettlementStatementModal
        visible={statementVisible}
        onClose={() => setStatementVisible(false)}
        settlements={settlements}
        transaction={transaction}
        statementData={statementQuery.data}
        loading={statementQuery.isLoading}
      />

      <TransactionHistoryModal
        visible={historyVisible}
        onClose={() => setHistoryVisible(false)}
        history={historyQuery.data ?? []}
        loading={historyQuery.isLoading}
        reference={transaction?.reference}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  body: {
    flex: 1,
  },
  breadcrumb: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.primary,
    paddingHorizontal: 23,
    paddingTop: 13,
    paddingBottom: 8,
  },

  // Transaction Summary Card
  summaryCard: {
    backgroundColor: Colors.primary10,
    marginHorizontal: 10,
    borderRadius: 10,
    padding: 18,
  },
  summaryTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 10,
    paddingHorizontal: 13,
    marginBottom: 8,
  },
  idRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  transactionId: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.primary,
  },
  actionsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 5,
    width: 77,
    height: 25,
  },
  actionsBtnText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.primary,
  },
  amountText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
  },
  valueLabel: {
    fontSize: 10,
    fontWeight: '400',
    color: Colors.gray,
    marginTop: 2,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  descriptionText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.primary,
    marginTop: 8,
  },
  closingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
  },
  closingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  closingDateValue: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  closingDateLabel: {
    fontSize: 10,
    fontWeight: '400',
    color: Colors.gray,
  },
  roleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  roleSection: {
    alignItems: 'flex-end',
  },
  roleValue: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  roleLabel: {
    fontSize: 10,
    fontWeight: '400',
    color: Colors.gray,
  },

  // Section containers
  sectionContainer: {
    paddingHorizontal: 10,
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 10,
    paddingHorizontal: 13,
  },

  // Transaction Status
  statusCard: {
    backgroundColor: Colors.primary10,
    borderRadius: 10,
    padding: 14,
  },
  awaitingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.accent17,
    width: 163,
    height: 35,
    borderRadius: 5,
    alignSelf: 'flex-start',
    marginBottom: 6,
    justifyContent: 'flex-start',
    paddingLeft: 4,
  },
  awaitingBadgeText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.accent,
  },
  actionRequiredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary10,
    width: 163,
    height: 35,
    borderRadius: 5,
    alignSelf: 'flex-start',
    marginBottom: 6,
    marginTop: 8,
    justifyContent: 'flex-start',
    paddingLeft: 4,
  },
  actionRequiredBadgeText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.primary,
  },
  statusNote: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.gray,
    marginBottom: 8,
    lineHeight: 18,
  },
  historyLink: {
    alignSelf: 'flex-end',
    marginTop: 10,
    paddingHorizontal: 4,
  },
  inlineLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  historyLinkText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '500',
  },

  // Counterparties
  counterpartiesCard: {
    backgroundColor: Colors.primary10,
    borderRadius: 10,
    padding: 14,
  },
  cpBlock: {
    paddingVertical: 8,
  },
  cpTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cpName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.gray,
  },
  cpRole: {
    fontSize: 12,
    fontWeight: '400',
    color: Colors.gray,
    marginTop: 2,
  },
  cpActionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.danger10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 5,
  },
  cpActionText: {
    fontSize: 13,
    fontWeight: '400',
    color: Colors.danger,
    fontFamily: 'LexendDeca-Regular',
  },
  cpNoActionBadge: {
    backgroundColor: Colors.success10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 5,
  },
  cpNoActionText: {
    fontSize: 13,
    fontWeight: '400',
    color: Colors.success,
    fontFamily: 'LexendDeca-Regular',
  },
  cpBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  cpEmail: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.gray,
    flex: 1,
    marginRight: 8,
  },
  nudgeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.primary,
    borderRadius: 5,
    width: 86,
    height: 25,
    paddingLeft: 7,
    paddingRight: 9,
  },
  nudgeBtnText: {
    fontSize: 13,
    fontWeight: '400',
    color: Colors.white,
    fontFamily: 'LexendDeca-Regular',
  },
  cpDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 4,
  },

  // Documents
  documentsCard: {
    backgroundColor: Colors.primary10,
    borderRadius: 10,
    padding: 14,
  },
  documentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  documentNumber: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.black,
    marginRight: 13,
  },
  documentName: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.black,
  },
  docFileBtn: {
    backgroundColor: '#F9F9F9',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 5,
    width: 60,
    height: 39,
    alignItems: 'center',
    justifyContent: 'center',
  },
  docDivider: {
    height: 1,
    backgroundColor: Colors.border,
  },

  // Settlements
  settlementsCard: {
    backgroundColor: Colors.primary10,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 10,
  },
  settlementHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  settlementNumber: {
    fontSize: 14,
    fontWeight: '400',
    color: '#707070',
    marginRight: 8,
    lineHeight: 19,
  },
  settlementName: {
    fontSize: 14,
    fontWeight: '400',
    color: '#707070',
    flex: 1,
    lineHeight: 19,
  },
  settlementStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 1,
  },
  settlementStatusText: {
    fontSize: 12,
    fontWeight: '400',
    color: '#FFA600',
    lineHeight: 16,
  },
  settlementDetails: {
    marginLeft: 12,
    gap: 2,
  },
  settlementRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    minHeight: 19,
  },
  settlementLabel: {
    fontSize: 14,
    fontWeight: '400',
    color: '#707070',
    lineHeight: 19,
  },
  settlementValue: {
    fontSize: 14,
    fontWeight: '400',
    color: '#707070',
    lineHeight: 19,
    flexShrink: 1,
    marginLeft: 12,
    textAlign: 'right',
  },
  preconditionsSection: {
    marginLeft: 12,
    marginTop: 10,
  },
  preconditionsToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  preconditionsTitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#2F6BC6',
    lineHeight: 19,
  },
  preconditionsBox: {
    borderWidth: 1,
    borderColor: '#2F6BC6',
    borderRadius: 5,
    backgroundColor: Colors.white,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  preconditionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  preconditionNumber: {
    fontSize: 13,
    fontWeight: '400',
    color: '#707070',
    marginRight: 6,
    lineHeight: 18,
  },
  preconditionDesc: {
    fontSize: 13,
    fontWeight: '400',
    color: '#707070',
    marginBottom: 6,
    lineHeight: 18,
  },
  preconditionPartyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 18,
    marginBottom: 4,
  },
  preconditionParty: {
    fontSize: 11,
    fontWeight: '400',
    color: '#707070',
    flex: 1,
    marginRight: 10,
    lineHeight: 18,
  },
  checkbox: {
    width: 14,
    height: 14,
    borderWidth: 1,
    borderColor: '#707070',
    borderRadius: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
  },
  preconditionDivider: {
    height: 0.5,
    backgroundColor: '#2F6BC6',
    marginVertical: 8,
    marginLeft: 20,
  },
  settlementDivider: {
    height: 1,
    backgroundColor: '#D7E5FF',
    marginVertical: 10,
  },
  viewStatementLink: {
    marginTop: 8,
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  viewStatementText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.primary,
    textDecorationLine: 'underline',
  },

  // Payment
  paymentCard: {
    backgroundColor: Colors.primary10,
    borderRadius: 5,
    padding: 18,
  },
  paymentAmountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  paymentAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.danger,
  },
  paymentLabel: {
    fontSize: 14,
    fontWeight: '400',
    color: Colors.danger,
    marginBottom: 14,
    textAlign: 'center',
  },
  paymentBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 5,
    width: 256,
    height: 46,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  paymentBtnText: {
    color: Colors.white,
    fontWeight: '500',
    fontSize: 14,
  },
  paymentNote: {
    fontSize: 14,
    fontWeight: '400',
    color: Colors.black,
    lineHeight: 20,
    marginBottom: 10,
  },
  paymentDetailsLink: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.primary,
    textAlign: 'right',
    textDecorationLine: 'underline',
  },

  // Acknowledgement
  acknowledgementCard: {
    backgroundColor: Colors.primary10,
    borderRadius: 10,
    padding: 18,
  },
  acknowledgementText: {
    fontSize: 14,
    fontWeight: '400',
    color: Colors.black,
    lineHeight: 21,
    marginBottom: 16,
  },
  termsLink: {
    color: Colors.primary,
    textDecorationLine: 'underline',
  },
  signerName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.black,
    marginBottom: 14,
  },
  signatureBtn: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#707070',
    borderRadius: 5,
    width: 250,
    height: 61,
    alignSelf: 'flex-start',
    marginLeft: 0,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  signatureBtnText: {
    color: Colors.primary,
    fontWeight: '500',
    fontSize: 16,
  },
  signatureLine: {
    height: 2,
    backgroundColor: Colors.gray,
    marginBottom: 14,
  },
  byRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  byLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.black,
  },
  byInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.grayLight,
    borderRadius: 0,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: 'rgba(217,217,217,0)',
  },
  byPlaceholder: {
    fontSize: 14,
    fontWeight: '500',
    fontStyle: 'italic',
    color: Colors.black,
  },
  declineBtn: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#707070',
    borderRadius: 5,
    width: '100%',
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  declineBtnText: {
    color: Colors.danger,
    fontWeight: '500',
    fontSize: 16,
  },
  submitBtn: {
    backgroundColor: Colors.primary30,
    borderRadius: 5,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
    width: 181,
    alignSelf: 'center',
  },
  submitBtnText: {
    color: Colors.white,
    fontWeight: '500',
    fontSize: 14,
  },

});
