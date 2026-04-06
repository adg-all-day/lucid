// The horizontal scrolling stats cards shown at the top of the home screen.
// Each card shows a count (all transactions, action required, open, closed)
// with an icon next to it.

import React from 'react';
import { View, StyleSheet } from 'react-native';
import Text from '../../../components/StyledText';
import Colors from '../../../constants/colors';

// Icons are being moved to the shared icons directory by another workstream,
// so we import from there to stay ahead of the migration.
import TransferIcon from '../../../icons/TransferIcon';
import UserTimeIcon from '../../../icons/UserTimeIcon';
import UnlockIcon from '../../../icons/UnlockIcon';
import LockIcon from '../../../icons/LockIcon';

// The card definitions -- which icon, label, and stats key each card uses.
// Kept here rather than in constants since it's tightly coupled to this component.
const STAT_CARDS = [
  { id: '1', icon: 'transfer', label: 'All\nTransactions', countKey: 'all' },
  { id: '2', icon: 'user-time', label: 'Action\nRequired', countKey: 'actionRequired' },
  { id: '3', icon: 'unlock', label: 'Open\nTransactions', countKey: 'open' },
  { id: '4', icon: 'lock', label: 'Closed\nTransactions', countKey: 'closed' },
];

// Picks the right icon component based on the string identifier
const renderIcon = (iconName) => {
  switch (iconName) {
    case 'transfer':
      return <TransferIcon size={20} color={Colors.white} />;
    case 'user-time':
      return <UserTimeIcon size={20} color={Colors.white} />;
    case 'unlock':
      return <UnlockIcon size={20} color={Colors.white} />;
    case 'lock':
      return <LockIcon size={20} color={Colors.white} />;
    default:
      return null;
  }
};

export default function TransactionStats({ stats }) {
  return (
    <View style={styles.statsSection}>
      <View style={styles.statsContainer}>
        {STAT_CARDS.map((item) => (
          <View key={item.id} style={styles.statCard}>
            <View style={styles.statTopRow}>
              <View style={styles.statIconArea}>{renderIcon(item.icon)}</View>
              <Text style={styles.statCount}>{stats[item.countKey] || 0}</Text>
            </View>
            <Text style={styles.statLabel}>{item.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// Styles match the HomeScreen originals exactly
const styles = StyleSheet.create({
  statsSection: {
    height: 112,
    justifyContent: 'center',
    backgroundColor: 'rgba(91, 95, 199, 0.05)',
    marginTop: 10,
  },
  statsContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    padding: 10,
    height: 81,
    width: 92,
    borderWidth: 1,
    borderColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 16,
  },
  statIconArea: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statTextArea: {
    marginTop: 6,
    alignItems: 'center',
  },
  statCount: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.white,
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '300',
    color: Colors.white,
    textAlign: 'center',
    lineHeight: 11,
    marginTop: 8,
  },
});
