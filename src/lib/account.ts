import { supabase } from './supabase';
import { getOwnerToken, setOwnerToken } from './owner';
import { setItem } from './storage';
import { SHORT_CODE_KEY, WORKER_KEY, blankWorker, loadWorker, type Qualification } from './passport';

// Matches the original app: Supabase email + password auth. The owner token is linked to the account by the
// `claim_passport` RPC while signed in, and `restore_passport` (no args) returns it on a new phone.

function need() {
  if (!supabase) throw new Error('Backend not configured (missing EXPO_PUBLIC_SUPABASE_* values).');
  return supabase;
}

const norm = (email: string) => email.trim().toLowerCase();

/** Links this phone's owner token to the signed-in account (backup). Safe to call repeatedly. */
export async function backupToAccount(): Promise<void> {
  const sb = need();
  const { data: s } = await sb.auth.getSession();
  if (!s.session) return;
  const { error } = await sb.rpc('claim_passport', { p_owner_token: await getOwnerToken() });
  if (error) console.warn('[claim]', error.message);
}

/** The signed-in account's email, or null when nobody is signed in. */
export async function currentAccountEmail(): Promise<string | null> {
  const { data } = await need().auth.getSession();
  return data.session?.user?.email ?? null;
}

/** Link the (already published) passport to the signed-in account. Throws with a plain message on failure. */
export async function linkToAccount(): Promise<void> {
  const sb = need();
  const { data: s } = await sb.auth.getSession();
  if (!s.session) throw new Error('Log in or create an account first.');
  const { error } = await sb.rpc('claim_passport', { p_owner_token: await getOwnerToken() });
  if (error) throw new Error(error.message);
}

/** Signs in without restoring anything, so nothing on this phone is replaced. */
export async function signInOnly(email: string, password: string): Promise<void> {
  const { error } = await need().auth.signInWithPassword({ email: norm(email), password });
  if (error) throw new Error(error.message);
}

export async function createAccount(email: string, password: string, meta?: Record<string, unknown>): Promise<void> {
  const sb = need();
  const { data, error } = await sb.auth.signUp({ email: norm(email), password, options: { data: meta ?? {} } });
  if (error) throw new Error(error.message);
  if (data.session) await backupToAccount();
}

/** Logs in, then restores the passport from the backend (owner token, short code and passport data). */
export async function logIn(email: string, password: string): Promise<{ restored: boolean }> {
  const sb = need();
  const { error } = await sb.auth.signInWithPassword({ email: norm(email), password });
  if (error) throw new Error(error.message);
  const { data, error: rerr } = await sb.rpc('restore_passport');
  if (rerr) console.warn('[restore]', rerr.message);
  const row: any = Array.isArray(data) ? data[0] : data;
  if (!row || !row.owner_token) return { restored: false };
  // Safety: never replace a passport that has content on this phone with an empty backup.
  const d0 = row.data;
  const backupHasContent = !!d0 && (!!d0.name || (Array.isArray(d0.quals) && d0.quals.length > 0));
  const local = await loadWorker();
  const localHasContent = !!local.name || local.qualifications.length > 0;
  if (!backupHasContent && localHasContent) return { restored: false };
  await setOwnerToken(row.owner_token);
  if (row.short_code) await setItem(SHORT_CODE_KEY, row.short_code);
  const d = row.data;
  if (d) {
    const quals: Qualification[] = Array.isArray(d.quals)
      ? d.quals.map((q: any, i: number) => ({
          id: `q${Date.now()}${i}`,
          name: q.n ?? 'Ticket',
          verification: q.verified ? 'verified' : 'unverified',
          expires: q.expires && !isNaN(Date.parse(q.expires)) ? new Date(q.expires).toISOString() : undefined,
          imageUri: q.img || undefined,
          imageBackUri: q.imgBack || undefined,
        }))
      : [];
    const b = blankWorker();
    await setItem(
      WORKER_KEY,
      JSON.stringify({ ...b, id: d.id || b.id, name: d.name || '', trade: d.trade || '', employer: d.employer || '', qualifications: quals }),
    );
  }
  return { restored: true };
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
