import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurTargetView } from 'expo-blur';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Text from '../../../components/StyledText';
import Colors from '../../../constants/colors';
import useTheme from '../../../hooks/useTheme';
import {
  useCompleteTransaction,
  useCopyTransaction,
  useDeleteTransaction,
  useResendCounterpartyEmail,
  useSubmitTransaction,
  useVoidTransaction,
} from '../../../api/queries/transactions';
import TransactionActionsMenu from '../components/TransactionActionsMenu';
import TransactionConfirmModal from '../components/TransactionConfirmModal';
import TransactionOverlayShell from '../components/TransactionOverlayShell';
import TransactionResultModal from '../components/TransactionResultModal';
import TransactionSummarySection from '../components/TransactionSummarySection';
import TransactionStatusSection from '../components/TransactionStatusSection';
import CounterpartiesSection from '../components/CounterpartiesSection';
import DocumentsSection from '../components/DocumentsSection';
import SettlementsSection from '../components/SettlementsSection';
import PaymentSection from '../components/PaymentSection';
import AcknowledgementSection from '../components/AcknowledgementSection';
import useTransactionDetailViewModel from '../hooks/useTransactionDetailViewModel';

export default function TransactionDetailScreen() {
  const { id } = useLocalSearchParams();
  const transactionId = Number(id);
  const router = useRouter();
  const theme = useTheme();
  const isDark = theme.isDark;
  const [amountHidden, setAmountHidden] = useState(false);
  const [expandedPreconditions, setExpandedPreconditions] = useState({});
  const [actionsMenuVisible, setActionsMenuVisible] = useState(false);
  const [confirmModal, setConfirmModal] = useState({
    visible: false,
    title: '',
    message: '',
    confirmLabel: 'Confirm',
    action: null,
    loading: false,
  });
  const [resultModal, setResultModal] = useState({
    visible: false,
    title: '',
    message: '',
    onClose: null,
  });

  const {
    transactionQuery,
    transaction,
    counterparties,
    documents,
    settlements,
    totalDue,
    myRole,
    emailToName,
    stepData,
  } = useTransactionDetailViewModel(id);
  const resendCounterpartyEmail = useResendCounterpartyEmail();
  const deleteTransaction = useDeleteTransaction();
  const voidTransaction = useVoidTransaction();
  const completeTransaction = useCompleteTransaction();
  const copyTransaction = useCopyTransaction();
  const submitTransaction = useSubmitTransaction();
  const [blurTargetRef, setBlurTargetRef] = useState(null);

  const showResultModal = (title, message, onClose = null) => {
    setResultModal({
      visible: true,
      title,
      message,
      onClose,
    });
  };

  const showConfirmModal = (title, message, action, confirmLabel = 'Confirm') => {
    setConfirmModal({
      visible: true,
      title,
      message,
      confirmLabel,
      action,
      loading: false,
    });
  };

  const closeConfirmModal = () => {
    setConfirmModal({
      visible: false,
      title: '',
      message: '',
      confirmLabel: 'Confirm',
      action: null,
      loading: false,
    });
  };

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

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <BlurTargetView ref={setBlurTargetRef} style={styles.blurTarget}>
        <View style={[styles.detailHeader, { backgroundColor: theme.headerBg }]}>
          <View style={styles.detailHeaderContent}>
            <View style={styles.detailHeaderSide}>
              <TouchableOpacity
                style={styles.detailHeaderBackButton}
                onPress={() => router.back()}
                activeOpacity={0.7}
              >
                <Ionicons name="arrow-back-circle-outline" size={28} color={Colors.white} />
              </TouchableOpacity>
            </View>
            <Text style={styles.detailHeaderTitle}>Transaction Details</Text>
            <View style={styles.detailHeaderSide} />
          </View>
        </View>

        <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
          <TransactionSummarySection
            transaction={transaction}
            amountHidden={amountHidden}
            setAmountHidden={setAmountHidden}
            myRole={myRole}
            theme={theme}
            isDark={isDark}
            onOpenActions={() => setActionsMenuVisible(true)}
            styles={styles}
          />

          <TransactionStatusSection
            transaction={transaction}
            stepData={stepData}
            theme={theme}
            isDark={isDark}
            onOpenHistory={() => router.push(`/transaction-history/${transactionId}`)}
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
                showResultModal('Nudge Sent', message);
              } catch (error) {
                showResultModal(
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
            counterparties={counterparties}
            emailToName={emailToName}
            expandedPreconditions={expandedPreconditions}
            setExpandedPreconditions={setExpandedPreconditions}
            theme={theme}
            isDark={isDark}
            onOpenStatement={() => router.push(`/transaction-statement/${transactionId}`)}
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
            transaction={transaction}
            counterparties={counterparties}
            myRole={myRole}
            theme={theme}
            isDark={isDark}
            submitPending={submitTransaction.isPending}
            onSubmit={async () => {
              try {
                const result = await submitTransaction.mutateAsync(transactionId);
                showResultModal(
                  'Transaction Submitted',
                  result?.message ||
                    result?.data?.message ||
                    'The transaction was submitted successfully.',
                );
              } catch (error) {
                showResultModal(
                  'Submit Failed',
                  error?.response?.data?.error ||
                    error?.response?.data?.message ||
                    error?.message ||
                    'Unable to submit this transaction.',
                );
              }
            }}
            styles={styles}
          />

          <View style={{ height: 30 }} />
        </ScrollView>
      </BlurTargetView>

      <TransactionOverlayShell
        visible={actionsMenuVisible || confirmModal.visible || resultModal.visible}
        position={actionsMenuVisible ? 'topRight' : 'center'}
        dismissible={!confirmModal.loading}
        blurTarget={blurTargetRef}
        onClose={() => {
          if (actionsMenuVisible) {
            setActionsMenuVisible(false);
            return;
          }
          if (confirmModal.visible && !confirmModal.loading) {
            closeConfirmModal();
            return;
          }
          if (resultModal.visible) {
            const closeHandler = resultModal.onClose;
            setResultModal({
              visible: false,
              title: '',
              message: '',
              onClose: null,
            });
            if (closeHandler) closeHandler();
          }
        }}
      >
        {actionsMenuVisible ? (
          <TransactionActionsMenu
            theme={theme}
            isDark={isDark}
            onSelectAction={(action) => {
              setActionsMenuVisible(false);

              if (action === 'history') {
                setHistoryVisible(true);
                return;
              }

              if (action === 'cancel') {
                showConfirmModal(
                  'Cancel Transaction',
                  'Are you sure you want to cancel this transaction?',
                  'cancel',
                );
                return;
              }

              if (action === 'void') {
                showConfirmModal(
                  'Void Transaction',
                  'Are you sure you want to void this transaction?',
                  'void',
                );
                return;
              }

              if (action === 'complete') {
                showConfirmModal(
                  'Mark as Complete',
                  'Are you sure you want to mark this transaction as complete?',
                  'complete',
                );
                return;
              }

              if (action === 'copy') {
                showConfirmModal(
                  'Create Copy',
                  'Are you sure you want to create a copy of this transaction?',
                  'copy',
                );
              }
            }}
          />
        ) : null}

        {confirmModal.visible ? (
          <TransactionConfirmModal
            title={confirmModal.title}
            message={confirmModal.message}
            confirmLabel={confirmModal.confirmLabel}
            loading={confirmModal.loading}
            theme={theme}
            isDark={isDark}
            onClose={closeConfirmModal}
            onConfirm={async () => {
              if (!confirmModal.action || confirmModal.loading) return;

              setConfirmModal((current) => ({ ...current, loading: true }));

              try {
                if (confirmModal.action === 'cancel') {
                  await deleteTransaction.mutateAsync(transactionId);
                  closeConfirmModal();
                  showResultModal(
                    'Transaction Cancelled',
                    'The transaction was deleted successfully.',
                    () => router.back(),
                  );
                  return;
                }

                if (confirmModal.action === 'void') {
                  await voidTransaction.mutateAsync(transactionId);
                  closeConfirmModal();
                  showResultModal('Transaction Voided', 'The transaction was voided successfully.');
                  return;
                }

                if (confirmModal.action === 'complete') {
                  await completeTransaction.mutateAsync(transactionId);
                  closeConfirmModal();
                  showResultModal('Transaction Completed', 'The transaction was marked as complete.');
                  return;
                }

                if (confirmModal.action === 'copy') {
                  const result = await copyTransaction.mutateAsync(transactionId);
                  const newId = result?.id || result?.transaction_id || result?.data?.id;
                  closeConfirmModal();
                  showResultModal(
                    'Transaction Copied',
                    newId ? `A copy was created successfully. New transaction ID: ${newId}` : 'A copy was created successfully.',
                  );
                }
              } catch (error) {
                closeConfirmModal();
                showResultModal(
                  'Action Failed',
                  error?.response?.data?.error ||
                    error?.response?.data?.message ||
                    error?.message ||
                    'Unable to complete this action.',
                );
              }
            }}
          />
        ) : null}

        {resultModal.visible ? (
          <TransactionResultModal
            title={resultModal.title}
            message={resultModal.message}
            theme={theme}
            isDark={isDark}
            onClose={() => {
              const closeHandler = resultModal.onClose;
              setResultModal({
                visible: false,
                title: '',
                message: '',
                onClose: null,
              });
              if (closeHandler) {
                closeHandler();
              }
            }}
          />
        ) : null}
      </TransactionOverlayShell>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  blurTarget: {
    flex: 1,
  },
  detailHeader: {
    paddingTop: 38,
    height: 108,
  },
  detailHeaderContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingBottom: 14,
  },
  detailHeaderSide: {
    width: 44,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  detailHeaderBackButton: {
    width: 28,
    height: 28,
  },
  detailHeaderTitle: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    flex: 1,
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
    paddingLeft: 13,
    paddingRight: 0,
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
    marginLeft: 'auto',
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
    minWidth: 163,
    height: 35,
    borderRadius: 5,
    alignSelf: 'flex-start',
    marginBottom: 6,
    justifyContent: 'flex-start',
    paddingHorizontal: 10,
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
    minWidth: 163,
    height: 35,
    borderRadius: 5,
    alignSelf: 'flex-start',
    marginBottom: 6,
    marginTop: 8,
    justifyContent: 'flex-start',
    paddingHorizontal: 10,
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
    paddingLeft: 4,
    paddingRight: 14,
  },
  historyLinkText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '500',
    textDecorationLine: 'underline',
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
  cpContentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cpLeftColumn: {
    flex: 1,
    minWidth: 0,
    paddingRight: 12,
  },
  cpRightColumn: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    minHeight: 72,
  },
  cpNameRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  cpVerificationBadgeWrap: {
    marginTop: 5,
  },
  cpNameTextBlock: {
    flex: 1,
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
  cpEmail: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.gray,
    marginTop: 10,
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
    marginTop: 14,
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
    justifyContent: 'space-between',
    width: '100%',
  },
  preconditionNumber: {
    fontSize: 13,
    fontWeight: '400',
    color: '#707070',
    marginRight: 6,
    lineHeight: 18,
  },
  preconditionContent: {
    flex: 1,
    minWidth: 0,
    paddingRight: 4,
  },
  preconditionDesc: {
    fontSize: 13,
    fontWeight: '300',
    color: '#707070',
    lineHeight: 18,
    flexShrink: 1,
    marginBottom: 10,
  },
  preconditionPartyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 18,
    marginBottom: 4,
  },
  preconditionParty: {
    fontSize: 13,
    fontWeight: '300',
    color: '#707070',
    flex: 1,
    marginRight: 10,
    lineHeight: 18,
  },
  checkbox: {
    width: 14,
    height: 14,
    marginTop: 2,
    marginLeft: 4,
    flexShrink: 0,
    borderWidth: 1,
    borderColor: '#707070',
    borderRadius: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
  },
  preconditionDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.primary,
    marginVertical: 8,
    marginLeft: 2,
    marginRight: 2,
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
    marginTop: 8,
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
