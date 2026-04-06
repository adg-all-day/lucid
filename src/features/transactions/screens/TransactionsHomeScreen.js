import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Text from '../../../components/StyledText';
import Header from '../../../components/Header';
import Colors from '../../../constants/colors';
import { SearchIcon } from '../../../icons';
import useUserStore from '../../../stores/userStore';
import { useActivityLog } from '../../../api/queries/activity';
import { useTransactions } from '../../../api/queries/transactions';
import TransactionStats from '../components/TransactionStats';
import TransactionCard from '../components/TransactionCard';
import ActivityLog from '../components/ActivityLog';
import useTransactionFilters from '../hooks/useTransactionFilters';
import { TABS, OPEN_STATUSES, CLOSED_STATUSES } from '../utils/constants';
import useUiStore from '../../../stores/uiStore';

export default function TransactionsHomeScreen() {
  const router = useRouter();
  const userName = useUserStore((state) => state.name);
  const userAvatar = useUserStore((state) => state.avatar);
  const activeTab = useUiStore((state) => state.activeTab);
  const searchText = useUiStore((state) => state.searchText);
  const setActiveTab = useUiStore((state) => state.setActiveTab);
  const setSearchText = useUiStore((state) => state.setSearchText);
  const [tabLayouts, setTabLayouts] = useState({});
  const underlineLeft = useRef(new Animated.Value(0)).current;
  const underlineWidth = useRef(new Animated.Value(0)).current;

  const transactionsQuery = useTransactions();
  const activityQuery = useActivityLog();

  const transactions = transactionsQuery.data ?? [];
  const filteredTransactions = useTransactionFilters(
    transactions,
    activeTab,
    searchText,
  );

  const stats = {
    all: transactions.length,
    actionRequired: transactions.filter(
      (item) =>
        item.status === 'AWAITING_SIGNATURES' ||
        item.status === 'AWAITING_FUNDS',
    ).length,
    open: transactions.filter((item) => OPEN_STATUSES.includes(item.status)).length,
    closed: transactions.filter((item) => CLOSED_STATUSES.includes(item.status)).length,
  };

  useEffect(() => {
    const activeLayout = tabLayouts[activeTab];
    if (!activeLayout) return;

    Animated.parallel([
      Animated.spring(underlineLeft, {
        toValue: activeLayout.x,
        useNativeDriver: false,
        tension: 180,
        friction: 20,
      }),
      Animated.spring(underlineWidth, {
        toValue: activeLayout.width,
        useNativeDriver: false,
        tension: 180,
        friction: 20,
      }),
    ]).start();
  }, [activeTab, tabLayouts, underlineLeft, underlineWidth]);

  return (
    <View style={styles.container}>
      <Header
        name={userName || 'there'}
        avatarUri={userAvatar}
      />
      <ScrollView
        style={styles.body}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={transactionsQuery.isRefetching}
            onRefresh={() => transactionsQuery.refetch()}
            tintColor={Colors.primary}
          />
        }
      >
        <TransactionStats stats={stats} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Transactions</Text>
          <View style={styles.sectionCard}>

            <View style={styles.searchRow}>
              <View style={styles.searchBar}>
                <SearchIcon size={13} color={Colors.grayMedium} />
                <TextInput
                  style={styles.searchInput}
                  value={searchText}
                  onChangeText={setSearchText}
                  placeholder="Search"
                  placeholderTextColor={Colors.grayMedium}
                />
                {searchText ? (
                  <TouchableOpacity onPress={() => setSearchText('')}>
                    <Text style={styles.clearText}>x</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
              <TouchableOpacity style={styles.iconButton}>
                <Ionicons name="filter" size={22} color={Colors.grayMedium} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton}>
                <Ionicons name="swap-vertical" size={20} color={Colors.grayMedium} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.newBtn}
                onPress={() => router.push('/new-transaction')}
              >
                <Text style={styles.newBtnText}>New +</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.tabsWrap}>
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
                    onLayout={(event) => {
                      const { x, width } = event.nativeEvent.layout;
                      setTabLayouts((current) => {
                        const prev = current[tab];
                        if (prev && prev.x === x && prev.width === width) {
                          return current;
                        }
                        return {
                          ...current,
                          [tab]: { x, width },
                        };
                      });
                    }}
                  >
                    <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                      {tab}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <Animated.View
                pointerEvents="none"
                style={[
                  styles.tabUnderline,
                  {
                    left: underlineLeft,
                    width: underlineWidth,
                  },
                ]}
              />
            </View>
            <View style={styles.tabDivider} />

            {transactionsQuery.isLoading ? (
              <ActivityIndicator
                size="large"
                color={Colors.primary}
                style={styles.loading}
              />
            ) : filteredTransactions.length === 0 ? (
              <Text style={styles.emptyText}>No transactions found</Text>
            ) : (
              filteredTransactions.map((item) => (
                <TransactionCard
                  key={item.id}
                  item={item}
                  onPress={() => router.push(`/transaction/${item.id}`)}
                />
              ))
            )}
          </View>
        </View>

        <View style={styles.section}>
          <ActivityLog activityLog={activityQuery.data ?? []} />
        </View>

        <View style={styles.footerGap} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  body: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 11,
    marginTop: 8,
  },
  sectionCard: {
    backgroundColor: 'rgba(91, 95, 199, 0.05)',
    borderRadius: 10,
    paddingHorizontal: 11,
    paddingTop: 12,
    paddingBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.primary,
    marginBottom: 12,
    marginLeft: 10,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  searchBar: {
    width: 202,
    flexDirection: 'row',
    alignItems: 'center',
    height: 26,
    borderWidth: 0.5,
    borderColor: '#979797',
    borderRadius: 5,
    paddingHorizontal: 8,
    backgroundColor: Colors.white,
  },
  searchInput: {
    flex: 1,
    marginLeft: 6,
    fontSize: 12,
    color: Colors.black,
    paddingVertical: 0,
    fontFamily: 'Satoshi-Regular',
  },
  clearText: {
    fontSize: 12,
    color: Colors.gray,
    marginRight: 2,
  },
  iconButton: {
    width: 26,
    height: 26,
    borderWidth: 0.5,
    borderColor: '#979797',
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
  },
  newBtn: {
    backgroundColor: Colors.primary,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderRadius: 5,
    width: 65,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 'auto',
  },
  newBtnText: {
    color: Colors.white,
    fontWeight: '500',
    fontSize: 10,
  },
  tabsWrap: {
    position: 'relative',
    marginBottom: -2,
  },
  tabsContainer: {
    marginBottom: 0,
    paddingRight: 8,
    marginTop: 8,
  },
  tab: {
    paddingBottom: 12,
    marginRight: 14,
    alignItems: 'center',
  },
  tabUnderline: {
    height: 4,
    backgroundColor: '#5B5FC7',
    position: 'absolute',
    bottom: -1,
    borderRadius: 999,
    zIndex: 2,
  },
  tabDivider: {
    height: 1,
    backgroundColor: Colors.grayLight,
    marginTop: 0,
    marginBottom: 6,
  },
  tabText: {
    fontSize: 13,
    color: Colors.grayMedium,
    fontWeight: '500',
  },
  tabTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  loading: {
    marginVertical: 40,
  },
  emptyText: {
    textAlign: 'center',
    color: Colors.grayMedium,
    fontSize: 14,
    marginVertical: 40,
  },
  footerGap: {
    height: 30,
  },
});
