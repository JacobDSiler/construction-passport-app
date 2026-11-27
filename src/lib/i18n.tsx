import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { getItem, setItem } from './storage';
import { DICTIONARIES } from '../i18n';
import type { LangCode } from '../i18n/languages';

const KEY = 'cp.lang.v1';

/** Normalise text so lookups ignore line breaks, doubled spaces and HTML entities. */
export function norm(s: string): string {
  return s
    .replace(/&apos;|&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

interface Compiled {
  exact: Map<string, string>;
  prefixes: { key: string; out: string }[];
  templates: { re: RegExp; out: string }[];
}
const cache = new Map<string, Compiled>();

function compile(lang: LangCode): Compiled {
  const hit = cache.get(lang);
  if (hit) return hit;
  const exact = new Map<string, string>();
  const templates: Compiled['templates'] = [];
  const prefixes: Compiled['prefixes'] = [];
  for (const [k, v] of Object.entries(DICTIONARIES[lang] ?? {})) {
    if (!v) continue;
    const key = norm(k);
    if (/\{\d+\}/.test(key)) {
      const parts = key.split(/\{\d+\}/).map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
      templates.push({ re: new RegExp('^' + parts.join('(.+?)') + '$'), out: v });
    } else {
      exact.set(key, v);
      if (key.endsWith(':') || key.endsWith(' as')) prefixes.push({ key, out: v }); // "Today: 7h", "Signed in as name"
    }
  }
  prefixes.sort((a, b) => b.key.length - a.key.length);
  const c = { exact, templates, prefixes };
  cache.set(lang, c);
  return c;
}

/** Translation of an English string, or null when there is none (or the language is English). */
export function translate(lang: LangCode | 'en', text: string): string | null {
  if (lang === 'en') return null;
  const s = norm(text);
  if (s.length < 2) return null;
  const c = compile(lang);
  const direct = c.exact.get(s);
  if (direct) return direct;
  for (const t of c.templates) {
    const m = s.match(t.re);
    if (m) return t.out.replace(/\{(\d+)\}/g, (_, i) => m[Number(i) + 1] ?? '');
  }
  for (const p of c.prefixes) {
    if (s.startsWith(p.key + ' ') || (p.key.endsWith(':') && s.startsWith(p.key) && s.length > p.key.length)) return p.out + s.slice(p.key.length);
  }
  return null;
}

interface Ctx {
  lang: LangCode | 'en';
  setLang: (l: LangCode | 'en') => void;
  /** English text followed by its translation, for places that only take a plain string (titles, placeholders). */
  bi: (en: string, sep?: string) => string;
  tr: (text: string) => string | null;
}
const I18nCtx = createContext<Ctx>({ lang: 'en', setLang: () => {}, bi: (s) => s, tr: () => null });
export const useI18n = () => useContext(I18nCtx);

let currentLang: LangCode | 'en' = 'en';
let alertPatched = false;
function patchAlert() {
  if (alertPatched) return;
  alertPatched = true;
  const orig = Alert.alert.bind(Alert);
  const bi = (s: string | undefined, sep: string) => {
    if (!s) return s as string;
    const t = translate(currentLang, s);
    return t ? `${s}${sep}${t}` : s;
  };
  (Alert as any).alert = (title: string, message?: string, buttons?: any[], options?: any) =>
    orig(bi(title, ' / '), bi(message, '\n\n'), buttons?.map((b) => ({ ...b, text: bi(b.text, ' / ') })), options);
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<LangCode | 'en'>('en');
  useEffect(() => {
    patchAlert();
    getItem(KEY).then((v) => {
      if (v && (v === 'en' || v in DICTIONARIES)) {
        currentLang = v as LangCode | 'en';
        setLangState(currentLang);
      }
    });
  }, []);
  const setLang = useCallback((l: LangCode | 'en') => {
    currentLang = l;
    setLangState(l);
    setItem(KEY, l);
  }, []);
  const value = useMemo<Ctx>(
    () => ({
      lang,
      setLang,
      tr: (text) => translate(lang, text),
      bi: (en, sep = ' · ') => {
        const t = translate(lang, en);
        return t ? `${en}${sep}${t}` : en;
      },
    }),
    [lang, setLang],
  );
  return <I18nCtx.Provider value={value}>{children}</I18nCtx.Provider>;
}
