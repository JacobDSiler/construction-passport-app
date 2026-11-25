import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Stamp, getStamp } from './photos';

/** Takes a photo or picks one from the library, with a date and GPS stamp. Returns null if cancelled or denied. */
export async function pickPhoto(mode: 'camera' | 'library'): Promise<{ uri: string; stamp: Stamp } | null> {
  try {
    let result: ImagePicker.ImagePickerResult;
    if (mode === 'library') {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Permission needed', 'Allow photo access to choose a picture.');
        return null;
      }
      result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
    } else {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Permission needed', 'Allow camera access to take a photo.');
        return null;
      }
      result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
    }
    if (result.canceled || !result.assets?.[0]) return null;
    return { uri: result.assets[0].uri, stamp: await getStamp() };
  } catch (e) {
    Alert.alert('Could not add the photo', String((e as Error).message ?? e));
    return null;
  }
}
