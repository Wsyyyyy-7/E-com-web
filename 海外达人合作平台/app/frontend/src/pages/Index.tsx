import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
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
  const { isLoggedIn, login } = useAuth();
  const navigate = useNavigate();

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
              面向中国跨境电商的海外达人合作执行平台
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight tracking-tight">
              连接中国商家
              <br />
              <span className="bg-gradient-to-r from-indigo-400 via-sky-400 to-cyan-400 bg-clip-text text-transparent">
                与海外创作者
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
              CreatorBridge 帮助中国跨境电商品牌高效对接海外 TikTok / Instagram / YouTube 达人，
              通过智能合约和里程碑付款机制，让每一次合作都安全、透明、可追踪。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-indigo-600 text-white hover:bg-indigo-500 h-13 px-8 text-base font-semibold shadow-lg shadow-indigo-600/30 transition-all hover:shadow-indigo-500/40 hover:scale-[1.02]"
                onClick={() => navigate('/marketplace')}
              >
                浏览合作广场 <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="!bg-white/5 border border-white/20 text-white hover:!bg-white/10 h-13 px-8 text-base backdrop-blur-sm transition-all hover:border-white/40"
                onClick={() => (isLoggedIn ? navigate('/role-select') : navigate('/auth'))}
              >
                {isLoggedIn ? '进入控制台' : '免费注册 / 登录'}
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-20 max-w-4xl mx-auto">
            {[
              { icon: Users, value: '500+', label: '注册达人' },
              { icon: Store, value: '200+', label: '合作商家' },
              { icon: DollarSign, value: '¥2M+', label: '交易总额' },
              { icon: Star, value: '98%', label: '履约率' },
            ].map((stat, i) => (
              <div
                key={i}
                className="text-center bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10 hover:bg-white/10 transition-all duration-300"
              >
                <stat.icon className="w-5 h-5 text-indigo-400 mx-auto mb-2" />
                <p className="text-3xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-gray-400 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== How It Works — 平台流程 ===== */}
      <section className="py-24 bg-gray-950 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/10 mb-4 border border-indigo-500/20">
              平台流程
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              四步完成合作
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              从发布需求到结算付款，CreatorBridge 让跨境达人合作变得简单高效
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                icon: FileText,
                title: '发布合作单',
                titleEn: 'Post Campaign',
                desc: '商家填写合作需求：目标国家、平台、预算、验收条件和里程碑付款比例。',
                gradient: 'from-indigo-600 to-indigo-500',
              },
              {
                step: '02',
                icon: Users,
                title: '达人申请',
                titleEn: 'Creator Applies',
                desc: '海外达人浏览合作广场，查看详情后提交申请和报价，商家审核并选择。',
                gradient: 'from-sky-600 to-sky-500',
              },
              {
                step: '03',
                icon: Lock,
                title: '资金托管',
                titleEn: 'Escrow & Milestones',
                desc: '商家预付资金进入托管账户，按里程碑逐步释放。',
                gradient: 'from-amber-600 to-amber-500',
              },
              {
                step: '04',
                icon: CheckCircle,
                title: '验收结算',
                titleEn: 'Verify & Settle',
                desc: '系统自动检查验收条件达标情况，满足阈值后自动释放尾款。',
                gradient: 'from-emerald-600 to-emerald-500',
              },
            ].map((item, i) => (
              <div key={i} className="relative group">
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 h-full hover:border-gray-700 transition-all duration-300 hover:-translate-y-1">
                  <div className="flex items-center gap-3 mb-5">
                    <div className={`w-12 h-12 bg-gradient-to-br ${item.gradient} rounded-xl flex items-center justify-center shadow-lg`}>
                      <item.icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-4xl font-bold text-gray-800 group-hover:text-gray-700 transition-colors">{item.step}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">{item.title}</h3>
                  <p className="text-sm text-indigo-400 mb-3">{item.titleEn}</p>
                  <p className="text-sm text-gray-400 leading-relaxed">{item.desc}</p>
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
              双角色平台
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              商家与达人，各取所需
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Merchant Card */}
            <div className="group relative rounded-2xl overflow-hidden border border-gray-800 hover:border-indigo-500/50 transition-all duration-500 hover:-translate-y-1">
              {/* Image Header */}
              <div className="relative h-52 overflow-hidden">
                <img
                  src={MERCHANT_IMG}
                  alt="Merchant workspace"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent" />
                <div className="absolute bottom-4 left-6 flex items-center gap-3">
                  <div className="w-14 h-14 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/30">
                    <Store className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">我是商家</h3>
                    <p className="text-sm text-indigo-300">Merchant</p>
                  </div>
                </div>
              </div>
              {/* Content */}
              <div className="p-6 bg-gray-900">
                <p className="text-gray-400 mb-5 text-sm">中国跨境电商品牌、工厂、贸易公司</p>
                <ul className="space-y-3 mb-6">
                  {[
                    '发布合作单，精准匹配海外达人',
                    '资金托管保障，里程碑分期付款',
                    '验收条件自动检查，数据透明',
                    '达人信誉评级，降低合作风险',
                    '按月订阅，¥39/月起',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-gray-300">
                      <CheckCircle className="w-4 h-4 text-indigo-400 mt-0.5 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white h-11 transition-all hover:shadow-lg hover:shadow-indigo-600/20"
                  onClick={() => (isLoggedIn ? navigate('/merchant') : navigate('/auth'))}
                >
                  商家入驻 <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>

            {/* Creator Card */}
            <div className="group relative rounded-2xl overflow-hidden border border-gray-800 hover:border-sky-500/50 transition-all duration-500 hover:-translate-y-1">
              {/* Image Header */}
              <div className="relative h-52 overflow-hidden">
                <img
                  src={CREATOR_IMG}
                  alt="Creator tools"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent" />
                <div className="absolute bottom-4 left-6 flex items-center gap-3">
                  <div className="w-14 h-14 bg-sky-600 rounded-xl flex items-center justify-center shadow-lg shadow-sky-600/30">
                    <Video className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">I'm a Creator</h3>
                    <p className="text-sm text-sky-300">Content Creator</p>
                  </div>
                </div>
              </div>
              {/* Content */}
              <div className="p-6 bg-gray-900">
                <p className="text-gray-400 mb-5 text-sm">TikTok / Instagram / YouTube content creators worldwide</p>
                <ul className="space-y-3 mb-6">
                  {[
                    'Discover brand collaborations from Chinese merchants',
                    'Secure milestone-based payments via escrow',
                    'Build your reputation with trust tiers',
                    'Transparent conditions & automated verification',
                    'Always free for creators',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-gray-300">
                      <CheckCircle className="w-4 h-4 text-sky-400 mt-0.5 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full bg-sky-600 hover:bg-sky-500 text-white h-11 transition-all hover:shadow-lg hover:shadow-sky-600/20"
                  onClick={() => (isLoggedIn ? navigate('/creator') : navigate('/auth'))}
                >
                  Creator Sign Up <ArrowRight className="w-4 h-4 ml-2" />
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
              核心功能
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              为什么选择 CreatorBridge
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Shield, title: '资金托管 Escrow',
                gradient: 'from-indigo-600 to-indigo-500',
                desc: '商家预付资金进入平台托管账户，确保达人完成任务后能收到报酬，双方权益有保障。',
              },
              {
                icon: Zap, title: '里程碑付款 Milestones',
                gradient: 'from-amber-600 to-amber-500',
                desc: '将合作拆分为多个里程碑，每完成一个阶段自动释放对应比例的款项，降低双方风险。',
              },
              {
                icon: Eye, title: '自动验收 Auto-Verify',
                gradient: 'from-emerald-600 to-emerald-500',
                desc: '设定播放量、点赞数、互动率等验收条件，系统自动检查达标情况，减少人工纠纷。',
              },
              {
                icon: TrendingUp, title: '信誉体系 Trust Tiers',
                gradient: 'from-sky-600 to-sky-500',
                desc: '基于履约率、准时率、纠纷率的三维信誉评级，帮助商家快速识别优质达人。',
              },
              {
                icon: Globe, title: '多国多平台 Multi-Market',
                gradient: 'from-purple-600 to-purple-500',
                desc: '覆盖北美、欧洲、东南亚等主要市场，支持 TikTok、Instagram、YouTube 等主流平台。',
              },
              {
                icon: DollarSign, title: '灵活定价 Flexible Pricing',
                gradient: 'from-rose-600 to-rose-500',
                desc: '商家按月订阅（基础版/进阶版/团队版），达人永久免费使用，合作成本透明可控。',
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-1 group"
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA Section ===== */}
      <section className="py-24 bg-gray-950 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
            开始您的跨境达人合作之旅
          </h2>
          <p className="text-gray-400 text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
            无论您是寻找海外推广渠道的中国商家，还是希望与中国品牌合作的海外创作者，
            CreatorBridge 都能帮您找到最佳合作伙伴。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-indigo-600 text-white hover:bg-indigo-500 h-13 px-8 text-base font-semibold shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02]"
              onClick={() => navigate('/marketplace')}
            >
              浏览合作广场 Browse Marketplace
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="!bg-white/5 border border-white/20 text-white hover:!bg-white/10 h-13 px-8 text-base backdrop-blur-sm transition-all hover:border-white/40"
              onClick={() => (isLoggedIn ? navigate('/role-select') : navigate('/auth'))}
            >
              立即加入 Join Now
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
                <span className="text-lg font-bold text-white">CreatorBridge</span>
              </div>
              <p className="text-sm text-gray-500">面向中国跨境电商的海外达人合作执行平台</p>
            </div>
            <div>
              <h4 className="text-white font-medium mb-3">快速链接</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="/marketplace" className="hover:text-white transition-colors">合作广场</a></li>
                <li><a href="/creators" className="hover:text-white transition-colors">达人目录</a></li>
                <li><a href="/merchants" className="hover:text-white transition-colors">商家目录</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-medium mb-3">平台</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="/role-select" className="hover:text-white transition-colors">注册 / 登录</a></li>
                <li><a href="/merchant" className="hover:text-white transition-colors">商家控制台</a></li>
                <li><a href="/creator" className="hover:text-white transition-colors">Creator Studio</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-500">
            <p>© 2026 CreatorBridge. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}