//checkBack01 
//place holder screen for the contact us tab

import React from 'react';
import { View, StyleSheet } from 'react-native';
import Text from '../components/StyledText';
import Colors from '../constants/colors';

export default function ContactUsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Contact Us</Text>
      <Text style={styles.subtitle}>Get in touch with our team</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.primary,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.gray,
    marginTop: 8,
  },
});
