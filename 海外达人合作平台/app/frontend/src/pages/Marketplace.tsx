import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { Campaign } from '../lib/types';
import { COUNTRIES, PLATFORMS, CATEGORIES } from '../lib/types';
import Navbar from '../components/Navbar';
import { useLocalePath, useLocaleNavigate } from '../hooks/useLocalePath';
import { TranslatedText } from '../components/TranslatedText';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import {
  Search, MapPin, Filter, Clock, CheckCircle, Loader2,
  TrendingUp, Users, Globe, Sparkles, ArrowRight, DollarSign, Tag
} from 'lucide-react';

const HERO_BG = 'https://mgx-backend-cdn.metadl.com/generate/images/999838/2026-03-04/7b456cbb-e7ae-444b-b8cf-25e64b74fcff.png';
const FALLBACK_PRODUCT_IMAGE = 'https://mgx-backend-cdn.metadl.com/generate/images/999838/2026-03-04/34b9b1f7-f6a1-4f9a-bf1f-1d83c651e2a2.png';

const demoCampaigns: Campaign[] = [
  {
    id: 1, user_id: 'demo', title: '美妆新品TikTok推广 — 北美市场',
    description: '寻找北美美妆达人合作推广新款口红系列，需要制作开箱视频和使用教程。预算充足，长期合作优先。',
    country: 'US', platform: 'tiktok', category: '美妆', collab_type: 'post_to_tiktok',
    total_budget: 15000, per_creator_min: 300, per_creator_max: 800,
    conditions: JSON.stringify(['视频播放量≥5000', '点赞数≥500', '评论数≥50']),
    threshold: 3, milestones: JSON.stringify([{ name: '脚本确认', percent: 20 }, { name: '成片提交', percent: 30 }, { name: '发布链接', percent: 30 }, { name: '条件达标', percent: 20 }]),
    deadline_apply: '2026-04-15', deadline_publish: '2026-05-15', retention_days: 30,
    status: 'active', applicant_count: 12, created_at: '2026-03-01T00:00:00Z',
  },
  {
    id: 2, user_id: 'demo', title: '家居好物Instagram种草 — 英国站',
    description: '为英国市场推广北欧风家居产品，需要拍摄精美的家居场景图和Reels短视频。',
    country: 'UK', platform: 'instagram', category: '家居', collab_type: 'hybrid',
    total_budget: 20000, per_creator_min: 400, per_creator_max: 1000,
    conditions: JSON.stringify(['帖子互动率≥3%', 'Reels播放≥8000', '保存数≥200']),
    threshold: 2, milestones: JSON.stringify([{ name: '脚本确认', percent: 20 }, { name: '成片提交', percent: 30 }, { name: '发布链接', percent: 30 }, { name: '条件达标', percent: 20 }]),
    deadline_apply: '2026-04-20', deadline_publish: '2026-06-01', retention_days: 45,
    status: 'active', applicant_count: 8, created_at: '2026-03-02T00:00:00Z',
  },
  {
    id: 3, user_id: 'demo', title: '数码配件YouTube测评 — 加拿大',
    description: '邀请科技类YouTuber测评新款无线耳机，需要详细的产品对比和使用体验分享。',
    country: 'CA', platform: 'youtube', category: '数码', collab_type: 'ugc_only',
    total_budget: 25000, per_creator_min: 500, per_creator_max: 1500,
    conditions: JSON.stringify(['视频观看≥10000', '平均观看时长≥3分钟', '评论数≥100']),
    threshold: 3, milestones: JSON.stringify([{ name: '脚本确认', percent: 20 }, { name: '成片提交', percent: 30 }, { name: '发布链接', percent: 30 }, { name: '条件达标', percent: 20 }]),
    deadline_apply: '2026-04-10', deadline_publish: '2026-05-20', retention_days: 60,
    status: 'active', applicant_count: 5, created_at: '2026-03-01T12:00:00Z',
  },
  {
    id: 4, user_id: 'demo', title: '时尚服饰TikTok带货 — 澳洲',
    description: '寻找澳洲时尚达人合作推广春季新款连衣裙系列，需要穿搭展示和购物链接推广。',
    country: 'AU', platform: 'tiktok', category: '服饰', collab_type: 'post_to_tiktok',
    total_budget: 10000, per_creator_min: 250, per_creator_max: 600,
    conditions: JSON.stringify(['视频播放量≥3000', '点击购物链接≥100', '转化订单≥10']),
    threshold: 2, milestones: JSON.stringify([{ name: '脚本确认', percent: 20 }, { name: '成片提交', percent: 30 }, { name: '发布链接', percent: 30 }, { name: '条件达标', percent: 20 }]),
    deadline_apply: '2026-04-25', deadline_publish: '2026-05-30', retention_days: 30,
    status: 'active', applicant_count: 18, created_at: '2026-03-03T00:00:00Z',
  },
  {
    id: 5, user_id: 'demo', title: '母婴用品Instagram推广 — 美国',
    description: '推广有机婴儿护肤品系列，需要妈妈博主拍摄真实使用场景和产品测评。',
    country: 'US', platform: 'instagram', category: '母婴', collab_type: 'hybrid',
    total_budget: 12000, per_creator_min: 300, per_creator_max: 700,
    conditions: JSON.stringify(['帖子点赞≥1000', '评论≥80', '分享≥50']),
    threshold: 2, milestones: JSON.stringify([{ name: '脚本确认', percent: 20 }, { name: '成片提交', percent: 30 }, { name: '发布链接', percent: 30 }, { name: '条件达标', percent: 20 }]),
    deadline_apply: '2026-04-18', deadline_publish: '2026-05-25', retention_days: 30,
    status: 'active', applicant_count: 15, created_at: '2026-03-02T08:00:00Z',
  },
  {
    id: 6, user_id: 'demo', title: '运动装备TikTok挑战赛 — 德国',
    description: '发起TikTok运动挑战赛，推广新款跑步鞋，需要运动类达人参与并带动UGC内容。',
    country: 'DE', platform: 'tiktok', category: '运动', collab_type: 'post_to_tiktok',
    total_budget: 18000, per_creator_min: 350, per_creator_max: 900,
    conditions: JSON.stringify(['视频播放≥8000', '挑战参与人数≥50', '使用品牌标签']),
    threshold: 2, milestones: JSON.stringify([{ name: '脚本确认', percent: 20 }, { name: '成片提交', percent: 30 }, { name: '发布链接', percent: 30 }, { name: '条件达标', percent: 20 }]),
    deadline_apply: '2026-04-22', deadline_publish: '2026-06-05', retention_days: 45,
    status: 'active', applicant_count: 7, created_at: '2026-03-03T06:00:00Z',
  },
];

