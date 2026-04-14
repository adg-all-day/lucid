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
import useTransactionDetailViewModel from '../hooks/useTransactionDetailViewModel';
import { formatActionLabel, formatDate } from '../utils/formatters';

const SCROLLBAR_TOP_OFFSET = 6;
const SCROLLBAR_BOTTOM_OFFSET = 18;

export default function TransactionHistoryScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const theme = useTheme();
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
        <ActivityIndicator size="large" color={Colors.white} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.background }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.75}>
          <Ionicons name="arrow-back" size={16} color={Colors.white} />
        </TouchableOpacity>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>Transaction History</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.historyCard, { backgroundColor: theme.primary10 }]}>
          {history.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: Colors.white }]}>No history yet.</Text>
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
                      <Text style={[styles.historyAction, { color: Colors.white }]}>
                        {formatActionLabel(item.action) || item.action}
                      </Text>
                      <Text style={[styles.historyDate, { color: Colors.white }]}>
                        {formatDate(item.created_at)}
                      </Text>
                    </View>
                    {index < history.length - 1 ? (
                      <View style={[styles.divider, { backgroundColor: 'rgba(255,255,255,0.2)' }]} />
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
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.white,
  },
  headerSpacer: {
    width: 28,
  },
  body: {
    flexGrow: 1,
    paddingHorizontal: 12,
    paddingTop: 4,
    paddingBottom: 24,
  },
  historyCard: {
    flex: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  historyListViewport: {
    flex: 1,
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
});
