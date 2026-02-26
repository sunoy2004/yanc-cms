/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { User, AuthState } from '@/types/cms';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'yanc_cms_token';
const USER_KEY = 'yanc_cms_user';

const resolveApiBase = () => {
  const viteApi = (import.meta.env.VITE_API_URL as string) || '';
  const cmsApi = (import.meta.env.VITE_CMS_API_URL as string) || '';
  const cmsBase = (import.meta.env.VITE_CMS_BASE_URL as string) || '';

  if (viteApi && viteApi.trim() !== '') return viteApi.replace(/\/+$/, '');
  if (cmsApi && cmsApi.trim() !== '') return cmsApi.replace(/\/+$/, '');
  if (cmsBase && cmsBase.trim() !== '') return cmsBase.replace(/\/+$/, '');
  return 'http://localhost:8080';
};

async function fetchProfile(token: string): Promise<User | null> {
  const apiBase = resolveApiBase();
  const meUrl = apiBase.endsWith('/api') ? `${apiBase}/auth/me` : `${apiBase}/api/auth/me`;
  try {
    const res = await fetch(meUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) {
      return null;
    }
    const data = await res.json();
    const user: User = {
      id: String(data.id ?? '1'),
      email: data.email || `${data.username || 'admin'}@yanc.in`,
      name: data.name || data.username || 'Admin User',
      role: (data.role === 'editor' ? 'editor' : 'admin'),
    };
    return user;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Check for existing session on mount and refresh profile from backend
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    const userStr = localStorage.getItem(USER_KEY);

    if (!token) {
      setState(prev => ({ ...prev, isLoading: false }));
      return;
    }

    (async () => {
      setState(prev => ({ ...prev, isLoading: true }));
      const backendUser = await fetchProfile(token);
      if (backendUser) {
        localStorage.setItem(USER_KEY, JSON.stringify(backendUser));
        setState({
          user: backendUser,
          token,
          isAuthenticated: true,
          isLoading: false,
        });
        return;
      }

      // Fallback to cached user if profile fetch fails
      if (userStr) {
        try {
          const user = JSON.parse(userStr) as User;
          setState({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
          return;
        } catch {
          // ignore parse error and clear
        }
      }

      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      setState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
    })();
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const apiBase = resolveApiBase();
      // Ensure we call the correct auth endpoint whether apiBase includes /api or not
      const authUrl = apiBase.endsWith('/api') ? `${apiBase}/auth/login` : `${apiBase}/api/auth/login`;

      const response = await fetch(authUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username, // Backend expects username
          password: password,
        }),
      });

      if (!response.ok) {
        // Attempt to surface backend error message if available
        let msg = 'Invalid credentials';
        try {
          const err = await response.json();
          msg = err?.message || msg;
        } catch {
          /* ignore parse errors */
        }
        throw new Error(msg);
      }

      const data = await response.json();

      // The backend returns accessToken
      const token = data.accessToken as string;
      localStorage.setItem(TOKEN_KEY, token);

      // Try to get profile from backend to populate name/email
      const backendUser = await fetchProfile(token);
      const user: User =
        backendUser ?? {
          id: '1',
          email: `${username}@yanc.in`,
          name: 'Admin User',
          role: 'admin',
        };

      localStorage.setItem(USER_KEY, JSON.stringify(user));

      setState({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
