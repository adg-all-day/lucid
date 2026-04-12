import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import Text from '../../../components/StyledText';
import {
  ExclamationIcon,
  NudgeIcon,
  UnverifiedShieldIcon,
  VerifiedShieldIcon,
} from '../../../icons';
import Colors from '../../../constants/colors';
import useUserStore from '../../../stores/userStore';

export default function CounterpartiesSection({
  counterparties,
  theme,
  isDark,
  onNudge,
  resendPending,
  styles,
}) {
  const userEmail = useUserStore((state) => state.email);
  const userName = useUserStore((state) => state.name);

  const isVerifiedCounterparty = (counterparty) =>
    String(counterparty?.persona_status || '').toLowerCase() === 'approved';

  const isCurrentUserCounterparty = (counterparty) => {
    const counterpartyEmail = String(counterparty?.email || '').toLowerCase();
    const counterpartyName = `${counterparty?.first_name || ''} ${counterparty?.last_name || ''}`.trim().toLowerCase();
    return (
      (counterpartyEmail && userEmail && counterpartyEmail === String(userEmail).toLowerCase()) ||
      (counterpartyName && userName && counterpartyName === String(userName).trim().toLowerCase())
    );
  };

  return (
    <View style={styles.sectionContainer}>
      <Text style={[styles.sectionTitle, { color: isDark ? theme.text : Colors.primary }]}>
        Counterparties
      </Text>

      <View style={[styles.counterpartiesCard, { backgroundColor: theme.primary10 }]}>
        {counterparties.map((cp, index) => (
          <View key={cp.id || `${cp.email}-${index}`}>
            <View style={styles.cpBlock}>
              <View style={styles.cpContentRow}>
                <View style={styles.cpLeftColumn}>
                  <View style={styles.cpNameRow}>
                    <View style={styles.cpVerificationBadgeWrap}>
                      {isVerifiedCounterparty(cp) ? (
                        <VerifiedShieldIcon size={18} />
                      ) : (
                        <UnverifiedShieldIcon size={18} />
                      )}
                    </View>
                    <View style={styles.cpNameTextBlock}>
                      <Text
                        style={[styles.cpName, { color: theme.text }]}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {cp.first_name} {cp.middle_name ? `${cp.middle_name} ` : ''}{cp.last_name}
                      </Text>
                      <Text style={[styles.cpRole, { color: theme.text }]}>
                        {cp.role ? cp.role.charAt(0).toUpperCase() + cp.role.slice(1) : 'Counterparty'}
                      </Text>
                      <Text
                        style={[styles.cpEmail, { color: theme.text }]}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {cp.email}
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={styles.cpRightColumn}>
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
                  {cp.next_required_action && !isCurrentUserCounterparty(cp) ? (
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
            </View>
            {index < counterparties.length - 1 ? <View style={styles.cpDivider} /> : null}
          </View>
        ))}
      </View>
    </View>
  );
}
