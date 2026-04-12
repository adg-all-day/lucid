import React, { useMemo, useRef, useState } from 'react';
import {
  Animated,
  View,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Text from '../../../components/StyledText';
import Colors from '../../../constants/colors';
import useTheme from '../../../hooks/useTheme';
import ModalBlurBackdrop from '../../../components/ModalBlurBackdrop';
import { TimePastIcon } from '../../../icons';
import { formatDate, formatActionLabel } from '../utils/formatters';

const FAQ_ITEMS = [
  'How long does the escrow process take?',
  'How does Lucid protect me?',
];

export default function TransactionHistoryModal({
  visible,
  onClose,
  history,
  loading,
  blurTarget,
}) {
  const theme = useTheme();
  const containerBg = theme.isDark ? '#2B2B2B' : theme.modalBg;
  const [historyViewportHeight, setHistoryViewportHeight] = useState(0);
  const [historyContentHeight, setHistoryContentHeight] = useState(0);
  const historyScrollY = useRef(new Animated.Value(0)).current;
  const showHistoryScrollbar = historyContentHeight > historyViewportHeight;
  const maxHistoryScroll = Math.max(historyContentHeight - historyViewportHeight, 1);
  const historyThumbHeight = showHistoryScrollbar
    ? Math.max((historyViewportHeight / historyContentHeight) * historyViewportHeight * 0.5, 14)
    : 0;
  const historyThumbTravel = Math.max(historyViewportHeight - historyThumbHeight, 0);
  const historyThumbTranslateY = useMemo(
    () =>
      historyScrollY.interpolate({
        inputRange: [0, maxHistoryScroll],
        outputRange: [0, historyThumbTravel],
        extrapolate: 'clamp',
      }),
    [historyScrollY, maxHistoryScroll, historyThumbTravel],
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <ModalBlurBackdrop isDark={theme.isDark} blurTarget={blurTarget} />
        <View style={[styles.container, { backgroundColor: containerBg }]}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color={Colors.primary} />
            </TouchableOpacity>
            <View style={styles.titleRow}>
              <TimePastIcon size={21} color={Colors.primary} />
              <Text style={styles.title}>Transaction History</Text>
            </View>
            <View style={{ width: 24 }} />
          </View>

          {loading ? (
            <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40, marginBottom: 40 }} />
          ) : (
            <Animated.ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
              {/* History card */}
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
                        <View key={item.id || `h-${index}`}>
                          <View style={styles.historyItem}>
                            <Text style={[styles.action, { color: theme.text }]}>
                              {formatActionLabel(item.action) || item.action}
                            </Text>
                            <Text style={[styles.date, { color: theme.text }]}>{formatDate(item.created_at)}</Text>
                          </View>
                          {index < history.length - 1 && <View style={styles.divider} />}
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

              {/* Got Questions? */}
              <View style={styles.faqHeader}>
                <Ionicons name="help-circle-outline" size={22} color={Colors.primary} />
                <Text style={styles.faqTitle}>Got Questions?</Text>
              </View>

              <View style={[styles.card, { backgroundColor: theme.primary10 }]}>
                {FAQ_ITEMS.map((question, index) => (
                  <View key={index}>
                    <TouchableOpacity style={styles.faqRow}>
                      <Text style={[styles.faqText, { color: theme.text }]}>{question}</Text>
                      <Ionicons name="chevron-forward" size={16} color={theme.text} />
                    </TouchableOpacity>
                    <View style={styles.divider} />
                  </View>
                ))}

                <TouchableOpacity style={styles.moreFaqLink}>
                  <Text style={styles.moreFaqText}>More Frequently Asked Questions</Text>
                </TouchableOpacity>
              </View>

              <View style={{ height: 20 }} />
            </Animated.ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    overflow: 'hidden',
  },
  container: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    maxHeight: '90%',
    width: '100%',
    paddingBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingTop: 20,
    paddingBottom: 16,
  },
  backBtn: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
  },
  body: {
    paddingHorizontal: 20,
  },
  historyCard: {
    backgroundColor: Colors.primary10,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 4,
    maxHeight: 380,
  },
  historyListViewport: {
    maxHeight: 360,
    position: 'relative',
  },
  historyListContent: {
    paddingRight: 8,
  },
  historyScrollbarTrack: {
    position: 'absolute',
    top: 6,
    right: -14,
    bottom: 6,
    width: 3,
    borderRadius: 999,
    backgroundColor: 'rgba(0, 0, 0, 0.06)',
  },
  historyScrollbarThumb: {
    width: 3,
    borderRadius: 999,
    backgroundColor: '#979797',
  },
  card: {
    backgroundColor: Colors.primary10,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyText: {
    color: Colors.gray,
    fontSize: 14,
  },
  historyItem: {
    paddingVertical: 12,
  },
  action: {
    fontSize: 12,
    fontWeight: '400',
    color: '#212121',
    lineHeight: 16,
  },
  date: {
    fontSize: 10,
    fontWeight: '400',
    color: '#212121',
    lineHeight: 14,
    marginTop: 4,
  },
  divider: {
    height: 0.5,
    backgroundColor: '#D5D5D5',
  },

  // FAQ section
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 20,
    marginBottom: 10,
  },
  faqTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
  },
  faqRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  faqText: {
    fontSize: 12,
    fontWeight: '400',
    color: '#212121',
    flex: 1,
    marginRight: 8,
  },
  moreFaqLink: {
    marginTop: 10,
    paddingHorizontal: 4,
  },
  moreFaqText: {
    fontSize: 10,
    fontWeight: '400',
    color: Colors.primary,
  },
});
