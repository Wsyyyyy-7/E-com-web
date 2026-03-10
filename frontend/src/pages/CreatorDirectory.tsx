import { useState, useEffect } from 'react';
import { client } from '../lib/api';
import type { UserProfile } from '../lib/types';
import { COUNTRIES, CATEGORIES } from '../lib/types';
import Navbar from '../components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import {
  Search, MapPin, Filter, Star, User, Loader2, CheckCircle, Clock
} from 'lucide-react';

const CREATOR_IMG = 'https://mgx-backend-cdn.metadl.com/generate/images/999838/2026-03-04/b7151c68-7aab-4f1e-9ea3-494ce309ae70.png';

const demoCreators: UserProfile[] = [
  {
    id: 1, user_id: 'c1', role: 'creator', display_name: 'Sarah Johnson',
    country: 'US', categories: '美妆', tiktok_handle: '@sarahbeauty',
    bio: 'Beauty & skincare content creator with 120K followers on TikTok. Specializing in product reviews and tutorials.',
    rate_min: 300, rate_max: 800, completion_rate: 98, ontime_rate: 95, dispute_rate: 1,
    trust_tier: 'trusted', created_at: '2025-06-15T00:00:00Z',
  },
  {
    id: 2, user_id: 'c2', role: 'creator', display_name: 'James Wilson',
    country: 'UK', categories: '数码', tiktok_handle: '@jamestech',
    bio: 'Tech reviewer and gadget enthusiast. YouTube channel with 85K subscribers. Detailed and honest reviews.',
    rate_min: 500, rate_max: 1500, completion_rate: 92, ontime_rate: 88, dispute_rate: 3,
    trust_tier: 'verified', created_at: '2025-08-20T00:00:00Z',
  },
  {
    id: 3, user_id: 'c3', role: 'creator', display_name: 'Emma Chen',
    country: 'CA', categories: '家居', tiktok_handle: '@emmahome',
    bio: 'Home decor and lifestyle influencer. Instagram focused with aesthetic flat-lay photography.',
    rate_min: 400, rate_max: 1000, completion_rate: 100, ontime_rate: 100, dispute_rate: 0,
    trust_tier: 'trusted', created_at: '2025-05-10T00:00:00Z',
  },
  {
    id: 4, user_id: 'c4', role: 'creator', display_name: 'Liam Brown',
    country: 'AU', categories: '运动', tiktok_handle: '@liamfitness',
    bio: 'Fitness and sports content creator. TikTok and Instagram. Passionate about outdoor activities.',
    rate_min: 250, rate_max: 600, completion_rate: 90, ontime_rate: 85, dispute_rate: 5,
    trust_tier: 'verified', created_at: '2025-09-01T00:00:00Z',
  },
  {
    id: 5, user_id: 'c5', role: 'creator', display_name: 'Sophie Martin',
    country: 'FR', categories: '服饰', tiktok_handle: '@sophiestyle',
    bio: 'Fashion blogger based in Paris. Specializing in street style and luxury fashion content.',
    rate_min: 350, rate_max: 900, completion_rate: 96, ontime_rate: 93, dispute_rate: 2,
    trust_tier: 'trusted', created_at: '2025-07-22T00:00:00Z',
  },
  {
    id: 6, user_id: 'c6', role: 'creator', display_name: 'Max Weber',
    country: 'DE', categories: '食品', tiktok_handle: '@maxfoodie',
    bio: 'Food and beverage content creator. Cooking videos and restaurant reviews across Germany.',
    rate_min: 200, rate_max: 500, completion_rate: 88, ontime_rate: 90, dispute_rate: 4,
    trust_tier: 'new', created_at: '2026-01-05T00:00:00Z',
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

export default function CreatorDirectory() {
  const [creators, setCreators] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCountry, setFilterCountry] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterTier, setFilterTier] = useState('all');
  const [selectedCreator, setSelectedCreator] = useState<UserProfile | null>(null);

  useEffect(() => {
    const fetchCreators = async () => {
      setLoading(true);
      try {
        const res = await client.entities.user_profiles.queryAll({
          query: { role: 'creator' },
          sort: '-created_at',
          limit: 100,
        });
        const items = res?.data?.items || [];
        setCreators(items.length > 0 ? items : demoCreators);
      } catch {
        setCreators(demoCreators);
      }
      setLoading(false);
    };
    fetchCreators();
  }, []);

  const filtered = creators.filter(c => {
    if (filterCountry !== 'all' && c.country !== filterCountry) return false;
    if (filterCategory !== 'all' && !c.categories?.includes(filterCategory)) return false;
    if (filterTier !== 'all' && c.trust_tier !== filterTier) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (
        !c.display_name?.toLowerCase().includes(q) &&
        !c.bio?.toLowerCase().includes(q) &&
        !c.tiktok_handle?.toLowerCase().includes(q)
      ) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />

      {/* Header with small decorative image */}
      <section className="pt-20 pb-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-sky-900/60 via-gray-950 to-gray-950" />
        <div className="absolute top-0 left-0 w-1/4 h-full opacity-15">
          <img src={CREATOR_IMG} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-gray-950" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4 text-center relative z-10">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">达人目录 Creator Directory</h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            浏览海外达人的 profile，查看履约率和报价，找到最适合的合作伙伴
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
                placeholder="搜索达人名称、简介... Search creators..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={filterCountry} onValueChange={setFilterCountry}>
              <SelectTrigger className="w-36 bg-gray-800 border-gray-700 text-gray-300">
                <MapPin className="w-3.5 h-3.5 mr-1 text-gray-500" />
                <SelectValue placeholder="国家" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-800">
                <SelectItem value="all">全部国家</SelectItem>
                {COUNTRIES.map(c => <SelectItem key={c.code} value={c.code}>{c.flag} {c.code}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-36 bg-gray-800 border-gray-700 text-gray-300">
                <Filter className="w-3.5 h-3.5 mr-1 text-gray-500" />
                <SelectValue placeholder="类目" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-800">
                <SelectItem value="all">全部类目</SelectItem>
                {CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterTier} onValueChange={setFilterTier}>
              <SelectTrigger className="w-36 bg-gray-800 border-gray-700 text-gray-300">
                <Star className="w-3.5 h-3.5 mr-1 text-gray-500" />
                <SelectValue placeholder="信誉" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-800">
                <SelectItem value="all">全部等级</SelectItem>
                <SelectItem value="trusted">⭐ Trusted</SelectItem>
                <SelectItem value="verified">✓ Verified</SelectItem>
                <SelectItem value="new">New</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <p className="text-sm text-gray-500 mb-4">共 {filtered.length} 位达人</p>

        {/* Creator Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-12 text-center">
            <User className="w-12 h-12 text-gray-700 mx-auto mb-3" />
            <p className="text-lg font-medium text-gray-400">没有找到匹配的达人</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(c => (
              <div
                key={c.id}
                className="bg-gray-900 border border-gray-800 rounded-2xl p-5 hover:border-gray-700 transition-all cursor-pointer group hover:-translate-y-0.5"
                onClick={() => setSelectedCreator(c)}
              >
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-12 h-12 bg-sky-500/10 rounded-full flex items-center justify-center flex-shrink-0 border border-sky-500/20">
                    <User className="w-6 h-6 text-sky-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white group-hover:text-sky-400 transition-colors truncate">
                      {c.display_name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={`${tierColors[c.trust_tier || 'new']} text-xs`}>
                        {tierLabels[c.trust_tier || 'new']}
                      </Badge>
                      {c.country && (
                        <span className="text-xs text-gray-500">
                          {COUNTRIES.find(co => co.code === c.country)?.flag} {c.country}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {c.bio && (
                  <p className="text-sm text-gray-500 line-clamp-2 mb-3 min-h-[40px]">{c.bio}</p>
                )}

                <div className="flex flex-wrap gap-1.5 mb-3">
                  {c.categories?.split(',').map((cat, i) => (
                    <Badge key={i} className="bg-white/5 text-gray-400 hover:bg-white/5 border-white/10 text-xs">{cat.trim()}</Badge>
                  ))}
                  {c.tiktok_handle && (
                    <Badge className="bg-white/5 text-gray-400 hover:bg-white/5 border-white/10 text-xs">{c.tiktok_handle}</Badge>
                  )}
                </div>

                <div className="border-t border-gray-800 pt-3 flex items-center justify-between text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                    履约 {c.completion_rate || 100}%
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-sky-500" />
                    准时 {c.ontime_rate || 100}%
                  </span>
                  <span className="text-emerald-400 font-medium">
                    ${c.rate_min || 0}-${c.rate_max || 0}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Creator Detail Dialog */}
      <Dialog open={!!selectedCreator} onOpenChange={() => setSelectedCreator(null)}>
        <DialogContent className="max-w-lg bg-gray-900 border-gray-800 text-white">
          {selectedCreator && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-sky-500/10 rounded-full flex items-center justify-center border border-sky-500/20">
                    <User className="w-6 h-6 text-sky-400" />
                  </div>
                  <div>
                    <span className="text-xl text-white">{selectedCreator.display_name}</span>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={`${tierColors[selectedCreator.trust_tier || 'new']} text-xs`}>
                        {tierLabels[selectedCreator.trust_tier || 'new']}
                      </Badge>
                      {selectedCreator.country && (
                        <span className="text-xs text-gray-500">
                          {COUNTRIES.find(co => co.code === selectedCreator.country)?.flag} {selectedCreator.country}
                        </span>
                      )}
                    </div>
                  </div>
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-5 mt-4">
                {selectedCreator.bio && (
                  <p className="text-gray-400 text-sm">{selectedCreator.bio}</p>
                )}

                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-gray-800 p-3 rounded-lg text-center">
                    <p className="text-xs text-gray-500 mb-1">履约率</p>
                    <p className="text-lg font-bold text-emerald-400">{selectedCreator.completion_rate || 100}%</p>
                    <Progress value={selectedCreator.completion_rate || 100} className="h-1.5 mt-1" />
                  </div>
                  <div className="bg-gray-800 p-3 rounded-lg text-center">
                    <p className="text-xs text-gray-500 mb-1">准时率</p>
                    <p className="text-lg font-bold text-sky-400">{selectedCreator.ontime_rate || 100}%</p>
                    <Progress value={selectedCreator.ontime_rate || 100} className="h-1.5 mt-1" />
                  </div>
                  <div className="bg-gray-800 p-3 rounded-lg text-center">
                    <p className="text-xs text-gray-500 mb-1">纠纷率</p>
                    <p className="text-lg font-bold text-amber-400">{selectedCreator.dispute_rate || 0}%</p>
                    <Progress value={selectedCreator.dispute_rate || 0} className="h-1.5 mt-1" />
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">类目 Categories</span>
                    <span className="text-gray-300">{selectedCreator.categories || 'Not set'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">TikTok</span>
                    <span className="text-gray-300">{selectedCreator.tiktok_handle || 'Not linked'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">报价范围 Rate</span>
                    <span className="text-emerald-400 font-medium">
                      ${selectedCreator.rate_min || 0} - ${selectedCreator.rate_max || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">加入时间 Joined</span>
                    <span className="text-gray-300">{selectedCreator.created_at ? new Date(selectedCreator.created_at).toLocaleDateString('zh-CN') : '-'}</span>
                  </div>
                </div>

                <Button className="w-full bg-sky-600 hover:bg-sky-500 text-white" onClick={() => setSelectedCreator(null)}>
                  关闭
                </Button>
              </div>
            </>
          )}
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