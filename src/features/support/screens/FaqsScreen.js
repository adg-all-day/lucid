import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Text from '../../../components/StyledText';
import Colors from '../../../constants/colors';
import useTheme from '../../../hooks/useTheme';
import faqs from '../data/faqs.json';

export default function FaqsScreen() {
  const router = useRouter();
  const theme = useTheme();
  const isDark = theme.isDark;
  const [expandedKeys, setExpandedKeys] = useState(() => new Set());

  const pageText = isDark ? Colors.white : Colors.gray;
  const sectionTitle = isDark ? Colors.white : Colors.primary;
  const qaText = isDark ? Colors.white : Colors.black;
  const cardBg = isDark ? theme.cardBg : 'rgba(91, 95, 199, 0.08)';
  const divider = isDark ? Colors.white : 'rgba(0,0,0,0.08)';
  const chevronColor = isDark ? Colors.white : Colors.grayMedium;
  const cardBorder = isDark ? 'transparent' : 'rgba(91, 95, 199, 0.18)';

  const isExpanded = useCallback(
    (key) => expandedKeys.has(key),
    [expandedKeys],
  );

  const toggleExpanded = useCallback((key) => {
    setExpandedKeys((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.headerBg }]}>
        <View style={styles.headerContent}>
          <View style={styles.headerSide}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back-circle-outline" size={28} color={Colors.white} />
            </TouchableOpacity>
          </View>
          <Text style={styles.headerTitle}>Frequently Asked Questions</Text>
          <View style={styles.headerSide} />
        </View>
      </View>

      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.bodyContent}
        showsVerticalScrollIndicator={false}
      >
        {faqs.map((section, sectionIndex) => (
          <View key={`${section.title}-${sectionIndex}`} style={styles.sectionBlock}>
            <Text style={[styles.sectionTitleOutside, { color: sectionTitle }]}>
              {section.title}
            </Text>

            <View style={[styles.card, { backgroundColor: cardBg, borderColor: cardBorder }]}>
              {section.items.map((item, index) => {
                const key = `${sectionIndex}:${index}`;
                const expanded = isExpanded(key);

                return (
                  <View key={`${section.title}-${index}`}>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      style={styles.questionRow}
                      onPress={() => toggleExpanded(key)}
                    >
                      <Text style={[styles.question, { color: qaText }]}>{item.question}</Text>
                      <Ionicons
                        name={expanded ? 'chevron-up-circle-outline' : 'chevron-down-circle-outline'}
                        size={20}
                        color={chevronColor}
                      />
                    </TouchableOpacity>

                    {expanded && item.answer ? (
                      <Text style={[styles.answer, { color: qaText }]}>{item.answer}</Text>
                    ) : null}

                    <View style={[styles.divider, { backgroundColor: divider }]} />
                  </View>
                );
              })}
            </View>
          </View>
        ))}

        <Text style={[styles.footerNote, { color: pageText }]}>
          If you need more help, contact support.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 38,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#FFFFFF',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  headerSide: {
    width: 40,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  backButton: {
    width: 28,
    height: 28,
  },
  headerTitle: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 18,
  },
  body: {
    flex: 1,
  },
  bodyContent: {
    paddingHorizontal: 11,
    paddingTop: 14,
    paddingBottom: 30,
  },
  sectionBlock: {
    marginBottom: 16,
  },
  sectionTitleOutside: {
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24,
    marginLeft: 2,
    marginBottom: 8,
  },
  card: {
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingTop: 16,
    paddingBottom: 16,
    borderWidth: 1,
  },
  questionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 14,
  },
  question: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 19,
    flex: 1,
  },
  answer: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 21,
    marginTop: 8,
  },
  divider: {
    height: 1,
    marginTop: 14,
  },
  footerNote: {
    marginTop: 4,
    fontSize: 12,
    textAlign: 'center',
  },
});
