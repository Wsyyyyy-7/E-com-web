import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import LocaleGuard from './components/LocaleGuard';
import { getInitialLocale } from './i18n';
import Index from './pages/Index';
import Marketplace from './pages/Marketplace';
import Auth from './pages/Auth';
import AuthError from './pages/AuthError';
import RoleSelect from './pages/RoleSelect';
import MerchantDashboard from './pages/MerchantDashboard';
import CreatorStudio from './pages/CreatorStudio';
import CreatorDirectory from './pages/CreatorDirectory';
import MerchantDirectory from './pages/MerchantDirectory';
import NotFound from './pages/NotFound';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to={`/${getInitialLocale()}`} replace />} />
          <Route path="/:locale" element={<LocaleGuard />}>
            <Route index element={<Index />} />
            <Route path="marketplace" element={<Marketplace />} />
            <Route path="auth" element={<Auth />} />
            <Route path="auth/error" element={<AuthError />} />
            <Route path="role-select" element={<ErrorBoundary><RoleSelect /></ErrorBoundary>} />
            <Route path="merchant" element={<MerchantDashboard />} />
            <Route path="creator" element={<CreatorStudio />} />
            <Route path="creators" element={<CreatorDirectory />} />
            <Route path="merchants" element={<MerchantDirectory />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;