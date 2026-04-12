import React, { useState } from 'react';
import {
  ActivityIndicator,
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

const FOOTER_LINKS = [
  'Terms of Use',
  'Trust & Safety',
  'Our Partners',
  'Contact Us',
];

function ActivityPreviewItem({ item, expanded, onToggle, theme }) {
  return (
    <View>
      <TouchableOpacity style={styles.activityRow} onPress={onToggle} activeOpacity={0.8}>
        <Text style={[styles.activityDate, { color: theme.textSecondary }]}>
          {formatShortDate(item.created_at)}
        </Text>
        <Text style={[styles.activityText, { color: theme.textSecondary }]} numberOfLines={1}>
          {item.event}
        </Text>
        <Ionicons
          name={expanded ? 'chevron-down' : 'chevron-forward'}
          size={14}
          color={theme.textSecondary}
        />
      </TouchableOpacity>
      {expanded && item.device ? (
        <View style={styles.activityDetails}>
          <Text style={[styles.activityDetailText, { color: theme.textSecondary }]}>
            Device: {item.device}
          </Text>
          <Text style={[styles.activityDetailText, { color: theme.textSecondary }]}>
            Browser: {item.browser || '-'}
          </Text>
          <Text style={[styles.activityDetailText, { color: theme.textSecondary }]}>
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

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header name={userName || 'there'} avatarUri={userAvatar} />
      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.bodyContent}
        showsVerticalScrollIndicator={false}
      >
        <TransactionStats stats={stats} />

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Recent Transactions</Text>
            <TouchableOpacity
              style={styles.newTransactionButton}
              activeOpacity={0.85}
              onPress={() => router.push('/new-transaction')}
            >
              <Text style={styles.newTransactionButtonText}>+ New Transaction</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.primaryCard, { backgroundColor: theme.cardBg }]}>
            {recentTransactionsQuery.isLoading ? (
              <ActivityIndicator size="large" color={Colors.primary} style={styles.loader} />
            ) : recentTransactions.length > 0 ? (
              recentTransactions.map((item) => (
                <TransactionCard
                  key={item.id}
                  item={item}
                  onPress={() => router.push(`/transaction/${item.id}`)}
                />
              ))
            ) : (
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                No transactions found
              </Text>
            )}

            <TouchableOpacity
              style={styles.seeAllButton}
              activeOpacity={0.8}
              onPress={() => router.push('/transactions')}
            >
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Explore Lucid</Text>
          <TouchableOpacity
            style={[styles.exploreCard, { backgroundColor: theme.primary10 }]}
            activeOpacity={0.85}
            onPress={() => router.push('/help')}
          >
            <View style={styles.exploreIconWrap}>
              <Ionicons name="folder-open-outline" size={30} color={Colors.accent} />
            </View>
            <View style={styles.exploreTextWrap}>
              <Text style={[styles.exploreTitle, { color: theme.text }]}>Starter Guide</Text>
              <Text style={[styles.exploreSubtitle, { color: theme.textSecondary }]}>
                Watch our quick guide for help with basic questions on the powerful features of Lucid.
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Recent Activity</Text>
          </View>

          <View style={[styles.primaryCard, styles.activityCard, { backgroundColor: theme.cardBg }]}>
            <Text style={[styles.noticeText, { color: theme.textSecondary }]}>
              Notice anything suspicious?{' '}
              <Text style={styles.noticeLink} onPress={() => router.push('/change-password')}>
                Change your password
              </Text>
            </Text>

            <View style={styles.activityHeaderRow}>
              <Text style={[styles.activityHeaderLabel, { color: theme.textSecondary }]}>Date</Text>
              <Text style={[styles.activityHeaderLabel, styles.activityHeaderRight, { color: theme.textSecondary }]}>
                Activity
              </Text>
            </View>
            <View style={[styles.divider, { backgroundColor: theme.divider }]} />

            {recentActivityQuery.isLoading ? (
              <ActivityIndicator size="large" color={Colors.primary} style={styles.loader} />
            ) : recentActivity.length > 0 ? (
              recentActivity.map((item, index) => (
                <View key={item.id || `${item.created_at}-${index}`}>
                  <ActivityPreviewItem
                    item={item}
                    expanded={expandedActivityId === item.id || (expandedActivityId === null && index === 0)}
                    onToggle={() =>
                      setExpandedActivityId((current) => (current === item.id ? null : item.id))
                    }
                    theme={theme}
                  />
                  {index < recentActivity.length - 1 ? (
                    <View style={[styles.divider, { backgroundColor: theme.divider }]} />
                  ) : null}
                </View>
              ))
            ) : (
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                No activity found
              </Text>
            )}

            <TouchableOpacity
              style={styles.seeAllButton}
              activeOpacity={0.8}
              onPress={() => router.push('/activity-log')}
            >
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.quickActionsRow}>
            <TouchableOpacity style={[styles.quickActionCard, { backgroundColor: theme.cardBg }]} activeOpacity={0.85}>
              <Ionicons name="calculator-outline" size={18} color={Colors.accent} />
              <Text style={[styles.quickActionText, { color: theme.textSecondary }]}>Fee Calculator</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.quickActionCard, { backgroundColor: theme.cardBg }]} activeOpacity={0.85}>
              <Ionicons name="alert-circle-outline" size={18} color={Colors.accent} />
              <Text style={[styles.quickActionText, { color: theme.textSecondary }]}>Raise a Dispute</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.quickActionCard, { backgroundColor: theme.cardBg }]} activeOpacity={0.85}>
              <Ionicons name="card-outline" size={18} color={Colors.accent} />
              <Text style={[styles.quickActionText, { color: theme.textSecondary }]}>Payment Methods</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footer}>
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
    paddingBottom: 120,
  },
  section: {
    paddingHorizontal: 11,
    marginTop: 10,
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
    backgroundColor: Colors.primary,
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
    paddingBottom: 2,
  },
  seeAllText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '500',
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
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  exploreIconWrap: {
    width: 48,
    height: 48,
    borderWidth: 2,
    borderColor: Colors.accent,
    borderRadius: 8,
    alignItems: 'center',
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
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 62,
  },
  quickActionText: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 6,
  },
  footer: {
    marginTop: 18,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  footerLinksRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  footerLink: {
    color: Colors.grayMedium,
    fontSize: 10,
    textDecorationLine: 'underline',
  },
  footerCopyright: {
    color: Colors.grayMedium,
    fontSize: 10,
    textAlign: 'center',
    marginTop: 12,
  },
});
