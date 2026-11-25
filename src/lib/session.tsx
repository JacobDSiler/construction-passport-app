import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import * as Crypto from 'expo-crypto';
import { getItem, loadJson, removeItem, saveJson, setItem } from './storage';

export type Role = 'worker' | 'company' | 'trainer';

export interface Session {
  role: Role | null;
  email: string | null;
  orgName: string | null; // company or training business name
  orgCode: string | null; // company org code (companies only)
}

const KEY = 'cp.session.v1';
const SETUP_KEY = 'cp.setupToken.v1';
const EMPTY: Session = { role: null, email: null, orgName: null, orgCode: null };

/** Companies authenticate with a separate setup token (32 random bytes as hex), as in the original backend. */
export async function getSetupToken(): Promise<string> {
  const existing = await getItem(SETUP_KEY);
  if (existing) return existing;
  const bytes = await Crypto.getRandomBytesAsync(32);
  const token = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  await setItem(SETUP_KEY, token);
  return token;
}

interface Ctx {
  ready: boolean;
  session: Session;
  update: (patch: Partial<Session>) => void;
  reset: () => void;
}

const SessionCtx = createContext<Ctx | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<Session>(EMPTY);

  useEffect(() => {
    loadJson<Session>(KEY, EMPTY).then((s) => {
      setSession({ ...EMPTY, ...s });
      setReady(true);
    });
  }, []);

  const update = useCallback((patch: Partial<Session>) => {
    setSession((cur) => {
      const next = { ...cur, ...patch };
      saveJson(KEY, next);
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setSession(EMPTY);
    saveJson(KEY, EMPTY);
    removeItem(SETUP_KEY);
  }, []);

  return <SessionCtx.Provider value={{ ready, session, update, reset }}>{children}</SessionCtx.Provider>;
}

export function useSession(): Ctx {
  const c = useContext(SessionCtx);
  if (!c) throw new Error('useSession outside SessionProvider');
  return c;
}

export function homeFor(role: Role | null): string {
  if (role === 'company') return '/company';
  if (role === 'trainer') return '/trainer';
  if (role === 'worker') return '/(tabs)';
  return '/role';
}
