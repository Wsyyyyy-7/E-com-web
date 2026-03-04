import { useState, useEffect, useCallback } from 'react';
import type { UserProfile } from '../lib/types';

type AuthUser = { id: string; email?: string };

type AuthState = {
  user: AuthUser | null;
  profile: UserProfile | null;
  loading: boolean;
  isLoggedIn: boolean;
};

const STORAGE_KEY: string = 'creatorbridge_auth';
const TOKEN_KEY: string = 'creatorbridge_token';

function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function storeToken(token: string | null): void {
  if (typeof window === 'undefined') return;
  if (!token) {
    window.localStorage.removeItem(TOKEN_KEY);
  } else {
    window.localStorage.setItem(TOKEN_KEY, token);
  }
}

function loadInitialState(): AuthState {
  try {
    const token = getStoredToken();
    if (!token) {
      return {
        user: null,
        profile: null,
        loading: false,
        isLoggedIn: false,
      };
    }

    // If we have a token, try to restore cached user/profile snapshot first
    if (typeof window !== 'undefined') {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { user: AuthUser | null; profile: UserProfile | null };
        const user = parsed?.user;
        const profile = parsed?.profile;
        if (user && typeof user.id === 'string') {
          const validProfile =
            profile &&
            typeof profile === 'object' &&
            (profile.role === 'merchant' || profile.role === 'creator')
              ? profile
              : null;
          return {
            user: { id: user.id, email: user.email },
            profile: validProfile,
            loading: false,
            isLoggedIn: true,
          };
        }
      }
    }

    // We have a token but no cached user info yet; mark loading and refresh in effect.
    return {
      user: null,
      profile: null,
      loading: true,
      isLoggedIn: false,
    };
  } catch {
    return {
      user: null,
      profile: null,
      loading: false,
      isLoggedIn: false,
    };
  }
}

export function useAuth() {
  const [state, setState] = useState<AuthState>(() => loadInitialState());

  // Persist user/profile snapshot for quick reloads (not security-critical).
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const snapshot = { user: state.user, profile: state.profile };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  }, [state.user, state.profile]);

  const refreshAuth = useCallback(async () => {
    const token = getStoredToken();
    if (!token) {
      setState({
        user: null,
        profile: null,
        loading: false,
        isLoggedIn: false,
      });
      return;
    }

    try {
      const res = await fetch('/api/v1/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        storeToken(null);
        setState({
          user: null,
          profile: null,
          loading: false,
          isLoggedIn: false,
        });
        return;
      }
      const data = await res.json();
      const user: AuthUser = { id: data.id, email: data.email };

      // 1) 尝试从后端 user_profiles 表获取当前账户的角色配置
      let profile: UserProfile | null = null;
      try {
        const profRes = await fetch('/api/v1/entities/user_profiles?limit=1&sort=-id', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (profRes.ok) {
          const body = await profRes.json();
          if (body && Array.isArray(body.items) && body.items.length > 0) {
            profile = body.items[0] as UserProfile;
          }
        }
      } catch {
        // ignore profile loading errors, fall back to local cache
      }

      // 2) 如果后端没有记录，再尝试本地缓存（仅当 user.id 一致时）
      if (!profile) {
        try {
          const raw = window.localStorage.getItem(STORAGE_KEY);
          if (raw) {
            const parsed = JSON.parse(raw) as { user: AuthUser | null; profile: UserProfile | null };
            if (parsed.user && parsed.user.id === user.id) {
              profile = parsed.profile || null;
            }
          }
        } catch {
          profile = null;
        }
      }

      setState({
        user,
        profile,
        loading: false,
        isLoggedIn: true,
      });
    } catch {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  useEffect(() => {
    if (state.loading) {
      // Initial load with token present
      refreshAuth();
    }
  }, [state.loading, refreshAuth]);

  const login = useCallback(() => {
    // Redirect to local auth page
    if (typeof window !== 'undefined') {
      window.location.href = '/auth';
    }
  }, []);

  const loginWithEmail = useCallback(async (email: string, password: string) => {
    const res = await fetch('/api/v1/auth/login-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || 'Email login failed');
    }
    const data = await res.json();
    storeToken(data.token);
    await refreshAuth();
  }, [refreshAuth]);

  const loginWithPhone = useCallback(async (phone: string, password: string) => {
    const res = await fetch('/api/v1/auth/login-phone', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phone, password }),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || 'Phone login failed');
    }
    const data = await res.json();
    storeToken(data.token);
    await refreshAuth();
  }, [refreshAuth]);

  const register = useCallback(
    async (params: { email?: string; phone?: string; password: string; name?: string }) => {
      const res = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Register failed');
      }
      const data = await res.json();
      storeToken(data.token);
      await refreshAuth();
    },
    [refreshAuth],
  );

  const logout = useCallback(() => {
    storeToken(null);
    setState({
      user: null,
      profile: null,
      loading: false,
      isLoggedIn: false,
    });
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  }, []);

  const selectRole = useCallback(
    async (role: 'merchant' | 'creator', displayName: string) => {
      if (!state.user) {
        return null;
      }
      const token = getStoredToken();

      // 默认先用本地构造一个 profile，保证即使后端失败也能在当前会话里用
      let profile: UserProfile = {
        id: state.profile?.id ?? 0,
        user_id: state.user.id,
        role,
        display_name: displayName,
        trust_tier: 'new',
        balance_frozen: 0,
        balance_available: 0,
        completion_rate: 100,
        ontime_rate: 100,
        dispute_rate: 0,
        created_at: new Date().toISOString(),
      } as UserProfile;

      // 有 token 时，优先把角色选择持久化到后端 user_profiles 表
      if (token) {
        try {
          const payload = {
            role,
            display_name: displayName,
            trust_tier: 'new',
          };

          let resp: Response;
          if (state.profile?.id) {
            resp = await fetch(`/api/v1/entities/user_profiles/${state.profile.id}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(payload),
            });
          } else {
            resp = await fetch('/api/v1/entities/user_profiles', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(payload),
            });
          }

          if (resp.ok) {
            const body = await resp.json();
            profile = body as UserProfile;
          }
        } catch {
          // 后端失败时保持本地 profile，不中断流转
        }
      }

      const nextState = {
        ...state,
        user: state.user!,
        profile,
        loading: false,
        isLoggedIn: true,
      };
      setState(nextState);
      // 同步写入 localStorage，这样跳转到 /merchant 或 /creator 时新页面的 useAuth 能立刻读到
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ user: nextState.user, profile: nextState.profile }),
        );
      }
      return profile;
    },
    [state.user, state.profile],
  );

  const getToken = useCallback(() => getStoredToken(), []);

  return {
    ...state,
    login,
    loginWithEmail,
    loginWithPhone,
    register,
    logout,
    selectRole,
    refreshAuth,
    getToken,
  };
}