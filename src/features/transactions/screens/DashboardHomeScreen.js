import React, { useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import Header from '../../../components/Header';
import Text from '../../../components/StyledText';
import Colors from '../../../constants/colors';
import useTheme from '../../../hooks/useTheme';
import useUserStore from '../../../stores/userStore';
import useUiStore from '../../../stores/uiStore';
import TransactionCard from '../components/TransactionCard';
import TransactionStats from '../components/TransactionStats';
import useDashboardHomeViewModel from '../hooks/useDashboardHomeViewModel';
import {
  BankIcon,
  FeeCalculatorIcon,
  RaiseDisputeIcon,
  StarterGuideIcon,
  UseCasesIcon,
} from '../../../icons';

const FOOTER_LINKS = [
  'home.footer.termsOfUse',
  'home.footer.trustSafety',
  'home.footer.ourPartners',
  'home.footer.contactUs',
];

const QUICK_ACTIONS = [
  { key: 'fee', labelKey: 'home.quickActions.feeCalculator', icon: FeeCalculatorIcon },
  { key: 'payment', labelKey: 'home.quickActions.paymentMethods', icon: BankIcon },
  { key: 'use-cases', labelKey: 'home.quickActions.useCases', icon: UseCasesIcon },
  { key: 'dispute', labelKey: 'home.quickActions.raiseDispute', icon: RaiseDisputeIcon },
];

function formatActivityPreviewDate(dateStr) {
  if (!dateStr) return '';

  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return '';

  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  const hour = date.getHours();
  const minute = String(date.getMinutes()).padStart(2, '0');
  const ampm = hour >= 12 ? 'PM' : 'AM';

  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()} ${hour % 12 || 12}:${minute}${ampm}`;
}

function ActivityPreviewItem({ item, expanded, onToggle, theme, t }) {
  const primaryTextColor = theme.isDark ? Colors.white : Colors.gray;
  const secondaryTextColor = theme.isDark ? Colors.white : Colors.gray;

  return (
    <View>
      <TouchableOpacity style={styles.activityRow} onPress={onToggle} activeOpacity={0.8}>
        <Text style={[styles.activityDate, { color: primaryTextColor }]}>
          {formatActivityPreviewDate(item.created_at)}
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
      {expanded ? (
        <View style={styles.activityDetails}>
          <View style={styles.activityDetailRow}>
            <Text style={[styles.activityDetailLabel, { color: secondaryTextColor }]}>{t('activity.device')}</Text>
            <Text style={[styles.activityDetailValue, { color: secondaryTextColor }]}>{item.device || '-'}</Text>
          </View>
          <View style={styles.activityDetailRow}>
            <Text style={[styles.activityDetailLabel, { color: secondaryTextColor }]}>{t('activity.browser')}</Text>
            <Text style={[styles.activityDetailValue, { color: secondaryTextColor }]}>{item.browser || '-'}</Text>
          </View>
          <View style={styles.activityDetailRow}>
            <Text style={[styles.activityDetailLabel, { color: secondaryTextColor }]}>{t('activity.ipAddress')}</Text>
            <Text style={[styles.activityDetailValue, { color: secondaryTextColor }]}>{item.ip || '-'}</Text>
          </View>
        </View>
      ) : null}
    </View>
  );
}

export default function DashboardHomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const theme = useTheme();
  const isDark = theme.isDark;
  const userName = useUserStore((state) => state.name);
  const userAvatar = useUserStore((state) => state.avatar);
  const setActiveTab = useUiStore((state) => state.setActiveTab);
  const {
    isLoading,
    isRefreshing,
    refetchAll,
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
  const recentTransactionsCardBackground = isDark ? theme.cardBg : 'rgba(91, 95, 199, 0.1)';
  const elevatedPurpleCard = isDark ? 'rgba(91, 95, 199, 0.5)' : Colors.primary;
  const footerBackground = isDark ? 'rgba(91, 95, 199, 0.5)' : Colors.primary;
  const cardDividerColor = isDark ? theme.divider : Colors.primary10;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header name={(userName || '').trim().split(/\s+/)[0] || 'there'} avatarUri={userAvatar} />
      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.bodyContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refetchAll}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
      >
        <TransactionStats
          stats={stats}
          onSelectTab={(tab) => {
            setActiveTab(tab);
            router.push('/transactions');
          }}
        />

        <View style={[styles.section, styles.recentTransactionsSection]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: sectionTitleColor }]}>{t('home.recentTransactions')}</Text>
            <TouchableOpacity
              style={[styles.newTransactionButton, { backgroundColor: elevatedPurpleCard }]}
              activeOpacity={0.85}
              onPress={() => router.push('/new-transaction')}
            >
              <Text style={styles.newTransactionButtonText}>{t('home.newTransaction')}</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.primaryCard, { backgroundColor: recentTransactionsCardBackground }]}>
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
                {t('home.noTransactions', { defaultValue: 'No transactions found' })}
              </Text>
            )}
          </View>
          <TouchableOpacity
            style={styles.seeAllButton}
            activeOpacity={0.8}
            onPress={() => router.push('/transactions')}
          >
            <Text style={styles.seeAllText}>{t('home.seeAll')}</Text>
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
                    {t(action.labelKey)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: sectionTitleColor }]}>{t('home.recentActivity')}</Text>
          </View>
          <Text style={[styles.noticeText, { color: bodyTextColor }]}>
            {t('activity.notice')}{' '}
            <Text style={styles.noticeLink} onPress={() => router.push('/change-password')}>
              {t('activity.changePassword')}
            </Text>
          </Text>

          <View style={[styles.primaryCard, styles.activityCard, { backgroundColor: primaryCardBackground }]}>
            <View style={styles.activityHeaderRow}>
              <Text style={[styles.activityHeaderLabel, { color: bodyTextColor }]}>{t('activity.date')}</Text>
              <Text style={[styles.activityHeaderLabel, styles.activityHeaderRight, { color: bodyTextColor }]}>
                {t('activity.activity')}
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
                    t={t}
                  />
                  {index < recentActivity.length - 1 ? (
                    <View style={[styles.divider, { backgroundColor: cardDividerColor }]} />
                  ) : null}
                </View>
              ))
            ) : (
              <Text style={[styles.emptyText, { color: bodyTextColor }]}>
                {t('activity.empty')}
              </Text>
            )}
          </View>
          <TouchableOpacity
            style={styles.seeAllButton}
            activeOpacity={0.8}
            onPress={() => router.push('/activity-log')}
          >
            <Text style={styles.seeAllText}>{t('home.seeAll')}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.exploreCard, { backgroundColor: elevatedPurpleCard }]}
            activeOpacity={0.85}
            onPress={() => Linking.openURL('http://wizerconsulting.com:9025/en/login')}
          >
            <Text style={[styles.exploreSectionTitle, { color: Colors.white }]}>{t('home.exploreLucid')}</Text>
            <View style={styles.exploreContentRow}>
              <View style={styles.exploreIconWrap}>
                <StarterGuideIcon width={70} height={70} color={Colors.accent} />
              </View>
              <View style={styles.exploreTextWrap}>
                <Text style={[styles.exploreTitle, { color: Colors.white }]}>{t('home.starterGuide')}</Text>
                <Text style={[styles.exploreSubtitle, { color: Colors.white }]}>
                  {t('home.starterGuideDescription')}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        <View style={[styles.footer, { backgroundColor: footerBackground }]}>
          <View style={styles.footerLinksRow}>
            {FOOTER_LINKS.map((itemKey) => (
              <Text key={itemKey} style={styles.footerLink}>
                {t(itemKey)}
              </Text>
            ))}
          </View>
          <Text style={styles.footerCopyright}>{t('home.footer.copyright')}</Text>
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
    fontSize: 12,
  },
  activityText: {
    flex: 1,
    fontSize: 12,
    marginRight: 8,
  },
  activityDetails: {
    paddingLeft: 12,
    paddingRight: 12,
    paddingBottom: 10,
  },
  activityDetailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  activityDetailLabel: {
    width: 88,
    fontSize: 12,
  },
  activityDetailValue: {
    flex: 1,
    fontSize: 12,
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
