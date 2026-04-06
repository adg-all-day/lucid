// The activity log section from the bottom of the home screen.
// Self-contained -- manages its own expanded/collapsed state so the
// parent doesn't need to worry about it.

import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Text from '../../../components/StyledText';
import Colors from '../../../constants/colors';
import { formatShortDate } from '../utils/formatters';

export default function ActivityLog({ activityLog }) {
  const router = useRouter();
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
          <Text style={styles.activityDate}>{formatShortDate(item.created_at)}</Text>
          <Text style={styles.activityText}>{item.event}</Text>
          <Ionicons
            name={isExpanded ? 'chevron-down' : 'chevron-forward'}
            size={16}
            color={Colors.gray}
          />
        </TouchableOpacity>

        {/* Device/browser/IP details shown when expanded */}
        {isExpanded && item.device && (
          <View style={styles.activityDetails}>
            <View style={styles.activityDetailRow}>
              <Text style={styles.activityDetailLabel}>Device:</Text>
              <Text style={styles.activityDetailValue}>{item.device}</Text>
            </View>
            <View style={styles.activityDetailRow}>
              <Text style={styles.activityDetailLabel}>Browser:</Text>
              <Text style={styles.activityDetailValue}>{item.browser}</Text>
            </View>
            <View style={styles.activityDetailRow}>
              <Text style={styles.activityDetailLabel}>IP Address:</Text>
              <Text style={styles.activityDetailValue}>{item.ip}</Text>
            </View>
          </View>
        )}

        <View style={styles.activityDivider} />
      </View>
    );
  };

  return (
    <View style={styles.sectionCard}>
      <Text style={styles.activityTitle}>Activity Log</Text>
      <Text style={styles.suspiciousText}>
        Notice anything suspicious?{' '}
        <Text style={styles.linkText} onPress={() => router.push('/change-password')}>
          Change your password
        </Text>
      </Text>

      {/* Column headers */}
      <View style={styles.activityTableHeader}>
        <Text style={styles.activityHeaderDate}>Date</Text>
        <Text style={styles.activityHeaderActivity}>Activity</Text>
      </View>
      <View style={styles.activityDivider} />

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
    width: 186,
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
    gap: 34,
  },
  activityDate: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.gray,
    width: 186,
  },
  activityDivider: {
    width: 387,
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