const platformIcons: Record<string, string> = {
  tiktok: '📱', instagram: '📷', youtube: '🎬',
};

export default function Marketplace() {
  const { t, i18n } = useTranslation();
  const { path } = useLocalePath();
  const localeNavigate = useLocaleNavigate();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCountry, setFilterCountry] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterPlatform, setFilterPlatform] = useState('all');
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);

  useEffect(() => {
    const fetchCampaigns = async () => {
      setLoading(true);
      try {
        const query = encodeURIComponent(JSON.stringify({ status: 'active' }));
        const res = await fetch(`/api/v1/entities/campaigns/all?limit=50&sort=-created_at&query=${query}`);
        if (res.ok) {
          const data = await res.json();
          const items = data?.items ?? [];
          setCampaigns(Array.isArray(items) ? items : demoCampaigns);
        } else {
          setCampaigns(demoCampaigns);
        }
      } catch {
        setCampaigns(demoCampaigns);
      }
      setLoading(false);
    };
    fetchCampaigns();
  }, []);

  const filtered = campaigns.filter(c => {
    if (filterCountry !== 'all' && c.country !== filterCountry) return false;
    if (filterCategory !== 'all' && c.category !== filterCategory) return false;
    if (filterPlatform !== 'all' && c.platform !== filterPlatform) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!c.title?.toLowerCase().includes(q) && !c.description?.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const parseSafe = (str: string, fallback: unknown[] = []) => {
    try { return JSON.parse(str || '[]'); } catch { return fallback; }
  };

  const totalApplicants = campaigns.reduce((s, c) => s + (c.applicant_count || 0), 0);

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />

      {/* Hero Banner with image accent */}
      <section className="pt-20 pb-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/80 via-gray-950 to-gray-950" />
        {/* Decorative image — small, positioned to the right */}
        <div className="absolute top-0 right-0 w-1/3 h-full opacity-20">
          <img src={HERO_BG} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-l from-transparent to-gray-950" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4 relative z-10">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
              {t('marketplace.title')}
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              {t('marketplace.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 max-w-xl mx-auto mb-8">
            <div className="text-center bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="text-2xl font-bold text-white">{campaigns.length}</span>
              </div>
              <p className="text-xs text-gray-400">{t('marketplace.activeProjects')}</p>
            </div>
            {/* Budget is intentionally hidden from public marketplace; creators only see per-creator range inside cards/details. */}
            <div className="text-center bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Users className="w-4 h-4 text-sky-400" />
                <span className="text-2xl font-bold text-white">{totalApplicants}</span>
              </div>
              <p className="text-xs text-gray-400">{t('marketplace.applicants')}</p>
            </div>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl border border-white/10 p-2 flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input
                  className="pl-9 border-0 shadow-none focus-visible:ring-0 h-10 bg-transparent text-white placeholder:text-gray-500"
                  placeholder={t('marketplace.searchPlaceholder')}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
              <Button className="bg-indigo-600 hover:bg-indigo-500 text-white h-10 px-6">
                <Search className="w-4 h-4 mr-1" /> {t('marketplace.search')}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Filters + Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Bar */}
        <div className="flex flex-wrap gap-3 mb-6 items-center">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Filter className="w-4 h-4" />
            <span>{t('marketplace.filter')}</span>
          </div>
          <Select value={filterCountry} onValueChange={setFilterCountry}>
            <SelectTrigger className="w-36 bg-gray-900 border-gray-800 text-gray-300">
              <MapPin className="w-3.5 h-3.5 mr-1 text-gray-500" />
              <SelectValue placeholder={t('marketplace.country')} />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-gray-800">
              <SelectItem value="all">{t('marketplace.allCountries')}</SelectItem>
              {COUNTRIES.map(c => <SelectItem key={c.code} value={c.code}>{c.flag} {c.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterPlatform} onValueChange={setFilterPlatform}>
            <SelectTrigger className="w-36 bg-gray-900 border-gray-800 text-gray-300">
              <Globe className="w-3.5 h-3.5 mr-1 text-gray-500" />
              <SelectValue placeholder={t('marketplace.platform')} />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-gray-800">
              <SelectItem value="all">{t('marketplace.allPlatforms')}</SelectItem>
              {PLATFORMS.map(p => <SelectItem key={p.value} value={p.value}>{p.icon} {p.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-36 bg-gray-900 border-gray-800 text-gray-300">
              <Tag className="w-3.5 h-3.5 mr-1 text-gray-500" />
              <SelectValue placeholder={t('marketplace.category')} />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-gray-800">
              <SelectItem value="all">{t('marketplace.allCategories')}</SelectItem>
              {CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <div className="ml-auto text-sm text-gray-500">
            {t('marketplace.projectsCount', { count: filtered.length })}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-12 text-center">
            <Search className="w-12 h-12 text-gray-700 mx-auto mb-3" />
            <p className="text-lg font-medium text-gray-400">{t('marketplace.noResults')}</p>
            <p className="text-sm mt-1 text-gray-500">{t('marketplace.noResultsHint')}</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(c => (
              <div
                key={c.id}
                className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-gray-700 transition-all cursor-pointer group hover:-translate-y-0.5 flex flex-col"
                onClick={() => setSelectedCampaign(c)}
              >
                {/* 商品图：1:1 区域，object-contain 完整显示不裁剪 */}
                <div className="aspect-square w-full flex items-center justify-center bg-gray-800/90 p-3">
                  <img
                    src={c.product_image_url || FALLBACK_PRODUCT_IMAGE}
                    alt={c.title}
                    className="max-w-full max-h-full object-contain group-hover:scale-[1.03] transition-transform duration-300"
                  />
                </div>
                <div className="p-4 flex flex-col flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <Badge className="bg-white/5 text-gray-300 hover:bg-white/5 border border-white/10 text-xs gap-1 shrink-0">
                      {platformIcons[c.platform] || '📱'} {c.platform}
                    </Badge>
                    <Badge className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/10 border-emerald-500/20 text-xs shrink-0">
                      {c.status === 'active' ? t('marketplace.recruiting') : c.status}
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-white mb-1.5 group-hover:text-indigo-400 transition-colors line-clamp-2 text-sm leading-snug">
                    <TranslatedText text={c.title} textEn={c.title_en} />
                  </h3>
                  <p className="text-xs text-gray-500 line-clamp-2 mb-3 flex-1 min-h-[2.5rem]">
                    <TranslatedText text={c.description} textEn={c.description_en} />
                  </p>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    <Badge className="bg-white/5 text-gray-400 hover:bg-white/5 border-white/10 text-xs">
                      {COUNTRIES.find(co => co.code === c.country)?.flag} {c.country}
                    </Badge>
                    <Badge className="bg-white/5 text-gray-400 hover:bg-white/5 border-white/10 text-xs">{c.category}</Badge>
                  </div>
                  <div className="border-t border-gray-800 pt-3 flex items-center justify-between gap-2">
                    <span className="text-emerald-400 font-semibold text-sm shrink-0">
                      ¥{c.per_creator_min} - ¥{c.per_creator_max}
                    </span>
                    <div className="flex items-center gap-2 text-xs text-gray-500 shrink-0">
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        {c.applicant_count || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {c.deadline_apply ? new Date(c.deadline_apply).toLocaleDateString() : t('marketplace.deadlineOngoing')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Links */}
        <div className="mt-12 grid sm:grid-cols-2 gap-6">
          <div
            className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex items-center gap-4 cursor-pointer group hover:border-gray-700 transition-all"
            onClick={() => localeNavigate(path('/creators'))}
          >
            <div className="w-12 h-12 bg-sky-500/10 rounded-xl flex items-center justify-center flex-shrink-0 border border-sky-500/20">
              <Users className="w-6 h-6 text-sky-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-white group-hover:text-sky-400 transition-colors">
                {t('marketplace.browseCreators')}
              </h3>
              <p className="text-sm text-gray-500 mt-0.5">{t('marketplace.browseCreatorsDescLong')}</p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-sky-400 transition-colors" />
          </div>
          <div
            className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex items-center gap-4 cursor-pointer group hover:border-gray-700 transition-all"
            onClick={() => localeNavigate(path('/merchants'))}
          >
            <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center flex-shrink-0 border border-indigo-500/20">
              <TrendingUp className="w-6 h-6 text-indigo-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-white group-hover:text-indigo-400 transition-colors">
                {t('marketplace.forMerchants')}
              </h3>
              <p className="text-sm text-gray-500 mt-0.5">{t('marketplace.forMerchantsDescLong')}</p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-indigo-400 transition-colors" />
          </div>
        </div>
      </section>

      {/* Campaign Detail Dialog */}
      <Dialog open={!!selectedCampaign} onOpenChange={() => setSelectedCampaign(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-gray-900 border-gray-800 text-white">
          {selectedCampaign && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl text-white">
                  <TranslatedText text={selectedCampaign.title} textEn={selectedCampaign.title_en} />
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-5 mt-4">
                {/* 商品图片 */}
                <div className="rounded-xl overflow-hidden bg-gray-800 max-h-64 flex items-center justify-center">
                  <img
                    src={selectedCampaign.product_image_url || FALLBACK_PRODUCT_IMAGE}
                    alt={selectedCampaign.title}
                    className="w-full max-h-64 object-contain"
                  />
                </div>
                <p className="text-gray-400">
                  <TranslatedText text={selectedCampaign.description} textEn={selectedCampaign.description_en} as="span" />
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { labelKey: 'marketplace.countryLabel', value: `${COUNTRIES.find(co => co.code === selectedCampaign.country)?.flag || ''} ${selectedCampaign.country}` },
                    { labelKey: 'marketplace.platformLabel', value: `${platformIcons[selectedCampaign.platform] || ''} ${selectedCampaign.platform}` },
                    { labelKey: 'marketplace.categoryLabel', value: selectedCampaign.category },
                    { labelKey: 'marketplace.perCreatorLabel', value: `¥${selectedCampaign.per_creator_min} - ¥${selectedCampaign.per_creator_max}` },
                    { labelKey: 'marketplace.retentionLabel', value: t('marketplace.retentionDays', { days: selectedCampaign.retention_days }) },
                  ].map((item, i) => (
                    <div key={i} className="bg-gray-800 p-3 rounded-lg">
                      <span className="text-gray-500 text-xs block mb-1">{t(item.labelKey)}</span>
                      <span className="font-medium text-sm text-gray-200">{item.value}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <h4 className="font-medium text-white mb-2">{t('marketplace.requirementsTitle')}</h4>
                  <div className="space-y-2">
                    {(i18n.language === 'en' && selectedCampaign.conditions_en
                      ? parseSafe(selectedCampaign.conditions_en)
                      : parseSafe(selectedCampaign.conditions)
                    ).map((cond: string, i: number) => (
                      <div key={i} className="flex items-center gap-2 text-sm bg-gray-800 p-2.5 rounded-lg">
                        <CheckCircle className="w-4 h-4 text-gray-500 flex-shrink-0" />
                        <span className="text-gray-300">
                          {i18n.language === 'en' && selectedCampaign.conditions_en ? cond : <TranslatedText text={cond} as="span" />}
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">{t('marketplace.thresholdHint', { n: selectedCampaign.threshold })}</p>
                </div>
                <div>
                  <h4 className="font-medium text-white mb-2">{t('marketplace.milestonesTitle')}</h4>
                  <div className="space-y-2">
                    {(i18n.language === 'en' && selectedCampaign.milestones_en
                      ? parseSafe(selectedCampaign.milestones_en)
                      : parseSafe(selectedCampaign.milestones)
                    ).map((ms: { name: string; percent: number }, i: number) => (
                      <div key={i} className="flex items-center gap-3 p-2.5 bg-gray-800 rounded-lg">
                        <div className="w-7 h-7 bg-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</div>
                        <span className="text-sm flex-1 text-gray-300">
                          {i18n.language === 'en' && selectedCampaign.milestones_en ? ms.name : <TranslatedText text={ms.name} as="span" />}
                        </span>
                        <Badge className="bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/10 border-indigo-500/20">{ms.percent}%</Badge>
                      </div>
                    ))}
                  </div>
                </div>
                <Separator className="bg-gray-800" />
                <div className="flex gap-3">
                  <Button
                    className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white"
                    onClick={() => { setSelectedCampaign(null); localeNavigate(path('/creator')); }}
                  >
                    {t('marketplace.applyNow')} <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                  <Button variant="outline" className="!bg-transparent border-gray-700 text-gray-300 hover:!bg-gray-800" onClick={() => setSelectedCampaign(null)}>
                    {t('marketplace.close')}
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="bg-gray-950 border-t border-gray-800 text-gray-500 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm">© 2026 CreatorBridge. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}