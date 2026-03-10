import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Globe, ArrowLeft } from 'lucide-react';
import { useLocalePath } from '../hooks/useLocalePath';

export default function NotFound() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { path } = useLocalePath();
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Globe className="w-8 h-8 text-indigo-600" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">{t('notFound.title')}</h1>
        <p className="text-gray-600 mb-6">{t('notFound.message')}</p>
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => navigate(path('/'))}>
          <ArrowLeft className="w-4 h-4 mr-2" /> {t('notFound.backHome')}
        </Button>
      </div>
    </div>
  );
}