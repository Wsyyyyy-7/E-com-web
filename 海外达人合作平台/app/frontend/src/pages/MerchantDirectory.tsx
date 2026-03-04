import { useState, useEffect } from 'react';
import { client } from '../lib/api';
import type { UserProfile, Campaign } from '../lib/types';
import { COUNTRIES } from '../lib/types';
import Navbar from '../components/Navbar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Search, MapPin, Store, Loader2, Building2, FileText,
  CheckCircle, Clock
} from 'lucide-react';

const MERCHANT_IMG = 'https://mgx-backend-cdn.metadl.com/generate/images/999838/2026-03-04/3881b601-d08f-4cb8-8397-4e67f42dd8ab.png';

interface MerchantWithCampaigns extends UserProfile {
  campaignList?: Campaign[];
}

const demoMerchants: MerchantWithCampaigns[] = [
  {
    id: 101, user_id: 'm1', role: 'merchant', display_name: '深圳美妆科技有限公司',
    company_name: '深圳美妆科技', country: 'US',
    bio: '专注跨境美妆出海，主营口红、眼影、护肤品等品类。已在北美市场运营3年，合作达人超过200位。',
    trust_tier: 'trusted', subscription_plan: 'advanced',
    balance_frozen: 25000, balance_available: 50000,
    completion_rate: 97, ontime_rate: 95, dispute_rate: 1,
    created_at: '2024-06-15T00:00:00Z',
    campaignList: [
      {
        id: 1, user_id: 'm1', title: '美妆新品TikTok推广 — 北美市场',
        description: '寻找北美美妆达人合作推广新款口红系列', country: 'US', platform: 'tiktok',
        category: '美妆', collab_type: 'post_to_tiktok', total_budget: 15000,
        per_creator_min: 300, per_creator_max: 800, conditions: '[]', threshold: 3,
        milestones: '[]', deadline_apply: '2026-04-15', deadline_publish: '2026-05-15',
        retention_days: 30, status: 'active', applicant_count: 12, created_at: '2026-03-01T00:00:00Z',
      },
    ],
  },
  {
    id: 102, user_id: 'm2', role: 'merchant', display_name: '杭州家居生活品牌',
    company_name: '杭州家居生活', country: 'UK',
    bio: '北欧风格家居品牌，产品涵盖灯具、收纳、装饰品。英国市场新进入者，寻求达人合作提升品牌知名度。',
    trust_tier: 'verified', subscription_plan: 'basic',
    balance_frozen: 10000, balance_available: 20000,
    completion_rate: 90, ontime_rate: 88, dispute_rate: 3,
    created_at: '2025-01-20T00:00:00Z',
    campaignList: [
      {
        id: 2, user_id: 'm2', title: '家居好物Instagram种草 — 英国站',
        description: '为英国市场推广北欧风家居产品', country: 'UK', platform: 'instagram',
        category: '家居', collab_type: 'hybrid', total_budget: 20000,
        per_creator_min: 400, per_creator_max: 1000, conditions: '[]', threshold: 2,
        milestones: '[]', deadline_apply: '2026-04-20', deadline_publish: '2026-06-01',
        retention_days: 45, status: 'active', applicant_count: 8, created_at: '2026-03-02T00:00:00Z',
      },
    ],
  },
  {
    id: 103, user_id: 'm3', role: 'merchant', display_name: '广州数码配件工厂',
    company_name: '广州数码配件', country: 'CA',
    bio: '专业生产蓝牙耳机、充电器、手机壳等数码配件。工厂直销，价格优势明显，寻求海外达人长期合作。',
    trust_tier: 'trusted', subscription_plan: 'team',
    balance_frozen: 40000, balance_available: 80000,
    completion_rate: 99, ontime_rate: 98, dispute_rate: 0,
    created_at: '2024-03-10T00:00:00Z',
    campaignList: [
      {
        id: 3, user_id: 'm3', title: '数码配件YouTube测评 — 加拿大',
        description: '邀请科技类YouTuber测评新款无线耳机', country: 'CA', platform: 'youtube',
        category: '数码', collab_type: 'ugc_only', total_budget: 25000,
        per_creator_min: 500, per_creator_max: 1500, conditions: '[]', threshold: 3,
        milestones: '[]', deadline_apply: '2026-04-10', deadline_publish: '2026-05-20',
        retention_days: 60, status: 'active', applicant_count: 5, created_at: '2026-03-01T12:00:00Z',
      },
    ],
  },
  {
    id: 104, user_id: 'm4', role: 'merchant', display_name: '上海时尚服饰集团',
    company_name: '上海时尚服饰', country: 'AU',
    bio: '快时尚品牌，主打年轻女性市场。澳洲市场快速增长中，需要当地达人帮助推广春夏新品。',
    trust_tier: 'verified', subscription_plan: 'advanced',
    balance_frozen: 15000, balance_available: 30000,
    completion_rate: 93, ontime_rate: 91, dispute_rate: 2,
    created_at: '2025-04-05T00:00:00Z',
    campaignList: [],
  },
];

