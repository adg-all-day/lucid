// home screen - transaction list, stats cards, activity log
// data comes from the api except for the activity log which is still mock

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/colors';
import { userData, statsData, activityLog } from '../constants/mockData';
import { getTransactions } from '../constants/api';
import LucidLogo from '../components/LucidLogo';
import TransferIcon from '../components/TransferIcon';
import UserTimeIcon from '../components/UserTimeIcon';
import UnlockIcon from '../components/UnlockIcon';
import LockIcon from '../components/LockIcon';
import Text from '../components/StyledText';

const TABS = ['All Transactions', 'Staging', 'Signed', 'Disbursed', 'Closed'];

const STATUS_MAP = {
  'All Transactions': null,
  'Staging': ['STAGING', 'DRAFT'],
  'Signed': ['AWAITING_FUNDS', 'AWAITING_SIGNATURES'],
  'Disbursed': ['AWAITING_DISBURSEMENT'],
  'Closed': ['VOIDED', 'COMPLETED', 'CLOSED'],
};

const OPEN_STATUSES = ['STAGING', 'DRAFT', 'AWAITING_FUNDS', 'AWAITING_SIGNATURES', 'AWAITING_DISBURSEMENT'];
const CLOSED_STATUSES = ['VOIDED', 'COMPLETED', 'CLOSED'];

