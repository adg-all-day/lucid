import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Text from '../../../components/StyledText';
import Colors from '../../../constants/colors';

export default function ResetLinkInvalidState({ onBackToLogin }) {
  return (
    <View style={styles.container}>
      <Text style={styles.errorText}>Invalid or expired reset link.</Text>
      <Pressable style={styles.button} onPress={onBackToLogin}>
        <Text style={styles.buttonText}>Back to Login</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingTop: 30,
    gap: 16,
  },
  errorText: {
    color: Colors.error,
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 5,
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
});
