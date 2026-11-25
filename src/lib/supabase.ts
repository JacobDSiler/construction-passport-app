import { createClient } from '@supabase/supabase-js';
import { getOwnerFolder } from './owner';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anon = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const supabaseEnabled = Boolean(url && anon);

// The backend has no user accounts: identity is an owner token held on the device. Storage calls carry
// an x-cp-folder header (the first 24 characters of the token) that the bucket policy checks.
export const supabase = supabaseEnabled
  ? createClient(url as string, anon as string, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: {
        fetch: async (input, init) => {
          try {
            const target = typeof input === 'string' ? input : (input as Request).url ?? String(input);
            if (target.includes('/storage/v1/')) {
              const headers = new Headers(init?.headers);
              headers.set('x-cp-folder', await getOwnerFolder());
              return fetch(input, { ...init, headers });
            }
          } catch {
            /* fall through to a plain fetch */
          }
          return fetch(input, init);
        },
      },
    })
  : null;

export const CERTS_BUCKET = 'certs';
