import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { BlurTargetView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Text from '../../../components/StyledText';
import Colors from '../../../constants/colors';
import useTheme from '../../../hooks/useTheme';
import {
  CalendarIcon,
  EyeCrossedIcon,
  EyeOpenIcon,
  OrderIdIcon,
} from '../../../icons';
import useUserStore from '../../../stores/userStore';
import {
  useUpdateSettlementDecision,
} from '../../../api/queries/transactions';
import useTransactionDetailViewModel from '../hooks/useTransactionDetailViewModel';
import {
  formatAmount,
  formatDate,
  formatType,
} from '../utils/formatters';
import TransactionOverlayShell from '../components/TransactionOverlayShell';
import TransactionResultModal from '../components/TransactionResultModal';

const CARD_DARK = '#2B2B2B';
const BORDER_DARK = 'rgba(255,255,255,0.18)';
const TEXT_MUTED_DARK = '#C9C9C9';

function formatStatementCurrency(code) {
  if (!code) return 'US$';
  if (code === 'USD') return 'US$';
  return code;
}

function formatStatementValue(amount, isCredit) {
  const formatted = Number(amount || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return isCredit ? `${formatted} CR` : `(${formatted}) DR`;
}

function getCounterpartyName(counterparty) {
  if (!counterparty) return '';
  return `${counterparty.first_name || ''} ${counterparty.last_name || ''}`.trim() || counterparty.email || '';
}

function getSettlementDecisionBadge(status) {
  const normalized = String(status || 'pending').toLowerCase();

  if (['accepted', 'accept', 'approved', 'approve'].includes(normalized)) {
    return { label: 'Accepted', color: Colors.success };
  }

  if (['rejected', 'reject', 'declined', 'decline'].includes(normalized)) {
    return { label: 'Rejected', color: Colors.danger };
  }

  return { label: 'Pending', color: Colors.pending };
}

function getCounterpartySettlementStatus(counterparty) {
  return (
    counterparty?.settlement_status ||
    counterparty?.settlement_decision_status ||
    counterparty?.settlement_statement_status ||
    counterparty?.decision_status ||
    counterparty?.settlement_decision ||
    'pending'
  );
}

function getStatementPermission(statementData, transaction) {
  if (!statementData) return false;

  const settlementPermission =
    statementData.can_decide ??
    statementData.can_authorize ??
    statementData.can_update ??
    statementData.allow_decision ??
    statementData.allow_action ??
    statementData.viewer_can_decide ??
    statementData.viewer_can_authorize ??
    statementData.permission ??
    statementData.has_permission;

  if (typeof settlementPermission === 'boolean') {
    return settlementPermission;
  }

  return (
    transaction?.viewer_next_required_action === 'accept_settlement' ||
    transaction?.required_actions?.includes?.('accept_settlement')
  );
}

function buildPartyStatementRows(counterparties, settlements, transactionAmount) {
  const counterpartyByEmail = Object.fromEntries(
    (counterparties || [])
      .filter((counterparty) => counterparty?.email)
      .map((counterparty) => [counterparty.email.toLowerCase(), counterparty]),
  );

  const orderedEmails = [];
  (settlements || []).forEach((item) => {
    [item?.due_to, item?.due_from].forEach((email) => {
      const normalized = email?.toLowerCase();
      if (normalized && !orderedEmails.includes(normalized)) {
        orderedEmails.push(normalized);
      }
    });
  });

  const emails = orderedEmails.length > 0
    ? orderedEmails
    : (counterparties || [])
      .map((counterparty) => counterparty?.email?.toLowerCase())
      .filter(Boolean);

  return emails.map((email) => {
    const counterparty = counterpartyByEmail[email];
    let credits = 0;
    let debits = 0;

    const rows = (settlements || [])
      .filter((item) => {
        const dueFrom = item?.due_from?.toLowerCase();
        const dueTo = item?.due_to?.toLowerCase();
        return dueFrom === email || dueTo === email;
      })
      .map((item) => {
        const amount =
          item.amount_type === 'percentage'
            ? ((item.value || 0) / 100) * (transactionAmount || 0)
            : item.actual_amount || item.value || 0;
        const isCredit = item?.due_to?.toLowerCase() === email;

        if (isCredit) {
          credits += amount;
        } else {
          debits += amount;
        }

        return {
          id: item.id,
          description: item.description || 'Settlement Item',
          amount,
          isCredit,
        };
      });

    return {
      id: counterparty?.id || email || rows[0]?.id || `party-${credits}-${debits}`,
      email: counterparty?.email || email || '',
      name:
        getCounterpartyName(counterparty) ||
        email ||
        'Counterparty',
      role: counterparty?.role
        ? counterparty.role.charAt(0).toUpperCase() + counterparty.role.slice(1)
        : 'Participant',
      decisionBadge: getSettlementDecisionBadge(getCounterpartySettlementStatus(counterparty)),
      rows,
      totalCredits: credits,
      totalDebits: debits,
      balance: credits - debits,
    };
  });
}

export default function SettlementStatementScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const theme = useTheme();
  const isDark = theme.isDark;
  const transactionId = Number(id);
  const [amountHidden, setAmountHidden] = useState(false);
  const [decisionInFlight, setDecisionInFlight] = useState(null);
  const [resultModal, setResultModal] = useState({
    visible: false,
    title: '',
    message: '',
    onClose: null,
  });
  const [blurTargetRef, setBlurTargetRef] = useState(null);
  const viewerEmail = useUserStore((state) => state.email);
  const settlementDecision = useUpdateSettlementDecision();

  const {
    transactionQuery,
    statementQuery,
    transaction,
    settlements,
    counterparties,
  } = useTransactionDetailViewModel(id);

  const statementSettlements =
    statementQuery.data?.all_settlements ||
    statementQuery.data?.settlements ||
    settlements ||
    [];
  const partyStatements = useMemo(
    () => buildPartyStatementRows(counterparties, statementSettlements, transaction?.amount || 0),
    [counterparties, statementSettlements, transaction?.amount],
  );

  const [expandedId, setExpandedId] = useState(null);
  const activeExpandedId = expandedId;

  const viewerNeedsSettlementDecision = getStatementPermission(statementQuery.data, transaction);

  const showResultModal = (title, message, onClose = null) => {
    setResultModal({
      visible: true,
      title,
      message,
      onClose,
    });
  };

  if (transactionQuery.isLoading || statementQuery.isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!transaction) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.textSecondary }}>Settlement statement not found</Text>
      </View>
    );
  }

  const currencyCode =
    transaction?.currency ||
    transaction?.quote_currency ||
    transaction?.base_currency ||
    'USD';
  const currencyLabel = formatStatementCurrency(currencyCode);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <BlurTargetView ref={setBlurTargetRef} style={styles.blurTarget}>
        <View style={[styles.header, { backgroundColor: theme.headerBg }]}>
          <View style={styles.headerContent}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              activeOpacity={0.75}
            >
              <Ionicons name="arrow-back-circle-outline" size={28} color={Colors.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Settlement Statement</Text>
            <View style={styles.headerSpacer} />
          </View>
        </View>

        <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
          <Text style={[styles.typeText, { color: isDark ? TEXT_MUTED_DARK : Colors.primary }]}>
            {formatType(transaction.type)}
          </Text>

          <View style={styles.referenceRow}>
            <OrderIdIcon size={14} color={isDark ? Colors.white : Colors.primary} />
            <Text style={[styles.referenceText, { color: isDark ? Colors.white : Colors.primary }]}>
              {transaction.reference}
            </Text>
          </View>

          <View style={[styles.summaryCard, { backgroundColor: isDark ? '#5B5FC780' : '#5B5FC7' }]}>
            <View style={styles.summaryAmountRow}>
              <Text style={styles.summaryAmountText}>
                {amountHidden
                  ? '••••••••'
                  : formatAmount(transaction.amount, currencyCode, transaction)}
              </Text>
              <TouchableOpacity
                onPress={() => setAmountHidden((value) => !value)}
                style={styles.eyeButton}
              >
                {amountHidden ? (
                  <EyeCrossedIcon size={17} color={Colors.white} />
                ) : (
                  <EyeOpenIcon size={17} color={Colors.white} />
                )}
              </TouchableOpacity>
            </View>
            <Text style={styles.summaryCaption}>Transaction Value</Text>
            <Text
              style={styles.summaryDescription}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {transaction.description}
            </Text>

            <View style={styles.summaryFooter}>
              <View style={styles.summaryDateWrap}>
                <CalendarIcon size={18} color={Colors.white} />
                <View style={styles.summaryDateTextWrap}>
                  <Text style={styles.summaryDateValue}>{formatDate(transaction.closing_date)}</Text>
                  <Text style={styles.summaryDateLabel}>Closing Date</Text>
                </View>
              </View>
            </View>
          </View>

          {partyStatements.map((party) => {
            const isExpanded = activeExpandedId === party.id;
            const showDecisionButtons =
              isExpanded &&
              viewerNeedsSettlementDecision &&
              party.email &&
              viewerEmail &&
              party.email.toLowerCase() === viewerEmail.toLowerCase();

            return (
              <View
                key={party.id}
                style={[
                  styles.partyCard,
                  {
                    backgroundColor: isDark ? CARD_DARK : Colors.white,
                    borderColor: 'rgba(213, 213, 213, 1)',
                    borderWidth: isExpanded ? 0 : 1,
                  },
                ]}
              >
                <TouchableOpacity
                  style={styles.partyHeader}
                  activeOpacity={0.8}
                  onPress={() => setExpandedId((current) => (current === party.id ? null : party.id))}
                >
                  <View style={styles.partyHeaderTextWrap}>
                    <Text style={[styles.partyName, { color: theme.text }]} numberOfLines={1}>
                      {party.name}
                    </Text>
                    <Text style={[styles.partyRole, { color: isDark ? TEXT_MUTED_DARK : Colors.gray }]}>
                      {party.role}
                    </Text>
                  </View>
                  <View style={styles.partyHeaderAction}>
                    <View style={styles.partyDecisionWrap}>
                      <Text style={[styles.partyDecisionText, { color: party.decisionBadge.color }]}>
                        {party.decisionBadge.label}
                      </Text>
                    </View>
                    <Ionicons
                      name={isExpanded ? 'chevron-down' : 'chevron-forward'}
                      size={18}
                      color={isDark ? Colors.white : Colors.black}
                    />
                  </View>
                </TouchableOpacity>

                <View
                  style={[
                    styles.partyHeaderDivider,
                    { backgroundColor: isDark ? BORDER_DARK : Colors.grayLight },
                  ]}
                />

                {isExpanded ? (
                  <>
                    <View style={styles.tableHeader}>
                      <Text style={[styles.tableHeaderLabel, { color: theme.text }]}>Description</Text>
                      <Text style={[styles.tableHeaderCurrency, { color: theme.text }]}>{currencyLabel}</Text>
                    </View>
                    <View
                      style={[
                        styles.tableDivider,
                        { backgroundColor: isDark ? BORDER_DARK : Colors.grayLight },
                      ]}
                    />

                    {party.rows.map((row, index) => (
                      <View key={row.id || `${party.id}-row-${index}`}>
                        <View style={styles.tableRow}>
                          <Text style={[styles.rowDescription, { color: isDark ? TEXT_MUTED_DARK : Colors.gray }]}>
                            {row.description}
                          </Text>
                          <Text style={[styles.rowValue, { color: isDark ? TEXT_MUTED_DARK : Colors.gray }]}>
                            {formatStatementValue(row.amount, row.isCredit)}
                          </Text>
                        </View>
                        {index < party.rows.length - 1 ? (
                          <View
                            style={[
                              styles.tableDivider,
                              { backgroundColor: isDark ? BORDER_DARK : Colors.grayLight },
                            ]}
                          />
                        ) : null}
                      </View>
                    ))}

                    <View style={styles.summaryBlock}>
                      <Text style={[styles.summaryBlockTitle, { color: theme.text }]}>Summary</Text>
                      <View style={[styles.summaryUnderline, { backgroundColor: isDark ? TEXT_MUTED_DARK : Colors.grayLight }]} />

                      <View style={styles.summaryCurrencyRow}>
                        <Text style={[styles.summaryCurrencyText, { color: theme.text }]}>{currencyLabel}</Text>
                      </View>
                      <View style={[styles.summaryDivider, { backgroundColor: isDark ? BORDER_DARK : Colors.grayLight }]} />

                      <View style={styles.summaryDataRow}>
                        <Text style={[styles.summaryDataLabel, { color: isDark ? TEXT_MUTED_DARK : Colors.gray }]}>
                          Total Credits (CR)
                        </Text>
                        <Text style={[styles.summaryDataValue, { color: isDark ? TEXT_MUTED_DARK : Colors.gray }]}>
                          {Number(party.totalCredits).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </Text>
                      </View>

                      <View style={styles.summaryDataRow}>
                        <Text style={[styles.summaryDataLabel, { color: isDark ? TEXT_MUTED_DARK : Colors.gray }]}>
                          Total Debits (DR)
                        </Text>
                        <Text style={[styles.summaryDataValue, { color: isDark ? TEXT_MUTED_DARK : Colors.gray }]}>
                          ({Number(party.totalDebits).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })})
                        </Text>
                      </View>

                      <View style={[styles.summaryDivider, { backgroundColor: isDark ? BORDER_DARK : Colors.grayLight }]} />

                      <View style={styles.summaryDataRow}>
                        <Text style={[styles.summaryBalanceLabel, { color: theme.text }]}>
                          Balance Due to {party.role}
                        </Text>
                        <Text style={[styles.summaryBalanceValue, { color: theme.text }]}>
                          {Number(party.balance).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </Text>
                      </View>
                      <View style={[styles.summaryDivider, { backgroundColor: isDark ? BORDER_DARK : Colors.grayLight }]} />
                      <View
                        style={[
                          styles.summaryDivider,
                          styles.summaryDividerTight,
                          { backgroundColor: isDark ? BORDER_DARK : Colors.grayLight },
                        ]}
                      />

                      {showDecisionButtons ? (
                        <View style={styles.decisionButtonsRow}>
                          <TouchableOpacity
                            style={[styles.decisionButton, styles.acceptButton]}
                            activeOpacity={0.85}
                            disabled={settlementDecision.isPending}
                            onPress={async () => {
                              setDecisionInFlight('accepted');
                              try {
                                const result = await settlementDecision.mutateAsync({
                                  transactionId,
                                  status: 'accepted',
                                });
                                showResultModal(
                                  'Settlement Accepted',
                                  result?.message || result?.data?.message || 'Settlement statement accepted successfully.',
                                  () => router.back(),
                                );
                              } catch (error) {
                                showResultModal(
                                  'Action Failed',
                                  error?.response?.data?.error ||
                                    error?.response?.data?.message ||
                                    error?.message ||
                                    'Unable to accept settlement statement.',
                                );
                              } finally {
                                setDecisionInFlight(null);
                              }
                            }}
                          >
                            {settlementDecision.isPending && decisionInFlight === 'accepted' ? (
                              <ActivityIndicator size="small" color={Colors.white} />
                            ) : (
                              <Text style={styles.decisionButtonText}>Accept</Text>
                            )}
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.decisionButton, styles.rejectButton]}
                            activeOpacity={0.85}
                            disabled={settlementDecision.isPending}
                            onPress={async () => {
                              setDecisionInFlight('rejected');
                              try {
                                const result = await settlementDecision.mutateAsync({
                                  transactionId,
                                  status: 'rejected',
                                });
                                showResultModal(
                                  'Settlement Rejected',
                                  result?.message || result?.data?.message || 'Settlement statement rejected.',
                                  () => router.back(),
                                );
                              } catch (error) {
                                showResultModal(
                                  'Action Failed',
                                  error?.response?.data?.error ||
                                    error?.response?.data?.message ||
                                    error?.message ||
                                    'Unable to reject settlement statement.',
                                );
                              } finally {
                                setDecisionInFlight(null);
                              }
                            }}
                          >
                            {settlementDecision.isPending && decisionInFlight === 'rejected' ? (
                              <ActivityIndicator size="small" color={Colors.white} />
                            ) : (
                              <Text style={styles.decisionButtonText}>Reject</Text>
                            )}
                          </TouchableOpacity>
                        </View>
                      ) : null}
                    </View>
                  </>
                ) : null}
              </View>
            );
          })}

          <View style={{ height: 28 }} />
        </ScrollView>
      </BlurTargetView>

      <TransactionOverlayShell
        visible={resultModal.visible}
        position="center"
        blurTarget={blurTargetRef}
        onClose={() => {
          const closeHandler = resultModal.onClose;
          setResultModal({
            visible: false,
            title: '',
            message: '',
            onClose: null,
          });
          if (closeHandler) closeHandler();
        }}
      >
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
              if (closeHandler) closeHandler();
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
  },
  blurTarget: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    paddingTop: 38,
    height: 108,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingBottom: 14,
  },
  backButton: {
    width: 28,
    height: 28,
  },
  headerTitle: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    flex: 1,
  },
  headerSpacer: {
    width: 28,
  },
  body: {
    flex: 1,
    paddingHorizontal: 12,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '500',
    paddingTop: 12,
    paddingBottom: 6,
  },
  referenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  referenceText: {
    fontSize: 12,
    fontWeight: '500',
  },
  summaryCard: {
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 14,
  },
  summaryAmountRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryAmountText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  eyeButton: {
    marginLeft: 8,
  },
  summaryCaption: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: '400',
    marginTop: 2,
  },
  summaryDescription: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '500',
    marginTop: 8,
  },
  summaryFooter: {
    marginTop: 14,
  },
  summaryDateWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryDateTextWrap: {
    marginLeft: 8,
  },
  summaryDateValue: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
  summaryDateLabel: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: '400',
    marginTop: 1,
  },
  partyCard: {
    borderRadius: 8,
    marginBottom: 10,
    overflow: 'hidden',
  },
  partyHeader: {
    minHeight: 52,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  partyHeaderTextWrap: {
    flex: 1,
    minWidth: 0,
    paddingRight: 10,
  },
  partyHeaderAction: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
  },
  partyDecisionWrap: {
    minWidth: 58,
    alignItems: 'flex-end',
    marginRight: 8,
  },
  partyHeaderDivider: {
    height: 1,
    width: '100%',
  },
  partyName: {
    fontSize: 13,
    fontWeight: '500',
  },
  partyRole: {
    fontSize: 11,
    fontWeight: '400',
    marginTop: 1,
  },
  partyDecisionText: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'right',
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 8,
  },
  tableDivider: {
    height: 1,
    marginHorizontal: 12,
  },
  tableHeaderLabel: {
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
  tableHeaderCurrency: {
    fontSize: 13,
    fontWeight: '700',
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  rowDescription: {
    flex: 1,
    fontSize: 12,
    fontWeight: '400',
    paddingRight: 10,
  },
  rowValue: {
    fontSize: 12,
    fontWeight: '400',
    textAlign: 'right',
  },
  summaryBlock: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 12,
  },
  summaryBlockTitle: {
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  summaryUnderline: {
    alignSelf: 'center',
    width: 86,
    height: 1,
    marginTop: 4,
    marginBottom: 12,
  },
  summaryCurrencyRow: {
    alignItems: 'flex-end',
    paddingBottom: 6,
  },
  summaryCurrencyText: {
    fontSize: 13,
    fontWeight: '500',
  },
  summaryDivider: {
    height: 1,
  },
  summaryDividerTight: {
    marginTop: 2,
  },
  summaryDataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryDataLabel: {
    flex: 1,
    fontSize: 12,
    fontWeight: '400',
    paddingRight: 10,
  },
  summaryDataValue: {
    fontSize: 12,
    fontWeight: '400',
    textAlign: 'right',
  },
  summaryBalanceLabel: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    paddingRight: 10,
  },
  summaryBalanceValue: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'right',
  },
  decisionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 28,
    paddingHorizontal: 22,
  },
  decisionButton: {
    width: 103,
    height: 35,
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptButton: {
    backgroundColor: Colors.success,
  },
  rejectButton: {
    backgroundColor: Colors.danger,
  },
  decisionButtonText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '500',
  },
});
