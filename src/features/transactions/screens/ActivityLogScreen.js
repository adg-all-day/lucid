import React, { useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import Header from '../../../components/Header';
import Text from '../../../components/StyledText';
import Colors from '../../../constants/colors';
import useTheme from '../../../hooks/useTheme';
import useUserStore from '../../../stores/userStore';
import ActivityLog from '../components/ActivityLog';
import useActivityLogQuery from '../hooks/useActivityLogQuery';

export default function ActivityLogScreen() {
  const theme = useTheme();
  const userName = useUserStore((state) => state.name);
  const userAvatar = useUserStore((state) => state.avatar);
  const [dateRange, setDateRange] = useState({ start: null, end: null });

  const activityQuery = useActivityLogQuery({
    limit: 200,
    startDate: dateRange.start,
    endDate: dateRange.end,
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header name={userName || 'there'} avatarUri={userAvatar} />
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
        <Text style={[styles.title, { color: theme.text }]}>Recent Activity</Text>
        <ActivityLog
          activityLog={activityQuery.data ?? []}
          onApplyDateFilter={setDateRange}
          isFiltering={activityQuery.isLoading || activityQuery.isRefetching}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  body: {
    flex: 1,
  },
  bodyContent: {
    paddingHorizontal: 11,
    paddingTop: 10,
    paddingBottom: 120,
  },
  title: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.primary,
    marginLeft: 10,
    marginBottom: 12,
  },
});
