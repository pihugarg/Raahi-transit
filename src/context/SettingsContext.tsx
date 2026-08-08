import React, { createContext, useContext, useMemo, useState } from 'react';

export type Lang = 'en' | 'hi' | 'pa' | 'kn';
export type Settings = {
  lang: Lang;
  setLang: (l: Lang) => void;
  lite: boolean;
  setLite: (v: boolean) => void;
};

const KEY = 'raahi:settings:v1';
const SettingsContext = createContext<Settings | null>(null);

const defaultLang: Lang = (() => {
  const raw = localStorage.getItem(KEY);
  if (raw) { try { const s = JSON.parse(raw); if (s.lang) return s.lang as Lang; } catch { } }
  const nav = navigator.language.toLowerCase();
  if (nav.startsWith('hi')) return 'hi';
  if (nav.startsWith('pa')) return 'pa';
  if (nav.startsWith('kn')) return 'kn';
  return 'en';
})();

export const SettingsProvider = ({ children }: { children: React.ReactNode }) => {
  const [lang, setLangState] = useState<Lang>(defaultLang);
  const [lite, setLiteState] = useState<boolean>(() => {
    try { const raw = localStorage.getItem(KEY); return raw ? !!JSON.parse(raw).lite : false; } catch { return false; }
  });

  const setLang = (l: Lang) => {
    setLangState(l);
    const cur = { lang: l, lite };
    localStorage.setItem(KEY, JSON.stringify({ lang: l, lite }));
  };
  const setLite = (v: boolean) => {
    setLiteState(v);
    const cur = { lang, lite: v };
    localStorage.setItem(KEY, JSON.stringify(cur));
  };

  const value = useMemo(() => ({ lang, setLang, lite, setLite }), [lang, lite]);
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('SettingsContext missing');
  return ctx;
}
