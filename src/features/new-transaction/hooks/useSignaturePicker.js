// Hook for picking a signature image using expo-image-picker.
// Returns the image URI or null if cancelled.

import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export function useSignaturePicker() {
  // Opens the image library so the user can pick a signature photo.
  // Allows basic cropping and compresses to 80% quality.
  const pickSignature = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        return result.assets[0].uri;
      }

      return null;
    } catch (e) {
      Alert.alert('Error', 'Failed to pick signature image');
      return null;
    }
  };

  return { pickSignature };
}
