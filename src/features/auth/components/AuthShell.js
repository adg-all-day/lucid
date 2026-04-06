import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Text from '../../../components/StyledText';
import LucidLogo from '../../../icons/LucidLogo';
import Colors from '../../../constants/colors';

export default function AuthShell({ title, children }) {
  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <View style={styles.headerBand}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <LucidLogo size={22} />
        </View>
      </View>
      <View style={styles.content}>
        <View style={styles.card}>{children}</View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  headerBand: {
    backgroundColor: Colors.primary,
  },
  header: {
    height: 70,
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  title: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    backgroundColor: '#F7F7F7',
    paddingHorizontal: 8,
    paddingTop: 15,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 9,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
});
