import * as Crypto from 'expo-crypto';
import { getItem, setItem } from './storage';

const KEY = 'cp.ownerToken.v1';

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

let pending: Promise<string> | null = null;

/** The device's owner token: 32 random bytes as hex (same format as the original app). */
export function getOwnerToken(): Promise<string> {
  if (!pending) {
    pending = (async () => {
      const existing = await getItem(KEY);
      if (existing) return existing;
      const token = toHex(await Crypto.getRandomBytesAsync(32));
      await setItem(KEY, token);
      return token;
    })().finally(() => {
      pending = null;
    });
  }
  return pending;
}

/** Folder used for this device's photos in the public "certs" bucket (matches the original app). */
export async function getOwnerFolder(): Promise<string> {
  return (await getOwnerToken()).replace(/[^a-zA-Z0-9]/g, '').slice(0, 24) || 'cp';
}

/** Adopt a token restored from an email account (log in on a new phone). */
export async function setOwnerToken(token: string): Promise<void> {
  await setItem(KEY, token);
  pending = null;
}
