import { createContext, useContext, useState, useEffect } from 'react';
import { t } from '../config/i18n';

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [dark, setDark] = useState(() => localStorage.getItem('dark') === 'true');
  const [lang, setLang] = useState(() => localStorage.getItem('lang') || 'en');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('dark', dark);
  }, [dark]);

  useEffect(() => {
    localStorage.setItem('lang', lang);
  }, [lang]);

  function toggleDark() { setDark((d) => !d); }
  function setLanguage(code) { setLang(code); }
  function i(key, params) { return t(key, lang, params); }

  return (
    <SettingsContext.Provider value={{ dark, toggleDark, lang, setLanguage, t: i }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be inside SettingsProvider');
  return ctx;
}
