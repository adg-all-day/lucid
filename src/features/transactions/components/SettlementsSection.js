import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Text from '../../../components/StyledText';
import Colors from '../../../constants/colors';
import { ChevronRightSmall, PendingStarIcon } from '../../../icons';
import { formatAmount } from '../utils/formatters';

export default function SettlementsSection({
  settlements,
  transaction,
  emailToName,
  expandedPreconditions,
  setExpandedPreconditions,
  theme,
  isDark,
  onOpenStatement,
  styles,
}) {
  if (settlements.length === 0) return null;

  return (
    <View style={styles.sectionContainer}>
      <Text style={[styles.sectionTitle, { color: isDark ? theme.text : Colors.primary }]}>Settlements</Text>
      <View style={[styles.settlementsCard, { backgroundColor: theme.primary10 }]}>
        {settlements.map((item, index) => {
          const preconditions = item.preconditions || item.conditions || [];
          const preconditionsExpanded = expandedPreconditions[index] ?? false;
          const settlementCurrency = item.currency || transaction.currency;

          return (
            <View key={item.id || `settlement-${index}`}>
              <View style={styles.settlementHeader}>
                <Text style={[styles.settlementNumber, { color: theme.textSecondary }]}>{index + 1}.</Text>
                <Text style={[styles.settlementName, { color: theme.textSecondary }]}>
                  {item.description || `Settlement ${index + 1}`}
                </Text>
                <View style={styles.settlementStatus}>
                  <PendingStarIcon size={14} color={Colors.accent} />
                  <Text style={[styles.settlementStatusText, { color: Colors.accent }]}>
                    {item.status
                      ? item.status.charAt(0).toUpperCase() + item.status.slice(1).toLowerCase()
                      : 'Pending'}
                  </Text>
                </View>
              </View>

              <View style={styles.settlementDetails}>
                <View style={styles.settlementRow}>
                  <Text style={[styles.settlementLabel, { color: theme.text }]}>Value</Text>
                  <Text style={[styles.settlementValue, { color: theme.text }]}>
                    {item.amount_type === 'percentage'
                      ? `${settlementCurrency} ${Number(
                        ((item.value || 0) / 100) * (transaction.amount || 0),
                      ).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}`
                      : formatAmount(item.actual_amount || item.value, settlementCurrency, transaction)}
                  </Text>
                </View>
                <View style={styles.settlementRow}>
                  <Text style={[styles.settlementLabel, { color: theme.text }]}>Due From</Text>
                  <Text style={[styles.settlementValue, { color: theme.text }]}>
                    {(item.due_from && emailToName[item.due_from.toLowerCase()]) || item.due_from || '—'}
                  </Text>
                </View>
                <View style={styles.settlementRow}>
                  <Text style={[styles.settlementLabel, { color: theme.text }]}>Due To</Text>
                  <Text style={[styles.settlementValue, { color: theme.text }]}>
                    {(item.due_to && emailToName[item.due_to.toLowerCase()]) || item.due_to || '—'}
                  </Text>
                </View>
              </View>

              {preconditions.length > 0 ? (
                <View style={styles.preconditionsSection}>
                  <TouchableOpacity
                    style={styles.preconditionsToggle}
                    onPress={() =>
                      setExpandedPreconditions((prev) => ({
                        ...prev,
                        [index]: !prev[index],
                      }))
                    }
                  >
                    <Text style={[styles.preconditionsTitle, { color: isDark ? theme.text : '#2F6BC6' }]}>
                      Disbursement Preconditions
                    </Text>
                    <Ionicons
                      name={preconditionsExpanded ? 'chevron-up' : 'chevron-down'}
                      size={16}
                      color={isDark ? theme.icon : Colors.primary}
                    />
                  </TouchableOpacity>

                  {preconditionsExpanded ? (
                    <View style={[styles.preconditionsBox, { backgroundColor: theme.cardBg }]}>
                      {preconditions.map((cond, conditionIndex) => (
                        <View key={cond.id || `cond-${conditionIndex}`}>
                          {conditionIndex > 0 ? <View style={styles.preconditionDivider} /> : null}
                          <View style={styles.preconditionItem}>
                            <Text style={[styles.preconditionNumber, { color: theme.text }]}>{conditionIndex + 1}.</Text>
                            <View style={{ flex: 1 }}>
                              <Text style={[styles.preconditionDesc, { color: theme.text }]}>
                                {cond.description || cond.name || `Condition ${conditionIndex + 1}`}
                              </Text>
                              {(cond.parties || []).map((party, partyIndex) => (
                                <View key={partyIndex} style={styles.preconditionPartyRow}>
                                  <Text style={[styles.preconditionParty, { color: theme.text }]}>
                                    {party.name || party}
                                  </Text>
                                  <View style={[styles.checkbox, { backgroundColor: theme.cardBg }]}>
                                    {party.completed ? (
                                      <Ionicons
                                        name="checkmark"
                                        size={12}
                                        color={isDark ? theme.icon : Colors.primary}
                                      />
                                    ) : null}
                                  </View>
                                </View>
                              ))}
                            </View>
                          </View>
                        </View>
                      ))}
                    </View>
                  ) : null}
                </View>
              ) : null}

              {index < settlements.length - 1 ? <View style={styles.settlementDivider} /> : null}
            </View>
          );
        })}
      </View>

      <TouchableOpacity style={styles.viewStatementLink} onPress={onOpenStatement}>
        <View style={styles.inlineLinkRow}>
          <Text style={styles.viewStatementText}>View Settlement Statement</Text>
          <ChevronRightSmall />
        </View>
      </TouchableOpacity>
    </View>
  );
}
