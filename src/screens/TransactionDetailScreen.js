//checkBack01 
//transaction details for any transactions


import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Text from '../components/StyledText';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/colors';
import { getTransaction } from '../constants/api';
import LucidLogo from '../components/LucidLogo';
import StepperChevron from '../components/StepperChevron';
import StepAgreementIcon from '../components/StepAgreementIcon';
import StepEscrowIcon from '../components/StepEscrowIcon';
import StepDeliveryIcon from '../components/StepDeliveryIcon';
import StepAcceptanceIcon from '../components/StepAcceptanceIcon';
import StepDisbursementIcon from '../components/StepDisbursementIcon';
import ActionRequiredIcon from '../components/ActionRequiredIcon';
import AwaitingDeliveryIcon from '../components/AwaitingDeliveryIcon';
import EyeCrossedIcon from '../components/EyeCrossedIcon';
import EyeOpenIcon from '../components/EyeOpenIcon';
import VerticalDotsIcon from '../components/VerticalDotsIcon';
import AvatarIcon from '../components/AvatarIcon';
import ExclamationIcon from '../components/ExclamationIcon';
import NudgeIcon from '../components/NudgeIcon';
import OrderIdIcon from '../components/OrderIdIcon';

// stepper stages.. the order matters here for progress tracking
const STAGE_ORDER = ['STAGING', 'AWAITING_SIGNATURES', 'AWAITING_FUNDS', 'AWAITING_DISBURSEMENT', 'COMPLETED'];
const STAGE_LABELS = ['Agreement', 'Escrow', 'Delivery', 'Acceptance', 'Disbursement'];
const STAGE_ICONS = ['document-text-outline', 'lock-closed-outline', 'time-outline', 'checkbox-outline', 'wallet-outline'];

