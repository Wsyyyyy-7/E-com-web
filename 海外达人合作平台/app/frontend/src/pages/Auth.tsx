import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Globe, Mail, Phone, Lock, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';

type Mode = 'email-login' | 'phone-login' | 'register';

export default function AuthPage() {
  const navigate = useNavigate();
  const { loginWithEmail, loginWithPhone, register } = useAuth();

  const [mode, setMode] = useState<Mode>('email-login');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEmailLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await loginWithEmail(email.trim(), password);
      navigate('/role-select');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Email login failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await loginWithPhone(phone.trim(), password);
      navigate('/role-select');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Phone login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    setError('');
    if (!email.trim() && !phone.trim()) {
      setError('Please enter email or phone.');
      return;
    }
    setLoading(true);
    try {
      await register({
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        password,
        name: name.trim() || undefined,
      });
      navigate('/role-select');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Register failed');
    } finally {
      setLoading(false);
    }
  };

  const renderEmailPhoneFields = () => (
    <>
      <div className="space-y-2">
        <Label className="text-gray-300 flex items-center gap-2">
          <Mail className="w-4 h-4" /> Email (optional)
        </Label>
        <Input
          type="email"
          placeholder="you@example.com"
          className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label className="text-gray-300 flex items-center gap-2">
          <Phone className="w-4 h-4" /> Phone (optional)
        </Label>
        <Input
          type="tel"
          placeholder="+86 13800000000"
          className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
          value={phone}
          onChange={e => setPhone(e.target.value)}
        />
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="mb-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          返回主页
        </button>
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">CreatorBridge</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">登录 / 注册</h1>
          <p className="text-gray-400 text-sm">支持邮箱或手机号登录</p>
        </div>

        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-6 space-y-6">
            <div className="flex gap-2">
              <Button
                variant={mode === 'email-login' ? 'default' : 'outline'}
                className={mode === 'email-login' ? 'flex-1' : 'flex-1 !bg-transparent border-gray-700 text-gray-300'}
                onClick={() => setMode('email-login')}
              >
                邮箱登录
              </Button>
              <Button
                variant={mode === 'phone-login' ? 'default' : 'outline'}
                className={mode === 'phone-login' ? 'flex-1' : 'flex-1 !bg-transparent border-gray-700 text-gray-300'}
                onClick={() => setMode('phone-login')}
              >
                手机登录
              </Button>
              <Button
                variant={mode === 'register' ? 'default' : 'outline'}
                className={mode === 'register' ? 'flex-1' : 'flex-1 !bg-transparent border-gray-700 text-gray-300'}
                onClick={() => setMode('register')}
              >
                注册
              </Button>
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}

            {mode === 'email-login' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-gray-300 flex items-center gap-2">
                    <Mail className="w-4 h-4" /> Email
                  </Label>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300 flex items-center gap-2">
                    <Lock className="w-4 h-4" /> Password
                  </Label>
                  <Input
                    type="password"
                    placeholder="Your password"
                    className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                </div>
                <Button
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white h-11"
                  disabled={loading || !email.trim() || !password}
                  onClick={handleEmailLogin}
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  使用邮箱登录 <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}

            {mode === 'phone-login' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-gray-300 flex items-center gap-2">
                    <Phone className="w-4 h-4" /> Phone
                  </Label>
                  <Input
                    type="tel"
                    placeholder="+86 13800000000"
                    className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300 flex items-center gap-2">
                    <Lock className="w-4 h-4" /> Password
                  </Label>
                  <Input
                    type="password"
                    placeholder="Your password"
                    className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                </div>
                <Button
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white h-11"
                  disabled={loading || !phone.trim() || !password}
                  onClick={handlePhoneLogin}
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  使用手机号登录 <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}

            {mode === 'register' && (
              <div className="space-y-4">
                {renderEmailPhoneFields()}
                <div className="space-y-2">
                  <Label className="text-gray-300 flex items-center gap-2">
                    <Lock className="w-4 h-4" /> Password
                  </Label>
                  <Input
                    type="password"
                    placeholder="Set a password"
                    className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Display Name (optional)</Label>
                  <Input
                    placeholder="Your name or brand"
                    className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                    value={name}
                    onChange={e => setName(e.target.value)}
                  />
                </div>
                <Button
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white h-11"
                  disabled={loading || !password}
                  onClick={handleRegister}
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  注册并继续 <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

