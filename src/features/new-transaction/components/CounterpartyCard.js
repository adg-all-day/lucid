// A single counterparty card with all its fields: email, phone, role, name,
// notification preferences, signature required toggle, security section, and permissions.
// This is the biggest sub-component -- the original renderCounterparty was ~285 lines.

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Switch,
} from 'react-native';
import { useFormContext, Controller } from 'react-hook-form';
import { Ionicons } from '@expo/vector-icons';
import Text from '../../../components/StyledText';
import Colors from '../../../constants/colors';
import useTheme from '../../../hooks/useTheme';
import OutlinedField from '../../../components/OutlinedField';
import PickerModal from '../../../components/PickerModal';
import CounterpartyFilterIcon from '../../../icons/CounterpartyFilterIcon';
import CounterpartyTrashIcon from '../../../icons/CounterpartyTrashIcon';
import CounterpartyCollapseIcon from '../../../icons/CounterpartyCollapseIcon';
import PhotoIdIcon from '../../../icons/PhotoIdIcon';
import { PHONE_CODES, ROLES, formatType } from '../utils/constants';

// The little drag handle dots on the left side of the card
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
 * - index: which counterparty this is in the array
 * - onRemove: callback to remove this counterparty
 * - onToggleCollapse: callback to toggle collapsed state
 */
