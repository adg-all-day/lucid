// The two action buttons at the bottom: Save as Draft and Submit.
// Pretty straightforward -- just takes callbacks and a loading state.

import React from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import Text from '../../../components/StyledText';
import Colors from '../../../constants/colors';

/**
 * Props:
 * - onDraft: called when "Save as Draft" is pressed
 * - onSubmit: called when "Submit" is pressed
 * - savingDraft: shows a spinner on the draft button when true
 * - submitting: shows a spinner on the submit button when true
 */
export default function FormActions({ onDraft, onSubmit, savingDraft = false, submitting }) {
  return (
    <View style={styles.actionRow}>
      <TouchableOpacity style={styles.draftBtn} onPress={onDraft} disabled={savingDraft || submitting}>
        {savingDraft ? (
          <ActivityIndicator color={Colors.white} />
        ) : (
          <Text style={styles.draftBtnText}>Save as Draft</Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity style={styles.submitBtn} onPress={onSubmit} disabled={savingDraft || submitting}>
        {submitting ? (
          <ActivityIndicator color={Colors.primary} />
        ) : (
          <Text style={styles.submitBtnText}>Submit</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  draftBtn: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: 5,
    paddingVertical: 10,
    alignItems: 'center',
  },
  draftBtnText: {
    color: Colors.white,
    fontWeight: '500',
    fontSize: 13,
  },
  submitBtn: {
    flex: 1,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 5,
    paddingVertical: 10,
    alignItems: 'center',
  },
  submitBtnText: {
    color: Colors.primary,
    fontWeight: '500',
    fontSize: 13,
  },
});
