import React from 'react';
import { TouchableOpacity, View, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Text from '../../../components/StyledText';
import Colors from '../../../constants/colors';
import { SearchIcon } from '../../../icons';

export default function TransactionsSearchRow({
  theme,
  searchText,
  setSearchText,
  compactActions,
  onNewPress,
  styles,
}) {
  return (
    <View style={styles.searchRow}>
      <View style={[styles.searchBar, { backgroundColor: theme.cardBg }]}>
        <SearchIcon size={13} color={theme.iconMuted} />
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Search"
          placeholderTextColor={Colors.grayMedium}
        />
        {searchText ? (
          <TouchableOpacity onPress={() => setSearchText('')}>
            <Text style={styles.clearText}>x</Text>
          </TouchableOpacity>
        ) : null}
      </View>
      <TouchableOpacity
        style={[
          styles.iconButton,
          compactActions && styles.iconButtonCompact,
          { backgroundColor: theme.cardBg },
        ]}
      >
        <Ionicons name="filter" size={22} color={theme.iconMuted} />
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.iconButton,
          compactActions && styles.iconButtonCompact,
          { backgroundColor: theme.cardBg },
        ]}
      >
        <Ionicons name="swap-vertical" size={20} color={theme.iconMuted} />
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.newBtn, compactActions && styles.newBtnCompact]}
        onPress={onNewPress}
      >
        <Text style={styles.newBtnText}>New +</Text>
      </TouchableOpacity>
    </View>
  );
}
