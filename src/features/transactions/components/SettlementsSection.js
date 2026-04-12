import React, { useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Text from '../../../components/StyledText';
import Colors from '../../../constants/colors';
import { CheckedSquareIcon, PendingStarIcon, UncheckedSquareIcon } from '../../../icons';
import useUserStore from '../../../stores/userStore';
import { formatAmount } from '../utils/formatters';

const FALLBACK_PRECONDITIONS = [
  { id: 'fallback-1', description: 'Artwork authenticity documents must be reviewed by both counterparties' },
  { id: 'fallback-2', description: 'Delivery confirmation must be uploaded before acceptance is recorded' },
  { id: 'fallback-3', description: 'Buyer inspection approval must be completed before disbursement' },
];

export default function SettlementsSection({
  settlements,
  transaction,
  counterparties,
  emailToName,
  expandedPreconditions,
  setExpandedPreconditions,
  theme,
  isDark,
  onOpenStatement,
  styles,
}) {
  const [previewChecks, setPreviewChecks] = useState({});
  const userName = useUserStore((state) => state.name);
  const userEmail = useUserStore((state) => state.email);

  if (settlements.length === 0) return null;

  return (
    <View style={styles.sectionContainer}>
      <Text style={[styles.sectionTitle, { color: isDark ? theme.text : Colors.primary }]}>Settlements</Text>
      <View style={[styles.settlementsCard, { backgroundColor: theme.primary10 }]}>
        {settlements.map((item, index) => {
          const preconditions = item.preconditions || item.conditions || [];
          const fallbackParties = (counterparties || []).map((counterparty) => ({
            name: `${counterparty.first_name || ''} ${counterparty.last_name || ''}`.trim() || counterparty.email || 'Counterparty',
            email: counterparty.email || '',
            completed: false,
          }));
          const displayPreconditions = (
            preconditions.length > 0
              ? preconditions
              : FALLBACK_PRECONDITIONS.map((condition) => ({
                ...condition,
                parties: fallbackParties,
              }))
          );
          const preconditionsExpanded = expandedPreconditions[index] ?? false;
          const settlementCurrency = item.currency || transaction.currency;
          const usingFallbackPreconditions = preconditions.length === 0;

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
                  <Text style={[styles.preconditionsTitle, { color: Colors.primary }]}>
                    Disbursement Preconditions
                  </Text>
                  <Ionicons
                    name={preconditionsExpanded ? 'chevron-up' : 'chevron-down'}
                    size={16}
                    color={Colors.primary}
                  />
                </TouchableOpacity>

                {preconditionsExpanded ? (
                  <View
                    style={[
                      styles.preconditionsBox,
                      {
                        backgroundColor: isDark ? '#2B2B2B' : Colors.white,
                        borderColor: Colors.primary,
                      },
                    ]}
                  >
                    {displayPreconditions.map((cond, conditionIndex) => (
                      <View key={cond.id || `cond-${conditionIndex}`}>
                        {conditionIndex > 0 ? <View style={styles.preconditionDivider} /> : null}
                        <View style={styles.preconditionItem}>
                          <Text style={[styles.preconditionNumber, { color: theme.text }]}>
                            {conditionIndex + 1}.
                          </Text>
                          <View style={styles.preconditionContent}>
                            <Text style={[styles.preconditionDesc, { color: theme.text }]}>
                              {cond.description || cond.name || `Condition ${conditionIndex + 1}`}
                            </Text>
                            {(cond.parties || []).map((party, partyIndex) => (
                              (() => {
                                const partyLabel = party.name || party.email || party;
                                const partyEmail = typeof party === 'object' ? party.email || '' : '';
                                const isCurrentUser =
                                  (partyEmail && userEmail && partyEmail.toLowerCase() === userEmail.toLowerCase()) ||
                                  (partyLabel && userName && partyLabel.trim().toLowerCase() === userName.trim().toLowerCase());
                                const key = `${index}-${conditionIndex}-${partyIndex}`;
                                const isChecked = usingFallbackPreconditions
                                  ? !!previewChecks[key]
                                  : !!party.completed;

                                return (
                              <TouchableOpacity
                                key={`${cond.id || conditionIndex}-party-${partyIndex}`}
                                style={styles.preconditionPartyRow}
                                activeOpacity={usingFallbackPreconditions && isCurrentUser ? 0.7 : 1}
                                disabled={!usingFallbackPreconditions || !isCurrentUser}
                                onPress={() => {
                                  if (!usingFallbackPreconditions || !isCurrentUser) return;
                                  setPreviewChecks((current) => ({
                                    ...current,
                                    [key]: !current[key],
                                  }));
                                }}
                              >
                                <Text style={[styles.preconditionParty, { color: theme.text }]}>
                                  {partyLabel}
                                </Text>
                                {isChecked ? (
                                  <CheckedSquareIcon size={16} />
                                ) : (
                                  <UncheckedSquareIcon size={16} />
                                )}
                              </TouchableOpacity>
                                );
                              })()
                            ))}
                          </View>
                        </View>
                      </View>
                    ))}
                  </View>
                ) : null}
              </View>

              {index < settlements.length - 1 ? <View style={styles.settlementDivider} /> : null}
            </View>
          );
        })}
      </View>

      <TouchableOpacity style={styles.viewStatementLink} onPress={onOpenStatement}>
        <Text style={styles.viewStatementText}>View Settlement Statement</Text>
      </TouchableOpacity>
    </View>
  );
}