export default function CounterpartyCard({ index, onRemove, onToggleCollapse }) {
  const { watch, setValue, control } = useFormContext();
  const theme = useTheme();

  // Local state for picker modals
  const [showPhoneCodePicker, setShowPhoneCodePicker] = useState(false);
  const [showRolePicker, setShowRolePicker] = useState(false);

  // Watch the fields we need for conditional rendering
  const prefix = `counterparties.${index}`;
  const cp = watch(prefix);
  const collapsed = cp?.collapsed ?? false;

  // Helper to set a single field on this counterparty
  const setField = (field, value) => {
    setValue(`${prefix}.${field}`, value);
  };

  return (
    <View style={[styles.counterpartyCard, { backgroundColor: theme.isDark ? theme.modalBg : theme.surfaceLight }]}>
      <View style={{ flexDirection: 'row' }}>
        <View style={styles.counterpartyProgressBar}>
          <DragDots />
        </View>
        <View style={{ flex: 1, padding: 14, paddingLeft: 0 }}>
          {/* Header row: number badge, collapsed name, action buttons */}
          <View style={styles.counterpartyHeader}>
            <View style={styles.counterpartyNumber}>
              <Text style={styles.counterpartyNumberText}>{index + 1}</Text>
            </View>
            {collapsed && cp?.firstName ? (
              <Text style={styles.collapsedName} numberOfLines={1}>
                {cp.firstName} {cp.lastName ? cp.lastName.charAt(0) + '.' : ''}
              </Text>
            ) : (
              <View style={{ flex: 1 }} />
            )}
            <View style={{ flexDirection: 'row', flexShrink: 0, alignItems: 'center' }}>
              <TouchableOpacity onPress={() => {}}>
                <CounterpartyFilterIcon size={45} />
              </TouchableOpacity>
              <TouchableOpacity style={{ marginLeft: 8 }} onPress={onRemove}>
                <CounterpartyTrashIcon size={45} />
              </TouchableOpacity>
              <TouchableOpacity style={{ marginLeft: 8 }} onPress={onToggleCollapse}>
                <CounterpartyCollapseIcon size={45} collapsed={collapsed} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Everything below is hidden when collapsed */}
          {!collapsed && (
            <>
              {/* Email */}
              <OutlinedField label="Email" bgColor={theme.isDark ? theme.modalBg : 'white'}>
                <View style={styles.inputRow}>
                  <Controller
                    control={control}
                    name={`${prefix}.email`}
                    render={({ field: { onChange, value } }) => (
                      <TextInput
                        style={[styles.input, { flex: 1, borderWidth: 0, backgroundColor: theme.inputBg, color: theme.text }]}
                        value={value}
                        onChangeText={onChange}
                        placeholder="Email"
                        placeholderTextColor={theme.textSecondary}
                        keyboardType="email-address"
                      />
                    )}
                  />
                  <TouchableOpacity style={styles.searchIcon}>
                    <Ionicons name="search" size={18} color={Colors.white} />
                  </TouchableOpacity>
                </View>
              </OutlinedField>

              {/* Telephone */}
              <OutlinedField label="Telephone (Optional)" bgColor={theme.isDark ? theme.modalBg : 'white'}>
                <View style={styles.phoneRow}>
                  <TouchableOpacity
                    style={styles.phoneCode}
                    onPress={() => setShowPhoneCodePicker(true)}
                  >
                    <Text style={[styles.phoneCodeText, { color: theme.text }]}>{cp?.phoneCode || '+234'}</Text>
                    <Ionicons name="chevron-down" size={12} color={Colors.gray} />
                  </TouchableOpacity>
                  <View style={styles.phoneDivider} />
                  <Controller
                    control={control}
                    name={`${prefix}.phone`}
                    render={({ field: { onChange, value } }) => (
                      <TextInput
                        style={[styles.input, { flex: 1, borderWidth: 0, backgroundColor: theme.inputBg, color: theme.text }]}
                        value={value}
                        onChangeText={onChange}
                        placeholder="(0) 8041234567"
                        placeholderTextColor={theme.textSecondary}
                        keyboardType="phone-pad"
                      />
                    )}
                  />
                </View>
              </OutlinedField>

              {/* Role */}
              <OutlinedField label="Role" bgColor={theme.isDark ? theme.modalBg : 'white'}>
                <TouchableOpacity
                  style={[styles.dropdownInput, { backgroundColor: theme.inputBg }]}
                  onPress={() => setShowRolePicker(true)}
                >
                  <Text style={cp?.role ? [styles.dropdownText, { color: theme.text }] : styles.dropdownPlaceholder}>
                    {cp?.role ? formatType(cp.role) : 'Select Role'}
                  </Text>
                  <Ionicons name="chevron-down" size={16} color={Colors.gray} />
                </TouchableOpacity>
              </OutlinedField>

              {/* First Name */}
              <View style={styles.nameRow}>
                <View style={{ flex: 1 }}>
                  <OutlinedField label="First Name" bgColor={theme.isDark ? theme.modalBg : 'white'}>
                    <Controller
                      control={control}
                      name={`${prefix}.firstName`}
                      render={({ field: { onChange, value } }) => (
                        <TextInput
                          style={[styles.input, { backgroundColor: theme.inputBg, color: theme.text }]}
                          value={value}
                          onChangeText={onChange}
                          placeholderTextColor={theme.textSecondary}
                        />
                      )}
                    />
                  </OutlinedField>
                </View>
              </View>

              {/* Middle Name */}
              <OutlinedField label="Middle Name" bgColor={theme.isDark ? theme.modalBg : 'white'}>
                <Controller
                  control={control}
                  name={`${prefix}.middleName`}
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      style={[styles.input, { backgroundColor: theme.inputBg, color: theme.text }]}
                      value={value}
                      onChangeText={onChange}
                      placeholderTextColor={theme.textSecondary}
                    />
                  )}
                />
              </OutlinedField>

              {/* Last Name */}
              <OutlinedField label="Last Name" bgColor={theme.isDark ? theme.modalBg : 'white'}>
                <Controller
                  control={control}
                  name={`${prefix}.lastName`}
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      style={[styles.input, { backgroundColor: theme.inputBg, color: theme.text }]}
                      value={value}
                      onChangeText={onChange}
                      placeholderTextColor={theme.textSecondary}
                    />
                  )}
                />
              </OutlinedField>

              {/* Notification preferences */}
              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Notify Counterparty By:</Text>
              <View style={styles.checkboxRow}>
                <TouchableOpacity
                  style={styles.checkbox}
                  onPress={() => setField('notifyEmail', !cp?.notifyEmail)}
                >
                  <Ionicons
                    name={cp?.notifyEmail ? 'checkbox' : 'square-outline'}
                    size={20}
                    color={Colors.primary}
                  />
                  <Text style={[styles.checkboxLabel, { color: theme.text }]}>Email</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.checkbox}
                  onPress={() => setField('notifyText', !cp?.notifyText)}
                >
                  <Ionicons
                    name={cp?.notifyText ? 'checkbox' : 'square-outline'}
                    size={20}
                    color={Colors.primary}
                  />
                  <Text style={[styles.checkboxLabel, { color: theme.text }]}>Text Message</Text>
                </TouchableOpacity>
              </View>

              {/* Signature required toggle */}
              <View style={styles.signatureSection}>
                <View style={styles.signatureRow}>
                  <Text style={styles.signatureLabel}>Signature Required</Text>
                  <Switch
                    value={!!cp?.signatureRequired}
                    onValueChange={(val) => setField('signatureRequired', val)}
                    trackColor={{ true: Colors.primary }}
                  />
                </View>
              </View>

              {/* Security and Permissions -- only shown for non-first counterparties */}
              {index > 0 && (
                <>
                  <View style={{ marginVertical: 12 }} />
                  <View style={styles.sectionRow}>
                    <Text style={[styles.sectionTitle, { fontSize: 16 }]}>Security</Text>
                    <TouchableOpacity
                      onPress={() => {
                        setField('accessCode', '');
                        setField('requirePhotoId', false);
                        setField('privateMessage', '');
                      }}
                    >
                      <Ionicons name="trash-outline" size={20} color={Colors.error} />
                    </TouchableOpacity>
                  </View>
                  <Text style={[styles.securityNote, { color: theme.textSecondary }]}>
                    Provide this Access Code to the counterparty for access this transaction
                  </Text>

                  <OutlinedField label="Access Code (Optional)" bgColor={theme.isDark ? theme.modalBg : 'white'}>
                    <Controller
                      control={control}
                      name={`${prefix}.accessCode`}
                      render={({ field: { onChange, value } }) => (
                        <TextInput
                          style={[styles.input, { backgroundColor: theme.inputBg, color: theme.text }]}
                          value={value}
                          onChangeText={onChange}
                          placeholderTextColor={theme.textSecondary}
                        />
                      )}
                    />
                  </OutlinedField>

                  <TouchableOpacity>
                    <Text style={styles.linkText}>Generate Access Code for Me</Text>
                  </TouchableOpacity>

                  <View style={styles.toggleRow}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <PhotoIdIcon size={18} />
                      <Text style={[styles.toggleLabel, { color: theme.text }]}>Require Photo ID verification</Text>
                    </View>
                    <Switch
                      value={cp?.requirePhotoId ?? false}
                      onValueChange={(v) => setField('requirePhotoId', v)}
                      trackColor={{ false: Colors.grayMedium, true: Colors.primaryLight }}
                      thumbColor={cp?.requirePhotoId ? Colors.primary : Colors.grayMedium}
                    />
                  </View>

                  <OutlinedField label="Private Message (0/1000)" bgColor={theme.isDark ? theme.modalBg : 'white'}>
                    <Controller
                      control={control}
                      name={`${prefix}.privateMessage`}
                      render={({ field: { onChange, value } }) => (
                        <TextInput
                          style={[styles.input, styles.textArea, { backgroundColor: theme.inputBg, color: theme.text }]}
                          value={value}
                          onChangeText={onChange}
                          multiline
                          numberOfLines={3}
                          placeholder="Enter private message..."
                          placeholderTextColor={theme.textSecondary}
                        />
                      )}
                    />
                  </OutlinedField>

                  {/* Permissions grid */}
                  <View style={{ marginVertical: 12 }} />
                  <View style={styles.sectionRow}>
                    <Text style={[styles.sectionTitle, { fontSize: 16, color: theme.text, fontWeight: '400' }]}>
                      Permissions
                    </Text>
                  </View>
                  <Text style={[styles.securityNote, { color: theme.text }]}>
                    Actions this Counterparty can perform on this transaction
                  </Text>

                  <View style={styles.permissionsGrid}>
                    {[
                      ['addCounterparty', 'Add Counterparty'],
                      ['deleteCounterparty', 'Delete Counterparty'],
                      ['uploadDocuments', 'Upload Documents'],
                      ['deleteDocuments', 'Delete Documents'],
                      ['addSettlement', 'Add Settlement'],
                      ['editSettlement', 'Edit Settlement'],
                    ].map(([key, label]) => (
                      <TouchableOpacity
                        key={key}
                        style={styles.permissionItem}
                        onPress={() => {
                          const current = cp?.permissions?.[key] ?? false;
                          setValue(`${prefix}.permissions.${key}`, !current);
                        }}
                      >
                        <Ionicons
                          name={cp?.permissions?.[key] ? 'checkbox' : 'square-outline'}
                          size={20}
                          color={Colors.gray}
                        />
                        <Text style={[styles.permissionLabel, { color: theme.text }]}>{label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}
            </>
          )}
        </View>
      </View>

      {/* Picker modals */}
      <PickerModal
        visible={showPhoneCodePicker}
        onClose={() => setShowPhoneCodePicker(false)}
        onSelect={(item) => setField('phoneCode', item.value)}
        items={PHONE_CODES}
        title="Select Country Code"
        searchable
      />
      <PickerModal
        visible={showRolePicker}
        onClose={() => setShowRolePicker(false)}
        onSelect={(item) => setField('role', item.value)}
        items={ROLES}
        title="Select Role"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  counterpartyCard: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 5,
    marginBottom: 14,
    backgroundColor: '#F5F5F5',
    overflow: 'hidden',
  },
  counterpartyProgressBar: {
    width: 20,
    backgroundColor: '#EFEEFA',
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterpartyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  counterpartyNumber: {
    width: 50,
    height: 45,
    borderRadius: 10,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterpartyNumberText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  collapsedName: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.primary,
    marginLeft: 10,
    flex: 1,
    flexShrink: 1,
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
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 5,
    overflow: 'hidden',
  },
  searchIcon: {
    width: 45,
    alignSelf: 'stretch',
    backgroundColor: Colors.primary,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 5,
    overflow: 'hidden',
  },
  phoneCode: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  phoneCodeText: {
    fontSize: 14,
    color: Colors.black,
  },
  phoneDivider: {
    width: 1,
    height: 17,
    backgroundColor: Colors.border,
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
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
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
  nameRow: {
    flexDirection: 'row',
    gap: 10,
  },
  inputLabel: {
    fontSize: 12,
    color: Colors.gray,
    marginBottom: 4,
    marginTop: 10,
  },
  checkboxRow: {
    flexDirection: 'row',
    gap: 20,
    marginVertical: 8,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  checkboxLabel: {
    fontSize: 13,
    color: Colors.black,
  },
  signatureSection: {
    marginTop: 8,
  },
  signatureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: Colors.primaryLight,
    gap: 10,
  },
  signatureLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.primary,
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '500',
    color: Colors.primary,
    marginBottom: 8,
  },
  securityNote: {
    fontSize: 13,
    color: Colors.gray,
    marginBottom: 10,
  },
  linkText: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '500',
    marginTop: 8,
    textDecorationLine: 'underline',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
  },
  toggleLabel: {
    fontSize: 14,
    color: Colors.black,
  },
  permissionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginVertical: 8,
  },
  permissionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    width: '45%',
  },
  permissionLabel: {
    fontSize: 13,
    color: Colors.black,
  },
});
