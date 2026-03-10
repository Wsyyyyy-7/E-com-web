import { useEffect, useState } from 'react';
import { useSearchParams, useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { supportedLocales, type Locale } from '../i18n';

export default function AuthErrorPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const { locale: param } = useParams<{ locale: string }>();
  const locale = (supportedLocales.includes(param as Locale) ? param : 'en') as Locale;
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(3);
  const errorMessage = searchParams.get('msg') || t('authError.defaultMessage');

  const homePath = `/${locale}`;

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate(homePath, { replace: true });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [navigate, homePath]);

  const handleReturnHome = () => {
    navigate(homePath);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 p-6 text-center">
      <div className="space-y-6 max-w-md">
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-red-500/20 blur-xl rounded-full"></div>
              <AlertCircle className="relative h-12 w-12 text-red-500" strokeWidth={1.5} />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">{t('authError.title')}</h1>
          <p className="text-base text-muted-foreground">{errorMessage}</p>
          <div className="pt-2">
            <p className="text-sm text-gray-500">
              {countdown > 0 ? t('authError.countdown', { seconds: countdown }) : t('authError.redirecting')}
            </p>
          </div>
        </div>
        <div className="flex justify-center pt-2">
          <Button onClick={handleReturnHome} className="px-6">{t('authError.returnHome')}</Button>
        </div>
      </div>
    </div>
  );
}
