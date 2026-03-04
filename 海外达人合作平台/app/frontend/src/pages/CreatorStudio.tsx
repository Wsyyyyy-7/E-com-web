import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import type { Campaign, Contract, Application, Message } from '../lib/types';
import { COUNTRIES, CATEGORIES } from '../lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  Globe, Compass, FileText, DollarSign, User, LogOut,
  Search, Filter, MapPin, Clock, CheckCircle, Loader2,
  Send, Star, Lock, Unlock, ArrowRight
} from 'lucide-react';

type CreatorTab = 'discover' | 'contracts' | 'earnings' | 'profile' | 'messages';

export default function CreatorStudio() {
  const { isLoggedIn, profile, loading: authLoading, logout, login } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<CreatorTab>('discover');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [filterCountry, setFilterCountry] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = useCallback(async () => {
    // Demo mode: data is provided by demo arrays and local actions only
    setLoadingData(false);
  }, []);

  // 已登录且角色为 creator 时使用真实账号，否则为展示用的 demo
  const isDemo = !(isLoggedIn && profile?.role === 'creator');

  const demoProfile = {
    display_name: 'Demo Creator',
    role: 'creator' as const,
    trust_tier: 'verified',
    completion_rate: 95,
    ontime_rate: 92,
    dispute_rate: 2,
    balance_available: 1280,
    country: 'US',
    categories: 'Beauty, Fashion',
    tiktok_handle: '@demo_creator',
    rate_min: 200,
    rate_max: 800,
  };

  const demoCampaigns: Campaign[] = [
    {
      id: 1, title: '美妆新品TikTok推广 — 北美市场', description: '寻找北美美妆达人合作推广新款口红系列，需要制作开箱视频和使用教程。', country: 'US', platform: 'TikTok', category: 'beauty',
      per_creator_min: 300, per_creator_max: 800, retention_days: 30, threshold: 3, status: 'active',
      conditions: JSON.stringify(['视频播放量≥5000', '点赞数≥500', '评论数≥50', '视频时长≥60秒', '使用指定标签']),
      milestones: JSON.stringify([{ name: '签约确认', percent: 10 }, { name: '内容提交', percent: 30 }, { name: '发布上线', percent: 30 }, { name: '数据达标', percent: 30 }]),
      deadline_apply: '2026-04-15', deadline_deliver: '2026-05-15', created_at: '2026-03-01T00:00:00Z',
    },
    {
      id: 2, title: '家居好物Instagram种草 — 英国站', description: '为英国市场推广北欧风家居产品，需要拍摄精美的家居场景图和Reels短视频。', country: 'GB', platform: 'Instagram', category: 'home',
      per_creator_min: 400, per_creator_max: 1000, retention_days: 45, threshold: 3, status: 'active',
      conditions: JSON.stringify(['帖子互动率≥3%', 'Reels播放≥8000', '保存数≥200', '使用品牌标签', '发布Stories']),
      milestones: JSON.stringify([{ name: '签约确认', percent: 10 }, { name: '内容提交', percent: 30 }, { name: '发布上线', percent: 30 }, { name: '数据达标', percent: 30 }]),
      deadline_apply: '2026-04-20', deadline_deliver: '2026-06-01', created_at: '2026-03-02T00:00:00Z',
    },
    {
      id: 3, title: '数码配件YouTube测评 — 加拿大', description: '邀请科技类YouTuber测评新款无线耳机，需要详细的产品对比和使用体验分享。', country: 'CA', platform: 'YouTube', category: 'electronics',
      per_creator_min: 500, per_creator_max: 1500, retention_days: 60, threshold: 4, status: 'active',
      conditions: JSON.stringify(['视频观看≥10000', '平均观看时长≥3分钟', '评论数≥100', '点赞率≥5%', '订阅转化≥50']),
      milestones: JSON.stringify([{ name: '签约确认', percent: 10 }, { name: '内容提交', percent: 30 }, { name: '发布上线', percent: 30 }, { name: '数据达标', percent: 30 }]),
      deadline_apply: '2026-04-10', deadline_deliver: '2026-05-20', created_at: '2026-03-01T12:00:00Z',
    },
    {
      id: 4, title: '时尚服饰TikTok带货 — 澳洲', description: '寻找澳洲时尚达人合作推广春季新款连衣裙系列，需要穿搭展示和购物链接推广。', country: 'AU', platform: 'TikTok', category: 'fashion',
      per_creator_min: 250, per_creator_max: 600, retention_days: 30, threshold: 3, status: 'active',
      conditions: JSON.stringify(['视频播放量≥3000', '点击购物链接≥100', '转化订单≥10', '使用品牌音乐']),
      milestones: JSON.stringify([{ name: '签约确认', percent: 10 }, { name: '内容提交', percent: 30 }, { name: '发布上线', percent: 30 }, { name: '数据达标', percent: 30 }]),
      deadline_apply: '2026-04-25', deadline_deliver: '2026-05-30', created_at: '2026-03-03T00:00:00Z',
    },
  ];

  const demoContracts: Contract[] = [
    {
      id: 1, campaign_id: 1, status: 'active', current_milestone: 2, conditions_met: 2, conditions_total: 5,
      escrow_amount: 600, released_amount: 240, created_at: '2026-03-01T00:00:00Z',
    },
  ];

  const demoMessages: Message[] = [
    { id: 1, contract_id: 1, sender_role: 'system', msg_type: 'system', content: '恭喜！您已成功签约合作单 #1「美妆新品TikTok推广」', is_read: true, created_at: '2026-03-01T10:00:00Z' },
    { id: 2, contract_id: 1, sender_role: 'merchant', msg_type: 'manual', content: '欢迎加入！请在3天内提交内容初稿，有任何问题随时沟通。', is_read: true, created_at: '2026-03-01T14:00:00Z' },
    { id: 3, contract_id: 1, sender_role: 'system', msg_type: 'auto', content: '里程碑2「内容提交」已完成，30%款项已释放至您的账户。', is_read: false, created_at: '2026-03-02T09:00:00Z' },
  ];

  useEffect(() => {
    setCampaigns(demoCampaigns);
    setContracts(demoContracts);
    setMessages(demoMessages);
    setLoadingData(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, profile, fetchData, isDemo]);

  const shouldRedirectToRoleSelect = isLoggedIn && profile !== undefined && profile?.role !== 'creator';
  const shouldRedirectToHome = !authLoading && !isLoggedIn;
  useEffect(() => {
    if (shouldRedirectToRoleSelect) navigate('/role-select');
  }, [shouldRedirectToRoleSelect, navigate]);
  useEffect(() => {
    if (shouldRedirectToHome) navigate('/');
  }, [shouldRedirectToHome, navigate]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
      </div>
    );
  }

  if (shouldRedirectToRoleSelect) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
          <p className="text-gray-400">正在跳转到角色选择...</p>
        </div>
      </div>
    );
  }

  const activeProfile = isDemo ? demoProfile : profile;

  const filteredCampaigns = campaigns.filter(c => {
    if (filterCountry !== 'all' && !c.country?.includes(filterCountry)) return false;
    if (filterCategory !== 'all' && c.category !== filterCategory) return false;
    if (searchQuery && !c.title?.toLowerCase().includes(searchQuery.toLowerCase()) && !c.description?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const sidebarItems: { key: CreatorTab; icon: React.ElementType; label: string; badge?: number }[] = [
    { key: 'discover', icon: Compass, label: 'Discover' },
    { key: 'contracts', icon: FileText, label: 'My Contracts', badge: contracts.filter(c => c.status === 'active').length },
    { key: 'earnings', icon: DollarSign, label: 'Earnings' },
    { key: 'messages', icon: Send, label: 'Messages', badge: messages.filter(m => !m.is_read).length },
    { key: 'profile', icon: User, label: 'Profile' },
  ];

  return (
    <div className="min-h-screen bg-gray-950 flex">
      <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col fixed h-full z-40">
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-8 h-8 bg-sky-600 rounded-lg flex items-center justify-center">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-white">Creator Studio</span>
          </div>
          <p className="text-xs text-gray-500 mt-2 truncate">{activeProfile?.display_name || 'Creator'}</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {sidebarItems.map(item => (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                activeTab === item.key ? 'bg-sky-500/10 text-sky-400 font-medium' : 'text-gray-400 hover:bg-white/5 hover:text-gray-300'
              }`}
            >
              <item.icon className="w-4 h-4" />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge ? (
                <Badge className="bg-sky-500/10 text-sky-400 hover:bg-sky-500/10 border-sky-500/20 h-5 min-w-[20px] flex items-center justify-center text-xs">
                  {item.badge}
                </Badge>
              ) : null}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-800">
          <div className="px-3 py-2 mb-2">
            <div className="flex items-center gap-2 mb-1">
              <Star className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-medium text-gray-300">
                {activeProfile?.trust_tier === 'trusted' ? 'Trusted' : activeProfile?.trust_tier === 'verified' ? 'Verified' : 'New Creator'}
              </span>
            </div>
            <div className="text-xs text-gray-500">
              Completion: {activeProfile?.completion_rate || 100}%
            </div>
          </div>
          {isDemo ? (
            <button onClick={login} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sky-400 hover:bg-sky-500/10 font-medium">
              <User className="w-4 h-4" />
              Sign In
            </button>
          ) : (
            <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-500 hover:bg-white/5 hover:text-gray-400">
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          )}
        </div>
      </aside>

      <main className="flex-1 ml-64 p-6">
        {isDemo && (
          <div className="mb-4 bg-amber-500/5 border border-amber-500/20 rounded-lg p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-400" />
              <span className="text-sm text-amber-300">Demo Mode — 展示模式，登录后可使用完整功能</span>
            </div>
            <Button size="sm" className="bg-sky-600 hover:bg-sky-500 text-white" onClick={login}>Sign In</Button>
          </div>
        )}
        {activeTab === 'discover' && (
          <DiscoverView
            campaigns={filteredCampaigns}
            loading={loadingData}
            filterCountry={filterCountry}
            filterCategory={filterCategory}
            searchQuery={searchQuery}
            onFilterCountry={setFilterCountry}
            onFilterCategory={setFilterCategory}
            onSearch={setSearchQuery}
            selectedCampaign={selectedCampaign}
            onSelectCampaign={setSelectedCampaign}
            applications={applications}
            onRefresh={fetchData}
          />
        )}
        {activeTab === 'contracts' && <ContractsView contracts={contracts} />}
        {activeTab === 'earnings' && <EarningsView profile={activeProfile} contracts={contracts} />}
        {activeTab === 'messages' && <CreatorMessagesView messages={messages} />}
        {activeTab === 'profile' && <ProfileView profile={activeProfile} />}
      </main>
    </div>
  );
}

function DiscoverView({
  campaigns, loading, filterCountry, filterCategory, searchQuery,
  onFilterCountry, onFilterCategory, onSearch, selectedCampaign, onSelectCampaign,
  applications, onRefresh
}: {
  campaigns: Campaign[]; loading: boolean;
  filterCountry: string; filterCategory: string; searchQuery: string;
  onFilterCountry: (v: string) => void; onFilterCategory: (v: string) => void; onSearch: (v: string) => void;
  selectedCampaign: Campaign | null; onSelectCampaign: (c: Campaign | null) => void;
  applications: Application[]; onRefresh: () => void;
}) {
  const [applyRate, setApplyRate] = useState('');
  const [applyMsg, setApplyMsg] = useState('');
  const [applying, setApplying] = useState(false);

  const handleApply = async () => {
    if (!selectedCampaign || !applyRate) return;
    setApplying(true);
    try {
      toast.success('Application submitted!（本地演示）');
      setApplyRate('');
      setApplyMsg('');
      onSelectCampaign(null);
      onRefresh();
    } catch (e) {
      toast.error('Failed to submit application');
    }
    setApplying(false);
  };

  const parseSafe = (str: string, fallback: any[] = []) => {
    try { return JSON.parse(str || '[]'); } catch { return fallback; }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Discover Campaigns</h1>
      <Card className="bg-gray-900 border-gray-800 mb-6">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input className="pl-9 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500" placeholder="Search campaigns..." value={searchQuery} onChange={e => onSearch(e.target.value)} />
              </div>
            </div>
            <Select value={filterCountry} onValueChange={onFilterCountry}>
              <SelectTrigger className="w-40 bg-gray-800 border-gray-700 text-gray-300">
                <MapPin className="w-4 h-4 mr-1 text-gray-500" />
                <SelectValue placeholder="Country" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-800">
                <SelectItem value="all">All Countries</SelectItem>
                {COUNTRIES.map(c => <SelectItem key={c.code} value={c.code}>{c.flag} {c.code}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterCategory} onValueChange={onFilterCategory}>
              <SelectTrigger className="w-40 bg-gray-800 border-gray-700 text-gray-300">
                <Filter className="w-4 h-4 mr-1 text-gray-500" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-800">
                <SelectItem value="all">All Categories</SelectItem>
                {CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-sky-500" /></div>
      ) : campaigns.length === 0 ? (
        <Card className="bg-gray-900 border-gray-800"><CardContent className="p-8 text-center text-gray-500">No campaigns found</CardContent></Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {campaigns.map(c => {
            const hasApplied = applications.some(a => a.campaign_id === c.id);
            return (
              <div key={c.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 hover:border-gray-700 transition-all cursor-pointer group hover:-translate-y-0.5" onClick={() => onSelectCampaign(c)}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white mb-1 group-hover:text-sky-400 transition-colors">{c.title}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2">{c.description}</p>
                  </div>
                  {hasApplied && <Badge className="bg-sky-500/10 text-sky-400 hover:bg-sky-500/10 border-sky-500/20 ml-2 flex-shrink-0">Applied</Badge>}
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge className="bg-white/5 text-gray-400 hover:bg-white/5 border-white/10 text-xs">{COUNTRIES.find(co => co.code === c.country)?.flag} {c.country}</Badge>
                  <Badge className="bg-white/5 text-gray-400 hover:bg-white/5 border-white/10 text-xs">{c.platform}</Badge>
                  <Badge className="bg-white/5 text-gray-400 hover:bg-white/5 border-white/10 text-xs">{c.category}</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-emerald-400 font-medium">¥{c.per_creator_min} - ¥{c.per_creator_max}</span>
                  <div className="flex items-center gap-1 text-gray-500">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="text-xs">{c.deadline_apply ? new Date(c.deadline_apply).toLocaleDateString() : 'Open'}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={!!selectedCampaign} onOpenChange={() => onSelectCampaign(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-gray-900 border-gray-800 text-white">
          {selectedCampaign && (
            <>
              <DialogHeader><DialogTitle className="text-white">{selectedCampaign.title}</DialogTitle></DialogHeader>
              <div className="space-y-5 mt-4">
                <p className="text-sm text-gray-400">{selectedCampaign.description}</p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-gray-800 p-3 rounded-lg">
                    <span className="text-gray-500 block text-xs mb-1">Country</span>
                    <span className="font-medium text-gray-200">{selectedCampaign.country}</span>
                  </div>
                  <div className="bg-gray-800 p-3 rounded-lg">
                    <span className="text-gray-500 block text-xs mb-1">Platform</span>
                    <span className="font-medium text-gray-200">{selectedCampaign.platform}</span>
                  </div>
                  <div className="bg-gray-800 p-3 rounded-lg">
                    <span className="text-gray-500 block text-xs mb-1">Budget per Creator</span>
                    <span className="font-medium text-emerald-400">¥{selectedCampaign.per_creator_min} - ¥{selectedCampaign.per_creator_max}</span>
                  </div>
                  <div className="bg-gray-800 p-3 rounded-lg">
                    <span className="text-gray-500 block text-xs mb-1">Retention</span>
                    <span className="font-medium text-gray-200">{selectedCampaign.retention_days} days</span>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-white mb-2">Requirements</h4>
                  <div className="space-y-2">
                    {parseSafe(selectedCampaign.conditions).map((cond: string, i: number) => (
                      <div key={i} className="flex items-center gap-2 text-sm bg-gray-800 p-2.5 rounded-lg">
                        <CheckCircle className="w-4 h-4 text-gray-500 flex-shrink-0" />
                        <span className="text-gray-300">{cond}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Threshold: ≥{selectedCampaign.threshold} conditions for final payment</p>
                </div>
                <div>
                  <h4 className="font-medium text-white mb-2">Milestones & Payout</h4>
                  <div className="space-y-2">
                    {parseSafe(selectedCampaign.milestones).map((ms: { name: string; percent: number }, i: number) => (
                      <div key={i} className="flex items-center gap-3 p-2.5 bg-gray-800 rounded-lg">
                        <div className="w-7 h-7 bg-sky-500/20 text-sky-400 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</div>
                        <span className="text-sm flex-1 text-gray-300">{ms.name}</span>
                        <Badge className="bg-sky-500/10 text-sky-400 hover:bg-sky-500/10 border-sky-500/20">{ms.percent}%</Badge>
                      </div>
                    ))}
                  </div>
                </div>
                <Separator className="bg-gray-800" />
                {applications.some(a => a.campaign_id === selectedCampaign.id) ? (
                  <div className="bg-sky-500/5 border border-sky-500/20 p-4 rounded-lg text-center">
                    <CheckCircle className="w-8 h-8 text-sky-400 mx-auto mb-2" />
                    <p className="font-medium text-sky-300">You have already applied!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h4 className="font-medium text-white">Apply Now</h4>
                    <div>
                      <Label className="text-gray-300">Your Rate (¥) *</Label>
                      <Input className="mt-1 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500" type="number" placeholder="e.g., 500" value={applyRate} onChange={e => setApplyRate(e.target.value)} />
                    </div>
                    <div>
                      <Label className="text-gray-300">Message to Merchant</Label>
                      <Textarea className="mt-1 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500" rows={3} placeholder="Introduce yourself..." value={applyMsg} onChange={e => setApplyMsg(e.target.value)} />
                    </div>
                    <Button className="w-full bg-sky-600 hover:bg-sky-500 text-white" disabled={applying || !applyRate} onClick={handleApply}>
                      {applying ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                      Submit Application <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ContractsView({ contracts }: { contracts: Contract[] }) {
  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">My Contracts</h1>
      {contracts.length === 0 ? (
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-8 text-center text-gray-500">
            <FileText className="w-12 h-12 text-gray-700 mx-auto mb-3" />
            <p>No active contracts yet</p>
            <p className="text-sm mt-1">Apply to campaigns to get started!</p>
          </CardContent>
        </Card>
      ) : contracts.map(c => (
        <Card key={c.id} className="bg-gray-900 border-gray-800 mb-4">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white">Contract #{c.id}</h3>
              <Badge className={c.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/10 border-emerald-500/20' : 'bg-white/5 text-gray-400 hover:bg-white/5 border-white/10'}>
                {c.status}
              </Badge>
            </div>
            <div className="mb-3">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-500">Milestone Progress</span>
                <span className="font-medium text-gray-300">{c.current_milestone || 0}/4</span>
              </div>
              <Progress value={((c.current_milestone || 0) / 4) * 100} className="h-2" />
            </div>
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div className="bg-gray-800 p-2.5 rounded-lg text-center">
                <p className="text-xs text-gray-500">Conditions Met</p>
                <p className="font-bold text-gray-200">{c.conditions_met || 0}/{c.conditions_total || 5}</p>
              </div>
              <div className="bg-gray-800 p-2.5 rounded-lg text-center">
                <p className="text-xs text-gray-500">Escrow</p>
                <p className="font-bold text-amber-400">${c.escrow_amount || 0}</p>
              </div>
              <div className="bg-gray-800 p-2.5 rounded-lg text-center">
                <p className="text-xs text-gray-500">Released</p>
                <p className="font-bold text-emerald-400">${c.released_amount || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function EarningsView({ profile, contracts }: { profile: any; contracts: Contract[] }) {
  const totalEscrow = contracts.reduce((s, c) => s + (c.escrow_amount || 0), 0);
  const totalReleased = contracts.reduce((s, c) => s + (c.released_amount || 0), 0);
  const locked = totalEscrow - totalReleased;

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Earnings</h1>
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-2">
              <Lock className="w-4 h-4 text-amber-400" />
              <p className="text-sm text-gray-500">Locked</p>
            </div>
            <p className="text-3xl font-bold text-amber-400">${locked.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-2">
              <Unlock className="w-4 h-4 text-emerald-400" />
              <p className="text-sm text-gray-500">Available</p>
            </div>
            <p className="text-3xl font-bold text-emerald-400">${(profile?.balance_available || 0).toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-sky-400" />
              <p className="text-sm text-gray-500">Total Earned</p>
            </div>
            <p className="text-3xl font-bold text-sky-400">${totalReleased.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader><CardTitle className="text-base text-white">Transaction History</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 text-center py-8">No transactions yet</p>
        </CardContent>
      </Card>
    </div>
  );
}

function CreatorMessagesView({ messages }: { messages: Message[] }) {
  const [newMsg, setNewMsg] = useState('');
  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Messages</h1>
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="p-0">
          <ScrollArea className="h-[500px] p-4">
            {messages.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-16">No messages yet</p>
            ) : messages.map(m => (
              <div key={m.id} className={`mb-4 p-3 rounded-lg ${m.msg_type === 'system' ? 'bg-gray-800' : 'bg-sky-500/5 border border-sky-500/10'}`}>
                <div className="flex items-center justify-between mb-1">
                  <Badge className="bg-white/5 text-gray-400 hover:bg-white/5 border-white/10 text-xs">
                    {m.msg_type === 'system' ? 'System' : m.msg_type === 'auto' ? 'Auto' : 'Message'}
                  </Badge>
                  <span className="text-xs text-gray-500">{new Date(m.created_at).toLocaleString()}</span>
                </div>
                <p className="text-sm text-gray-300">{m.content}</p>
              </div>
            ))}
          </ScrollArea>
          <div className="border-t border-gray-800 p-4 flex gap-2">
            <Input
              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
              placeholder="Type a message..."
              value={newMsg}
              onChange={e => setNewMsg(e.target.value)}
            />
            <Button
              className="bg-sky-600 hover:bg-sky-500 text-white"
              disabled={!newMsg.trim()}
              onClick={() => {
                if (!newMsg.trim()) return;
                toast.success('Message sent（local demo）');
                setNewMsg('');
              }}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ProfileView({ profile }: { profile: any }) {
  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Profile</h1>
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-sky-500/10 rounded-full flex items-center justify-center border border-sky-500/20">
              <User className="w-8 h-8 text-sky-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{profile.display_name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={
                  profile.trust_tier === 'trusted' ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/10 border-emerald-500/20' :
                  profile.trust_tier === 'verified' ? 'bg-sky-500/10 text-sky-400 hover:bg-sky-500/10 border-sky-500/20' :
                  'bg-white/5 text-gray-400 hover:bg-white/5 border-white/10'
                }>
                  <Star className="w-3 h-3 mr-1" />
                  {profile.trust_tier === 'trusted' ? 'Trusted' : profile.trust_tier === 'verified' ? 'Verified' : 'New'}
                </Badge>
              </div>
            </div>
          </div>
          <Separator className="mb-6 bg-gray-800" />
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-white mb-3">Reputation</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500">Completion Rate</span>
                    <span className="font-medium text-gray-300">{profile.completion_rate || 100}%</span>
                  </div>
                  <Progress value={profile.completion_rate || 100} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500">On-time Rate</span>
                    <span className="font-medium text-gray-300">{profile.ontime_rate || 100}%</span>
                  </div>
                  <Progress value={profile.ontime_rate || 100} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500">Dispute Rate</span>
                    <span className="font-medium text-gray-300">{profile.dispute_rate || 0}%</span>
                  </div>
                  <Progress value={profile.dispute_rate || 0} className="h-2" />
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-medium text-white mb-3">Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Country</span>
                  <span className="text-gray-300">{profile.country || 'Not set'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Categories</span>
                  <span className="text-gray-300">{profile.categories || 'Not set'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">TikTok</span>
                  <span className="text-gray-300">{profile.tiktok_handle || 'Not linked'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Rate Range</span>
                  <span className="text-gray-300">{profile.rate_min && profile.rate_max ? `$${profile.rate_min} - $${profile.rate_max}` : 'Not set'}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}