const tierColors: Record<string, string> = {
  trusted: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  verified: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  new: 'bg-white/5 text-gray-400 border-white/10',
};

const tierLabels: Record<string, string> = {
  trusted: '⭐ Trusted', verified: '✓ Verified', new: 'New',
};

export default function MerchantDirectory() {
  const [merchants, setMerchants] = useState<MerchantWithCampaigns[]>([]);
  const [allCampaigns, setAllCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCountry, setFilterCountry] = useState('all');
  const [selectedMerchant, setSelectedMerchant] = useState<MerchantWithCampaigns | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [merchantRes, campaignRes] = await Promise.all([
          client.entities.user_profiles.queryAll({
            query: { role: 'merchant' },
            sort: '-created_at',
            limit: 100,
          }),
          client.entities.campaigns.queryAll({
            query: {},
            sort: '-created_at',
            limit: 200,
          }),
        ]);
        const merchantItems = merchantRes?.data?.items || [];
        const campaignItems = campaignRes?.data?.items || [];

        if (merchantItems.length > 0) {
          setAllCampaigns(campaignItems);
          const enriched = merchantItems.map((m: UserProfile) => ({
            ...m,
            campaignList: campaignItems.filter((c: Campaign) => c.user_id === m.user_id),
          }));
          setMerchants(enriched);
        } else {
          setMerchants(demoMerchants);
          setAllCampaigns([]);
        }
      } catch {
        setMerchants(demoMerchants);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const filtered = merchants.filter(m => {
    if (filterCountry !== 'all' && m.country !== filterCountry) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (
        !m.display_name?.toLowerCase().includes(q) &&
        !m.company_name?.toLowerCase().includes(q) &&
        !m.bio?.toLowerCase().includes(q)
      ) return false;
    }
    return true;
  });

  const getMerchantCampaigns = (m: MerchantWithCampaigns) => {
    if (m.campaignList && m.campaignList.length > 0) return m.campaignList;
    return allCampaigns.filter(c => c.user_id === m.user_id);
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />

      {/* Header with decorative image */}
      <section className="pt-20 pb-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/60 via-gray-950 to-gray-950" />
        <div className="absolute top-0 right-0 w-1/4 h-full opacity-15">
          <img src={MERCHANT_IMG} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-l from-transparent to-gray-950" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4 text-center relative z-10">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">商家目录 Merchant Directory</h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            查看商家的过往合作历史、信誉评级和发布的活动，选择靠谱的合作伙伴
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search & Filters */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-6">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input
                className="pl-9 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                placeholder="搜索商家名称、简介... Search merchants..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={filterCountry} onValueChange={setFilterCountry}>
              <SelectTrigger className="w-36 bg-gray-800 border-gray-700 text-gray-300">
                <MapPin className="w-3.5 h-3.5 mr-1 text-gray-500" />
                <SelectValue placeholder="目标市场" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-800">
                <SelectItem value="all">全部市场</SelectItem>
                {COUNTRIES.map(c => <SelectItem key={c.code} value={c.code}>{c.flag} {c.code}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <p className="text-sm text-gray-500 mb-4">共 {filtered.length} 家商家</p>

        {/* Merchant Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-12 text-center">
            <Store className="w-12 h-12 text-gray-700 mx-auto mb-3" />
            <p className="text-lg font-medium text-gray-400">没有找到匹配的商家</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(m => {
              const mCampaigns = getMerchantCampaigns(m);
              const activeCampaigns = mCampaigns.filter(c => c.status === 'active');
              const totalBudget = mCampaigns.reduce((s, c) => s + (c.total_budget || 0), 0);

              return (
                <div
                  key={m.id}
                  className="bg-gray-900 border border-gray-800 rounded-2xl p-5 hover:border-gray-700 transition-all cursor-pointer group hover:-translate-y-0.5"
                  onClick={() => setSelectedMerchant(m)}
                >
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center flex-shrink-0 border border-indigo-500/20">
                      <Building2 className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white group-hover:text-indigo-400 transition-colors truncate">
                        {m.display_name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={`${tierColors[m.trust_tier || 'new']} text-xs`}>
                          {tierLabels[m.trust_tier || 'new']}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {m.bio && (
                    <p className="text-sm text-gray-500 line-clamp-2 mb-3 min-h-[40px]">{m.bio}</p>
                  )}

                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="bg-gray-800 p-2 rounded-lg text-center">
                      <p className="text-xs text-gray-500">活动</p>
                      <p className="font-bold text-indigo-400">{mCampaigns.length}</p>
                    </div>
                    <div className="bg-gray-800 p-2 rounded-lg text-center">
                      <p className="text-xs text-gray-500">招募中</p>
                      <p className="font-bold text-emerald-400">{activeCampaigns.length}</p>
                    </div>
                    <div className="bg-gray-800 p-2 rounded-lg text-center">
                      <p className="text-xs text-gray-500">总预算</p>
                      <p className="font-bold text-amber-400">¥{(totalBudget / 1000).toFixed(0)}k</p>
                    </div>
                  </div>

                  <div className="border-t border-gray-800 pt-3 flex items-center justify-between text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                      履约 {m.completion_rate || 100}%
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      入驻 {m.created_at ? new Date(m.created_at).toLocaleDateString('zh-CN') : '-'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Merchant Detail Dialog */}
      <Dialog open={!!selectedMerchant} onOpenChange={() => setSelectedMerchant(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-gray-900 border-gray-800 text-white">
          {selectedMerchant && (() => {
            const mCampaigns = getMerchantCampaigns(selectedMerchant);
            return (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/20">
                      <Building2 className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div>
                      <span className="text-xl text-white">{selectedMerchant.display_name}</span>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={`${tierColors[selectedMerchant.trust_tier || 'new']} text-xs`}>
                          {tierLabels[selectedMerchant.trust_tier || 'new']}
                        </Badge>
                        {selectedMerchant.subscription_plan && (
                          <Badge className="bg-white/5 text-gray-400 hover:bg-white/5 border-white/10 text-xs">
                            {selectedMerchant.subscription_plan === 'team' ? '团队版' : selectedMerchant.subscription_plan === 'advanced' ? '进阶版' : '基础版'}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-5 mt-4">
                  {selectedMerchant.bio && (
                    <p className="text-gray-400">{selectedMerchant.bio}</p>
                  )}

                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-gray-800 p-3 rounded-lg text-center">
                      <p className="text-xs text-gray-500 mb-1">履约率</p>
                      <p className="text-lg font-bold text-emerald-400">{selectedMerchant.completion_rate || 100}%</p>
                    </div>
                    <div className="bg-gray-800 p-3 rounded-lg text-center">
                      <p className="text-xs text-gray-500 mb-1">准时率</p>
                      <p className="text-lg font-bold text-sky-400">{selectedMerchant.ontime_rate || 100}%</p>
                    </div>
                    <div className="bg-gray-800 p-3 rounded-lg text-center">
                      <p className="text-xs text-gray-500 mb-1">纠纷率</p>
                      <p className="text-lg font-bold text-amber-400">{selectedMerchant.dispute_rate || 0}%</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">入驻时间 Joined</span>
                      <span className="text-gray-300">{selectedMerchant.created_at ? new Date(selectedMerchant.created_at).toLocaleDateString('zh-CN') : '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">发布活动 Campaigns</span>
                      <span className="font-medium text-gray-300">{mCampaigns.length} 个</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">总预算 Total Budget</span>
                      <span className="font-medium text-emerald-400">
                        ¥{mCampaigns.reduce((s, c) => s + (c.total_budget || 0), 0).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {mCampaigns.length > 0 && (
                    <div>
                      <h4 className="font-medium text-white mb-3 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        过往活动 Campaign History
                      </h4>
                      <div className="space-y-3">
                        {mCampaigns.map(c => (
                          <div key={c.id} className="bg-gray-800 p-3 rounded-lg">
                            <div className="flex items-center justify-between mb-1">
                              <h5 className="font-medium text-sm text-gray-200 truncate flex-1">{c.title}</h5>
                              <Badge className={
                                c.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/10 border-emerald-500/20 ml-2 text-xs' :
                                c.status === 'completed' ? 'bg-sky-500/10 text-sky-400 hover:bg-sky-500/10 border-sky-500/20 ml-2 text-xs' :
                                'bg-white/5 text-gray-400 hover:bg-white/5 border-white/10 ml-2 text-xs'
                              }>
                                {c.status === 'active' ? '招募中' : c.status === 'completed' ? '已完成' : c.status}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-gray-500">
                              <span>{COUNTRIES.find(co => co.code === c.country)?.flag} {c.country}</span>
                              <span>{c.platform}</span>
                              <span>{c.category}</span>
                              <span className="text-emerald-400">¥{c.total_budget?.toLocaleString()}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white" onClick={() => setSelectedMerchant(null)}>
                    关闭
                  </Button>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>

      <footer className="bg-gray-950 border-t border-gray-800 text-gray-500 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm">© 2026 CreatorBridge. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}