export default function HomeScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('All Transactions');
  const [searchText, setSearchText] = useState('');
  const [expandedActivity, setExpandedActivity] = useState('1');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // fetch from backend.. also re-fetches when screen gets focus
  const fetchTransactions = useCallback(async () => {
    try {
      const data = await getTransactions();
      setTransactions(data.data || []);
    } catch (e) {
      console.error('Failed to fetch transactions:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchTransactions();
    });
    return unsubscribe;
  }, [navigation, fetchTransactions]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTransactions();
  };

  // compute stats from transaction list for the cards at the top
  const stats = {
    all: transactions.length,
    actionRequired: transactions.filter(t => t.status === 'AWAITING_SIGNATURES' || t.status === 'AWAITING_FUNDS').length,
    open: transactions.filter(t => OPEN_STATUSES.includes(t.status)).length,
    closed: transactions.filter(t => CLOSED_STATUSES.includes(t.status)).length,
  };

  const filteredTransactions = transactions.filter((t) => {
    const statusFilter = STATUS_MAP[activeTab];
    if (statusFilter && !statusFilter.includes(t.status)) return false;
    if (searchText) {
      const search = searchText.toLowerCase();
      return (
        (t.description || '').toLowerCase().includes(search) ||
        (t.type || '').toLowerCase().includes(search)
      );
    }
    return true;
  });

  const formatAmount = (amount, currency) => {
    const sym = currency === 'NGN' ? '₦' : currency === 'XOF' ? 'XOF ' : '$';
    return sym + (amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${days[d.getDay()]}. ${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  };

  const formatClosingDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const h = d.getHours();
    const m = d.getMinutes();
    const ampm = h >= 12 ? 'PM' : 'AM';
    return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()} ${h % 12 || 12}:${m.toString().padStart(2, '0')} ${ampm}`;
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const h = d.getHours();
    const m = d.getMinutes();
    const ampm = h >= 12 ? 'PM' : 'AM';
    return `${h % 12 || 12}:${m.toString().padStart(2, '0')} ${ampm}`;
  };

  const getStatusLabel = (status) => {
    const map = {
      STAGING: 'Staging',
      DRAFT: 'Draft',
      AWAITING_SIGNATURES: 'Awaiting Signatures',
      AWAITING_FUNDS: 'Awaiting Funds',
      AWAITING_DISBURSEMENT: 'Awaiting Disbursement',
      VOIDED: 'Voided',
      COMPLETED: 'Completed',
      CLOSED: 'Closed',
    };
    return map[status] || status;
  };

  const getStatusColor = (status) => {
    if (status === 'VOIDED') return Colors.error;
    if (status === 'COMPLETED' || status === 'CLOSED') return Colors.success;
    return Colors.pending;
  };

  const getDaysLeft = (closingDate) => {
    if (!closingDate) return null;
    const now = new Date();
    const close = new Date(closingDate);
    const diff = Math.ceil((close - now) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const formatType = (type) => {
    if (!type) return '';
    return type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  const renderTransactionCard = (item) => {
    const daysLeft = getDaysLeft(item.closing_date);
    const counterpartyName = `${item.counter_party_first_name} ${item.counter_party_last_name}`;
    const extraCount = (item.number_of_counterparties || 1) - 1;

    return (
      <View key={item.id}>
        <TouchableOpacity
          style={styles.transactionCard}
          onPress={() => navigation.navigate('TransactionDetail', { transactionId: item.id })}
        >
          <View style={styles.transactionRow}>
            {/* Left column */}
            <View style={styles.transactionLeft}>
              <Text style={styles.transactionType}>{formatType(item.type)}</Text>
              <Text style={styles.transactionDesc}>{item.description}</Text>
              <Text style={styles.transactionAmount}>{formatAmount(item.amount, item.currency)}</Text>
              <Text style={styles.transactionMeta}>Role: {item.role ? item.role.charAt(0).toUpperCase() + item.role.slice(1) : ''}</Text>
              <Text style={styles.transactionMeta}>
                {counterpartyName}{extraCount > 0 ? ` + ${extraCount} more` : ''}
              </Text>
              <Text style={styles.transactionMeta}>
                Closing: {formatClosingDate(item.closing_date)}{daysLeft !== null ? ` (${daysLeft} days)` : ''}
              </Text>
            </View>
            {/* Right column */}
            <View style={styles.transactionRight}>
              <View>
                <Text style={styles.dateText}>{formatDate(item.created_at)}</Text>
                <Text style={styles.timeText}>{formatTime(item.created_at)}</Text>
              </View>
              <Text style={[styles.statusBadge, { color: getStatusColor(item.status) }]}>
                {getStatusLabel(item.status)}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
        <View style={styles.transactionDivider} />
      </View>
    );
  };

  // activity log.. this still uses mock data for now, havent connected it to backend yet
  const renderActivityItem = (item) => {
    const isExpanded = expandedActivity === item.id;
    return (
      <View key={item.id}>
        <TouchableOpacity
          style={styles.activityRow}
          onPress={() => setExpandedActivity(isExpanded ? null : item.id)}
        >
          <Text style={styles.activityDate}>{item.date}</Text>
          <Text style={styles.activityText}>{item.activity}</Text>
          <Ionicons
            name={isExpanded ? 'chevron-down' : 'chevron-forward'}
            size={16}
            color={Colors.gray}
          />
        </TouchableOpacity>
        {isExpanded && item.device && (
          <View style={styles.activityDetails}>
            <View style={styles.activityDetailRow}>
              <Text style={styles.activityDetailLabel}>Device:</Text>
              <Text style={styles.activityDetailValue}>{item.device}</Text>
            </View>
            <View style={styles.activityDetailRow}>
              <Text style={styles.activityDetailLabel}>Browser:</Text>
              <Text style={styles.activityDetailValue}>{item.browser}</Text>
            </View>
            <View style={styles.activityDetailRow}>
              <Text style={styles.activityDetailLabel}>IP Address:</Text>
              <Text style={styles.activityDetailValue}>{item.ip}</Text>
            </View>
          </View>
        )}
        <View style={styles.activityDivider} />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={22} color={Colors.white} />
            </View>
            <Text style={styles.greeting} numberOfLines={1}>Hello, {userData.name}!</Text>
          </View>
          <View style={styles.logoContainer}>
            <LucidLogo size={20} />
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.body}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
        }
      >
        {/* Stats Cards */}
        <View style={styles.statsSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.statsContainer}
          >
            {statsData.map((item) => (
              <View key={item.id} style={styles.statCard}>
                <View style={styles.statIconArea}>
                  {item.icon === 'transfer' && <TransferIcon size={35} color={Colors.primary} />}
                  {item.icon === 'user-time' && <UserTimeIcon size={35} color={Colors.primary} />}
                  {item.icon === 'unlock' && <UnlockIcon size={35} color={Colors.primary} />}
                  {item.icon === 'lock' && <LockIcon size={35} color={Colors.primary} />}
                </View>
                <View style={styles.statTextArea}>
                  <Text style={styles.statCount}>{stats[item.countKey] || 0}</Text>
                  <Text style={styles.statLabel}>{item.label}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* My Transactions */}
        <View style={styles.section}>
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>My Transactions</Text>

            {/* Search row */}
            <View style={styles.searchRow}>
              <View style={styles.searchBar}>
                <Ionicons name="search" size={16} color={Colors.grayMedium} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search"
                  placeholderTextColor={Colors.grayMedium}
                  value={searchText}
                  onChangeText={setSearchText}
                />
                {searchText ? (
                  <TouchableOpacity onPress={() => setSearchText('')}>
                    <Text style={styles.clearText}>x</Text>
                  </TouchableOpacity>
                ) : null}
                <TouchableOpacity style={styles.filterBtn}>
                  <Ionicons name="filter" size={24} color={Colors.grayMedium} />
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={styles.newBtn}
                onPress={() => navigation.navigate('NewTransaction')}
              >
                <Text style={styles.newBtnText}>New +</Text>
              </TouchableOpacity>
            </View>

            {/* Tabs */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.tabsContainer}
            >
              {TABS.map((tab) => (
                <TouchableOpacity
                  key={tab}
                  style={styles.tab}
                  onPress={() => setActiveTab(tab)}
                >
                  <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                    {tab}
                  </Text>
                  {activeTab === tab && <View style={styles.tabUnderline} />}
                </TouchableOpacity>
              ))}
            </ScrollView>
            <View style={styles.tabDivider} />

            {/* Transaction List */}
            {loading ? (
              <ActivityIndicator size="large" color={Colors.primary} style={{ marginVertical: 40 }} />
            ) : filteredTransactions.length === 0 ? (
              <Text style={styles.emptyText}>No transactions found</Text>
            ) : (
              filteredTransactions.map(renderTransactionCard)
            )}
          </View>
        </View>

        {/* Activity Log */}
        <View style={styles.section}>
          <View style={styles.sectionCard}>
            <Text style={styles.activityTitle}>Activity Log</Text>
            <Text style={styles.suspiciousText}>
              Notice anything suspicious?{' '}
              <Text style={styles.linkText}>Change your password</Text>
            </Text>

            <View style={styles.activityTableHeader}>
              <Text style={styles.activityHeaderDate}>Date</Text>
              <Text style={styles.activityHeaderActivity}>Activity</Text>
            </View>
            <View style={styles.activityDivider} />

            {activityLog.map(renderActivityItem)}
          </View>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
  statsSection: {
    height: 130,
    justifyContent: 'center',
  },
  statsContainer: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    gap: 15,
  },
  statCard: {
    backgroundColor: Colors.white,
    borderRadius: 10,
    padding: 10,
    height: 110,
    width: 150,
    borderWidth: 1,
    borderColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statIconArea: {
    width: 35,
    height: 35,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statTextArea: {
    flex: 1,
    flexDirection: 'column',
    gap: 5,
    alignItems: 'center',
  },
  statCount: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.primary,
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '400',
    color: Colors.primary,
    textAlign: 'center',
    lineHeight: 18,
  },
  section: {
    paddingHorizontal: 11,
    marginTop: 10,
  },
  sectionCard: {
    backgroundColor: Colors.white,
    borderRadius: 10,
    padding: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 25,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.grayLight,
    marginBottom: 12,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.grayLight,
    paddingBottom: 8,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: Colors.black,
    paddingVertical: 0,
    fontFamily: 'Satoshi-Regular',
  },
  clearText: {
    fontSize: 16,
    color: Colors.gray,
    marginRight: 10,
  },
  filterBtn: {
    paddingLeft: 8,
  },
  newBtn: {
    backgroundColor: Colors.primary,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderRadius: 25,
    width: 80,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newBtnText: {
    color: Colors.white,
    fontWeight: '500',
    fontSize: 14,
  },
  tabsContainer: {
    marginBottom: 6,
  },
  tab: {
    paddingBottom: 8,
    marginRight: 14,
    alignItems: 'center',
  },
  tabUnderline: {
    width: 103,
    height: 3,
    backgroundColor: Colors.primary,
    marginTop: 4,
  },
  tabDivider: {
    height: 1,
    backgroundColor: Colors.grayLight,
    marginBottom: 6,
  },
  tabText: {
    fontSize: 14,
    color: Colors.grayMedium,
    fontWeight: '500',
  },
  tabTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  transactionCard: {
    paddingVertical: 14,
  },
  transactionDivider: {
    width: 380,
    height: 1,
    backgroundColor: Colors.grayLight,
    alignSelf: 'center',
  },
  transactionRow: {
    flexDirection: 'row',
  },
  transactionLeft: {
    width: 263,
  },
  transactionRight: {
    width: 113,
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  transactionType: {
    fontSize: 12,
    color: Colors.primary60,
    fontWeight: '400',
  },
  transactionDesc: {
    fontSize: 12,
    color: Colors.gray,
    fontWeight: '500',
    marginTop: 2,
    lineHeight: 18,
  },
  transactionAmount: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.gray,
    marginTop: 2,
    lineHeight: 18,
  },
  transactionMeta: {
    fontSize: 12,
    color: Colors.gray,
    fontWeight: '400',
    marginTop: 2,
    lineHeight: 16,
  },
  dateText: {
    fontSize: 12,
    color: Colors.gray,
    fontWeight: '400',
    textAlign: 'right',
  },
  timeText: {
    fontSize: 12,
    color: Colors.gray,
    fontWeight: '400',
    textAlign: 'right',
  },
  statusBadge: {
    fontSize: 12,
    fontWeight: '400',
    textAlign: 'right',
  },
  emptyText: {
    textAlign: 'center',
    color: Colors.grayMedium,
    fontSize: 14,
    marginVertical: 40,
  },
  activityTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 4,
  },
  suspiciousText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.black,
    marginBottom: 14,
  },
  linkText: {
    color: Colors.primary,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  activityTableHeader: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  activityHeaderDate: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.gray,
    width: 186,
  },
  activityHeaderActivity: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.gray,
    flex: 1,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 34,
  },
  activityDate: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.gray,
    width: 186,
  },
  activityDivider: {
    width: 387,
    height: 1,
    backgroundColor: Colors.grayLight,
    alignSelf: 'center',
  },
  activityText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.gray,
    flex: 1,
  },
  activityDetails: {
    paddingLeft: 28,
    paddingBottom: 14,
  },
  activityDetailRow: {
    flexDirection: 'row',
    marginBottom: 7,
  },
  activityDetailLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.gray,
    width: 70,
  },
  activityDetailValue: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.gray,
  },
});
