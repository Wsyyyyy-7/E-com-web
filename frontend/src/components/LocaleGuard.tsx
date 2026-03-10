import { useEffect } from 'react';
import { Navigate, Outlet, useParams } from 'react-router-dom';
import i18n from '../i18n';
import { supportedLocales, type Locale } from '../i18n';

export default function LocaleGuard() {
  const { locale: param } = useParams<{ locale: string }>();

  if (!param || !supportedLocales.includes(param as Locale)) {
    return <Navigate to="/en" replace />;
  }

  const locale = param as Locale;

  useEffect(() => {
    if (locale !== document.documentElement.lang) {
      document.documentElement.lang = locale;
    }
    i18n.changeLanguage(locale);
    localStorage.setItem('locale', locale);
  }, [locale]);

  return <Outlet />;
}
