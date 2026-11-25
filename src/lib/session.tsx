import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { getOwnerToken } from './owner';
import { loadJson, removeItem, saveJson } from './storage';
import { clearCertifierCode } from './certifier';

export type Role = 'worker' | 'company' | 'trainer' | 'certifier';

export interface Session {
  role: Role | null;
  email: string | null;
  orgName: string | null; // company or training business name
  orgCode: string | null; // company org code (companies only)
}

const KEY = 'cp.session.v1';
const SETUP_KEY = 'cp.setupToken.v1'; // legacy key from an earlier build; cleared on reset
const EMPTY: Session = { role: null, email: null, orgName: null, orgCode: null };

/** The live web app keeps no separate setup token: the device owner token is used for company calls too. */
export async function getSetupToken(): Promise<string> {
  return getOwnerToken();
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
    clearCertifierCode();
  }, []);

  return <SessionCtx.Provider value={{ ready, session, update, reset }}>{children}</SessionCtx.Provider>;
}

export function useSession(): Ctx {
  const c = useContext(SessionCtx);
  if (!c) throw new Error('useSession outside SessionProvider');
  return c;
}

export function homeFor(role: Role | null): string {
  if (role === 'company') return '/(company)';
  if (role === 'trainer') return '/trainer';
  if (role === 'certifier') return '/certifier';
  if (role === 'worker') return '/(tabs)';
  return '/role';
}
