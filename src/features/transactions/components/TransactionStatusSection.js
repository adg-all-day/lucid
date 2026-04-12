import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import Text from '../../../components/StyledText';
import Colors from '../../../constants/colors';
import {
  ActionRequiredIcon,
  AwaitingDeliveryIcon,
  StepperChevron,
} from '../../../icons';
import { formatActionLabel, getStatusLabel } from '../utils/formatters';

export default function TransactionStatusSection({
  transaction,
  stepData,
  theme,
  isDark,
  onOpenHistory,
  styles,
}) {
  return (
    <View style={styles.sectionContainer}>
      <Text style={[styles.sectionTitle, { color: isDark ? theme.text : Colors.primary }]}>
        Transaction Status
      </Text>

      <View style={[styles.statusCard, { backgroundColor: theme.primary10 }]}>
        <StepperChevron steps={stepData} />

        <View style={[styles.awaitingBadge, { backgroundColor: theme.accent17 }]}>
          <AwaitingDeliveryIcon size={18} color={isDark ? theme.icon : Colors.accent} />
          <Text style={[styles.awaitingBadgeText, { color: isDark ? theme.text : Colors.accent }]}>
            {getStatusLabel(transaction.current_stage || transaction.status)}
          </Text>
        </View>
        <Text style={[styles.statusNote, { color: theme.text }]}>
          {transaction.stage || getStatusLabel(transaction.current_stage || transaction.status)}
        </Text>

        <View style={[styles.actionRequiredBadge, isDark && { backgroundColor: '#5B5FC780' }]}>
          <ActionRequiredIcon size={18} color={isDark ? theme.icon : Colors.primary} />
          <Text style={[styles.actionRequiredBadgeText, { color: isDark ? theme.text : Colors.primary }]}>
            Action Required
          </Text>
        </View>
        <Text style={[styles.statusNote, { color: theme.text }]}>
          {transaction.viewer_next_required_action
            ? formatActionLabel(transaction.viewer_next_required_action)
            : 'None'}
        </Text>
      </View>

      <TouchableOpacity style={styles.historyLink} onPress={onOpenHistory}>
        <Text style={styles.historyLinkText}>Transaction History</Text>
      </TouchableOpacity>
    </View>
  );
}
