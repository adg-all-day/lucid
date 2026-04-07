// shared header with avatar, greeting, and logo
// used across multiple screens so we don't repeat ourselves

import React, { useState } from 'react';
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import LucidLogo from '../icons/LucidLogo';
import Colors from '../constants/colors';
import Text from './StyledText';
import useAuthStore from '../stores/authStore';
import useUserStore from '../stores/userStore';
import useUiStore from '../stores/uiStore';
import queryClient from '../api/queryClient';
import { useLogout } from '../api/queries/auth';
import useTheme from '../hooks/useTheme';

export default function Header({ name, avatarUri }) {
  const router = useRouter();
  const logoutMutation = useLogout();
  const darkMode = useUiStore((s) => s.darkMode);
  const toggleDarkMode = useUiStore((s) => s.toggleDarkMode);
  const theme = useTheme();
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch {
      // even if the server call fails, clear local state
    }
    useAuthStore.getState().clearToken();
    useUserStore.getState().clearUser();
    queryClient.clear();
    router.replace('/log-in');
  };

  return (
    <View style={[styles.header, { backgroundColor: theme.headerBg, borderBottomColor: theme.divider }]}>
      <View style={styles.headerContent}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.avatar}
            onPress={() => setShowMenu((v) => !v)}
            activeOpacity={0.7}
          >
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
            ) : (
              <Ionicons name="person" size={22} color={Colors.white} />
            )}
          </TouchableOpacity>

          {showMenu ? (
            <View style={styles.menuRow}>
              <TouchableOpacity style={styles.menuBtn} onPress={toggleDarkMode} activeOpacity={0.8}>
                <Ionicons
                  name={darkMode ? 'sunny-outline' : 'moon-outline'}
                  size={14}
                  color={Colors.white}
                />
                <Text style={styles.menuText}>{darkMode ? 'Light' : 'Dark'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuBtn} onPress={handleLogout} activeOpacity={0.8}>
                <Ionicons name="log-out-outline" size={14} color={Colors.white} />
                <Text style={styles.menuText}>Log out</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Text style={styles.greeting} numberOfLines={1}>
              Hello, {name}!
            </Text>
          )}
        </View>
          <View style={styles.logoContainer}>
            <LucidLogo size={20} color={theme.logoColor} accentColor={theme.logoAccent} />
          </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#5B5FC7',
    paddingTop: 38,
    height: 108,
    borderBottomWidth: 1,
    borderBottomColor: '#D5D5D5',
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingBottom: 14,
    alignItems: 'flex-end',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 5,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  greeting: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
    maxWidth: 99,
  },
  logoContainer: {
    height: 44,
    justifyContent: 'center',
    marginBottom: 6,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginLeft: 3,
  },
  menuBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  menuText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '500',
  },
});
