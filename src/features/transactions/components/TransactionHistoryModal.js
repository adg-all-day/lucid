import React from 'react';
import {
  View,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Text from '../../../components/StyledText';
import Colors from '../../../constants/colors';
import useTheme from '../../../hooks/useTheme';
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
}) {
  const theme = useTheme();
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: theme.modalBg }]}>
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
            <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
              {/* History card */}
              <View style={[styles.historyCard, { backgroundColor: theme.primary10 }]}>
                {history.length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No history yet.</Text>
                  </View>
                ) : (
                  <ScrollView nestedScrollEnabled showsVerticalScrollIndicator>
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
                  </ScrollView>
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
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
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
