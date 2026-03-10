import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import zh from './locales/zh.json';

export const supportedLocales = ['en', 'zh'] as const;
export type Locale = (typeof supportedLocales)[number];

const resources = {
  en: { translation: en },
  zh: { translation: zh },
};

// Detect initial locale: from path /en/ or /zh/, then localStorage, then browser, default 'en'
export function getInitialLocale(): Locale {
  const path = window.location.pathname;
  if (path.startsWith('/zh/') || path === '/zh') return 'zh';
  if (path.startsWith('/en/') || path === '/en') return 'en';
  const stored = localStorage.getItem('locale') as Locale | null;
  if (stored && supportedLocales.includes(stored)) return stored;
  const lang = navigator.language.toLowerCase();
  if (lang.startsWith('zh')) return 'zh';
  return 'en';
}

const initialLocale = getInitialLocale();

i18n.use(initReactI18next).init({
  resources,
  lng: initialLocale,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;
