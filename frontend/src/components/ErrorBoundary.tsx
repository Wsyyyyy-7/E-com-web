import { Component, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';

type Props = { children: ReactNode; fallback?: ReactNode };
type State = { hasError: boolean; error?: Error };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <h2 className="text-xl font-bold text-white mb-2">页面加载出错</h2>
            <p className="text-gray-400 text-sm mb-4">
              {this.state.error?.message || '请刷新页面或返回首页重试'}
            </p>
            <div className="flex gap-3 justify-center">
              <Button
                className="bg-indigo-600 hover:bg-indigo-500 text-white"
                onClick={() => window.location.href = '/'}
              >
                返回首页
              </Button>
              <Button
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-white/5"
                onClick={() => window.location.href = '/auth'}
              >
                去登录
              </Button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
