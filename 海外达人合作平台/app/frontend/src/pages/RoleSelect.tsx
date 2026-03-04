import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Globe, Store, Video, ArrowRight, Loader2 } from 'lucide-react';

const CREATOR_IMG = 'https://mgx-backend-cdn.metadl.com/generate/images/999838/2026-03-04/b7151c68-7aab-4f1e-9ea3-494ce309ae70.png';
const MERCHANT_IMG = 'https://mgx-backend-cdn.metadl.com/generate/images/999838/2026-03-04/3881b601-d08f-4cb8-8397-4e67f42dd8ab.png';

export default function RoleSelect() {
  const { isLoggedIn, profile, selectRole, login, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<'merchant' | 'creator' | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // If已经有角色信息，自动跳转到对应控制台
  useEffect(() => {
    if (!authLoading && isLoggedIn && profile) {
      navigate(profile.role === 'merchant' ? '/merchant' : '/creator');
    }
  }, [authLoading, isLoggedIn, profile, navigate]);

  const shouldRedirectToHome = !authLoading && !isLoggedIn;
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

  const handleSubmit = async () => {
    if (!selectedRole || !displayName.trim()) return;
    setSubmitting(true);
    try {
      await selectRole(selectedRole, displayName.trim());
      navigate(selectedRole === 'merchant' ? '/merchant' : '/creator');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">CreatorBridge</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">选择您的角色 / Choose Your Role</h1>
          <p className="text-gray-400">请选择您在平台上的身份</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Merchant Card */}
          <div
            className={`cursor-pointer transition-all rounded-2xl overflow-hidden border-2 group ${
              selectedRole === 'merchant'
                ? 'border-indigo-500 shadow-lg shadow-indigo-500/20'
                : 'border-gray-800 hover:border-gray-700'
            }`}
            onClick={() => setSelectedRole('merchant')}
          >
            <div className="relative h-32 overflow-hidden">
              <img src={MERCHANT_IMG} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent" />
              <div className="absolute bottom-3 left-4">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                  <Store className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
            <div className="p-6 bg-gray-900">
              <h3 className="text-xl font-bold text-white mb-1">我是商家</h3>
              <p className="text-sm text-gray-400 mb-4">I&apos;m a Merchant</p>
              <ul className="text-sm text-gray-400 space-y-1.5">
                <li>• 发布合作单，寻找海外达人</li>
                <li>• 资金托管，里程碑付款</li>
                <li>• 按月订阅，¥39/月起</li>
              </ul>
            </div>
          </div>

          {/* Creator Card */}
          <div
            className={`cursor-pointer transition-all rounded-2xl overflow-hidden border-2 group ${
              selectedRole === 'creator'
                ? 'border-sky-500 shadow-lg shadow-sky-500/20'
                : 'border-gray-800 hover:border-gray-700'
            }`}
            onClick={() => setSelectedRole('creator')}
          >
            <div className="relative h-32 overflow-hidden">
              <img src={CREATOR_IMG} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent" />
              <div className="absolute bottom-3 left-4">
                <div className="w-10 h-10 bg-sky-600 rounded-xl flex items-center justify-center">
                  <Video className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
            <div className="p-6 bg-gray-900">
              <h3 className="text-xl font-bold text-white mb-1">I&apos;m a Creator</h3>
              <p className="text-sm text-gray-400 mb-4">我是达人</p>
              <ul className="text-sm text-gray-400 space-y-1.5">
                <li>• Discover brand collaborations</li>
                <li>• Milestone-based payments</li>
                <li>• Always free for creators</li>
              </ul>
            </div>
          </div>
        </div>

        {selectedRole && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <Label className="text-sm font-medium text-gray-300">
              {selectedRole === 'merchant' ? '显示名称 / 公司名称' : 'Display Name'}
            </Label>
            <Input
              className="mt-2 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus-visible:ring-indigo-500"
              placeholder={selectedRole === 'merchant' ? '例如：深圳XX贸易有限公司' : 'e.g., Sarah Johnson'}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
            <Button
              className="w-full mt-4 bg-indigo-600 hover:bg-indigo-500 text-white h-11"
            disabled={!selectedRole || !displayName.trim() || submitting}
              onClick={handleSubmit}
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {submitting ? '创建中...' : '确认并进入'} <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}