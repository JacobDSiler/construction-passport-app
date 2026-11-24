import * as Crypto from 'expo-crypto';
import { getItem, setItem } from './storage';

const KEY = 'cp.ownerToken.v1';

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * The device's owner token. The legacy backend identifies a passport by this token and also
 * offers adopt_rotated_token / claim_passport to move it. TODO(verify): confirm the exact format the
 * live database expects by comparing with a token from the old app before shipping.
 */
export async function getOwnerToken(): Promise<string> {
  const existing = await getItem(KEY);
  if (existing) return existing;
  const token = toHex(await Crypto.getRandomBytesAsync(24));
  await setItem(KEY, token);
  return token;
}
