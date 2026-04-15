// Thin wrapper over OutlinedField that handles the red-asterisk "required"
// label style used across the settings designs. Also standardises the
// embedded TextInput so sections don't re-state padding/color every time.

import React from 'react';
import { TextInput, StyleSheet, View } from 'react-native';
import Text from '../../../components/StyledText';
import Colors from '../../../constants/colors';
import useTheme from '../../../hooks/useTheme';
import OutlinedField from '../../../components/OutlinedField';

export default function SettingsField({
  label,
  value,
  onChangeText,
  required,
  placeholder,
  keyboardType,
  editable = true,
  secureTextEntry,
  autoCapitalize,
}) {
  const theme = useTheme();
  const displayLabel = required ? (
    <Text style={{ color: theme.textSecondary, fontSize: 12 }}>
      {label}
      <Text style={{ color: Colors.error }}>*</Text>
    </Text>
  ) : (
    label
  );

  return (
    <OutlinedField label={displayLabel} bgColor={theme.cardBgSolid}>
      <View style={[styles.inputWrap, { backgroundColor: theme.cardBgSolid, borderColor: theme.divider }]}>
        <TextInput
          style={[styles.input, { color: theme.text }]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.textSecondary}
          keyboardType={keyboardType}
          editable={editable}
          secureTextEntry={secureTextEntry}
          autoCapitalize={autoCapitalize}
        />
      </View>
    </OutlinedField>
  );
}

const styles = StyleSheet.create({
  inputWrap: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
  },
  input: {
    fontSize: 14,
    paddingTop: 8,
    paddingBottom: 10,
    margin: 0,
    textAlignVertical: 'center',
  },
});
