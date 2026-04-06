// A single settlement card. Shows description, value (fixed or percentage),
// currency picker, and due-from/due-to dropdowns that select counterparty emails.
// The fixed/percentage toggle is that nice little pill switcher.

import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { useFormContext, Controller } from 'react-hook-form';
import { Ionicons } from '@expo/vector-icons';
import Text from '../../../components/StyledText';
import Colors from '../../../constants/colors';
import OutlinedField from '../../../components/OutlinedField';
import PickerModal from '../../../components/PickerModal';
import CounterpartyTrashIcon from '../../../icons/CounterpartyTrashIcon';
import CounterpartyCollapseIcon from '../../../icons/CounterpartyCollapseIcon';
import { CURRENCIES, getCurrencyDisplay } from '../utils/constants';

// Drag dots for the left gutter
function DragDots() {
  return (
    <View style={styles.dragDotsContainer}>
      {[0, 1, 2].map((row) => (
        <View key={row} style={styles.dragDotsRow}>
          <View style={styles.dragDot} />
          <View style={styles.dragDot} />
        </View>
      ))}
    </View>
  );
}

/**
 * Props:
 * - index: position in the settlements array
 * - onRemove: callback to delete this settlement
 * - counterpartyNames: array of { label, value } for the due from/to pickers
 *   (value should be the counterparty email, not the display name)
 */
