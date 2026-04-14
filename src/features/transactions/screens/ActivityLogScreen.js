import React, { useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import CalendarDatePickerModal from '../../../components/CalendarDatePickerModal';
import Text from '../../../components/StyledText';
import Colors from '../../../constants/colors';
import useTheme from '../../../hooks/useTheme';
import { useInfiniteActivityLogQuery } from '../hooks/useActivityLogQuery';
import { formatShortDate } from '../utils/formatters';
import { ActivityCalendarIcon } from '../../../icons';

function formatFilterDate(date) {
  if (!date) return 'mm/dd/yyyy';
  const d = new Date(date);
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const year = d.getFullYear();
  return `${month}/${day}/${year}`;
}

function isSameDay(left, right) {
  if (!left || !right) return false;
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

export default function ActivityLogScreen() {
  const router = useRouter();
  const theme = useTheme();
  const isDark = theme.isDark;
  const { height: screenHeight } = useWindowDimensions();
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(new Date());
  const [pickerTarget, setPickerTarget] = useState(null);
  const [appliedDateRange, setAppliedDateRange] = useState({ start: null, end: new Date() });
  const [expandedActivityId, setExpandedActivityId] = useState(null);
  const [activityInteracted, setActivityInteracted] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);
  const scrollY = useRef(new Animated.Value(0)).current;
  const today = useMemo(() => new Date(), []);

  const activityQuery = useInfiniteActivityLogQuery({
    limit: 20,
    startDate: appliedDateRange.start,
    endDate: appliedDateRange.end,
  });

  const viewportMaxHeight = Math.max(360, screenHeight - 245);
  const filterDisabled = activityQuery.isRefetching || activityQuery.isLoading || (!startDate && !endDate);
  const showClearButton =
    Boolean(appliedDateRange.start) || !isSameDay(appliedDateRange.end, today);
  const showScrollbar = contentHeight > viewportHeight;
  const maxScroll = Math.max(contentHeight - viewportHeight, 1);
  const thumbHeight = showScrollbar
    ? Math.max((viewportHeight / contentHeight) * viewportHeight * 0.18, 16)
    : 0;
  const thumbTravel = Math.max(viewportHeight - thumbHeight - 14, 0);
  const thumbTranslateY = useMemo(
    () =>
      scrollY.interpolate({
        inputRange: [0, maxScroll],
        outputRange: [0, thumbTravel],
        extrapolate: 'clamp',
      }),
    [maxScroll, scrollY, thumbTravel],
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

  const handleApplyFilter = () => {
    setAppliedDateRange({ start: startDate, end: endDate });
  };

  const handleClearFilter = () => {
    setStartDate(null);
    setEndDate(today);
    setAppliedDateRange({ start: null, end: today });
  };

  const handleLoadMore = ({ nativeEvent }) => {
    if (!activityQuery.hasNextPage || activityQuery.isFetchingNextPage) {
      return;
    }

    const { contentOffset, contentSize, layoutMeasurement } = nativeEvent;
    const distanceFromBottom =
      contentSize.height - (contentOffset.y + layoutMeasurement.height);

    if (distanceFromBottom <= 48) {
      activityQuery.fetchNextPage();
    }
  };

  const activityLog = activityQuery.data?.pages.flatMap((page) => page.items) ?? [];
    console.log('Activity log items:', activityLog);
  const cardBackgroundColor = 'rgba(91, 95, 199, 0.1)';
  const sectionTextColor = isDark ? Colors.white : Colors.primary;
  const bodyTextColor = isDark ? Colors.white : Colors.gray;
  const dividerColor = isDark ? 'rgba(255,255,255,0.2)' : Colors.primary10;
  const chevronColor = isDark ? Colors.white : Colors.gray;
  const scrollbarTrackColor = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.06)';

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
          <Text style={styles.headerTitle}>Activity Log</Text>
          <View style={styles.headerSide} />
        </View>
      </View>

      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.bodyContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={activityQuery.isRefetching}
            onRefresh={() => activityQuery.refetch()}
            tintColor={Colors.primary}
          />
        }
      >
        <View style={[styles.card, { backgroundColor: cardBackgroundColor }]}>
          <View style={styles.filterRow}>
            <Pressable style={styles.dateFieldWrap} onPress={() => setPickerTarget('start')}>
              <Text style={[styles.dateFieldLabel, { color: sectionTextColor }]}>Start Date</Text>
              <TextInput
                editable={false}
                value={formatFilterDate(startDate)}
                pointerEvents="none"
                style={styles.dateFieldInput}
              />
              <View style={styles.dateFieldIcon}>
                <ActivityCalendarIcon />
              </View>
            </Pressable>

            <Pressable style={styles.dateFieldWrap} onPress={() => setPickerTarget('end')}>
              <Text style={[styles.dateFieldLabel, { color: sectionTextColor }]}>End Date</Text>
              <TextInput
                editable={false}
                value={formatFilterDate(endDate)}
                pointerEvents="none"
                style={styles.dateFieldInput}
              />
              <View style={styles.dateFieldIcon}>
                <ActivityCalendarIcon />
              </View>
            </Pressable>

            <TouchableOpacity
              style={[styles.filterButton, filterDisabled && styles.filterButtonDisabled]}
              disabled={filterDisabled}
              activeOpacity={0.85}
              onPress={handleApplyFilter}
            >
              {activityQuery.isRefetching ? (
                <ActivityIndicator size="small" color={Colors.white} />
              ) : (
                <Text style={styles.filterButtonText}>Filter</Text>
              )}
            </TouchableOpacity>

            {showClearButton ? (
              <TouchableOpacity
                style={styles.clearButton}
                activeOpacity={0.85}
                onPress={handleClearFilter}
              >
                <Text style={styles.clearButtonText}>Clear</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          <Text style={[styles.noticeText, { color: bodyTextColor }]}>
            Notice anything suspicious?{' '}
            <Text style={styles.noticeLink} onPress={() => router.push('/change-password')}>
              Change your password
            </Text>
          </Text>

          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, { color: bodyTextColor }]}>Date</Text>
            <Text style={[styles.tableHeaderText, styles.tableHeaderRight, { color: bodyTextColor }]}>
              Activity
            </Text>
          </View>
          <View style={[styles.divider, { backgroundColor: dividerColor }]} />

          <View
            style={[styles.listViewport, { maxHeight: viewportMaxHeight }]}
            onLayout={(event) => setViewportHeight(event.nativeEvent.layout.height)}
          >
            {activityQuery.isLoading ? (
              <ActivityIndicator size="large" color={Colors.primary} style={styles.loader} />
            ) : (
              <Animated.ScrollView
                nestedScrollEnabled
                showsVerticalScrollIndicator={false}
                onContentSizeChange={(_, height) => setContentHeight(height)}
                onScroll={Animated.event(
                  [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                  {
                    useNativeDriver: true,
                    listener: handleLoadMore,
                  },
                )}
                scrollEventThrottle={16}
              >
                {activityLog.map((item, index) => {
                  const isExpanded =
                    expandedActivityId === item.id ||
                    (!activityInteracted && expandedActivityId === null && index === 0);

                  return (
                    <View key={item.id || `${item.created_at}-${index}`}>
                      <TouchableOpacity
                        style={styles.activityRow}
                        activeOpacity={0.8}
                        onPress={() => {
                          setActivityInteracted(true);
                          setExpandedActivityId((current) => (current === item.id ? null : item.id));
                        }}
                      >
                        <Text style={[styles.activityDate, { color: bodyTextColor }]}>
                          {formatShortDate(item.created_at)}
                        </Text>
                        <Text style={[styles.activityEvent, { color: bodyTextColor }]} numberOfLines={1}>
                          {item.event}
                        </Text>
                        <Ionicons
                          name={isExpanded ? 'chevron-down' : 'chevron-forward'}
                          size={14}
                          color={chevronColor}
                        />
                      </TouchableOpacity>

                      {isExpanded ? (
                        <View style={styles.activityDetails}>
                          <View style={styles.detailRow}>
                            <Text style={[styles.detailLabel, { color: bodyTextColor }]}>Device:</Text>
                            <Text style={[styles.detailValue, { color: bodyTextColor }]}>{item.device || '-'}</Text>
                          </View>
                          <View style={styles.detailRow}>
                            <Text style={[styles.detailLabel, { color: bodyTextColor }]}>Browser:</Text>
                            <Text style={[styles.detailValue, { color: bodyTextColor }]}>{item.browser || '-'}</Text>
                          </View>
                          <View style={styles.detailRow}>
                            <Text style={[styles.detailLabel, { color: bodyTextColor }]}>IP Address:</Text>
                            <Text style={[styles.detailValue, { color: bodyTextColor }]}>{item.ip || '-'}</Text>
                          </View>
                        </View>
                      ) : null}

                      {index < activityLog.length - 1 ? (
                        <View style={[styles.divider, { backgroundColor: dividerColor }]} />
                      ) : null}
                    </View>
                  );
                })}

                {activityQuery.isFetchingNextPage ? (
                  <View style={styles.paginationLoader}>
                    <ActivityIndicator size="small" color={Colors.primary} />
                  </View>
                ) : null}
              </Animated.ScrollView>
            )}

            {showScrollbar ? (
              <View pointerEvents="none" style={[styles.scrollbarTrack, { backgroundColor: scrollbarTrackColor }]}>
                <Animated.View
                  style={[
                    styles.scrollbarThumb,
                    {
                      height: thumbHeight,
                      transform: [{ translateY: thumbTranslateY }],
                    },
                  ]}
                />
              </View>
            ) : null}
          </View>
        </View>
      </ScrollView>

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
  card: {
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingTop: 22,
    paddingBottom: 10,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
    marginBottom: 14,
  },
  dateFieldWrap: {
    width: 96,
    height: 28,
    borderRadius: 5,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: 'rgba(151, 151, 151, 1)',
    justifyContent: 'center',
    paddingLeft: 6,
    paddingRight: 22,
    position: 'relative',
  },
  dateFieldLabel: {
    position: 'absolute',
    top: -10,
    left: 6,
    color: Colors.white,
    fontSize: 8,
    fontWeight: '500',
    lineHeight: 10,
  },
  dateFieldInput: {
    color: 'rgba(151, 151, 151, 1)',
    fontSize: 10,
    paddingVertical: 0,
    fontFamily: 'Satoshi-Regular',
  },
  dateFieldIcon: {
    position: 'absolute',
    right: 6,
    top: 6,
  },
  filterButton: {
    width: 54,
    height: 28,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterButtonDisabled: {
    opacity: 0.65,
  },
  filterButtonText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: '500',
    lineHeight: 11,
  },
  clearButton: {
    minWidth: 50,
    height: 28,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(151, 151, 151, 1)',
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  clearButtonText: {
    color: 'rgba(151, 151, 151, 1)',
    fontSize: 11,
    fontWeight: '500',
  },
  noticeText: {
    color: Colors.white,
    fontSize: 10,
    marginBottom: 12,
  },
  noticeLink: {
    color: Colors.primary,
    fontSize: 10,
    textDecorationLine: 'underline',
  },
  tableHeader: {
    flexDirection: 'row',
    paddingBottom: 8,
  },
  tableHeaderText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '500',
  },
  tableHeaderRight: {
    marginLeft: 'auto',
    width: '45%',
    textAlign: 'left',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  listViewport: {
    position: 'relative',
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  activityDate: {
    width: '42%',
    color: Colors.white,
    fontSize: 12,
  },
  activityEvent: {
    flex: 1,
    color: Colors.white,
    fontSize: 12,
    marginRight: 8,
  },
  activityDetails: {
    paddingLeft: 12,
    paddingBottom: 10,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  detailLabel: {
    width: 62,
    color: Colors.white,
    fontSize: 12,
  },
  detailValue: {
    flex: 1,
    color: Colors.white,
    fontSize: 12,
  },
  loader: {
    paddingVertical: 40,
  },
  scrollbarTrack: {
    position: 'absolute',
    top: 10,
    right: -6,
    bottom: 10,
    width: 3,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  scrollbarThumb: {
    width: 3,
    borderRadius: 999,
    backgroundColor: '#979797',
  },
});
