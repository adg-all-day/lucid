import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Text from '../../../components/StyledText';
import Colors from '../../../constants/colors';

export default function DocumentsSection({ documents, theme, isDark, styles }) {
  if (documents.length === 0) return null;

  return (
    <View style={styles.sectionContainer}>
      <Text style={[styles.sectionTitle, { color: isDark ? theme.text : Colors.primary }]}>
        Transaction Documents
      </Text>
      <View style={[styles.documentsCard, { backgroundColor: theme.primary10 }]}>
        {documents.map((doc, index) => (
          <View key={doc.id || `${doc.name}-${index}`}>
            <View style={styles.documentRow}>
              <Text style={[styles.documentNumber, { color: theme.text }]}>{index + 1}.</Text>
              <Text style={[styles.documentName, { color: theme.text }]}>
                {doc.description || doc.name || `Document ${index + 1}`}
              </Text>
              <View style={{ flex: 1 }} />
              <TouchableOpacity style={[styles.docFileBtn, { backgroundColor: theme.surfaceLight }]}>
                <Ionicons name="document-text" size={18} color={isDark ? theme.icon : Colors.gray} />
              </TouchableOpacity>
            </View>
            {index < documents.length - 1 ? <View style={styles.docDivider} /> : null}
          </View>
        ))}
      </View>
    </View>
  );
}
