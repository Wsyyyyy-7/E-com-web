import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Globe, Menu, X, ShoppingBag, Users, Store, User, LogOut, LayoutDashboard
} from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

export default function Navbar() {
  const { isLoggedIn, profile, login, logout, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { href: '/marketplace', label: '广场 Marketplace', icon: ShoppingBag },
    { href: '/creators', label: '达人目录 Creators', icon: Users },
    { href: '/merchants', label: '商家 Merchants', icon: Store },
  ];

  const isActive = (href: string) => location.pathname === href;

  const handleDashboard = () => {
    if (profile?.role === 'merchant') navigate('/merchant');
    else if (profile?.role === 'creator') navigate('/creator');
    else navigate('/role-select');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-950/80 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">CreatorBridge</span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.href}
                to={link.href}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive(link.href)
                    ? 'bg-white/10 text-white font-medium'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-3">
            {loading ? (
              <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse" />
            ) : isLoggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors">
                    <div className="w-8 h-8 bg-indigo-500/20 rounded-full flex items-center justify-center border border-indigo-500/30">
                      <User className="w-4 h-4 text-indigo-400" />
                    </div>
                    {profile?.role && (
                      <Badge className="bg-white/10 text-gray-300 hover:bg-white/10 border-white/20 text-xs">
                        {profile.role === 'merchant' ? '商家' : 'Creator'}
                      </Badge>
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-gray-900 border-gray-800">
                  <DropdownMenuItem onClick={handleDashboard} className="cursor-pointer text-gray-300 hover:text-white focus:text-white focus:bg-white/10">
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    控制台 Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-800" />
                  <DropdownMenuItem onClick={logout} className="cursor-pointer text-red-400 hover:text-red-300 focus:text-red-300 focus:bg-red-500/10">
                    <LogOut className="w-4 h-4 mr-2" />
                    退出 Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="outline" size="sm" className="!bg-transparent border-white/20 text-gray-300 hover:!bg-white/10 hover:text-white" onClick={login}>
                  登录 Login
                </Button>
                <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-white" onClick={login}>
                  免费注册 Sign Up
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden text-gray-400" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-gray-950 border-t border-white/10 px-4 py-4 space-y-2">
          {navLinks.map(link => (
            <Link
              key={link.href}
              to={link.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm ${
                isActive(link.href) ? 'bg-white/10 text-white font-medium' : 'text-gray-400'
              }`}
            >
              <link.icon className="w-4 h-4" />
              {link.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-white/10">
            {isLoggedIn ? (
              <>
                <button
                  onClick={() => { handleDashboard(); setMobileOpen(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-gray-400"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  控制台 Dashboard
                </button>
                <button
                  onClick={() => { logout(); setMobileOpen(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-red-400"
                >
                  <LogOut className="w-4 h-4" />
                  退出 Logout
                </button>
              </>
            ) : (
              <Button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white" onClick={login}>
                登录 / 注册
              </Button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}