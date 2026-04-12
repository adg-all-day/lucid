import React, { useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Text from '../../../components/StyledText';
import Colors from '../../../constants/colors';
import useTheme from '../../../hooks/useTheme';
import { TimePastIcon } from '../../../icons';
import useTransactionDetailViewModel from '../hooks/useTransactionDetailViewModel';
import { formatActionLabel, formatDate } from '../utils/formatters';

const FAQ_ITEMS = [
  'How long does the escrow process take?',
  'How does Lucid protect me?',
];
const SCROLLBAR_TOP_OFFSET = 6;
const SCROLLBAR_BOTTOM_OFFSET = 18;

export default function TransactionHistoryScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const theme = useTheme();
  const isDark = theme.isDark;
  const { historyQuery } = useTransactionDetailViewModel(id);
  const history = historyQuery.data ?? [];

  const [historyViewportHeight, setHistoryViewportHeight] = useState(0);
  const [historyContentHeight, setHistoryContentHeight] = useState(0);
  const historyScrollY = useRef(new Animated.Value(0)).current;

  const showHistoryScrollbar = historyContentHeight > historyViewportHeight;
  const maxHistoryScroll = Math.max(historyContentHeight - historyViewportHeight, 1);
  const historyRailHeight = Math.max(
    historyViewportHeight - SCROLLBAR_TOP_OFFSET - SCROLLBAR_BOTTOM_OFFSET,
    0,
  );
  const historyThumbHeight = showHistoryScrollbar
    ? Math.max((historyViewportHeight / historyContentHeight) * historyRailHeight * 0.22, 18)
    : 0;
  const historyThumbTravel = Math.max(historyRailHeight - historyThumbHeight, 0);

  const historyThumbTranslateY = useMemo(
    () =>
      historyScrollY.interpolate({
        inputRange: [0, maxHistoryScroll],
        outputRange: [0, historyThumbTravel],
        extrapolate: 'clamp',
      }),
    [historyScrollY, maxHistoryScroll, historyThumbTravel],
  );

  if (historyQuery.isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.background }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.75}>
          <Ionicons name="arrow-back" size={20} color={Colors.primary} />
        </TouchableOpacity>
        <View style={styles.headerTitleWrap}>
          <TimePastIcon size={18} color={Colors.primary} />
          <Text style={styles.headerTitle}>Transaction History</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={[styles.historyCard, { backgroundColor: theme.primary10 }]}>
          {history.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No history yet.</Text>
            </View>
          ) : (
            <View
              style={styles.historyListViewport}
              onLayout={(event) => setHistoryViewportHeight(event.nativeEvent.layout.height)}
            >
              <Animated.ScrollView
                nestedScrollEnabled
                showsVerticalScrollIndicator={false}
                onContentSizeChange={(_, height) => setHistoryContentHeight(height)}
                onScroll={Animated.event(
                  [{ nativeEvent: { contentOffset: { y: historyScrollY } } }],
                  { useNativeDriver: true },
                )}
                scrollEventThrottle={16}
                contentContainerStyle={styles.historyListContent}
              >
                {history.map((item, index) => (
                  <View key={item.id || `history-${index}`}>
                    <View style={styles.historyItem}>
                      <Text style={[styles.historyAction, { color: theme.text }]}>
                        {formatActionLabel(item.action) || item.action}
                      </Text>
                      <Text style={[styles.historyDate, { color: theme.textSecondary }]}>
                        {formatDate(item.created_at)}
                      </Text>
                    </View>
                    {index < history.length - 1 ? (
                      <View style={[styles.divider, { backgroundColor: Colors.grayLight }]} />
                    ) : null}
                  </View>
                ))}
              </Animated.ScrollView>

              {showHistoryScrollbar ? (
                <View pointerEvents="none" style={styles.historyScrollbarTrack}>
                  <Animated.View
                    style={[
                      styles.historyScrollbarThumb,
                      {
                        height: historyThumbHeight,
                        transform: [{ translateY: historyThumbTranslateY }],
                      },
                    ]}
                  />
                </View>
              ) : null}
            </View>
          )}
        </View>

        <View style={styles.faqHeader}>
          <Ionicons name="help-circle-outline" size={21} color={Colors.primary} />
          <Text style={styles.faqTitle}>Got Questions?</Text>
        </View>

        <View style={[styles.faqCard, { backgroundColor: theme.primary10 }]}>
          {FAQ_ITEMS.map((question, index) => (
            <View key={question}>
              <TouchableOpacity style={styles.faqRow} activeOpacity={0.8}>
                <Text style={[styles.faqText, { color: theme.text }]}>{question}</Text>
                <Ionicons name="chevron-forward" size={16} color={theme.text} />
              </TouchableOpacity>
              {index < FAQ_ITEMS.length - 1 ? (
                <View style={[styles.divider, { backgroundColor: Colors.grayLight }]} />
              ) : null}
            </View>
          ))}

          <TouchableOpacity activeOpacity={0.8} style={styles.moreFaqLink}>
            <Text style={styles.moreFaqText}>More Frequently Asked Questions</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    height: 92,
    paddingTop: 42,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
  headerSpacer: {
    width: 28,
  },
  body: {
    paddingHorizontal: 12,
    paddingTop: 4,
    paddingBottom: 24,
  },
  historyCard: {
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 8,
    maxHeight: 520,
  },
  historyListViewport: {
    maxHeight: 480,
    position: 'relative',
  },
  historyListContent: {
    paddingRight: 10,
  },
  historyItem: {
    paddingVertical: 10,
  },
  historyAction: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 17,
  },
  historyDate: {
    fontSize: 10,
    fontWeight: '400',
    marginTop: 4,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
  historyScrollbarTrack: {
    position: 'absolute',
    top: SCROLLBAR_TOP_OFFSET,
    right: -5,
    bottom: SCROLLBAR_BOTTOM_OFFSET,
    width: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(213, 213, 213, 0.65)',
  },
  historyScrollbarThumb: {
    width: 4,
    borderRadius: 999,
    backgroundColor: '#BDBDBD',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 28,
  },
  emptyText: {
    fontSize: 13,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 26,
    marginBottom: 10,
  },
  faqTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
  faqCard: {
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingTop: 6,
    paddingBottom: 10,
  },
  faqRow: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  faqText: {
    fontSize: 12,
    fontWeight: '400',
    flex: 1,
    paddingRight: 12,
  },
  moreFaqLink: {
    paddingTop: 10,
    paddingBottom: 2,
  },
  moreFaqText: {
    fontSize: 11,
    fontWeight: '400',
    color: Colors.primary,
  },
});
