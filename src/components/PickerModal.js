// reusable picker modal with search.. used for transaction type, currency, roles etc
import React, { useState, useMemo } from 'react';
import {
  Modal,
  View,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Pressable,
} from 'react-native';
import Text from './StyledText';
import Colors from '../constants/colors';
import useTheme from '../hooks/useTheme';

export default function PickerModal({ visible, onClose, onSelect, items, title, searchable }) {
  const theme = useTheme();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search || !searchable) return items;
    const q = search.toLowerCase();
    return items.filter((i) => i.label.toLowerCase().includes(q));
  }, [items, search, searchable]);

  const handleSelect = (item) => {
    onSelect(item);
    setSearch('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={[styles.sheet, { backgroundColor: theme.modalBg }]} onPress={(e) => e.stopPropagation()}>
          <View style={styles.handle} />
          {title && <Text style={[styles.title, { color: theme.text }]}>{title}</Text>}
          {searchable && (
            <TextInput
              style={[styles.searchInput, { backgroundColor: theme.inputBg, color: theme.text }]}
              placeholder="Search..."
              placeholderTextColor={theme.textSecondary}
              value={search}
              onChangeText={setSearch}
              autoCorrect={false}
            />
          )}
          <FlatList
            data={filtered}
            keyExtractor={(item, i) => item.value + i}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.row} onPress={() => handleSelect(item)}>
                <Text style={[styles.rowText, { color: theme.text }]}>{item.label}</Text>
              </TouchableOpacity>
            )}
            style={styles.list}
            keyboardShouldPersistTaps="handled"
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '60%',
    paddingBottom: 30,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.grayLight,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.black,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  searchInput: {
    marginHorizontal: 20,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    marginBottom: 8,
  },
  list: {
    paddingHorizontal: 20,
  },
  row: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  rowText: {
    fontSize: 14,
    color: Colors.black,
  },
});
