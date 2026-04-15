import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Pressable,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import Text from '../../../components/StyledText';
import CalendarDatePickerModal from '../../../components/CalendarDatePickerModal';
import Colors from '../../../constants/colors';
import TransactionCard from '../components/TransactionCard';
import TransactionsSortMenu from '../components/TransactionsSortMenu';
import { FilterSelectedDot, SearchIcon, SortVerticalIcon } from '../../../icons';
import useTransactionsHomeViewModel from '../hooks/useTransactionsHomeViewModel';
import { DATE_FILTER_OPTIONS, TABS } from '../utils/constants';
import useUiStore from '../../../stores/uiStore';
import useTheme from '../../../hooks/useTheme';

export default function TransactionsHomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const theme = useTheme();
  const isDark = theme.isDark;
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const activeTab = useUiStore((state) => state.activeTab);
  const searchText = useUiStore((state) => state.searchText);
  const setActiveTab = useUiStore((state) => state.setActiveTab);
  const setSearchText = useUiStore((state) => state.setSearchText);
  const [tabLayouts, setTabLayouts] = useState({});
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [dateFilter, setDateFilter] = useState('all');
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');
  const [customRange, setCustomRange] = useState({ start: null, end: null });
  const [pendingCustomStart, setPendingCustomStart] = useState(null);
  const [pickerTarget, setPickerTarget] = useState(null);
  const [transactionsViewportHeight, setTransactionsViewportHeight] = useState(0);
  const [transactionsContentHeight, setTransactionsContentHeight] = useState(0);
  const [isTransactionsListInteracting, setIsTransactionsListInteracting] = useState(false);
  const underlineLeft = useRef(new Animated.Value(0)).current;
  const underlineWidth = useRef(new Animated.Value(0)).current;
  const transactionsScrollY = useRef(new Animated.Value(0)).current;

  const {
    transactionsQuery,
    filteredTransactions,
    stats,
    compactActions,
  } = useTransactionsHomeViewModel(
    activeTab,
    searchText,
    screenWidth,
    dateFilter,
    customRange,
    sortField,
    sortDirection,
  );

  const handleSelectDateFilter = (value) => {
    if (value === 'custom') {
      setShowFilterMenu(false);
      setPendingCustomStart(customRange.start);
      setPickerTarget('start');
      return;
    }

    setDateFilter(value);
    setShowFilterMenu(false);
  };

  const handleSelectSortField = (field) => {
    setSortField(field);
  };

  const handleSelectSortDirection = (direction) => {
    setSortDirection(direction);
  };

  const handleDatePickerChange = (selectedDate) => {
    if (!selectedDate) {
      setPickerTarget(null);
      setPendingCustomStart(null);
      return;
    }

    if (pickerTarget === 'start') {
      setPendingCustomStart(selectedDate);
      setPickerTarget('end');
      return;
    }

    setCustomRange({
      start: pendingCustomStart || selectedDate,
      end: selectedDate,
    });
    setDateFilter('custom');
    setPendingCustomStart(null);
    setPickerTarget(null);
  };

  const handleClearTransactionsControls = () => {
    setSearchText('');
    setShowFilterMenu(false);
    setShowSortMenu(false);
    setDateFilter('all');
    setSortField('created_at');
    setSortDirection('desc');
    setCustomRange({ start: null, end: null });
    setPendingCustomStart(null);
    setPickerTarget(null);
    setActiveTab('All Transactions');
  };

  useEffect(() => {
    const activeLayout = tabLayouts[activeTab];
    if (!activeLayout) return;

    Animated.parallel([
      Animated.spring(underlineLeft, {
        toValue: activeLayout.x,
        useNativeDriver: false,
        tension: 180,
        friction: 20,
      }),
      Animated.spring(underlineWidth, {
        toValue: activeLayout.width,
        useNativeDriver: false,
        tension: 180,
        friction: 20,
      }),
    ]).start();
  }, [activeTab, tabLayouts, underlineLeft, underlineWidth]);

  const showTransactionsScrollbar = transactionsContentHeight > transactionsViewportHeight;
  const maxTransactionsScroll = Math.max(transactionsContentHeight - transactionsViewportHeight, 1);
  const transactionsThumbHeight = showTransactionsScrollbar
    ? Math.max((transactionsViewportHeight / transactionsContentHeight) * transactionsViewportHeight * 0.2, 14)
    : 0;
  const transactionsThumbTravel = Math.max(transactionsViewportHeight - transactionsThumbHeight, 0);
  const transactionsThumbTranslateY = useMemo(
    () =>
      transactionsScrollY.interpolate({
        inputRange: [0, maxTransactionsScroll],
        outputRange: [0, transactionsThumbTravel],
        extrapolate: 'clamp',
      }),
    [transactionsScrollY, maxTransactionsScroll, transactionsThumbTravel],
  );
  const disableOuterScroll = isTransactionsListInteracting;
  const showClearTransactionsControls =
    searchText.trim().length > 0 ||
    dateFilter !== 'all' ||
    sortField !== 'created_at' ||
    sortDirection !== 'desc';
  const handleTransactionsScroll = ({ nativeEvent }) => {
    const { contentOffset, contentSize, layoutMeasurement } = nativeEvent;
    const threshold = 180;
    const reachedBottom =
      contentOffset.y + layoutMeasurement.height >= contentSize.height - threshold;

    if (
      reachedBottom &&
      transactionsQuery.hasNextPage &&
      !transactionsQuery.isFetchingNextPage
    ) {
      transactionsQuery.fetchNextPage();
    }
  };
  const transactionsViewportMaxHeight = Math.max(330, screenHeight - 235);
  const filterMenuBackgroundColor = theme.isDark ? '#2B2B2B' : theme.cardBg;
  const filterMenuBorderColor = theme.isDark ? 'rgba(255,255,255,0.08)' : '#E6E6E6';

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.detailHeader, { backgroundColor: theme.headerBg }]}>
        <View style={styles.detailHeaderContent}>
          <View style={styles.detailHeaderSide}>
            <TouchableOpacity
              style={styles.detailHeaderBackButton}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back-circle-outline" size={28} color={Colors.white} />
            </TouchableOpacity>
          </View>
          <Text style={styles.detailHeaderTitle}>{t('transactions.myTransactions')}</Text>
          <View style={styles.detailHeaderSide} />
        </View>
      </View>
      <ScrollView
        style={styles.body}
        showsVerticalScrollIndicator={false}
        scrollEnabled={!disableOuterScroll}
        refreshControl={
          <RefreshControl
            enabled={!disableOuterScroll}
            refreshing={!disableOuterScroll && transactionsQuery.isRefetching}
            onRefresh={() => transactionsQuery.refetch()}
            tintColor={Colors.primary}
          />
        }
      >
        <View style={styles.section}>
          <View style={[styles.sectionCard, { backgroundColor: theme.primary5 }]}>
            <View style={styles.searchRow}>
              <View
                style={[
                  styles.searchBar,
                  showClearTransactionsControls && styles.searchBarWithClear,
                  { backgroundColor: Colors.white },
                ]}
              >
                <SearchIcon size={13} color="rgba(151, 151, 151, 1)" />
                <TextInput
                  style={styles.searchInput}
                  value={searchText}
                  onChangeText={setSearchText}
                  placeholder={t('common.search')}
                  placeholderTextColor="rgba(151, 151, 151, 1)"
                />
                {searchText ? (
                  <TouchableOpacity style={styles.searchClearButton} onPress={() => setSearchText('')}>
                    <Text style={styles.clearText}>x</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
              <View style={styles.filterButtonWrap}>
                <TouchableOpacity
                  style={[
                    styles.iconButton,
                    compactActions && styles.iconButtonCompact,
                    { backgroundColor: Colors.white },
                  ]}
                  onPress={() => {
                    setShowSortMenu(false);
                    setShowFilterMenu((current) => !current);
                  }}
                >
                  <View style={styles.filterIconWrap}>
                    <Ionicons name="filter" size={22} color="rgba(151, 151, 151, 1)" />
                  </View>
                </TouchableOpacity>

                {showFilterMenu ? (
                  <Pressable style={styles.filterMenuOverlay} onPress={() => setShowFilterMenu(false)}>
                    <Pressable
                      style={[
                        styles.filterMenu,
                        { backgroundColor: filterMenuBackgroundColor, borderColor: filterMenuBorderColor },
                      ]}
                      onPress={(event) => event.stopPropagation()}
                    >
                      {DATE_FILTER_OPTIONS.map((option) => {
                        const selected = dateFilter === option.value;
                        return (
                          <TouchableOpacity
                            key={option.value}
                            style={styles.filterOption}
                            onPress={() => handleSelectDateFilter(option.value)}
                          >
                            {selected ? (
                              <FilterSelectedDot size={20} />
                            ) : (
                              <View
                                style={[
                                  styles.filterRadioOuter,
                                  { borderColor: '#D0D0D0' },
                                ]}
                              />
                            )}
                            <Text style={[styles.filterOptionText, { color: theme.text }]}>
                              {t(option.labelKey)}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </Pressable>
                  </Pressable>
                ) : null}
              </View>
              <TouchableOpacity
                style={[
                  styles.iconButton,
                  compactActions && styles.iconButtonCompact,
                  { backgroundColor: Colors.white },
                ]}
                onPress={() => {
                  setShowFilterMenu(false);
                  setShowSortMenu(true);
                }}
              >
                <View style={styles.sortIconWrap}>
                  <SortVerticalIcon width={11} height={14} color="rgba(151, 151, 151, 1)" />
                </View>
              </TouchableOpacity>
              {showClearTransactionsControls ? (
                <TouchableOpacity
                  style={[
                    styles.clearButton,
                    compactActions && styles.clearButtonCompact,
                    { backgroundColor: theme.cardBg },
                  ]}
                  onPress={handleClearTransactionsControls}
                >
                  <Text style={[styles.clearButtonText, { color: theme.textSecondary }]}>{t('common.clear')}</Text>
                </TouchableOpacity>
              ) : null}
            </View>

            <TransactionsSortMenu
              visible={showSortMenu}
              theme={theme}
              sortField={sortField}
              sortDirection={sortDirection}
              onClose={() => setShowSortMenu(false)}
              onSelectSortField={handleSelectSortField}
              onSelectSortDirection={handleSelectSortDirection}
            />

            <View style={styles.tabsWrap}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.tabsContainer}
              >
                {TABS.map((tab) => (
                  <TouchableOpacity
                    key={tab.value}
                    style={styles.tab}
                    onPress={() => setActiveTab(tab.value)}
                    onLayout={(event) => {
                      const { x, width } = event.nativeEvent.layout;
                      setTabLayouts((current) => {
                      const previous = current[tab.value];
                        if (previous && previous.x === x && previous.width === width) {
                          return current;
                        }

                        return {
                          ...current,
                          [tab.value]: { x, width },
                        };
                      });
                    }}
                  >
                    <Text
                      style={[
                        styles.tabText,
                        { color: theme.textSecondary },
                        activeTab === tab.value && styles.tabTextActive,
                        activeTab === tab.value && { color: theme.isDark ? Colors.white : Colors.primary },
                      ]}
                    >
                      {t(tab.labelKey)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <Animated.View
                pointerEvents="none"
                style={[
                  styles.tabUnderline,
                  {
                    left: underlineLeft,
                    width: underlineWidth,
                  },
                ]}
              />
            </View>
            <View style={styles.tabDivider} />

            <View
              style={[styles.transactionsListViewport, { maxHeight: transactionsViewportMaxHeight }]}
              onLayout={(event) => setTransactionsViewportHeight(event.nativeEvent.layout.height)}
            >
              {transactionsQuery.isLoading ? (
                <ActivityIndicator
                  size="large"
                  color={Colors.primary}
                  style={styles.loading}
                />
              ) : filteredTransactions.length === 0 ? (
                <Text style={[styles.emptyText, { color: theme.text }]}>{t('transactions.empty')}</Text>
              ) : (
                <Animated.ScrollView
                  nestedScrollEnabled
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.transactionsListContent}
                  onContentSizeChange={(_, height) => setTransactionsContentHeight(height)}
                  onTouchStart={() => setIsTransactionsListInteracting(true)}
                  onTouchEnd={() => setIsTransactionsListInteracting(false)}
                  onTouchCancel={() => setIsTransactionsListInteracting(false)}
                  onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: transactionsScrollY } } }],
                    {
                      useNativeDriver: true,
                      listener: handleTransactionsScroll,
                    },
                  )}
                  onScrollBeginDrag={() => setIsTransactionsListInteracting(true)}
                  onScrollEndDrag={() => setIsTransactionsListInteracting(false)}
                  onMomentumScrollBegin={() => setIsTransactionsListInteracting(true)}
                  onMomentumScrollEnd={() => setIsTransactionsListInteracting(false)}
                  scrollEventThrottle={16}
                >
                  {filteredTransactions.map((item) => (
                    <TransactionCard
                      key={item.id}
                      item={item}
                      onPress={() => router.push(`/transaction/${item.id}`)}
                    />
                  ))}
                  {transactionsQuery.isFetchingNextPage ? (
                    <ActivityIndicator
                      size="small"
                      color={Colors.primary}
                      style={styles.transactionsNextPageLoader}
                    />
                  ) : null}
                </Animated.ScrollView>
              )}
              {showTransactionsScrollbar ? (
                <View pointerEvents="none" style={styles.transactionsScrollbarTrack}>
                  <Animated.View
                    style={[
                      styles.transactionsScrollbarThumb,
                      {
                        height: transactionsThumbHeight,
                        transform: [{ translateY: transactionsThumbTranslateY }],
                      },
                    ]}
                  />
                </View>
              ) : null}
            </View>
          </View>
        </View>

        <View style={styles.footerGap} />

      </ScrollView>

      <CalendarDatePickerModal
        visible={Boolean(pickerTarget)}
        value={
          pickerTarget === 'end'
            ? customRange.end || pendingCustomStart || new Date()
            : customRange.start || new Date()
        }
        minimumDate={pickerTarget === 'end' ? pendingCustomStart || undefined : undefined}
        onCancel={() => {
          setPickerTarget(null);
          setPendingCustomStart(null);
        }}
        onConfirm={handleDatePickerChange}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  body: {
    flex: 1,
  },
  detailHeader: {
    paddingTop: 38,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#FFFFFF',
  },
  detailHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  detailHeaderSide: {
    width: 40,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  detailHeaderBackButton: {
    width: 28,
    height: 28,
  },
  detailHeaderTitle: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 14,
  },
  section: {
    paddingHorizontal: 11,
    marginTop: 22,
  },
  sectionCard: {
    backgroundColor: 'rgba(91, 95, 199, 0.05)',
    borderRadius: 10,
    paddingHorizontal: 11,
    paddingTop: 12,
    paddingBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.primary,
    marginBottom: 12,
    marginLeft: 10,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
    position: 'relative',
    zIndex: 3,
    width: '100%',
  },
  searchBar: {
    width: 265,
    maxWidth: 265,
    flexShrink: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 26,
    borderWidth: 0.5,
    borderColor: '#979797',
    borderRadius: 5,
    paddingHorizontal: 8,
    backgroundColor: Colors.white,
  },
  searchBarWithClear: {
    minWidth: 0,
    flex: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: 6,
    fontSize: 12,
    color: 'rgba(151, 151, 151, 1)',
    paddingVertical: 0,
    fontFamily: 'Satoshi-Regular',
  },
  searchClearButton: {
    marginLeft: 4,
    paddingHorizontal: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearText: {
    fontSize: 12,
    color: Colors.gray,
    marginRight: 2,
  },
  iconButton: {
    width: 26,
    height: 26,
    borderWidth: 0.5,
    borderColor: '#979797',
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
  },
  iconButtonCompact: {
    width: 24,
    height: 24,
  },
  filterButtonWrap: {
    position: 'relative',
    marginLeft: 'auto',
  },
  firstRightAlignedButton: {
    marginLeft: 'auto',
  },
  filterIconWrap: {
    transform: [{ scaleX: 0.8 }],
  },
  sortIconWrap: {
    transform: [{ scaleX: -1 }],
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearButton: {
    minWidth: 44,
    height: 26,
    borderWidth: 0.5,
    borderColor: '#979797',
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    flexShrink: 0,
  },
  clearButtonCompact: {
    minWidth: 40,
    paddingHorizontal: 6,
  },
  clearButtonText: {
    fontSize: 10,
    fontWeight: '600',
  },
  filterMenuOverlay: {
    position: 'absolute',
    top: 30,
    left: 0,
    zIndex: 10,
  },
  filterMenu: {
    width: 180,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#E6E6E6',
    alignSelf: 'flex-start',
    marginLeft: -126,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 9,
  },
  filterRadioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterRadioInner: {
    width: 20,
    height: 20,
  },
  filterOptionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  tabsWrap: {
    position: 'relative',
    marginBottom: -2,
  },
  tabsContainer: {
    marginBottom: 0,
    paddingRight: 8,
    marginTop: 8,
  },
  tab: {
    paddingBottom: 12,
    marginRight: 14,
    alignItems: 'center',
  },
  tabUnderline: {
    height: 4,
    backgroundColor: '#5B5FC7',
    position: 'absolute',
    bottom: -1,
    borderRadius: 999,
    zIndex: 2,
  },
  tabDivider: {
    height: 1,
    backgroundColor: Colors.grayLight,
    marginTop: 0,
    marginBottom: 6,
  },
  tabText: {
    fontSize: 13,
    color: Colors.grayMedium,
    fontWeight: '500',
  },
  tabTextActive: {
    color: Colors.white,
    fontWeight: '700',
  },
  loading: {
    marginVertical: 40,
  },
  emptyText: {
    textAlign: 'center',
    color: Colors.grayMedium,
    fontSize: 14,
    marginVertical: 40,
  },
  transactionsListViewport: {
    maxHeight: 330,
    position: 'relative',
  },
  transactionsListContent: {
    paddingBottom: 4,
    paddingRight: 8,
  },
  transactionsNextPageLoader: {
    marginVertical: 10,
  },
  transactionsScrollbarTrack: {
    position: 'absolute',
    top: 6,
    right: -6,
    bottom: 6,
    width: 3,
    borderRadius: 999,
    backgroundColor: 'rgba(0, 0, 0, 0.06)',
  },
  transactionsScrollbarThumb: {
    width: 3,
    borderRadius: 999,
    backgroundColor: '#979797',
  },
  footerGap: {
    height: 30,
  },
});
