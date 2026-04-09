import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import Text from '../../../components/StyledText';
import { ExclamationIcon, NudgeIcon } from '../../../icons';
import Colors from '../../../constants/colors';

export default function CounterpartiesSection({
  counterparties,
  theme,
  isDark,
  onNudge,
  resendPending,
  styles,
}) {
  return (
    <View style={styles.sectionContainer}>
      <Text style={[styles.sectionTitle, { color: isDark ? theme.text : Colors.primary }]}>
        Counterparties
      </Text>

      <View style={[styles.counterpartiesCard, { backgroundColor: theme.primary10 }]}>
        {counterparties.map((cp, index) => (
          <View key={cp.id || `${cp.email}-${index}`}>
            <View style={styles.cpBlock}>
              <View style={styles.cpTopRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.cpName, { color: theme.text }]}>
                    {cp.first_name} {cp.middle_name ? `${cp.middle_name} ` : ''}{cp.last_name}
                  </Text>
                  <Text style={[styles.cpRole, { color: theme.text }]}>
                    {cp.role ? cp.role.charAt(0).toUpperCase() + cp.role.slice(1) : 'Counterparty'}
                  </Text>
                </View>
                {cp.next_required_action ? (
                  <View style={[styles.cpActionBadge, isDark && { backgroundColor: '#FCE8EC' }]}>
                    <ExclamationIcon size={14} />
                    <Text style={styles.cpActionText}> Action Required</Text>
                  </View>
                ) : (
                  <View style={[styles.cpNoActionBadge, isDark && { backgroundColor: '#E6F5F0' }]}>
                    <Text style={styles.cpNoActionText}>No Action Required</Text>
                  </View>
                )}
              </View>
              <View style={styles.cpBottomRow}>
                <Text style={[styles.cpEmail, { color: theme.text }]} numberOfLines={1}>
                  {cp.email}
                </Text>
                {cp.next_required_action ? (
                  <TouchableOpacity
                    style={styles.nudgeBtn}
                    disabled={resendPending}
                    onPress={() => onNudge(cp)}
                  >
                    <NudgeIcon size={14} color={Colors.white} />
                    <Text style={styles.nudgeBtnText}>Nudge</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>
            {index < counterparties.length - 1 ? <View style={styles.cpDivider} /> : null}
          </View>
        ))}
      </View>
    </View>
  );
}
