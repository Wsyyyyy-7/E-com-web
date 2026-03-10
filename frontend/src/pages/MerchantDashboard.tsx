import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import type { Campaign, Contract, Application, Message, Dispute } from '../lib/types';
import { COUNTRIES, PLATFORMS, CATEGORIES, COLLAB_TYPES, DEFAULT_MILESTONES, SUBSCRIPTION_PLANS } from '../lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import {
  Globe, LayoutDashboard, PlusCircle, FileText, Wallet, MessageSquare,
  AlertTriangle, LogOut, ChevronRight, Users, DollarSign, Clock,
  CheckCircle, XCircle, Loader2, Send, CreditCard, QrCode, Sparkles,
  Eye, Trash2, Upload
} from 'lucide-react';
import { getAPIBaseURL } from '../lib/config';

type TabType = 'dashboard' | 'create' | 'orders' | 'wallet' | 'messages' | 'disputes' | 'subscription';

const TOKEN_KEY = 'creatorbridge_token';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export default function MerchantDashboard() {
  const { isLoggedIn, profile, loading: authLoading, logout, login, getToken: getAuthToken } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);

  const fetchData = useCallback(async () => {
    setLoadingData(true);
    const token = getAuthToken?.() ?? getToken();
    try {
      if (token) {
        const res = await fetch('/api/v1/entities/campaigns?limit=100&sort=-created_at', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          const items = data?.items ?? [];
          setCampaigns(Array.isArray(items) ? items : []);
        }
      }
    } catch {
      setCampaigns([]);
    }
    setContracts([]);
    setApplications([]);
    setMessages([]);
    setDisputes([]);
    setLoadingData(false);
  }, [getAuthToken]);

  useEffect(() => {
    if (isLoggedIn && profile?.role === 'merchant') {
      fetchData();
    }
  }, [isLoggedIn, profile, fetchData]);

  const shouldRedirectToRoleSelect = isLoggedIn && profile !== undefined && profile?.role !== 'merchant';
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
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (shouldRedirectToRoleSelect) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          <p className="text-gray-400">正在跳转到角色选择...</p>
        </div>
      </div>
    );
  }

  const activeCampaigns = campaigns.filter(c => c.status === 'active');
  const activeContracts = contracts.filter(c => c.status === 'active');
  const pendingApps = applications.filter(a => a.status === 'pending');
  const openDisputes = disputes.filter(d => d.status === 'open' || d.status === 'under_review');
  const unreadMessages = messages.filter(m => !m.is_read);

  const sidebarItems: { key: TabType; icon: React.ElementType; label: string; badge?: number }[] = [
    { key: 'dashboard', icon: LayoutDashboard, label: '仪表盘' },
    { key: 'create', icon: PlusCircle, label: '发布合作单' },
    { key: 'orders', icon: FileText, label: '订单管理', badge: pendingApps.length },
    { key: 'wallet', icon: Wallet, label: '托管与账务' },
    { key: 'messages', icon: MessageSquare, label: '消息中心', badge: unreadMessages.length },
    { key: 'disputes', icon: AlertTriangle, label: '纠纷中心', badge: openDisputes.length },
    { key: 'subscription', icon: CreditCard, label: '订阅管理' },
  ];

  return (
    <div className="min-h-screen bg-gray-950 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col fixed h-full z-40">
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-white">CreatorBridge</span>
          </div>
          <p className="text-xs text-gray-500 mt-2 truncate">{profile.display_name || '商家控制台'}</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {sidebarItems.map(item => (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                activeTab === item.key ? 'bg-indigo-500/10 text-indigo-400 font-medium' : 'text-gray-400 hover:bg-white/5 hover:text-gray-300'
              }`}
            >
              <item.icon className="w-4 h-4" />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge ? (
                <Badge variant="destructive" className="h-5 min-w-[20px] flex items-center justify-center text-xs">
                  {item.badge}
                </Badge>
              ) : null}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-800">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-500 hover:bg-white/5 hover:text-gray-400 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            退出登录
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            campaigns={activeCampaigns}
            contracts={activeContracts}
            pendingApps={pendingApps}
            openDisputes={openDisputes}
            profile={profile}
            loadingData={loadingData}
            onNavigate={setActiveTab}
          />
        )}
        {activeTab === 'create' && (
          <CreateCampaignView
            getToken={() => getAuthToken?.() ?? getToken()}
            onCreateCampaign={async (payload) => {
              const token = getAuthToken?.() ?? getToken();
              if (!token) throw new Error('请先登录');
              const res = await fetch('/api/v1/entities/campaigns', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
              });
              if (!res.ok) {
                const text = await res.text();
                throw new Error(text || '发布失败');
              }
              return res.json();
            }}
            onCreated={(campaign) => {
              setCampaigns(prev => [...prev, campaign]);
              setActiveTab('orders');
            }}
          />
        )}
        {activeTab === 'orders' && (
          <OrdersView
            campaigns={campaigns}
            contracts={contracts}
            applications={applications}
            selectedCampaign={selectedCampaign}
            onSelectCampaign={setSelectedCampaign}
            onRefresh={fetchData}
          />
        )}
        {activeTab === 'wallet' && <WalletView profile={profile} contracts={contracts} />}
        {activeTab === 'messages' && <MessagesView messages={messages} onRefresh={fetchData} />}
        {activeTab === 'disputes' && <DisputesView disputes={disputes} onRefresh={fetchData} />}
        {activeTab === 'subscription' && <SubscriptionView profile={profile} />}
      </main>
    </div>
  );
}

/* ==================== Dashboard View ==================== */
function DashboardView({
  campaigns, contracts, pendingApps, openDisputes, profile, loadingData, onNavigate
}: {
  campaigns: Campaign[]; contracts: Contract[]; pendingApps: Application[];
  openDisputes: Dispute[]; profile: any; loadingData: boolean; onNavigate: (t: TabType) => void;
}) {
  if (loadingData) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>;
  }

  const stats = [
    { label: '进行中合作', value: campaigns.length, icon: FileText, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' },
    { label: '活跃订单', value: contracts.length, icon: Users, color: 'text-sky-400 bg-sky-500/10 border-sky-500/20' },
    { label: '待处理申请', value: pendingApps.length, icon: Clock, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
    { label: '冻结金额', value: `¥${(profile?.balance_frozen || 0).toLocaleString()}`, icon: DollarSign, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">仪表盘</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s, i) => (
          <Card key={i} className="bg-gray-900 border-gray-800">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-lg border ${s.color} flex items-center justify-center`}>
                  <s.icon className="w-5 h-5" />
                </div>
              </div>
              <p className="text-2xl font-bold text-white">{s.value}</p>
              <p className="text-sm text-gray-500 mt-1">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {openDisputes.length > 0 && (
        <Card className="border-red-500/20 bg-red-500/5 mb-6">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <span className="text-sm font-medium text-red-300">您有 {openDisputes.length} 个待处理纠纷</span>
            </div>
            <Button size="sm" variant="outline" className="!bg-transparent border-red-500/30 text-red-400 hover:!bg-red-500/10" onClick={() => onNavigate('disputes')}>
              查看详情 <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base text-white">近期合作单</CardTitle>
              <Button variant="ghost" size="sm" className="text-indigo-400 hover:text-indigo-300" onClick={() => onNavigate('orders')}>
                查看全部 <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {campaigns.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">暂无合作单</p>
            ) : (
              <div className="space-y-3">
                {campaigns.slice(0, 4).map(c => (
                  <div key={c.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-200 truncate">{c.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{c.category} · {c.country} · {c.applicant_count}人申请</p>
                    </div>
                    <Badge className={c.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/10 border-emerald-500/20' : 'bg-white/5 text-gray-400 hover:bg-white/5 border-white/10'}>
                      {c.status === 'active' ? '进行中' : c.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base text-white">快捷操作</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="h-auto py-4 flex-col gap-2 !bg-transparent border-gray-800 hover:!bg-white/5 text-gray-300" onClick={() => onNavigate('create')}>
                <PlusCircle className="w-5 h-5 text-indigo-400" />
                <span className="text-sm">发布合作单</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2 !bg-transparent border-gray-800 hover:!bg-white/5 text-gray-300" onClick={() => onNavigate('orders')}>
                <Eye className="w-5 h-5 text-sky-400" />
                <span className="text-sm">查看申请</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2 !bg-transparent border-gray-800 hover:!bg-white/5 text-gray-300" onClick={() => onNavigate('messages')}>
                <MessageSquare className="w-5 h-5 text-purple-400" />
                <span className="text-sm">消息中心</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2 !bg-transparent border-gray-800 hover:!bg-white/5 text-gray-300" onClick={() => onNavigate('wallet')}>
                <Wallet className="w-5 h-5 text-emerald-400" />
                <span className="text-sm">账务管理</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/** Upload product image to backend (local storage, no OSS required). */
async function uploadProductImage(file: File, token: string): Promise<string> {
  const base = getAPIBaseURL();
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${base}/api/v1/storage/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const msg = data.detail || (await res.text()) || '上传失败';
    throw new Error(typeof msg === 'string' ? msg : JSON.stringify(msg));
  }
  const data = await res.json();
  if (!data?.url) throw new Error('未返回图片地址');
  return data.url;
}

/* ==================== Create Campaign View ==================== */
function CreateCampaignView({
  onCreateCampaign,
  onCreated,
  getToken,
}: {
  onCreateCampaign: (payload: Record<string, unknown>) => Promise<Campaign>;
  onCreated: (c: Campaign) => void;
  getToken: () => string | null;
}) {
  const [form, setForm] = useState({
    title: '', description: '', country: 'US', platform: 'tiktok', category: '美妆',
    collab_type: 'post_to_tiktok', total_budget: '', per_creator_min: '', per_creator_max: '',
    threshold: '3', deadline_apply: '', deadline_publish: '', retention_days: '7',
    keywords: '', compliance_notes: '',
    product_image_url: '',
  });
  const [conditions, setConditions] = useState<string[]>(['']);
  const [milestones, setMilestones] = useState(DEFAULT_MILESTONES.map(m => ({ ...m })));
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const addCondition = () => {
    if (conditions.length < 5) setConditions([...conditions, '']);
  };
  const removeCondition = (i: number) => {
    setConditions(conditions.filter((_, idx) => idx !== i));
  };
  const updateCondition = (i: number, val: string) => {
    const next = [...conditions];
    next[i] = val;
    setConditions(next);
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) { toast.error('请填写合作标题'); return; }
    if (!form.total_budget) { toast.error('请填写总预算'); return; }
    if (!form.product_image_url.trim()) { toast.error('请上传产品图片'); return; }
    const validConditions = conditions.filter(c => c.trim());
    if (validConditions.length === 0) { toast.error('请至少添加一个验收条件'); return; }

    setSubmitting(true);
    try {
      const now = new Date();
      const deadlineApplyDate = form.deadline_apply || new Date(now.getTime() + 14 * 86400000).toISOString().slice(0, 10);
      const deadlinePublishDate = form.deadline_publish || new Date(now.getTime() + 30 * 86400000).toISOString().slice(0, 10);
      const deadlineApply = deadlineApplyDate.includes('T') ? deadlineApplyDate : `${deadlineApplyDate}T23:59:59.000Z`;
      const deadlinePublish = deadlinePublishDate.includes('T') ? deadlinePublishDate : `${deadlinePublishDate}T23:59:59.000Z`;
      const payload: Record<string, unknown> = {
        title: form.title.trim(),
        description: form.description || null,
        country: form.country,
        platform: form.platform,
        category: form.category,
        collab_type: form.collab_type,
        total_budget: parseFloat(form.total_budget),
        per_creator_min: parseFloat(form.per_creator_min || '0'),
        per_creator_max: parseFloat(form.per_creator_max || '0'),
        conditions: JSON.stringify(validConditions),
        threshold: parseInt(form.threshold, 10),
        milestones: JSON.stringify(milestones),
        deadline_apply: deadlineApply,
        deadline_publish: deadlinePublish,
        retention_days: parseInt(form.retention_days, 10),
        keywords: form.keywords?.trim() ?? '',
        compliance_notes: form.compliance_notes?.trim() ?? '',
        product_image_url: form.product_image_url?.trim() || null,
        status: 'active',
        applicant_count: 0,
      };
      const created = await onCreateCampaign(payload);
      toast.success('合作单发布成功');
      onCreated(created);
    } catch (e) {
      console.error(e);
      toast.error(e instanceof Error ? e.message : '发布失败，请重试');
    }
    setSubmitting(false);
  };

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-white mb-6">发布合作单</h1>
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="p-6 space-y-6">
          {/* Basic Info */}
          <div>
            <h3 className="font-semibold text-white mb-4">基本信息</h3>
            <div className="space-y-4">
              <div>
                <Label className="text-gray-300">合作标题 *</Label>
                <Input className="mt-1 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500" placeholder="例如：TikTok美妆产品推广 - 美国市场" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
              </div>
              <div>
                <Label className="text-gray-300">合作描述</Label>
                <Textarea className="mt-1 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500" rows={3} placeholder="详细描述合作需求..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <div>
                <Label className="text-gray-300">产品图片 *</Label>
                <div className="mt-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      id="product-image-upload"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        if (file.size > 5 * 1024 * 1024) {
                          toast.error('图片大小不能超过 5MB');
                          return;
                        }
                        const token = getToken();
                        if (!token) {
                          toast.error('请先登录');
                          return;
                        }
                        setUploading(true);
                        try {
                          const url = await uploadProductImage(file, token);
                          setForm((f) => ({ ...f, product_image_url: url }));
                          toast.success('图片上传成功');
                        } catch (err) {
                          console.error(err);
                          const msg = err instanceof Error ? err.message : '';
                          const useLink = msg.includes('not configured') || msg.includes('503')
                            ? '上传服务未配置，请直接填写下方图片链接'
                            : '上传失败，可改为填写下方图片链接';
                          toast.error(useLink);
                        } finally {
                          setUploading(false);
                          e.target.value = '';
                        }
                      }}
                    />
                    <Label
                      htmlFor="product-image-upload"
                      className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-700 bg-gray-800 text-gray-300 cursor-pointer hover:bg-gray-750 transition-colors"
                    >
                      {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                      <span>{uploading ? '上传中...' : '上传产品图片'}</span>
                    </Label>
                    {form.product_image_url && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-gray-500 hover:text-red-400"
                        onClick={() => setForm((f) => ({ ...f, product_image_url: '' }))}
                      >
                        清除
                      </Button>
                    )}
                  </div>
                  {form.product_image_url && (
                    <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-gray-700 bg-gray-800">
                      <img src={form.product_image_url} alt="产品图" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <p className="text-xs text-gray-500">或填写图片链接：</p>
                  <Input
                    className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                    placeholder="https://..."
                    value={form.product_image_url}
                    onChange={e => setForm({ ...form, product_image_url: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-300">目标国家</Label>
                  <Select value={form.country} onValueChange={v => setForm({ ...form, country: v })}>
                    <SelectTrigger className="mt-1 bg-gray-800 border-gray-700 text-gray-300"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-800">
                      {COUNTRIES.map(c => <SelectItem key={c.code} value={c.code}>{c.flag} {c.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-gray-300">平台</Label>
                  <Select value={form.platform} onValueChange={v => setForm({ ...form, platform: v })}>
                    <SelectTrigger className="mt-1 bg-gray-800 border-gray-700 text-gray-300"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-800">
                      {PLATFORMS.map(p => <SelectItem key={p.value} value={p.value}>{p.icon} {p.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-300">产品类目</Label>
                  <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}>
                    <SelectTrigger className="mt-1 bg-gray-800 border-gray-700 text-gray-300"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-800">
                      {CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-gray-300">合作类型</Label>
                  <Select value={form.collab_type} onValueChange={v => setForm({ ...form, collab_type: v })}>
                    <SelectTrigger className="mt-1 bg-gray-800 border-gray-700 text-gray-300"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-800">
                      {COLLAB_TYPES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          <Separator className="bg-gray-800" />

          {/* Budget */}
          <div>
            <h3 className="font-semibold text-white mb-4">预算设置 (¥)</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="text-gray-300">总预算 *</Label>
                <Input className="mt-1 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500" type="number" placeholder="15000" value={form.total_budget} onChange={e => setForm({ ...form, total_budget: e.target.value })} />
              </div>
              <div>
                <Label className="text-gray-300">单人最低</Label>
                <Input className="mt-1 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500" type="number" placeholder="200" value={form.per_creator_min} onChange={e => setForm({ ...form, per_creator_min: e.target.value })} />
              </div>
              <div>
                <Label className="text-gray-300">单人最高</Label>
                <Input className="mt-1 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500" type="number" placeholder="800" value={form.per_creator_max} onChange={e => setForm({ ...form, per_creator_max: e.target.value })} />
              </div>
            </div>
          </div>

          <Separator className="bg-gray-800" />

          {/* Conditions */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white">验收条件（最多5条）</h3>
              <div className="flex items-center gap-3">
                <Label className="text-sm text-gray-400">触发阈值：</Label>
                <Select value={form.threshold} onValueChange={v => setForm({ ...form, threshold: v })}>
                  <SelectTrigger className="w-32 bg-gray-800 border-gray-700 text-gray-300"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-800">
                    <SelectItem value="2">≥2条达标</SelectItem>
                    <SelectItem value="3">≥3条达标</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-3">
              {conditions.map((c, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                    placeholder={`条件 ${i + 1}，例如：视频时长≥60秒`}
                    value={c}
                    onChange={e => updateCondition(i, e.target.value)}
                  />
                  {conditions.length > 1 && (
                    <Button variant="ghost" size="icon" onClick={() => removeCondition(i)}>
                      <Trash2 className="w-4 h-4 text-gray-500" />
                    </Button>
                  )}
                </div>
              ))}
              {conditions.length < 5 && (
                <Button variant="outline" size="sm" className="!bg-transparent border-gray-700 text-gray-400 hover:!bg-white/5" onClick={addCondition}>
                  <PlusCircle className="w-4 h-4 mr-1" /> 添加条件
                </Button>
              )}
            </div>
          </div>

          <Separator className="bg-gray-800" />

          {/* Milestones */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white">里程碑模板</h3>
              <Badge className="bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/10 border-indigo-500/20">
                <Sparkles className="w-3 h-3 mr-1" /> 推荐模板
              </Badge>
            </div>
            <div className="space-y-3">
              {milestones.map((m, i) => (
                <div key={i} className="flex items-center gap-4 p-3 bg-gray-800 rounded-lg">
                  <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-200">{m.name}</p>
                  </div>
                  <Badge className="bg-white/5 text-gray-400 hover:bg-white/5 border-white/10">{m.percent}%</Badge>
                </div>
              ))}
            </div>
          </div>

          <Separator className="bg-gray-800" />

          {/* Timeline */}
          <div>
            <h3 className="font-semibold text-white mb-4">时间线</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="text-gray-300">接单截止</Label>
                <Input className="mt-1 bg-gray-800 border-gray-700 text-white" type="date" value={form.deadline_apply} onChange={e => setForm({ ...form, deadline_apply: e.target.value })} />
              </div>
              <div>
                <Label className="text-gray-300">发布截止</Label>
                <Input className="mt-1 bg-gray-800 border-gray-700 text-white" type="date" value={form.deadline_publish} onChange={e => setForm({ ...form, deadline_publish: e.target.value })} />
              </div>
              <div>
                <Label className="text-gray-300">保留天数</Label>
                <Input className="mt-1 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500" type="number" placeholder="7" value={form.retention_days} onChange={e => setForm({ ...form, retention_days: e.target.value })} />
              </div>
            </div>
          </div>

          <Separator className="bg-gray-800" />

          {/* Compliance */}
          <div>
            <h3 className="font-semibold text-white mb-4">合规提示</h3>
            <div className="space-y-4">
              <div>
                <Label className="text-gray-300">禁用词汇（逗号分隔）</Label>
                <Input className="mt-1 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500" placeholder="假货,山寨,仿品" value={form.keywords} onChange={e => setForm({ ...form, keywords: e.target.value })} />
              </div>
              <div>
                <Label className="text-gray-300">合规备注</Label>
                <Textarea className="mt-1 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500" rows={2} placeholder="不得虚假宣传产品功效" value={form.compliance_notes} onChange={e => setForm({ ...form, compliance_notes: e.target.value })} />
              </div>
            </div>
          </div>

          <Button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white h-11" disabled={submitting} onClick={handleSubmit}>
            {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <PlusCircle className="w-4 h-4 mr-2" />}
            {submitting ? '发布中...' : '发布合作单'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

/* ==================== Orders View ==================== */
function OrdersView({
  campaigns, contracts, applications, selectedCampaign, onSelectCampaign, onRefresh
}: {
  campaigns: Campaign[]; contracts: Contract[]; applications: Application[];
  selectedCampaign: Campaign | null; onSelectCampaign: (c: Campaign | null) => void; onRefresh: () => void;
}) {
  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">订单管理</h1>
      <Tabs defaultValue="campaigns">
        <TabsList className="bg-gray-900 border border-gray-800">
          <TabsTrigger value="campaigns">合作单 ({campaigns.length})</TabsTrigger>
          <TabsTrigger value="contracts">进行中订单 ({contracts.length})</TabsTrigger>
          <TabsTrigger value="applications">申请列表 ({applications.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="mt-4">
          <div className="space-y-4">
            {campaigns.length === 0 ? (
              <Card className="bg-gray-900 border-gray-800"><CardContent className="p-8 text-center text-gray-500">暂无合作单</CardContent></Card>
            ) : campaigns.map(c => (
              <Card key={c.id} className="bg-gray-900 border-gray-800 hover:border-gray-700 transition-all cursor-pointer" onClick={() => onSelectCampaign(c)}>
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    {c.product_image_url && (
                      <img
                        src={c.product_image_url}
                        alt={c.title}
                        className="w-20 h-20 rounded-lg object-cover flex-shrink-0 border border-gray-800"
                      />
                    )}
                    <div className="flex-1 min-w-0 flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-white">{c.title}</h3>
                          <Badge className={c.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/10 border-emerald-500/20' : 'bg-white/5 text-gray-400 hover:bg-white/5 border-white/10'}>
                            {c.status === 'active' ? '进行中' : c.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-400 line-clamp-1">{c.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span>{COUNTRIES.find(co => co.code === c.country)?.flag} {c.country}</span>
                          <span>{c.platform}</span>
                          <span>{c.category}</span>
                          <span>{c.applicant_count}人申请</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 text-sm text-gray-300">
                        <div className="text-base font-semibold text-emerald-400">¥{c.per_creator_min} - ¥{c.per_creator_max}</div>
                        <div className="text-xs text-gray-500 flex flex-col items-end">
                          <span>总预算：<span className="text-gray-300">¥{c.total_budget?.toLocaleString()}</span></span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-600 flex-shrink-0 mt-1" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Campaign Detail Dialog */}
          <Dialog open={!!selectedCampaign} onOpenChange={() => onSelectCampaign(null)}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-gray-900 border-gray-800 text-white">
              {selectedCampaign && (
                <>
                  <DialogHeader>
                    <DialogTitle className="text-white">{selectedCampaign.title}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    {selectedCampaign.product_image_url && (
                      <img
                        src={selectedCampaign.product_image_url}
                        alt={selectedCampaign.title}
                        className="w-full max-h-64 object-cover rounded-xl border border-gray-800"
                      />
                    )}
                    <p className="text-sm text-gray-400">{selectedCampaign.description}</p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div><span className="text-gray-500">国家：</span><span className="text-gray-300">{selectedCampaign.country}</span></div>
                      <div><span className="text-gray-500">平台：</span><span className="text-gray-300">{selectedCampaign.platform}</span></div>
                      <div><span className="text-gray-500">类目：</span><span className="text-gray-300">{selectedCampaign.category}</span></div>
                      <div><span className="text-gray-500">预算：</span><span className="text-gray-300">¥{selectedCampaign.total_budget?.toLocaleString()}</span></div>
                    </div>
                    <div>
                      <h4 className="font-medium text-white mb-2">验收条件</h4>
                      <div className="space-y-1.5">
                        {(() => { try { return JSON.parse(selectedCampaign.conditions || '[]'); } catch { return []; } })().map((cond: string, i: number) => (
                          <div key={i} className="flex items-center gap-2 text-sm text-gray-300">
                            <CheckCircle className="w-4 h-4 text-gray-500" />
                            <span>{cond}</span>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">触发阈值：≥{selectedCampaign.threshold}条达标释放尾款</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-white mb-2">里程碑</h4>
                      <div className="space-y-2">
                        {(() => { try { return JSON.parse(selectedCampaign.milestones || '[]'); } catch { return []; } })().map((ms: any, i: number) => (
                          <div key={i} className="flex items-center gap-3">
                            <div className="w-6 h-6 bg-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center text-xs font-bold">{i + 1}</div>
                            <span className="text-sm flex-1 text-gray-300">{ms.name}</span>
                            <Badge className="bg-white/5 text-gray-400 hover:bg-white/5 border-white/10">{ms.percent}%</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="contracts" className="mt-4">
          {contracts.length === 0 ? (
            <Card className="bg-gray-900 border-gray-800"><CardContent className="p-8 text-center text-gray-500">暂无进行中订单</CardContent></Card>
          ) : contracts.map(c => (
            <Card key={c.id} className="bg-gray-900 border-gray-800 mb-4">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-white">订单 #{c.id}</h3>
                  <Badge className={c.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/10 border-emerald-500/20' : 'bg-white/5 text-gray-400 hover:bg-white/5'}>
                    {c.status === 'active' ? '进行中' : c.status}
                  </Badge>
                </div>
                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500">里程碑进度</span>
                    <span className="font-medium text-gray-300">{c.current_milestone || 0}/4</span>
                  </div>
                  <Progress value={((c.current_milestone || 0) / 4) * 100} className="h-2" />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <span className="text-gray-500">条件达标：{c.conditions_met || 0}/{c.conditions_total || 5}</span>
                    <span className="text-gray-500">托管：${c.escrow_amount || 0}</span>
                    <span className="text-emerald-400">已释放：${c.released_amount || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="applications" className="mt-4">
          {applications.length === 0 ? (
            <Card className="bg-gray-900 border-gray-800"><CardContent className="p-8 text-center text-gray-500">暂无申请</CardContent></Card>
          ) : applications.map(a => (
            <Card key={a.id} className="bg-gray-900 border-gray-800 mb-4">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white">申请 #{a.id}</p>
                    <p className="text-sm text-gray-500 mt-1">报价：${a.proposed_rate} · {a.availability}</p>
                    {a.message && <p className="text-sm text-gray-400 mt-2">{a.message}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={
                      a.status === 'pending' ? 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/10 border-amber-500/20' :
                      a.status === 'accepted' ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/10 border-emerald-500/20' :
                      'bg-white/5 text-gray-400 hover:bg-white/5 border-white/10'
                    }>
                      {a.status === 'pending' ? '待审核' : a.status === 'accepted' ? '已接受' : a.status === 'rejected' ? '已拒绝' : a.status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* ==================== Wallet View ==================== */
function WalletView({ profile, contracts }: { profile: any; contracts: Contract[] }) {
  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">托管与账务</h1>
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-5">
            <p className="text-sm text-gray-500 mb-1">可用余额</p>
            <p className="text-3xl font-bold text-white">¥{(profile?.balance_available || 0).toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-5">
            <p className="text-sm text-gray-500 mb-1">冻结金额</p>
            <p className="text-3xl font-bold text-amber-400">¥{(profile?.balance_frozen || 0).toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-5">
            <p className="text-sm text-gray-500 mb-1">已释放总额</p>
            <p className="text-3xl font-bold text-emerald-400">
              ¥{contracts.reduce((sum, c) => sum + (c.released_amount || 0), 0).toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader><CardTitle className="text-base text-white">资金流水</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 text-center py-8">暂无交易记录</p>
        </CardContent>
      </Card>
    </div>
  );
}

/* ==================== Messages View ==================== */
function MessagesView({ messages, onRefresh }: { messages: Message[]; onRefresh: () => void }) {
  const [newMsg, setNewMsg] = useState('');

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">消息中心</h1>
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="p-0">
          <ScrollArea className="h-[500px] p-4">
            {messages.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-16">暂无消息</p>
            ) : messages.map(m => (
              <div key={m.id} className={`mb-4 p-3 rounded-lg ${m.msg_type === 'system' ? 'bg-gray-800' : 'bg-indigo-500/5 border border-indigo-500/10'}`}>
                <div className="flex items-center justify-between mb-1">
                  <Badge className="bg-white/5 text-gray-400 hover:bg-white/5 border-white/10 text-xs">
                    {m.msg_type === 'system' ? '系统' : m.msg_type === 'auto' ? '自动' : '消息'}
                  </Badge>
                  <span className="text-xs text-gray-500">{new Date(m.created_at).toLocaleString('zh-CN')}</span>
                </div>
                <p className="text-sm text-gray-300">{m.content}</p>
              </div>
            ))}
          </ScrollArea>
          <div className="border-t border-gray-800 p-4 flex gap-2">
            <Input
              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
              placeholder="输入消息..."
              value={newMsg}
              onChange={e => setNewMsg(e.target.value)}
            />
            <Button
              className="bg-indigo-600 hover:bg-indigo-500 text-white"
              disabled={!newMsg.trim()}
              onClick={() => {
                if (!newMsg.trim()) return;
                toast.success('消息已发送（本地演示）');
                setNewMsg('');
                onRefresh();
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

/* ==================== Disputes View ==================== */
function DisputesView({ disputes, onRefresh }: { disputes: Dispute[]; onRefresh: () => void }) {
  const [showCreate, setShowCreate] = useState(false);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = async () => {
    if (!reason.trim()) return;
    setSubmitting(true);
    try {
      toast.success('纠纷已提交（本地演示）');
      setReason('');
      setShowCreate(false);
      onRefresh();
    } catch (e) {
      toast.error('提交失败');
    }
    setSubmitting(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">纠纷中心</h1>
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogTrigger asChild>
            <Button className="bg-red-600 hover:bg-red-500 text-white">
              <AlertTriangle className="w-4 h-4 mr-2" /> 发起纠纷
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-900 border-gray-800 text-white">
            <DialogHeader><DialogTitle className="text-white">发起纠纷</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label className="text-gray-300">纠纷原因 *</Label>
                <Textarea className="mt-1 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500" rows={4} placeholder="请详细描述纠纷原因..." value={reason} onChange={e => setReason(e.target.value)} />
              </div>
              <Button className="w-full bg-red-600 hover:bg-red-500 text-white" disabled={submitting || !reason.trim()} onClick={handleCreate}>
                {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                提交纠纷
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {disputes.length === 0 ? (
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-8 text-center">
            <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <p className="text-gray-500">暂无纠纷，一切顺利！</p>
          </CardContent>
        </Card>
      ) : disputes.map(d => (
        <Card key={d.id} className="bg-gray-900 border-gray-800 mb-4">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-white">纠纷 #{d.id}</h3>
              <Badge className={
                d.status === 'open' ? 'bg-red-500/10 text-red-400 hover:bg-red-500/10 border-red-500/20' :
                d.status === 'under_review' ? 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/10 border-amber-500/20' :
                'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/10 border-emerald-500/20'
              }>
                {d.status === 'open' ? '待处理' : d.status === 'under_review' ? '审核中' : d.status === 'resolved' ? '已解决' : d.status}
              </Badge>
            </div>
            <p className="text-sm text-gray-400">{d.reason}</p>
            <p className="text-xs text-gray-500 mt-2">{new Date(d.created_at).toLocaleString('zh-CN')}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/* ==================== Subscription View ==================== */
function SubscriptionView({ profile }: { profile: any }) {
  const [showPayDialog, setShowPayDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">订阅管理</h1>

      <Card className="bg-gray-900 border-gray-800 mb-8">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">当前方案</p>
              <p className="text-xl font-bold text-white mt-1">
                {profile?.subscription_plan === 'advanced' ? '进阶版' : profile?.subscription_plan === 'team' ? '团队版' : '基础版'}
              </p>
            </div>
            <Badge className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/10 border-emerald-500/20">有效</Badge>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-3 gap-6">
        {SUBSCRIPTION_PLANS.map(plan => (
          <Card key={plan.id} className={`border-2 transition-shadow hover:shadow-lg bg-gray-900 ${plan.popular ? 'border-indigo-500' : 'border-gray-800'}`}>
            {plan.popular && (
              <div className="bg-indigo-600 text-white text-center py-1 text-xs font-medium">最受欢迎</div>
            )}
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-white">{plan.name}</h3>
              <div className="mt-2 mb-4">
                <span className="text-3xl font-bold text-white">¥{plan.price}</span>
                <span className="text-gray-500">/月</span>
              </div>
              <ul className="space-y-2 mb-6">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-400">
                    <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />{f}
                  </li>
                ))}
              </ul>
              <Button
                className={`w-full ${plan.popular ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : '!bg-transparent border-gray-700 text-gray-300 hover:!bg-white/5'}`}
                variant={plan.popular ? 'default' : 'outline'}
                onClick={() => { setSelectedPlan(plan.id); setShowPayDialog(true); }}
              >
                {profile?.subscription_plan === plan.id ? '当前方案' : '升级'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* WeChat Pay Dialog */}
      <Dialog open={showPayDialog} onOpenChange={setShowPayDialog}>
        <DialogContent className="max-w-sm bg-gray-900 border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-center text-white">微信支付</DialogTitle>
          </DialogHeader>
          <div className="text-center py-6">
            <div className="w-48 h-48 bg-gray-800 rounded-xl mx-auto flex items-center justify-center mb-4 border-2 border-dashed border-gray-700">
              <div className="text-center">
                <QrCode className="w-16 h-16 text-emerald-400 mx-auto mb-2" />
                <p className="text-xs text-gray-500">微信扫码支付</p>
              </div>
            </div>
            <p className="text-2xl font-bold text-white mb-1">
              ¥{SUBSCRIPTION_PLANS.find(p => p.id === selectedPlan)?.price || 0}/月
            </p>
            <p className="text-sm text-gray-400">
              {SUBSCRIPTION_PLANS.find(p => p.id === selectedPlan)?.name}
            </p>
            <p className="text-xs text-gray-500 mt-4">
              * MVP演示版本，实际支付功能将在正式版中对接微信支付
            </p>
            <Button className="w-full mt-4 bg-emerald-600 hover:bg-emerald-500 text-white" onClick={() => { toast.success('订阅成功（演示）'); setShowPayDialog(false); }}>
              模拟支付成功
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}