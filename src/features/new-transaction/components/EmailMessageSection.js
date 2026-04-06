// The email subject + message section at the bottom of the form.
// Sits in a grey card to visually separate it from the rest.

import React from 'react';
import { View, StyleSheet, TextInput } from 'react-native';
import { useFormContext, Controller } from 'react-hook-form';
import Colors from '../../../constants/colors';
import OutlinedField from '../../../components/OutlinedField';

export default function EmailMessageSection() {
  const { control } = useFormContext();

  return (
    <View style={styles.emailCard}>
      <OutlinedField label="Email Subject" bgColor="#F5F5F5">
        <Controller
          control={control}
          name="emailSubject"
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={[styles.input, { backgroundColor: Colors.white }]}
              value={value}
              onChangeText={onChange}
              placeholder=""
            />
          )}
        />
      </OutlinedField>

      <OutlinedField label="Email Message" bgColor="#F5F5F5">
        <Controller
          control={control}
          name="emailMessage"
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={[styles.input, styles.textArea, { minHeight: 115, backgroundColor: Colors.white }]}
              value={value}
              onChangeText={onChange}
              multiline
              numberOfLines={4}
              placeholder=""
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
