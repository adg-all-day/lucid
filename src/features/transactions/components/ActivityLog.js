// The activity log section from the bottom of the home screen.
// Self-contained -- manages its own expanded/collapsed state so the
// parent doesn't need to worry about it.

import React, { useMemo, useRef, useState } from 'react';
import { Animated, View, TouchableOpacity, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Text from '../../../components/StyledText';
import CalendarDatePickerModal from '../../../components/CalendarDatePickerModal';
import Colors from '../../../constants/colors';
import useTheme from '../../../hooks/useTheme';
import { formatShortDate } from '../utils/formatters';

function formatFilterDate(date) {
  if (!date) return 'MM/DD/YYYY';
  const d = new Date(date);
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const year = d.getFullYear();
  return `${month}/${day}/${year}`;
}

export default function ActivityLog({
  activityLog,
  onApplyDateFilter,
  isFiltering = false,
  onInteractionChange,
  viewportMaxHeight,
}) {
  const router = useRouter();
  const theme = useTheme();
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(new Date());
  const [pickerTarget, setPickerTarget] = useState(null);
  const [activityViewportHeight, setActivityViewportHeight] = useState(0);
  const [activityContentHeight, setActivityContentHeight] = useState(0);
  // Track which activity row is currently expanded (only one at a time)
  const [expandedActivity, setExpandedActivity] = useState(
    activityLog.length > 0 ? activityLog[0].id : null
  );
  const activityScrollY = useRef(new Animated.Value(0)).current;

  const filterButtonDisabled = useMemo(
    () => isFiltering || (!startDate && !endDate),
    [isFiltering, startDate, endDate],
  );
  const showActivityScrollbar = activityContentHeight > activityViewportHeight;
  const maxActivityScroll = Math.max(activityContentHeight - activityViewportHeight, 1);
  const activityThumbHeight = showActivityScrollbar
    ? Math.max((activityViewportHeight / activityContentHeight) * activityViewportHeight * 0.5, 14)
    : 0;
  const activityThumbTravel = Math.max(activityViewportHeight - activityThumbHeight, 0);
  const activityThumbTranslateY = useMemo(
    () =>
      activityScrollY.interpolate({
        inputRange: [0, maxActivityScroll],
        outputRange: [0, activityThumbTravel],
        extrapolate: 'clamp',
      }),
    [activityScrollY, maxActivityScroll, activityThumbTravel],
  );
  const handleDateChange = (selectedDate) => {
    setPickerTarget(null);
    if (!selectedDate) return;

    if (pickerTarget === 'start') {
      setStartDate(selectedDate);
      if (endDate && selectedDate > endDate) {
        setEndDate(selectedDate);
      }
      return;
    }

    setEndDate(selectedDate);
    if (startDate && selectedDate < startDate) {
      setStartDate(selectedDate);
    }
  };

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

      <View style={styles.filterRow}>
        <Pressable
          style={styles.dateFieldWrap}
          onPress={() => setPickerTarget('start')}
        >
          <Text
            style={[
              styles.dateFieldLabel,
              { color: theme.textSecondary, backgroundColor: theme.cardBg },
            ]}
          >
            Start Date
          </Text>
          <View style={[styles.dateField, { borderColor: theme.divider, backgroundColor: theme.cardBg }]}>
            <Text style={[styles.dateFieldValue, { color: startDate ? theme.text : Colors.grayMedium }]}>
              {formatFilterDate(startDate)}
            </Text>
            <Ionicons name="calendar-outline" size={18} color={theme.iconMuted} />
          </View>
        </Pressable>

        <Pressable
          style={styles.dateFieldWrap}
          onPress={() => setPickerTarget('end')}
        >
          <Text
            style={[
              styles.dateFieldLabel,
              { color: theme.textSecondary, backgroundColor: theme.cardBg },
            ]}
          >
            End Date
          </Text>
          <View style={[styles.dateField, { borderColor: theme.divider, backgroundColor: theme.cardBg }]}>
            <Text style={[styles.dateFieldValue, { color: endDate ? theme.text : Colors.grayMedium }]}>
              {formatFilterDate(endDate)}
            </Text>
            <Ionicons name="calendar-outline" size={18} color={theme.iconMuted} />
          </View>
        </Pressable>

        <TouchableOpacity
          style={[styles.filterButton, filterButtonDisabled && styles.filterButtonDisabled]}
          disabled={filterButtonDisabled}
          onPress={() => onApplyDateFilter?.({ start: startDate, end: endDate })}
        >
          {isFiltering ? (
            <ActivityIndicator size="small" color={Colors.white} />
          ) : (
            <Text style={styles.filterButtonText}>Filter</Text>
          )}
        </TouchableOpacity>
      </View>

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

      <View
        style={[styles.activityListViewport, viewportMaxHeight ? { maxHeight: viewportMaxHeight } : null]}
        onLayout={(event) => setActivityViewportHeight(event.nativeEvent.layout.height)}
      >
        <Animated.ScrollView
          nestedScrollEnabled
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.activityListContent}
          onContentSizeChange={(_, height) => setActivityContentHeight(height)}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: activityScrollY } } }],
            { useNativeDriver: true },
          )}
          onScrollBeginDrag={() => onInteractionChange?.(true)}
          onScrollEndDrag={() => onInteractionChange?.(false)}
          onMomentumScrollBegin={() => onInteractionChange?.(true)}
          onMomentumScrollEnd={() => onInteractionChange?.(false)}
          scrollEventThrottle={16}
        >
          {activityLog.map(renderActivityItem)}
        </Animated.ScrollView>
        {showActivityScrollbar ? (
          <View pointerEvents="none" style={styles.activityScrollbarTrack}>
            <Animated.View
              style={[
                styles.activityScrollbarThumb,
                {
                  height: activityThumbHeight,
                  transform: [{ translateY: activityThumbTranslateY }],
                },
              ]}
            />
          </View>
        ) : null}
      </View>

      <CalendarDatePickerModal
        visible={Boolean(pickerTarget)}
        value={pickerTarget === 'start' ? startDate || new Date() : endDate || startDate || new Date()}
        minimumDate={pickerTarget === 'end' ? startDate || undefined : undefined}
        onCancel={() => setPickerTarget(null)}
        onConfirm={handleDateChange}
      />
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
  filterRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginTop: 4,
    marginBottom: 10,
  },
  dateFieldWrap: {
    flex: 1,
    minWidth: 0,
    position: 'relative',
    marginTop: 10,
  },
  dateField: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateFieldLabel: {
    position: 'absolute',
    top: -8,
    left: 10,
    paddingHorizontal: 4,
    fontSize: 12,
    fontWeight: '500',
    zIndex: 1,
  },
  dateFieldValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  filterButton: {
    height: 38,
    minWidth: 74,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  filterButtonDisabled: {
    opacity: 0.6,
  },
  filterButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
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
  activityListViewport: {
    maxHeight: 320,
    position: 'relative',
  },
  activityListContent: {
    paddingBottom: 4,
    paddingRight: 8,
  },
  activityScrollbarTrack: {
    position: 'absolute',
    top: 6,
    right: 1,
    bottom: 6,
    width: 3,
    borderRadius: 999,
    backgroundColor: 'rgba(0, 0, 0, 0.06)',
  },
  activityScrollbarThumb: {
    width: 3,
    borderRadius: 999,
    backgroundColor: '#979797',
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
