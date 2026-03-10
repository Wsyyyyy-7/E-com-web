import { useParams, useNavigate } from 'react-router-dom';
import { useCallback } from 'react';
import { supportedLocales, type Locale } from '../i18n';

/**
 * Returns current locale from URL (e.g. "en" or "zh") and a function to build paths with locale prefix.
 * Use for all Link/navigate so EN and ZH versions stay under /en/* and /zh/*.
 */
export function useLocalePath(): { locale: Locale; path: (p: string) => string } {
  const { locale: param } = useParams<{ locale: string }>();
  const locale = (supportedLocales.includes(param as Locale) ? param : 'en') as Locale;
  const path = useCallback(
    (p: string) => (locale ? `/${locale}${p.startsWith('/') ? p : `/${p}`}` : p),
    [locale]
  );
  return { locale, path };
}

/**
 * Navigate to a path with current locale prefix.
 */
export function useLocaleNavigate() {
  const navigate = useNavigate();
  const { path } = useLocalePath();
  return useCallback(
    (to: string, options?: { replace?: boolean }) => {
      navigate(path(to), options);
    },
    [navigate, path]
  );
}
