import { supabase } from './supabase';
import { getOwnerToken, setOwnerToken } from './owner';

// Email accounts back up the device's owner token so a lost phone does not mean a lost passport.
// The token is stored in the account's metadata (key cp_owner_token).
const META = 'cp_owner_token';

function need() {
  if (!supabase) throw new Error('Backend not configured (missing EXPO_PUBLIC_SUPABASE_* values).');
  return supabase;
}

export async function createAccount(email: string, password: string): Promise<void> {
  const sb = need();
  const token = await getOwnerToken();
  const { error } = await sb.auth.signUp({ email: email.trim(), password, options: { data: { [META]: token } } });
  if (error) throw new Error(error.message);
}

/** Logs in. If the account holds a backed-up token, this phone adopts it, which brings the passport back. */
export async function logIn(email: string, password: string): Promise<{ restored: boolean }> {
  const sb = need();
  const { data, error } = await sb.auth.signInWithPassword({ email: email.trim(), password });
  if (error) throw new Error(error.message);
  const saved = data.user?.user_metadata?.[META];
  if (typeof saved === 'string' && saved.length >= 32) {
    await setOwnerToken(saved);
    return { restored: true };
  }
  // Account exists but has no backup yet: attach this phone's token so future log-ins restore it.
  await sb.auth.updateUser({ data: { [META]: await getOwnerToken() } });
  return { restored: false };
}

export async function logOut(): Promise<void> {
  try {
    await supabase?.auth.signOut();
  } catch {
    /* ignore */
  }
}

/** Creates the account only when the user typed an email; otherwise the app stays device-only. */
export async function maybeCreateAccount(email: string, password: string): Promise<string | null> {
  if (!email.trim()) return null;
  if (password.length < 6) return 'Password must be at least 6 characters.';
  try {
    await createAccount(email, password);
    return null;
  } catch (e) {
    return (e as Error).message;
  }
}
