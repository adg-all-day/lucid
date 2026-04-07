// The email subject + message section at the bottom of the form.
// Sits in a grey card to visually separate it from the rest.

import React from 'react';
import { View, StyleSheet, TextInput } from 'react-native';
import { useFormContext, Controller } from 'react-hook-form';
import Colors from '../../../constants/colors';
import useTheme from '../../../hooks/useTheme';
import OutlinedField from '../../../components/OutlinedField';

export default function EmailMessageSection() {
  const { control } = useFormContext();
  const theme = useTheme();

  return (
    <View style={[styles.emailCard, { backgroundColor: theme.isDark ? theme.modalBg : theme.surfaceLight }]}>
      <OutlinedField label="Email Subject" bgColor={theme.isDark ? theme.modalBg : 'white'}>
        <Controller
          control={control}
          name="emailSubject"
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={[styles.input, { backgroundColor: theme.inputBg, color: theme.text }]}
              value={value}
              onChangeText={onChange}
              placeholder=""
              placeholderTextColor={theme.textSecondary}
            />
          )}
        />
      </OutlinedField>

      <OutlinedField label="Email Message" bgColor={theme.isDark ? theme.modalBg : 'white'}>
        <Controller
          control={control}
          name="emailMessage"
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={[styles.input, styles.textArea, { minHeight: 115, backgroundColor: theme.inputBg, color: theme.text }]}
              value={value}
              onChangeText={onChange}
              multiline
              numberOfLines={4}
              placeholder=""
              placeholderTextColor={theme.textSecondary}
            />
          )}
        />
      </OutlinedField>
    </View>
  );
}

const styles = StyleSheet.create({
  emailCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 5,
    padding: 12,
    paddingTop: 4,
    marginTop: 10,
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
});