export default function SettlementCard({ index, onRemove, counterpartyNames }) {
  const { watch, setValue, control } = useFormContext();

  // Local picker state
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
  const [showDueFromPicker, setShowDueFromPicker] = useState(false);
  const [showDueToPicker, setShowDueToPicker] = useState(false);

  const prefix = `settlements.${index}`;
  const settlement = watch(prefix);
  const collapsed = settlement?.collapsed ?? false;

  return (
    <View style={styles.settlementCard}>
      <View style={{ flexDirection: 'row' }}>
        <View style={styles.progressBar}>
          <DragDots />
        </View>
        <View style={{ flex: 1, padding: collapsed ? 4 : 14, paddingLeft: 0 }}>
          {/* Header */}
          <View style={[styles.header, { marginBottom: collapsed ? 0 : 8 }]}>
            {collapsed && settlement?.description ? (
              <Text style={styles.collapsedName} numberOfLines={1}>{settlement.description}</Text>
            ) : (
              <View style={{ flex: 1 }} />
            )}
            <View style={{ flexDirection: 'row', flexShrink: 0, alignItems: 'center' }}>
              <TouchableOpacity style={{ marginLeft: 8 }} onPress={onRemove}>
                <CounterpartyTrashIcon size={45} />
              </TouchableOpacity>
              <TouchableOpacity
                style={{ marginLeft: 8 }}
                onPress={() => setValue(`${prefix}.collapsed`, !collapsed)}
              >
                <CounterpartyCollapseIcon size={45} collapsed={collapsed} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Expanded content */}
          {!collapsed && (
            <>
              {/* Description row with number */}
              <View style={styles.settlementHeader}>
                <Text style={styles.documentNumber}>{index + 1}.</Text>
                <View style={{ flex: 1 }}>
                  <OutlinedField label="Description" bgColor="white">
                    <Controller
                      control={control}
                      name={`${prefix}.description`}
                      render={({ field: { onChange, value } }) => (
                        <TextInput
                          style={styles.input}
                          value={value}
                          onChangeText={onChange}
                          placeholder="Description"
                        />
                      )}
                    />
                  </OutlinedField>
                </View>
              </View>

              <View style={styles.settlementFields}>
                {/* Value field -- changes display based on fixed vs percentage */}
                <OutlinedField label="Value" bgColor="white">
                  {settlement?.isFixed ? (
                    <View style={styles.valueRow}>
                      <TouchableOpacity
                        style={styles.currencyBadge}
                        onPress={() => setShowCurrencyPicker(true)}
                      >
                        <Text style={styles.currencyText}>
                          {getCurrencyDisplay(settlement?.currency || 'USD')}
                        </Text>
                        <Ionicons name="chevron-down" size={14} color={Colors.gray} />
                      </TouchableOpacity>
                      <Controller
                        control={control}
                        name={`${prefix}.value`}
                        render={({ field: { onChange, value } }) => (
                          <TextInput
                            style={[styles.input, { flex: 1, borderWidth: 0 }]}
                            value={value}
                            onChangeText={onChange}
                            placeholder="0.00"
                            keyboardType="numeric"
                          />
                        )}
                      />
                    </View>
                  ) : (
                    <View style={styles.valueRow}>
                      <View style={styles.currencyBadge}>
                        <Text style={styles.currencyText}>%</Text>
                        <Ionicons name="chevron-down" size={14} color={Colors.gray} />
                      </View>
                      <Controller
                        control={control}
                        name={`${prefix}.value`}
                        render={({ field: { onChange, value } }) => (
                          <TextInput
                            style={[styles.input, { flex: 1, borderWidth: 0 }]}
                            value={value}
                            onChangeText={onChange}
                            placeholder="0%"
                            keyboardType="numeric"
                          />
                        )}
                      />
                    </View>
                  )}
                </OutlinedField>

                {/* Fixed / Percentage toggle */}
                <TouchableOpacity
                  style={styles.pillToggleRow}
                  onPress={() => setValue(`${prefix}.isFixed`, !settlement?.isFixed)}
                >
                  <Text style={[styles.pillToggleText, settlement?.isFixed && styles.pillToggleTextActive]}>
                    Fixed Amount
                  </Text>
                  <View style={styles.pillTrack}>
                    <View style={[styles.pillThumb, !settlement?.isFixed && styles.pillThumbRight]} />
                  </View>
                  <Text style={[styles.pillToggleText, !settlement?.isFixed && styles.pillToggleTextActive]}>
                    Percentage
                  </Text>
                </TouchableOpacity>

                {/* Due From picker */}
                <OutlinedField label="Due From" bgColor="white">
                  <TouchableOpacity
                    style={styles.dropdownInput}
                    onPress={() => setShowDueFromPicker(true)}
                  >
                    <Text style={settlement?.dueFrom ? styles.dropdownText : styles.dropdownPlaceholder}>
                      {settlement?.dueFrom || 'Select counterparty'}
                    </Text>
                    <Ionicons name="chevron-down" size={16} color={Colors.gray} />
                  </TouchableOpacity>
                </OutlinedField>

                {/* Due To picker */}
                <OutlinedField label="Due To" bgColor="white">
                  <TouchableOpacity
                    style={styles.dropdownInput}
                    onPress={() => setShowDueToPicker(true)}
                  >
                    <Text style={settlement?.dueTo ? styles.dropdownText : styles.dropdownPlaceholder}>
                      {settlement?.dueTo || 'Select counterparty'}
                    </Text>
                    <Ionicons name="chevron-down" size={16} color={Colors.gray} />
                  </TouchableOpacity>
                </OutlinedField>
              </View>
            </>
          )}
        </View>
      </View>

      {/* Picker modals */}
      <PickerModal
        visible={showCurrencyPicker}
        onClose={() => setShowCurrencyPicker(false)}
        onSelect={(item) => setValue(`${prefix}.currency`, item.value)}
        items={CURRENCIES}
        title="Select Currency"
        searchable
      />
      <PickerModal
        visible={showDueFromPicker}
        onClose={() => setShowDueFromPicker(false)}
        onSelect={(item) => setValue(`${prefix}.dueFrom`, item.value)}
        items={counterpartyNames}
        title="Select Due From"
      />
      <PickerModal
        visible={showDueToPicker}
        onClose={() => setShowDueToPicker(false)}
        onSelect={(item) => setValue(`${prefix}.dueTo`, item.value)}
        items={counterpartyNames}
        title="Select Due To"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  settlementCard: {
    marginBottom: 14,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBar: {
    width: 20,
    backgroundColor: '#EFEEFA',
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  collapsedName: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.primary,
    marginLeft: 10,
    flex: 1,
    flexShrink: 1,
  },
  settlementHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  documentNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.black,
    marginTop: 28,
  },
  settlementFields: {
    marginLeft: 20,
  },
  input: {
    minHeight: 45,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 5,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.black,
    backgroundColor: Colors.white,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 45,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 5,
    overflow: 'hidden',
  },
  currencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 10,
    gap: 4,
    borderRightWidth: 1,
    borderRightColor: Colors.border,
  },
  currencyText: {
    fontSize: 14,
    color: Colors.black,
    fontWeight: '500',
  },
  dropdownInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 45,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 5,
    paddingHorizontal: 12,
    backgroundColor: Colors.white,
  },
  dropdownPlaceholder: {
    fontSize: 14,
    color: Colors.gray,
  },
  dropdownText: {
    fontSize: 14,
    color: Colors.black,
  },
  pillToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 8,
  },
  pillToggleText: {
    fontSize: 13,
    color: Colors.gray,
  },
  pillToggleTextActive: {
    color: Colors.black,
    fontWeight: '500',
  },
  pillTrack: {
    width: 32,
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  pillThumb: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
    alignSelf: 'flex-start',
  },
  pillThumbRight: {
    alignSelf: 'flex-end',
  },
  dragDotsContainer: {
    gap: 4,
  },
  dragDotsRow: {
    flexDirection: 'row',
    gap: 4,
  },
  dragDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#C5C6E8',
  },
});
