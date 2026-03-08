import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { useLocalePath, useLocaleNavigate } from '../hooks/useLocalePath';
import Navbar from '../components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Globe, Store, Video, Shield, DollarSign, CheckCircle,
  ArrowRight, Users, TrendingUp, Zap, Lock, Eye, FileText,
  Sparkles, Star
} from 'lucide-react';

const HERO_BG = 'https://mgx-backend-cdn.metadl.com/generate/images/999838/2026-03-04/7b456cbb-e7ae-444b-b8cf-25e64b74fcff.png';
const CREATOR_IMG = 'https://mgx-backend-cdn.metadl.com/generate/images/999838/2026-03-04/b7151c68-7aab-4f1e-9ea3-494ce309ae70.png';
const MERCHANT_IMG = 'https://mgx-backend-cdn.metadl.com/generate/images/999838/2026-03-04/3881b601-d08f-4cb8-8397-4e67f42dd8ab.png';
const FEATURES_BG = 'https://mgx-backend-cdn.metadl.com/generate/images/999838/2026-03-04/59100f41-83ac-48d9-8107-2c4ac9d6d9d6.png';

export default function Index() {
  const { t } = useTranslation();
  const { isLoggedIn } = useAuth();
  const { path } = useLocalePath();
  const localeNavigate = useLocaleNavigate();

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />

      {/* ===== Hero Section with Background Image ===== */}
      <section className="relative pt-24 pb-20 min-h-[90vh] flex items-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src={HERO_BG}
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-gray-950/70 via-gray-950/50 to-gray-950" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/20 mb-6 text-sm px-4 py-1.5 border border-indigo-500/30 backdrop-blur-sm">
              <Sparkles className="w-4 h-4 mr-1.5" />
              {t('index.badge')}
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight tracking-tight">
              {t('index.heroTitle1')}
              <br />
              <span className="bg-gradient-to-r from-indigo-400 via-sky-400 to-cyan-400 bg-clip-text text-transparent">
                {t('index.heroTitle2')}
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
              {t('index.heroDesc')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-indigo-600 text-white hover:bg-indigo-500 h-13 px-8 text-base font-semibold shadow-lg shadow-indigo-600/30 transition-all hover:shadow-indigo-500/40 hover:scale-[1.02]"
                onClick={() => localeNavigate('/marketplace')}
              >
                {t('index.browseMarketplace')} <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="!bg-white/5 border border-white/20 text-white hover:!bg-white/10 h-13 px-8 text-base backdrop-blur-sm transition-all hover:border-white/40"
                onClick={() => (isLoggedIn ? localeNavigate('/role-select') : localeNavigate('/auth'))}
              >
                {isLoggedIn ? t('index.enterConsole') : t('index.signUpOrLogin')}
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-20 max-w-4xl mx-auto">
            {[
              { icon: Users, value: '500+', labelKey: 'index.statsCreators' as const },
              { icon: Store, value: '200+', labelKey: 'index.statsMerchants' as const },
              { icon: DollarSign, value: '¥2M+', labelKey: 'index.statsVolume' as const },
              { icon: Star, value: '98%', labelKey: 'index.statsFulfillment' as const },
            ].map((stat, i) => (
              <div
                key={i}
                className="text-center bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10 hover:bg-white/10 transition-all duration-300"
              >
                <stat.icon className="w-5 h-5 text-indigo-400 mx-auto mb-2" />
                <p className="text-3xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-gray-400 mt-1">{t(stat.labelKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== How It Works ===== */}
      <section className="py-24 bg-gray-950 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/10 mb-4 border border-indigo-500/20">
              {t('index.platformFlow')}
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {t('index.stepsHeadline')}
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              {t('index.stepsSubtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: '01', icon: FileText, titleKey: 'index.step1Title' as const, descKey: 'index.step1Desc' as const, gradient: 'from-indigo-600 to-indigo-500' },
              { step: '02', icon: Users, titleKey: 'index.step2Title' as const, descKey: 'index.step2Desc' as const, gradient: 'from-sky-600 to-sky-500' },
              { step: '03', icon: Lock, titleKey: 'index.step3Title' as const, descKey: 'index.step3Desc' as const, gradient: 'from-amber-600 to-amber-500' },
              { step: '04', icon: CheckCircle, titleKey: 'index.step4Title' as const, descKey: 'index.step4Desc' as const, gradient: 'from-emerald-600 to-emerald-500' },
            ].map((item, i) => (
              <div key={i} className="relative group">
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 h-full hover:border-gray-700 transition-all duration-300 hover:-translate-y-1">
                  <div className="flex items-center gap-3 mb-5">
                    <div className={`w-12 h-12 bg-gradient-to-br ${item.gradient} rounded-xl flex items-center justify-center shadow-lg`}>
                      <item.icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-4xl font-bold text-gray-800 group-hover:text-gray-700 transition-colors">{item.step}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-3">{t(item.titleKey)}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{t(item.descKey)}</p>
                </div>
                {i < 3 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                    <ArrowRight className="w-5 h-5 text-gray-700" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Two Roles with Images ===== */}
      <section className="py-24 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/10 mb-4 border border-indigo-500/20">
              {t('index.dualRoleBadge')}
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {t('index.dualRoleTitle')}
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            <div className="group relative rounded-2xl overflow-hidden border border-gray-800 hover:border-indigo-500/50 transition-all duration-500 hover:-translate-y-1">
              <div className="relative h-52 overflow-hidden">
                <img src={MERCHANT_IMG} alt="Merchant" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent" />
                <div className="absolute bottom-4 left-6 flex items-center gap-3">
                  <div className="w-14 h-14 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/30">
                    <Store className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{t('index.merchantLabel')}</h3>
                    <p className="text-sm text-indigo-300">{t('index.merchantSub')}</p>
                  </div>
                </div>
              </div>
              <div className="p-6 bg-gray-900">
                <p className="text-gray-400 mb-5 text-sm">{t('index.merchantDesc')}</p>
                <ul className="space-y-3 mb-6">
                  {(['index.merchantBullet1', 'index.merchantBullet2', 'index.merchantBullet3', 'index.merchantBullet4', 'index.merchantBullet5'] as const).map((key, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-gray-300">
                      <CheckCircle className="w-4 h-4 text-indigo-400 mt-0.5 flex-shrink-0" />
                      {t(key)}
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white h-11 transition-all hover:shadow-lg hover:shadow-indigo-600/20"
                  onClick={() => (isLoggedIn ? localeNavigate('/merchant') : localeNavigate('/auth'))}
                >
                  {t('index.merchantCta')} <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>

            <div className="group relative rounded-2xl overflow-hidden border border-gray-800 hover:border-sky-500/50 transition-all duration-500 hover:-translate-y-1">
              <div className="relative h-52 overflow-hidden">
                <img src={CREATOR_IMG} alt="Creator" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent" />
                <div className="absolute bottom-4 left-6 flex items-center gap-3">
                  <div className="w-14 h-14 bg-sky-600 rounded-xl flex items-center justify-center shadow-lg shadow-sky-600/30">
                    <Video className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{t('index.creatorLabel')}</h3>
                    <p className="text-sm text-sky-300">{t('index.creatorSub')}</p>
                  </div>
                </div>
              </div>
              <div className="p-6 bg-gray-900">
                <p className="text-gray-400 mb-5 text-sm">{t('index.creatorDesc')}</p>
                <ul className="space-y-3 mb-6">
                  {(['index.creatorBullet1', 'index.creatorBullet2', 'index.creatorBullet3', 'index.creatorBullet4', 'index.creatorBullet5'] as const).map((key, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-gray-300">
                      <CheckCircle className="w-4 h-4 text-sky-400 mt-0.5 flex-shrink-0" />
                      {t(key)}
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full bg-sky-600 hover:bg-sky-500 text-white h-11 transition-all hover:shadow-lg hover:shadow-sky-600/20"
                  onClick={() => (isLoggedIn ? localeNavigate('/creator') : localeNavigate('/auth'))}
                >
                  {t('index.creatorCta')} <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Key Features with Background Image ===== */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={FEATURES_BG}
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gray-950/90 backdrop-blur-sm" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <Badge className="bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/10 mb-4 border border-indigo-500/20">
              {t('index.featuresBadge')}
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {t('index.featuresTitle')}
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Shield, titleKey: 'index.feat1Title' as const, descKey: 'index.feat1Desc' as const, gradient: 'from-indigo-600 to-indigo-500' },
              { icon: Zap, titleKey: 'index.feat2Title' as const, descKey: 'index.feat2Desc' as const, gradient: 'from-amber-600 to-amber-500' },
              { icon: Eye, titleKey: 'index.feat3Title' as const, descKey: 'index.feat3Desc' as const, gradient: 'from-emerald-600 to-emerald-500' },
              { icon: TrendingUp, titleKey: 'index.feat4Title' as const, descKey: 'index.feat4Desc' as const, gradient: 'from-sky-600 to-sky-500' },
              { icon: Globe, titleKey: 'index.feat5Title' as const, descKey: 'index.feat5Desc' as const, gradient: 'from-purple-600 to-purple-500' },
              { icon: DollarSign, titleKey: 'index.feat6Title' as const, descKey: 'index.feat6Desc' as const, gradient: 'from-rose-600 to-rose-500' },
            ].map((feature, i) => (
              <div
                key={i}
                className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-1 group"
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-white mb-2">{t(feature.titleKey)}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{t(feature.descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA Section ===== */}
      <section className="py-24 bg-gray-950 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
            {t('index.ctaTitle')}
          </h2>
          <p className="text-gray-400 text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
            {t('index.ctaSubtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-indigo-600 text-white hover:bg-indigo-500 h-13 px-8 text-base font-semibold shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02]"
              onClick={() => localeNavigate('/marketplace')}
            >
              {t('index.browseMarketplace')} <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="!bg-white/5 border border-white/20 text-white hover:!bg-white/10 h-13 px-8 text-base backdrop-blur-sm transition-all hover:border-white/40"
              onClick={() => (isLoggedIn ? localeNavigate('/role-select') : localeNavigate('/auth'))}
            >
              {t('index.joinNow')}
            </Button>
          </div>
        </div>
      </section>

      {/* ===== Footer ===== */}
      <footer className="bg-gray-950 border-t border-gray-800 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <Globe className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold text-white">{t('index.appName')}</span>
              </div>
              <p className="text-sm text-gray-500">{t('index.footerTagline')}</p>
            </div>
            <div>
              <h4 className="text-white font-medium mb-3">{t('index.quickLinks')}</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to={path('/marketplace')} className="hover:text-white transition-colors">{t('nav.marketplace')}</Link></li>
                <li><Link to={path('/creators')} className="hover:text-white transition-colors">{t('nav.creators')}</Link></li>
                <li><Link to={path('/merchants')} className="hover:text-white transition-colors">{t('nav.merchants')}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-medium mb-3">{t('index.platformLabel')}</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to={path('/auth')} className="hover:text-white transition-colors">{t('index.registerLogin')}</Link></li>
                <li><Link to={path('/merchant')} className="hover:text-white transition-colors">{t('index.merchantConsole')}</Link></li>
                <li><Link to={path('/creator')} className="hover:text-white transition-colors">{t('index.creatorStudio')}</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-500">
            <p>{t('index.copyright')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}