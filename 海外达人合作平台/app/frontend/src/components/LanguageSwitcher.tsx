import { useParams, useLocation, Link } from 'react-router-dom';
import { supportedLocales, type Locale } from '../i18n';

const labels: Record<Locale, string> = { en: 'EN', zh: '中文' };

export default function LanguageSwitcher() {
  const { locale: currentLocale } = useParams<{ locale: string }>();
  const location = useLocation();
  const pathname = location.pathname.replace(/^\/(en|zh)/, '') || '/';
  const nextLocale: Locale = currentLocale === 'zh' ? 'en' : 'zh';

  return (
    <Link
      to={`/${nextLocale}${pathname}${location.search}`}
      className="px-2.5 py-1.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
      title={nextLocale === 'zh' ? '中文' : 'English'}
    >
      {labels[nextLocale]}
    </Link>
  );
}
