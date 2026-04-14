import React, { useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Header from '../../../components/Header';
import Text from '../../../components/StyledText';
import Colors from '../../../constants/colors';
import useTheme from '../../../hooks/useTheme';
import useUserStore from '../../../stores/userStore';
import TransactionCard from '../components/TransactionCard';
import TransactionStats from '../components/TransactionStats';
import useDashboardHomeViewModel from '../hooks/useDashboardHomeViewModel';
import { formatShortDate } from '../utils/formatters';
import {
  BankIcon,
  FeeCalculatorIcon,
  RaiseDisputeIcon,
  StarterGuideIcon,
  UseCasesIcon,
} from '../../../icons';

const FOOTER_LINKS = [
  'Terms of Use',
  'Trust & Safety',
  'Our Partners',
  'Contact Us',
];

const QUICK_ACTIONS = [
  { key: 'fee', label: 'Fee\nCalculator', icon: FeeCalculatorIcon },
  { key: 'payment', label: 'Payment\nMethods', icon: BankIcon },
  { key: 'use-cases', label: 'Use\nCases', icon: UseCasesIcon },
  { key: 'dispute', label: 'Raise a\nDispute', icon: RaiseDisputeIcon },
];

function ActivityPreviewItem({ item, expanded, onToggle, theme }) {
  const primaryTextColor = theme.isDark ? Colors.white : Colors.gray;
  const secondaryTextColor = theme.isDark ? Colors.white : Colors.gray;

  return (
    <View>
      <TouchableOpacity style={styles.activityRow} onPress={onToggle} activeOpacity={0.8}>
        <Text style={[styles.activityDate, { color: primaryTextColor }]}>
          {formatShortDate(item.created_at)}
        </Text>
        <Text style={[styles.activityText, { color: primaryTextColor }]} numberOfLines={1}>
          {item.event}
        </Text>
        <Ionicons
          name={expanded ? 'chevron-down' : 'chevron-forward'}
          size={14}
          color={theme.isDark ? Colors.white : Colors.gray}
        />
      </TouchableOpacity>
      {expanded && item.device ? (
        <View style={styles.activityDetails}>
          <Text style={[styles.activityDetailText, { color: secondaryTextColor }]}>
            Device: {item.device}
          </Text>
          <Text style={[styles.activityDetailText, { color: secondaryTextColor }]}>
            Browser: {item.browser || '-'}
          </Text>
          <Text style={[styles.activityDetailText, { color: secondaryTextColor }]}>
            IP Address: {item.ip || '-'}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

export default function DashboardHomeScreen() {
  const router = useRouter();
  const theme = useTheme();
  const isDark = theme.isDark;
  const userName = useUserStore((state) => state.name);
  const userAvatar = useUserStore((state) => state.avatar);
  const {
    isLoading,
    stats,
    recentTransactions,
    recentActivity,
    recentTransactionsQuery,
    recentActivityQuery,
  } = useDashboardHomeViewModel();
  const [expandedActivityId, setExpandedActivityId] = useState(null);
  const [activityInteracted, setActivityInteracted] = useState(false);
  const sectionTitleColor = isDark ? Colors.white : Colors.primary;
  const bodyTextColor = isDark ? Colors.white : Colors.gray;
  const primaryCardBackground = isDark ? theme.cardBg : Colors.white;
  const elevatedPurpleCard = isDark ? 'rgba(91, 95, 199, 0.5)' : Colors.primary;
  const footerBackground = isDark ? 'rgba(91, 95, 199, 0.5)' : Colors.primary;
  const cardDividerColor = isDark ? theme.divider : Colors.primary10;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header name={userName || 'there'} avatarUri={userAvatar} />
      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.bodyContent}
        showsVerticalScrollIndicator={false}
      >
        <TransactionStats stats={stats} />

        <View style={[styles.section, styles.recentTransactionsSection]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: sectionTitleColor }]}>Recent Transactions</Text>
            <TouchableOpacity
              style={[styles.newTransactionButton, { backgroundColor: elevatedPurpleCard }]}
              activeOpacity={0.85}
              onPress={() => router.push('/new-transaction')}
            >
              <Text style={styles.newTransactionButtonText}>+ New Transaction</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.primaryCard, { backgroundColor: primaryCardBackground }]}>
            {recentTransactionsQuery.isLoading ? (
              <ActivityIndicator size="large" color={Colors.primary} style={styles.loader} />
            ) : recentTransactions.length > 0 ? (
              recentTransactions.map((item) => (
                <TransactionCard
                  key={item.id}
                  item={item}
                  useLightText={isDark}
                  onPress={() => router.push(`/transaction/${item.id}`)}
                />
              ))
            ) : (
              <Text style={[styles.emptyText, { color: bodyTextColor }]}>
                No transactions found
              </Text>
            )}
          </View>
          <TouchableOpacity
            style={styles.seeAllButton}
            activeOpacity={0.8}
            onPress={() => router.push('/transactions')}
          >
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.quickActionsRow}>
            {QUICK_ACTIONS.map((action) => {
              const IconComponent = action.icon;

              return (
                <TouchableOpacity
                  key={action.key}
                  style={[styles.quickActionCard, { backgroundColor: elevatedPurpleCard }]}
                  activeOpacity={0.85}
                >
                  <IconComponent />
                  <Text style={[styles.quickActionText, { color: Colors.white }]}>
                    {action.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: sectionTitleColor }]}>Recent Activity</Text>
          </View>
          <Text style={[styles.noticeText, { color: bodyTextColor }]}>
            Notice anything suspicious?{' '}
            <Text style={styles.noticeLink} onPress={() => router.push('/change-password')}>
              Change your password
            </Text>
          </Text>

          <View style={[styles.primaryCard, styles.activityCard, { backgroundColor: primaryCardBackground }]}>
            <View style={styles.activityHeaderRow}>
              <Text style={[styles.activityHeaderLabel, { color: bodyTextColor }]}>Date</Text>
              <Text style={[styles.activityHeaderLabel, styles.activityHeaderRight, { color: bodyTextColor }]}>
                Activity
              </Text>
            </View>
            <View style={[styles.divider, { backgroundColor: cardDividerColor }]} />

            {recentActivityQuery.isLoading ? (
              <ActivityIndicator size="large" color={Colors.primary} style={styles.loader} />
            ) : recentActivity.length > 0 ? (
              recentActivity.map((item, index) => (
                <View key={item.id || `${item.created_at}-${index}`}>
                  <ActivityPreviewItem
                    item={item}
                    expanded={
                      expandedActivityId === item.id ||
                      (!activityInteracted && expandedActivityId === null && index === 0)
                    }
                    onToggle={() => {
                      setActivityInteracted(true);
                      setExpandedActivityId((current) => (current === item.id ? null : item.id));
                    }}
                    theme={theme}
                  />
                  {index < recentActivity.length - 1 ? (
                    <View style={[styles.divider, { backgroundColor: cardDividerColor }]} />
                  ) : null}
                </View>
              ))
            ) : (
              <Text style={[styles.emptyText, { color: bodyTextColor }]}>
                No activity found
              </Text>
            )}
          </View>
          <TouchableOpacity
            style={styles.seeAllButton}
            activeOpacity={0.8}
            onPress={() => router.push('/activity-log')}
          >
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.exploreCard, { backgroundColor: elevatedPurpleCard }]}
            activeOpacity={0.85}
            onPress={() => Linking.openURL('http://wizerconsulting.com:9025/en/login')}
          >
            <Text style={[styles.exploreSectionTitle, { color: Colors.white }]}>Explore Lucid</Text>
            <View style={styles.exploreContentRow}>
              <View style={styles.exploreIconWrap}>
                <StarterGuideIcon width={70} height={70} color={Colors.accent} />
              </View>
              <View style={styles.exploreTextWrap}>
                <Text style={[styles.exploreTitle, { color: Colors.white }]}>Starter Guide</Text>
                <Text style={[styles.exploreSubtitle, { color: Colors.white }]}>
                  Watch our quick guide for help with basic questions on the powerful features of Lucid.
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        <View style={[styles.footer, { backgroundColor: footerBackground }]}>
          <View style={styles.footerLinksRow}>
            {FOOTER_LINKS.map((item) => (
              <Text key={item} style={styles.footerLink}>
                {item}
              </Text>
            ))}
          </View>
          <Text style={styles.footerCopyright}>Copyright © 2026 Lucid. All rights reserved</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  body: {
    flex: 1,
  },
  bodyContent: {
    paddingBottom: 0,
  },
  section: {
    paddingHorizontal: 11,
    marginTop: 22,
  },
  recentTransactionsSection: {
    marginTop: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.black,
  },
  primaryCard: {
    borderRadius: 10,
    paddingHorizontal: 11,
    paddingTop: 8,
    paddingBottom: 8,
  },
  newTransactionButton: {
    backgroundColor: 'rgba(91, 95, 199, 0.5)',
    borderRadius: 5,
    paddingHorizontal: 10,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newTransactionButtonText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: '500',
  },
  seeAllButton: {
    alignSelf: 'flex-end',
    paddingTop: 8,
    paddingRight: 4,
  },
  seeAllText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  loader: {
    paddingVertical: 24,
  },
  emptyText: {
    fontSize: 12,
    textAlign: 'center',
    paddingVertical: 24,
  },
  exploreCard: {
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 18,
    backgroundColor: 'rgba(91, 95, 199, 0.5)',
  },
  exploreSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 20,
  },
  exploreContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 36,
  },
  exploreIconWrap: {
    width: 48,
    height: 48,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  exploreTextWrap: {
    flex: 1,
  },
  exploreTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  exploreSubtitle: {
    fontSize: 12,
    lineHeight: 17,
  },
  activityCard: {
    paddingTop: 10,
  },
  noticeText: {
    fontSize: 11,
    marginBottom: 10,
  },
  noticeLink: {
    color: Colors.primary,
    textDecorationLine: 'underline',
  },
  activityHeaderRow: {
    flexDirection: 'row',
    paddingBottom: 8,
  },
  activityHeaderLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  activityHeaderRight: {
    marginLeft: 'auto',
    width: '42%',
    textAlign: 'left',
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  activityDate: {
    width: '42%',
    fontSize: 11,
  },
  activityText: {
    flex: 1,
    fontSize: 11,
    marginRight: 8,
  },
  activityDetails: {
    paddingBottom: 10,
  },
  activityDetailText: {
    fontSize: 11,
    marginTop: 2,
  },
  divider: {
    height: 1,
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  quickActionCard: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    minHeight: 60,
    backgroundColor: 'rgba(91, 95, 199, 0.5)',
  },
  quickActionText: {
    fontSize: 10,
    fontWeight: '500',
    textAlign: 'left',
    lineHeight: 12,
  },
  footer: {
    marginTop: 40,
    backgroundColor: 'rgba(91, 95, 199, 0.5)',
    marginHorizontal: 0,
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 32,
  },
  footerLinksRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  footerLink: {
    color: Colors.white,
    fontSize: 10,
    textDecorationLine: 'underline',
  },
  footerCopyright: {
    color: Colors.white,
    fontSize: 10,
    textAlign: 'center',
    marginTop: 28,
  },
});
