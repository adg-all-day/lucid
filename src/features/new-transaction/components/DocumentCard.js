// A single document card in the transaction form.
// Shows a description field and an upload button, plus the filename if a file is attached.
// Uses react-hook-form context to stay in sync with the parent form.

import React from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { useFormContext, Controller } from 'react-hook-form';
import { Ionicons } from '@expo/vector-icons';
import Text from '../../../components/StyledText';
import Colors from '../../../constants/colors';
import useTheme from '../../../hooks/useTheme';
import OutlinedField from '../../../components/OutlinedField';
import CounterpartyTrashIcon from '../../../icons/CounterpartyTrashIcon';
import CounterpartyCollapseIcon from '../../../icons/CounterpartyCollapseIcon';

// Same drag dots used on all the cards
function DragDots() {
  return (
    <View style={styles.dragDotsContainer}>
      {[0, 1, 2].map((row) => (
        <View key={row} style={styles.dragDotsRow}>
          <View style={styles.dragDot} />
          <View style={styles.dragDot} />
        </View>
      ))}
    </View>
  );
}

/**
 * Props:
 * - index: position in the documents array
 * - onRemove: callback to delete this document
 * - onPickDocument: callback to open the file picker for this document
 */
export default function DocumentCard({ index, onRemove, onPickDocument }) {
  const { watch, setValue, control } = useFormContext();
  const theme = useTheme();

  const prefix = `documents.${index}`;
  const doc = watch(prefix);
  const collapsed = doc?.collapsed ?? false;

  return (
    <View style={[styles.documentCard, { backgroundColor: theme.isDark ? theme.modalBg : theme.surfaceLight }]}>
      <View style={{ flexDirection: 'row' }}>
        <View style={styles.progressBar}>
          <DragDots />
        </View>
        <View style={{ flex: 1, padding: collapsed ? 4 : 14, paddingLeft: 0 }}>
          {/* Header with collapsed name and action buttons */}
          <View style={[styles.header, { marginBottom: collapsed ? 0 : 8 }]}>
            {collapsed && doc?.description ? (
              <Text style={styles.collapsedName} numberOfLines={1}>{doc.description}</Text>
            ) : (
              <View style={{ flex: 1 }} />
            )}
            <View style={{ flexDirection: 'row', flexShrink: 0, alignItems: 'center' }}>
              <TouchableOpacity style={{ marginLeft: 8 }} onPress={onRemove}>
                <CounterpartyTrashIcon size={45} />
              </TouchableOpacity>
              <TouchableOpacity
                style={{ marginLeft: 8 }}
                onPress={() => setValue(`${prefix}.collapsed`, !collapsed)}
              >
                <CounterpartyCollapseIcon size={45} collapsed={collapsed} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Expanded content: description input, upload button, file info */}
          {!collapsed && (
            <>
              <View style={styles.documentHeader}>
                <Text style={[styles.documentNumber, { color: theme.text }]}>{index + 1}.</Text>
                <View style={{ flex: 1 }}>
                  <OutlinedField label="Description" bgColor={theme.isDark ? theme.modalBg : 'white'}>
                    <Controller
                      control={control}
                      name={`${prefix}.description`}
                      render={({ field: { onChange, value } }) => (
                        <TextInput
                          style={[styles.input, { backgroundColor: theme.inputBg, color: theme.text }]}
                          value={value}
                          onChangeText={onChange}
                          placeholder="Description"
                          placeholderTextColor={theme.textSecondary}
                        />
                      )}
                    />
                  </OutlinedField>
                </View>
              </View>
              <TouchableOpacity style={styles.uploadBtn} onPress={() => onPickDocument(index)}>
                <Ionicons name="document-outline" size={20} color={Colors.primary} />
                <Text style={styles.uploadBtnText}> Upload File </Text>
              </TouchableOpacity>
              {doc?.file && (
                <Text style={styles.fileNameText} numberOfLines={1}>{doc.file.name}</Text>
              )}
              <Text style={[styles.uploadHint, { color: theme.textSecondary }]}>
                Supported formats: .pdf, .jpeg, .png, .docx, .bmp{'\n'}Maximum file size: 10 MB
              </Text>
            </>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  documentCard: {
    marginBottom: 14,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBar: {
    width: 20,
    backgroundColor: '#EFEEFA',
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  collapsedName: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.primary,
    marginLeft: 10,
    flex: 1,
    flexShrink: 1,
  },
  documentHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  documentNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.black,
    marginTop: 28,
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
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 5,
    borderStyle: 'dashed',
    paddingVertical: 10,
    marginTop: 8,
  },
  uploadBtnText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '500',
  },
  uploadHint: {
    fontSize: 11,
    color: Colors.gray,
    marginTop: 4,
    textAlign: 'center',
  },
  fileNameText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500',
    marginTop: 4,
    textAlign: 'center',
  },
  dragDotsContainer: {
    gap: 4,
  },
  dragDotsRow: {
    flexDirection: 'row',
    gap: 4,
  },
  dragDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#C5C6E8',
  },
});