export default function TransactionDetailScreen({ route, navigation }) {
  const { transactionId } = route.params || {};
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [amountHidden, setAmountHidden] = useState(false);

  useEffect(() => {
    if (transactionId) {
      getTransaction(transactionId)
        .then((data) => setTransaction(data))
        .catch((e) => console.error('Failed to fetch transaction:', e))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [transactionId]);

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!transaction) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: Colors.gray }}>Transaction not found</Text>
      </View>
    );
  }

  const formatAmount = (amount, currency) => {
    const symbols = { USD: '$', NGN: '₦', GBP: '£', EUR: '€', JPY: '¥', INR: '₹', KES: 'KSh', GHS: '₵', ZAR: 'R', CNY: '¥' };
    const effectiveCurrency = currency || transaction?.quote_currency || transaction?.base_currency || 'USD';
    const sym = symbols[effectiveCurrency] || (effectiveCurrency + ' ');
    // for currency exchange transactions, amount is 0 so we sum from settlements instea
    let effectiveAmount = amount;
    if (!effectiveAmount && transaction?.settlements?.length) {
      effectiveAmount = transaction.settlements.reduce((sum, s) => {
        if (s.amount_type === 'percentage') {
          return sum + ((s.value || 0) / 100) * (transaction.amount || 0);
        }
        return sum + (s.actual_amount || s.value || 0);
      }, 0);
    }
    return `${sym}${(effectiveAmount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const h = d.getHours();
    const m = d.getMinutes();
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()} (${h % 12 || 12}:${m.toString().padStart(2, '0')}${h >= 12 ? 'PM' : 'AM'})`;
  };

  const formatType = (type) => {
    if (!type) return '';
    return type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  const currentStageIndex = STAGE_ORDER.indexOf(transaction.current_stage || transaction.status);
  const stepData = STAGE_LABELS.map((label, i) => ({
    label,
    icon: STAGE_ICONS[i],
    completed: i < currentStageIndex,
    active: i === currentStageIndex,
  }));

  const getStatusLabel = (status) => {
    const map = {
      STAGING: 'Staging',
      DRAFT: 'Draft',
      AWAITING_SIGNATURES: 'Awaiting Signatures',
      AWAITING_FUNDS: 'Awaiting Funds',
      AWAITING_DISBURSEMENT: 'Awaiting Disbursement',
      VOIDED: 'Voided',
      COMPLETED: 'Completed',
    };
    return map[status] || status;
  };

  const counterparties = transaction.counterparties || [];
  const documents = transaction.documents || [];
  const settlements = transaction.settlements || [];
  // percentage settlements store the % not the actual naira amount... so we calculate it
  const totalDue = settlements.reduce((sum, s) => {
    if (s.amount_type === 'percentage') {
      return sum + ((s.value || 0) / 100) * (transaction.amount || 0);
    }
    return sum + (s.actual_amount || s.value || 0);
  }, 0);
  // suggezt: dont hardcode this email, get it from auth context or somthing
  const myRole = counterparties.find(cp => cp.email?.toLowerCase() === 'lovelace.filson2@teml.net');

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={22} color={Colors.white} />
            </View>
            <Text style={styles.greeting} numberOfLines={1}>Hello, Chibuikem!</Text>
          </View>
          <View style={styles.logoContainer}>
            <LucidLogo size={20} />
          </View>
        </View>
      </View>

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        {/* Breadcrumb */}
        <Text style={styles.breadcrumb}>{formatType(transaction.type)}</Text>

        {/* Order ID & Actions - outside card */}
        <View style={styles.summaryTopRow}>
          <View style={styles.idRow}>
            <OrderIdIcon size={16} />
            <Text style={styles.transactionId}>{transaction.reference}</Text>
          </View>
          <TouchableOpacity style={styles.actionsBtn}>
            <Text style={styles.actionsBtnText}>Actions</Text>
            <VerticalDotsIcon />
          </TouchableOpacity>
        </View>

        {/* Transaction Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.amountRow}>
            <Text style={styles.amountText}>
              {amountHidden ? '••••••••' : formatAmount(transaction.amount, transaction.currency)}
            </Text>
            <TouchableOpacity onPress={() => setAmountHidden(!amountHidden)} style={{ marginLeft: 10 }}>
              {amountHidden ? <EyeCrossedIcon size={18} /> : <EyeOpenIcon size={18} />}
            </TouchableOpacity>
          </View>
          <Text style={styles.valueLabel}>Transaction Value</Text>

          <Text style={styles.descriptionText} numberOfLines={2}>
            {transaction.description}
          </Text>

          <View style={styles.closingRow}>
            <View style={styles.closingLeft}>
              <Ionicons name="calendar-outline" size={16} color={Colors.primary} />
              <View style={{ marginLeft: 8 }}>
                <Text style={styles.closingDateValue}>{formatDate(transaction.closing_date)}</Text>
                <Text style={styles.closingDateLabel}>Closing Date</Text>
              </View>
            </View>
            <View style={styles.roleRow}>
              <AvatarIcon size={20} />
              <View style={styles.roleSection}>
                <Text style={styles.roleValue}>
                  {myRole ? myRole.role.charAt(0).toUpperCase() + myRole.role.slice(1) : ''}
                </Text>
                <Text style={styles.roleLabel}>Role</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Transaction Status */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Transaction Status</Text>

          <View style={styles.statusCard}>
            <StepperChevron
              steps={stepData.map((step, i) => ({
                ...step,
                date: step.completed ? 'Jun. 23, 2024\n(8:00AM)' : null,
                renderIcon: (color) => {
                  const iconMap = [
                    <StepAgreementIcon size={18} color={color} />,
                    <StepEscrowIcon size={20} color={color} />,
                    <StepDeliveryIcon size={20} color={color} />,
                    <StepAcceptanceIcon size={20} color={color} />,
                    <View style={{ marginLeft: 6 }}><StepDisbursementIcon size={32} color={color} /></View>,
                  ];
                  return iconMap[i];
                },
              }))}
            />

            {/* Status Badges */}
            <View style={styles.awaitingBadge}>
              <AwaitingDeliveryIcon size={14} color={Colors.accent} />
              <Text style={styles.awaitingBadgeText}>Awaiting Delivery</Text>
            </View>
            <Text style={styles.statusNote}>
              Funds sent to escrow account by buyer. Awaiting sellers confirmation of delivery.
            </Text>

            <View style={styles.actionRequiredBadge}>
              <ActionRequiredIcon size={16} color={Colors.primary} />
              <Text style={styles.actionRequiredBadgeText}>Action Required</Text>
            </View>
            <Text style={styles.statusNote}>
              Confirm that Seller/counterparty has fulfilled all terms and tick checkbox(es) to proceed.
            </Text>

          </View>
          <TouchableOpacity style={styles.historyLink}>
            <Text style={styles.historyLinkText}>Transaction History {'>'}</Text>
          </TouchableOpacity>
        </View>

        {/* Counterparties */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Counterparties</Text>

          <View style={styles.counterpartiesCard}>
            {counterparties.map((cp, index) => (
              <View key={cp.id || index}>
                <View style={styles.cpBlock}>
                  <View style={styles.cpTopRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cpName}>
                        {cp.first_name} {cp.middle_name ? cp.middle_name + ' ' : ''}{cp.last_name}
                      </Text>
                      <Text style={styles.cpRole}>
                        {cp.role ? cp.role.charAt(0).toUpperCase() + cp.role.slice(1) : ''}
                      </Text>
                    </View>
                    {cp.next_required_action ? (
                      <View style={styles.cpActionBadge}>
                        <ExclamationIcon size={14} />
                        <Text style={styles.cpActionText}> Action Required</Text>
                      </View>
                    ) : (
                      <View style={styles.cpNoActionBadge}>
                        <Text style={styles.cpNoActionText}>No Action Required</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.cpBottomRow}>
                    <Text style={styles.cpEmail} numberOfLines={1}>{cp.email}</Text>
                    {cp.next_required_action && (
                      <TouchableOpacity style={styles.nudgeBtn}>
                        <NudgeIcon size={14} color={Colors.white} />
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
            <Text style={styles.sectionTitle}>Transaction Documents</Text>
            <View style={styles.documentsCard}>
              {documents.map((doc, index) => (
                <View key={doc.id || index}>
                  <View style={styles.documentRow}>
                    <Text style={styles.documentNumber}>{index + 1}.</Text>
                    <Text style={styles.documentName}>{doc.description || doc.name || `Document ${index + 1}`}</Text>
                    <View style={{ flex: 1 }} />
                    <TouchableOpacity style={styles.docFileBtn}>
                      <Ionicons name="document-text" size={18} color={Colors.gray} />
                    </TouchableOpacity>
                  </View>
                  {index < documents.length - 1 && <View style={styles.docDivider} />}
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Payment */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Payment</Text>

          <View style={styles.paymentCard}>
            <View style={styles.paymentAmountRow}>
              <Ionicons name="time-outline" size={20} color={Colors.danger} />
              <View style={{ marginLeft: 8 }}>
                <Text style={styles.paymentAmount}>
                  {formatAmount(totalDue, transaction.currency)}
                </Text>
              </View>
            </View>
            <Text style={styles.paymentLabel}>
              Balance Due from [{myRole ? myRole.role.charAt(0).toUpperCase() + myRole.role.slice(1) : 'Buyer'}]:
            </Text>

            <TouchableOpacity style={styles.paymentBtn}>
              <Text style={styles.paymentBtnText}>Transfer Payment to Escrow</Text>
            </TouchableOpacity>

            <Text style={styles.paymentNote}>
              Your payment will be held in an Escrow Account with one of our Partner Banks until you authorize disbursement to the relevant counterparty/counterparties.
            </Text>

            <TouchableOpacity>
              <Text style={styles.paymentDetailsLink}>View Payment Details</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Acknowledgement and Acceptance */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Acknowledgement and Acceptance</Text>

          <View style={styles.acknowledgementCard}>
            <Text style={styles.acknowledgementText}>
              By signing below, [Buyer's Name], the [Role], acknowledges having read, understood, and agreed to the terms outlined in the attached Transaction Documents and Settlement Statement. The undersigned confirms their acceptance of the provisions described herein as binding and enforceable.{' '}
              <Text style={styles.termsLink}>Terms and Conditions</Text>.
            </Text>

            {counterparties.length > 0 && (
              <Text style={styles.signerName}>
                {counterparties[0].first_name} {counterparties[0].last_name}
              </Text>
            )}

            <TouchableOpacity style={styles.signatureBtn}>
              <Text style={styles.signatureBtnText}>Insert Signature</Text>
            </TouchableOpacity>

            <View style={styles.signatureLine} />

            <View style={styles.byRow}>
              <Text style={styles.byLabel}>By:</Text>
              <View style={styles.byInput}>
                <Text style={styles.byPlaceholder}>Buyers' Name Placeholder</Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    backgroundColor: Colors.headerBg,
    paddingTop: 38,
    height: 108,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingBottom: 14,
    alignItems: 'flex-end',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.white10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 5,
  },
  greeting: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '500',
    maxWidth: 99,
  },
  logoContainer: {
    height: 44,
    justifyContent: 'center',
    marginBottom: 6,
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
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 5,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  awaitingBadgeText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.accent,
  },
  actionRequiredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primary10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 5,
    alignSelf: 'flex-start',
    marginBottom: 6,
    marginTop: 8,
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
    width: 390,
    alignSelf: 'center',
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
    backgroundColor: Colors.surfaceLight,
    borderWidth: 1,
    borderColor: Colors.gray,
    borderRadius: 5,
    width: 250,
    height: 61,
    alignSelf: 'center',
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
    borderRadius: 5,
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
    backgroundColor: Colors.surfaceLight,
    borderWidth: 1,
    borderColor: Colors.gray,
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
