import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

// Secrets (the owner token) go in the OS keychain on phones; web falls back to AsyncStorage (localStorage).
const useSecure = Platform.OS !== 'web';

export async function getItem(key: string): Promise<string | null> {
  try {
    return useSecure ? await SecureStore.getItemAsync(key) : await AsyncStorage.getItem(key);
  } catch {
    return null;
  }
}

export async function setItem(key: string, value: string): Promise<void> {
  try {
    if (useSecure) await SecureStore.setItemAsync(key, value);
    else await AsyncStorage.setItem(key, value);
  } catch {
    /* storage unavailable: caller must cope */
  }
}

export async function removeItem(key: string): Promise<void> {
  try {
    if (useSecure) await SecureStore.deleteItemAsync(key);
    else await AsyncStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}
