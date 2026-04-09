import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Text from '../../../components/StyledText';
import LucidLogo from '../../../icons/LucidLogo';
import Colors from '../../../constants/colors';
import useTheme from '../../../hooks/useTheme';

export default function AuthShell({ title, children, cardStyle }) {
  const theme = useTheme();

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.headerBg }]} edges={['top', 'left', 'right']}>
      <View style={[styles.headerBand, { backgroundColor: theme.headerBg }]}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <LucidLogo size={22} color={theme.logoColor} accentColor={theme.logoAccent} />
        </View>
      </View>
      <View style={[styles.content, { backgroundColor: theme.background }]}>
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.modalBg,
              borderColor: theme.isDark ? theme.divider : 'transparent',
              shadowOpacity: theme.isDark ? 0 : 0.05,
              elevation: theme.isDark ? 0 : 1,
            },
            cardStyle,
          ]}
        >
          {children}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  headerBand: {
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
    paddingHorizontal: 8,
    paddingTop: 15,
  },
  card: {
    borderRadius: 9,
    padding: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
  },
});
