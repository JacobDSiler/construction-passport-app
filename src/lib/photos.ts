import * as Location from 'expo-location';
import { CERTS_BUCKET, supabase } from './supabase';
import { getOwnerFolder } from './owner';

/** Uploads a local image to the public certs bucket and returns its public URL (or null if it is already remote or fails). */
export async function uploadCertPhoto(localUri: string | undefined, name: string): Promise<string | null> {
  if (!supabase || !localUri || /^https?:\/\//i.test(localUri)) return null;
  try {
    const folder = await getOwnerFolder();
    const blob = await (await fetch(localUri)).blob();
    if (!blob.size) return null;
    const png = (blob.type || '').includes('png');
    const path = `${folder}/${name}.${png ? 'png' : 'jpg'}`;
    const bytes = new Uint8Array(await new Response(blob).arrayBuffer());
    const { error } = await supabase.storage
      .from(CERTS_BUCKET)
      .upload(path, bytes, { contentType: png ? 'image/png' : 'image/jpeg', upsert: true });
    if (error) return null;
    return supabase.storage.from(CERTS_BUCKET).getPublicUrl(path).data.publicUrl;
  } catch {
    return null;
  }
}

export interface Stamp {
  at: string; // ISO timestamp
  lat?: number;
  lng?: number;
}

/** Date and GPS stamp for a photo or timesheet entry. Never blocks for long; location is optional. */
export async function getStamp(): Promise<Stamp> {
  const stamp: Stamp = { at: new Date().toISOString() };
  try {
    const perm = await Location.requestForegroundPermissionsAsync();
    if (perm.status !== 'granted') return stamp;
    const pos = await Promise.race([
      Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
      new Promise<null>((r) => setTimeout(() => r(null), 5000)),
    ]);
    if (pos) {
      stamp.lat = Number(pos.coords.latitude.toFixed(6));
      stamp.lng = Number(pos.coords.longitude.toFixed(6));
    }
  } catch {
    /* location unavailable */
  }
  return stamp;
}
