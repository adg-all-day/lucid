import React, { useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import Text from '../../../components/StyledText';
import Header from '../../../components/Header';
import Colors from '../../../constants/colors';
import useTheme from '../../../hooks/useTheme';
import {
  ActionRequiredIcon,
  AwaitingDeliveryIcon,
  AvatarIcon,
  CalendarIcon,
  EyeCrossedIcon,
  EyeOpenIcon,
  ExclamationIcon,
  NudgeIcon,
  OrderIdIcon,
  PendingStarIcon,
  StepAcceptanceIcon,
  StepAgreementIcon,
  StepDeliveryIcon,
  StepDisbursementIcon,
  StepEscrowIcon,
  StepperChevron,
  ChevronRightSmall,
  VerticalDotsIcon,
} from '../../../icons';
import useUserStore from '../../../stores/userStore';
import { useTransaction, useTransactionHistory, useSettlementStatement } from '../../../api/queries/transactions';
import SettlementStatementModal from '../components/SettlementStatementModal';
import TransactionHistoryModal from '../components/TransactionHistoryModal';
import { TimeQuarterIcon } from '../../../icons';
import {
  formatActionLabel,
  formatAmount,
  formatDate,
  formatType,
  getStatusLabel,
} from '../utils/formatters';
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
        {/* Breadcrumb */}
        <Text style={[styles.breadcrumb, { color: isDark ? theme.text : Colors.primary }]}>{formatType(transaction.type)}</Text>

        {/* Order ID & Actions */}
        <View style={styles.summaryTopRow}>
          <View style={styles.idRow}>
            <OrderIdIcon size={16} color={isDark ? theme.icon : Colors.primary} />
            <Text style={[styles.transactionId, { color: isDark ? theme.text : Colors.primary }]}>{transaction.reference}</Text>
          </View>
          <TouchableOpacity
            style={[
              styles.actionsBtn,
              {
                backgroundColor: isDark ? theme.actionButtonBg : theme.cardBg,
                borderColor: isDark ? theme.actionButtonBg : Colors.border,
              },
            ]}
          >
            <Text style={[styles.actionsBtnText, { color: isDark ? theme.actionButtonText : Colors.primary }]}>Actions</Text>
            <VerticalDotsIcon color={isDark ? theme.icon : Colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Transaction Summary Card */}
        <View style={[styles.summaryCard, { backgroundColor: theme.summaryCardBg }]}>
          <View style={styles.amountRow}>
            <Text style={[styles.amountText, { color: isDark ? theme.text : Colors.primary }]}>
              {amountHidden
                ? '••••••••'
                : formatAmount(transaction.amount, transaction.currency, transaction)}
            </Text>
            <TouchableOpacity onPress={() => setAmountHidden((v) => !v)} style={{ marginLeft: 10 }}>
              {amountHidden ? <EyeCrossedIcon size={18} color={isDark ? theme.icon : Colors.grayMedium} /> : <EyeOpenIcon size={18} color={isDark ? theme.icon : Colors.grayMedium} />}
            </TouchableOpacity>
          </View>
          <Text style={[styles.valueLabel, { color: isDark ? theme.text : theme.textSecondary }]}>Transaction Value</Text>

          <Text style={[styles.descriptionText, { color: isDark ? theme.text : Colors.primary }]} numberOfLines={2}>
            {transaction.description}
          </Text>

          <View style={styles.closingRow}>
            <View style={styles.closingLeft}>
              <CalendarIcon size={16} color={isDark ? theme.icon : Colors.primary} />
              <View style={{ marginLeft: 8 }}>
                <Text style={[styles.closingDateValue, { color: isDark ? theme.text : Colors.primary }]}>{formatDate(transaction.closing_date)}</Text>
                <Text style={[styles.closingDateLabel, { color: isDark ? theme.text : theme.textSecondary }]}>Closing Date</Text>
              </View>
            </View>
            <View style={styles.roleRow}>
              <AvatarIcon size={20} color={isDark ? theme.icon : Colors.primary} />
              <View style={styles.roleSection}>
                <Text style={[styles.roleValue, { color: isDark ? theme.text : Colors.primary }]}>
                  {myRole?.role
                    ? myRole.role.charAt(0).toUpperCase() + myRole.role.slice(1)
                    : 'Participant'}
                </Text>
                <Text style={[styles.roleLabel, { color: isDark ? theme.text : theme.textSecondary }]}>Role</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Transaction Status */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: isDark ? theme.text : Colors.primary }]}>Transaction Status</Text>

          <View style={[styles.statusCard, { backgroundColor: theme.primary10 }]}>
            <StepperChevron steps={stepData} />

            <View style={[styles.awaitingBadge, { backgroundColor: theme.accent17 }]}>
              <AwaitingDeliveryIcon size={18} color={isDark ? theme.icon : Colors.accent} />
              <Text style={[styles.awaitingBadgeText, { color: isDark ? theme.text : Colors.accent }]}>
                {getStatusLabel(transaction.current_stage || transaction.status)}
              </Text>
            </View>
            <Text style={[styles.statusNote, { color: theme.text }]}>
              {transaction.stage || getStatusLabel(transaction.current_stage || transaction.status)}
            </Text>

            <View
              style={[
                styles.actionRequiredBadge,
                isDark && { backgroundColor: '#5B5FC780' },
              ]}
            >
              <ActionRequiredIcon size={18} color={isDark ? theme.icon : Colors.primary} />
              <Text style={[styles.actionRequiredBadgeText, { color: isDark ? theme.text : Colors.primary }]}>Action Required</Text>
            </View>
            <Text style={[styles.statusNote, { color: theme.text }]}>
              {transaction.viewer_next_required_action
                ? formatActionLabel(transaction.viewer_next_required_action)
                : 'None'}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.historyLink}
            onPress={() => setHistoryVisible(true)}
          >
            <View style={styles.inlineLinkRow}>
              <Text style={styles.historyLinkText}>Transaction History</Text>
              <ChevronRightSmall />
            </View>
          </TouchableOpacity>
        </View>

        {/* Counterparties */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: isDark ? theme.text : Colors.primary }]}>Counterparties</Text>

          <View style={[styles.counterpartiesCard, { backgroundColor: theme.primary10 }]}>
            {counterparties.map((cp, index) => (
              <View key={cp.id || `${cp.email}-${index}`}>
                <View style={styles.cpBlock}>
                  <View style={styles.cpTopRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.cpName, { color: theme.text }]}>
                        {cp.first_name} {cp.middle_name ? cp.middle_name + ' ' : ''}{cp.last_name}
                      </Text>
                      <Text style={[styles.cpRole, { color: theme.text }]}>
                        {cp.role ? cp.role.charAt(0).toUpperCase() + cp.role.slice(1) : 'Counterparty'}
                      </Text>
                    </View>
                    {cp.next_required_action ? (
                      <View style={[styles.cpActionBadge, isDark && { backgroundColor: '#FCE8EC' }]}>
                        <ExclamationIcon size={14} />
                        <Text style={styles.cpActionText}> Action Required</Text>
                      </View>
                    ) : (
                      <View style={[styles.cpNoActionBadge, isDark && { backgroundColor: '#E6F5F0' }]}>
                        <Text style={styles.cpNoActionText}>No Action Required</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.cpBottomRow}>
                    <Text style={[styles.cpEmail, { color: theme.text }]} numberOfLines={1}>{cp.email}</Text>
                    {cp.next_required_action && (
                      <TouchableOpacity style={styles.nudgeBtn}>
                        <NudgeIcon size={14} color={theme.icon} />
                        <Text style={styles.nudgeBtnText}> Nudge</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
                {index < counterparties.length - 1 && <View style={styles.cpDivider} />}
              </View>
            ))}
          </View>
        </View>

        {/* Transaction Documents */}
        {documents.length > 0 && (
          <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: isDark ? theme.text : Colors.primary }]}>Transaction Documents</Text>
            <View style={[styles.documentsCard, { backgroundColor: theme.primary10 }]}>
              {documents.map((doc, index) => (
                <View key={doc.id || `${doc.name}-${index}`}>
                  <View style={styles.documentRow}>
                    <Text style={[styles.documentNumber, { color: theme.text }]}>{index + 1}.</Text>
                    <Text style={[styles.documentName, { color: theme.text }]}>{doc.description || doc.name || `Document ${index + 1}`}</Text>
                    <View style={{ flex: 1 }} />
                    <TouchableOpacity style={[styles.docFileBtn, { backgroundColor: theme.surfaceLight }]}>
                      <Ionicons name="document-text" size={18} color={isDark ? theme.icon : Colors.gray} />
                    </TouchableOpacity>
                  </View>
                  {index < documents.length - 1 && <View style={styles.docDivider} />}
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Settlements */}
        {settlements.length > 0 && (
          <View style={styles.sectionContainer}>
            <Text style={[styles.sectionTitle, { color: isDark ? theme.text : Colors.primary }]}>Settlements</Text>
            <View style={[styles.settlementsCard, { backgroundColor: theme.primary10 }]}>
              {settlements.map((item, index) => {
                const preconditions = item.preconditions || item.conditions || [];
                const preconditionsExpanded = expandedPreconditions[index] ?? false;
                const settlementCurrency = item.currency || transaction.currency;

                return (
                  <View key={item.id || `settlement-${index}`}>
                    {/* Settlement header */}
                    <View style={styles.settlementHeader}>
                      <Text style={[styles.settlementNumber, { color: theme.textSecondary }]}>{index + 1}.</Text>
                      <Text style={[styles.settlementName, { color: theme.textSecondary }]}>
                        {item.description || `Settlement ${index + 1}`}
                      </Text>
                      <View style={styles.settlementStatus}>
                        <PendingStarIcon size={14} color={Colors.accent} />
                        <Text style={[styles.settlementStatusText, { color: Colors.accent }]}>
                          {item.status
                            ? item.status.charAt(0).toUpperCase() + item.status.slice(1).toLowerCase()
                            : 'Pending'}
                        </Text>
                      </View>
                    </View>

                    {/* Detail rows */}
                    <View style={styles.settlementDetails}>
                      <View style={styles.settlementRow}>
                        <Text style={[styles.settlementLabel, { color: theme.text }]}>Value</Text>
                        <Text style={[styles.settlementValue, { color: theme.text }]}>
                          {item.amount_type === 'percentage'
                            ? `${settlementCurrency} ${Number(
                              ((item.value || 0) / 100) * (transaction.amount || 0),
                            ).toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}`
                            : formatAmount(item.actual_amount || item.value, settlementCurrency, transaction)}
                        </Text>
                      </View>
                      <View style={styles.settlementRow}>
                        <Text style={[styles.settlementLabel, { color: theme.text }]}>Due From</Text>
                        <Text style={[styles.settlementValue, { color: theme.text }]}>{(item.due_from && emailToName[item.due_from.toLowerCase()]) || item.due_from || '—'}</Text>
                      </View>
                      <View style={styles.settlementRow}>
                        <Text style={[styles.settlementLabel, { color: theme.text }]}>Due To</Text>
                        <Text style={[styles.settlementValue, { color: theme.text }]}>{(item.due_to && emailToName[item.due_to.toLowerCase()]) || item.due_to || '—'}</Text>
                      </View>
                    </View>

                    {/* Disbursement Preconditions */}
                    {preconditions.length > 0 && (
                      <View style={styles.preconditionsSection}>
                        <TouchableOpacity
                          style={styles.preconditionsToggle}
                          onPress={() =>
                            setExpandedPreconditions((prev) => ({
                              ...prev,
                              [index]: !prev[index],
                            }))
                          }
                        >
                          <Text style={[styles.preconditionsTitle, { color: isDark ? theme.text : '#2F6BC6' }]}>Disbursement Preconditions</Text>
                          <Ionicons
                            name={preconditionsExpanded ? 'chevron-up' : 'chevron-down'}
                            size={16}
                            color={isDark ? theme.icon : Colors.primary}
                          />
                        </TouchableOpacity>

                        {preconditionsExpanded && (
                          <View style={[styles.preconditionsBox, { backgroundColor: theme.cardBg }]}>
                            {preconditions.map((cond, cIndex) => (
                              <View key={cond.id || `cond-${cIndex}`}>
                                {cIndex > 0 && <View style={styles.preconditionDivider} />}
                                <View style={styles.preconditionItem}>
                                  <Text style={[styles.preconditionNumber, { color: theme.text }]}>{cIndex + 1}.</Text>
                                  <View style={{ flex: 1 }}>
                                    <Text style={[styles.preconditionDesc, { color: theme.text }]}>
                                      {cond.description || cond.name || `Condition ${cIndex + 1}`}
                                    </Text>
                                    {(cond.parties || []).map((party, pIndex) => (
                                      <View key={pIndex} style={styles.preconditionPartyRow}>
                                        <Text style={[styles.preconditionParty, { color: theme.text }]}>{party.name || party}</Text>
                                        <View style={[styles.checkbox, { backgroundColor: theme.cardBg }]}>
                                          {party.completed && (
                                            <Ionicons name="checkmark" size={12} color={isDark ? theme.icon : Colors.primary} />
                                          )}
                                        </View>
                                      </View>
                                    ))}
                                  </View>
                                </View>
                              </View>
                            ))}
                          </View>
                        )}
                      </View>
                    )}

                    {index < settlements.length - 1 && <View style={styles.settlementDivider} />}
                  </View>
                );
              })}

            </View>

            <TouchableOpacity
              style={styles.viewStatementLink}
              onPress={() => setStatementVisible(true)}
            >
              <View style={styles.inlineLinkRow}>
                <Text style={styles.viewStatementText}>View Settlement Statement</Text>
                <ChevronRightSmall />
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Payment */}
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
              Balance Due from [{myRole ? myRole.role.charAt(0).toUpperCase() + myRole.role.slice(1) : 'Buyer'}]:
            </Text>

            <TouchableOpacity style={styles.paymentBtn}>
              <Text style={styles.paymentBtnText}>Transfer Payment to Escrow</Text>
            </TouchableOpacity>

            <Text style={[styles.paymentNote, { color: theme.text }]}>
              Your payment will be held in an Escrow Account with one of our Partner Banks until you authorize disbursement to the relevant counterparty/counterparties.
            </Text>

            <TouchableOpacity>
              <View style={styles.inlineLinkRow}>
                <Text style={styles.paymentDetailsLink}>View Payment Details</Text>
                <ChevronRightSmall />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Acknowledgement and Acceptance */}
        <View style={[styles.sectionContainer, { paddingTop: 28 }]}>
          <Text style={[styles.sectionTitle, { color: isDark ? theme.text : Colors.primary }]}>Acknowledgement and Acceptance</Text>

          <View style={[styles.acknowledgementCard, { backgroundColor: theme.primary10 }]}>
            <Text style={[styles.acknowledgementText, { color: theme.text }]}>
              By signing below, [{counterparties[0]?.first_name || 'Buyer'}'s Name], the [{myRole?.role ? myRole.role.charAt(0).toUpperCase() + myRole.role.slice(1) : 'Role'}], acknowledges having read, understood, and agreed to the terms outlined in the attached Transaction Documents and Settlement Statement. The undersigned confirms their acceptance of the provisions described herein as binding and enforceable.{' '}
              <Text style={styles.termsLink}>Terms and Conditions</Text>.
            </Text>

            {counterparties.length > 0 && (
              <Text style={[styles.signerName, { color: theme.text }]}>
                {counterparties[0].first_name} {counterparties[0].last_name}
              </Text>
            )}

            <TouchableOpacity style={styles.signatureBtn}>
              <Text style={styles.signatureBtnText}>Insert Signature</Text>
            </TouchableOpacity>

            <View style={styles.signatureLine} />

            <View style={styles.byRow}>
              <Text style={[styles.byLabel, { color: theme.text }]}>By:</Text>
              <View style={styles.byInput}>
                <Text style={[styles.byPlaceholder, { color: theme.text }]}>Buyers' Name Placeholder</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.declineBtn}>
              <Text style={styles.declineBtnText}>Decline Signing</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.submitBtn}>
            <Text style={styles.submitBtnText}>Submit</Text>
          </TouchableOpacity>
        </View>

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
    backgroundColor: Colors.primary,
    borderRadius: 5,
    paddingHorizontal: 12,
    paddingVertical: 5,
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
