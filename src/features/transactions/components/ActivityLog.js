// The activity log section from the bottom of the home screen.
// Self-contained -- manages its own expanded/collapsed state so the
// parent doesn't need to worry about it.

import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Text from '../../../components/StyledText';
import Colors from '../../../constants/colors';
import useTheme from '../../../hooks/useTheme';
import { formatShortDate } from '../utils/formatters';

export default function ActivityLog({ activityLog }) {
  const router = useRouter();
  const theme = useTheme();
  // Track which activity row is currently expanded (only one at a time)
  const [expandedActivity, setExpandedActivity] = useState(
    activityLog.length > 0 ? activityLog[0].id : null
  );

  const renderActivityItem = (item) => {
    const isExpanded = expandedActivity === item.id;

    return (
      <View key={item.id}>
        <TouchableOpacity
          style={styles.activityRow}
          onPress={() => setExpandedActivity(isExpanded ? null : item.id)}
        >
          <Text style={[styles.activityDate, { color: theme.textSecondary }]}>{formatShortDate(item.created_at)}</Text>
          <Text style={[styles.activityText, { color: theme.textSecondary }]}>{item.event}</Text>
          <Ionicons
            name={isExpanded ? 'chevron-down' : 'chevron-forward'}
            size={16}
            color={theme.textSecondary}
          />
        </TouchableOpacity>

        {/* Device/browser/IP details shown when expanded */}
        {isExpanded && item.device && (
          <View style={styles.activityDetails}>
            <View style={styles.activityDetailRow}>
              <Text style={[styles.activityDetailLabel, { color: theme.textSecondary }]}>Device:</Text>
              <Text style={[styles.activityDetailValue, { color: theme.textSecondary }]}>{item.device}</Text>
            </View>
            <View style={styles.activityDetailRow}>
              <Text style={[styles.activityDetailLabel, { color: theme.textSecondary }]}>Browser:</Text>
              <Text style={[styles.activityDetailValue, { color: theme.textSecondary }]}>{item.browser}</Text>
            </View>
            <View style={styles.activityDetailRow}>
              <Text style={[styles.activityDetailLabel, { color: theme.textSecondary }]}>IP Address:</Text>
              <Text style={[styles.activityDetailValue, { color: theme.textSecondary }]}>{item.ip}</Text>
            </View>
          </View>
        )}

        <View style={[styles.activityDivider, { backgroundColor: theme.divider }]} />
      </View>
    );
  };

  return (
    <View style={[styles.sectionCard, { backgroundColor: theme.cardBg }]}>
      <Text style={[styles.activityTitle, { color: theme.text }]}>Activity Log</Text>
      <Text style={[styles.suspiciousText, { color: theme.text }]}>
        Notice anything suspicious?{' '}
        <Text style={styles.linkText} onPress={() => router.push('/change-password')}>
          Change your password
        </Text>
      </Text>

      {/* Column headers */}
      <View style={styles.activityTableHeader}>
        <Text style={[styles.activityHeaderDate, { color: theme.textSecondary }]}>Date</Text>
        <Text style={[styles.activityHeaderActivity, { color: theme.textSecondary }]}>Activity</Text>
      </View>
      <View style={[styles.activityDivider, { backgroundColor: theme.divider }]} />

      {activityLog.map(renderActivityItem)}
    </View>
  );
}

// All styles carried over from HomeScreen to keep the look identical
const styles = StyleSheet.create({
  sectionCard: {
    backgroundColor: Colors.white,
    borderRadius: 10,
    padding: 10,
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
    flexBasis: '42%',
    maxWidth: 186,
    paddingRight: 12,
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
  },
  activityDate: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.gray,
    flexBasis: '42%',
    maxWidth: 186,
    paddingRight: 12,
  },
  activityDivider: {
    width: '100%',
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
