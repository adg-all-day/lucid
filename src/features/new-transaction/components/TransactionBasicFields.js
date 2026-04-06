// The top section of the new transaction form: type dropdown, description,
// value + currency row, and closing date picker.
// Uses react-hook-form's useFormContext so it stays in sync with the parent form.

import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput, Platform } from 'react-native';
import { useFormContext, Controller } from 'react-hook-form';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import Text from '../../../components/StyledText';
import Colors from '../../../constants/colors';
import OutlinedField from '../../../components/OutlinedField';
import PickerModal from '../../../components/PickerModal';
import { TRANSACTION_TYPES, CURRENCIES, getCurrencyDisplay, formatType, formatDate } from '../utils/constants';

export default function TransactionBasicFields() {
  const { watch, setValue, control } = useFormContext();

  // Local state for picker modals and the date picker
  const [showTypePicker, setShowTypePicker] = useState(false);
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const transactionType = watch('transactionType');
  const currency = watch('currency');
  const closingDate = watch('closingDate');

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setValue('closingDate', selectedDate);
    }
  };

  return (
    <>
      {/* Transaction Type */}
      <OutlinedField label="Transaction Type">
        <TouchableOpacity style={styles.dropdownInput} onPress={() => setShowTypePicker(true)}>
          <Text style={transactionType ? styles.dropdownText : styles.dropdownPlaceholder}>
            {transactionType ? formatType(transactionType) : 'Select Transaction Type'}
          </Text>
          <Ionicons name="chevron-down" size={16} color={Colors.gray} />
        </TouchableOpacity>
      </OutlinedField>

      {/* Description */}
      <Controller
        control={control}
        name="description"
        render={({ field: { onChange, value } }) => (
          <OutlinedField label="Description">
            <TextInput
              style={styles.input}
              placeholder="Enter Description"
              value={value}
              onChangeText={onChange}
            />
          </OutlinedField>
        )}
      />

      {/* Transaction Value + Closing Date side by side */}
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <OutlinedField label="Transaction Value">
            <View style={styles.valueRow}>
              <TouchableOpacity
                style={styles.currencyBadge}
                onPress={() => setShowCurrencyPicker(true)}
              >
                <Text style={styles.currencyText}>{getCurrencyDisplay(currency)}</Text>
                <Ionicons name="chevron-down" size={14} color={Colors.gray} />
              </TouchableOpacity>
              <Controller
                control={control}
                name="transactionValue"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={[styles.input, { flex: 1, borderWidth: 0, fontSize: 12, minHeight: 0, paddingVertical: 0 }]}
                    placeholder="88,888,888,888.00"
                    value={value}
                    onChangeText={onChange}
                    keyboardType="numeric"
                  />
                )}
              />
            </View>
          </OutlinedField>
        </View>
        <View style={{ width: 12 }} />
        <View style={{ flex: 0.7 }}>
          <OutlinedField label="Closing Date">
            <TouchableOpacity
              style={styles.dropdownInput}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={closingDate ? styles.dropdownText : styles.dropdownPlaceholder}>
                {closingDate ? formatDate(closingDate) : 'dd/mm/yyyy'}
              </Text>
              <Ionicons name="calendar-outline" size={16} color={Colors.gray} />
            </TouchableOpacity>
          </OutlinedField>
        </View>
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={closingDate || new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          minimumDate={new Date()}
        />
      )}

      {/* Picker modals */}
      <PickerModal
        visible={showTypePicker}
        onClose={() => setShowTypePicker(false)}
        onSelect={(item) => setValue('transactionType', item.value)}
        items={TRANSACTION_TYPES}
        title="Select Transaction Type"
      />
      <PickerModal
        visible={showCurrencyPicker}
        onClose={() => setShowCurrencyPicker(false)}
        onSelect={(item) => setValue('currency', item.value)}
        items={CURRENCIES}
        title="Select Currency"
        searchable
      />
    </>
  );
}

const styles = StyleSheet.create({
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
  row: {
    flexDirection: 'row',
    marginTop: 4,
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
});
