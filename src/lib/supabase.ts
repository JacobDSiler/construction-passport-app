import { createClient } from '@supabase/supabase-js';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anon = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const supabaseEnabled = Boolean(url && anon);

// The existing backend has no user accounts: identity is an owner token held on the device,
// so Supabase auth sessions are not used.
export const supabase = supabaseEnabled
  ? createClient(url as string, anon as string, { auth: { persistSession: false, autoRefreshToken: false } })
  : null;

export const CERTS_BUCKET = 'certs';
