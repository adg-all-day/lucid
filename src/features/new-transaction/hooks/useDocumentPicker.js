// Hook for picking documents using expo-document-picker.
// Returns the file object (name, uri, size, mimeType) or null if cancelled.
// Supports pdf, jpeg, png, docx, and bmp -- same as the original screen.

import { Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';

export function useDocumentPicker() {
  // Opens the system file picker and returns the selected file info,
  // or null if the user backed out.
  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'application/pdf',
          'image/jpeg',
          'image/png',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'image/bmp',
        ],
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        return {
          name: asset.name,
          uri: asset.uri,
          size: asset.size,
          mimeType: asset.mimeType,
        };
      }

      return null;
    } catch (e) {
      Alert.alert('Error', 'Failed to pick document');
      return null;
    }
  };

  return { pickDocument };
}
