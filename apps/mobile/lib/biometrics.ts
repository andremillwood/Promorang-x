import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const BIOMETRIC_KEY = 'promorang_master_key_auth';

export async function storeSecureSecret(key: string, value: string): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  try {
    await SecureStore.setItemAsync(key, value, {
      requireAuthentication: false,
    });
    return true;
  } catch (err) {
    console.error('Failed to store secure secret:', err);
    return false;
  }
}

export async function getSecureSecret(key: string): Promise<string | null> {
  if (Platform.OS === 'web') return null;
  try {
    return await SecureStore.getItemAsync(key);
  } catch (err) {
    console.error('Failed to retrieve secure secret:', err);
    return null;
  }
}

export async function deleteSecureSecret(key: string): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  try {
    await SecureStore.deleteItemAsync(key);
    return true;
  } catch (err) {
    console.error('Failed to delete secure secret:', err);
    return false;
  }
}
