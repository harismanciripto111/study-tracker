'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/lib/api';
import { getErrorMessage } from '@/lib/utils';

export function useAuth() {
  const { user, token, isAuthenticated, isLoading, setAuth, clearAuth, setLoading } = useAuthStore();
  const router = useRouter();

  // Rehydrate user from token on mount
  useEffect(() => {
    const storedToken = typeof window !== 'undefined' ? localStorage.getItem('st_token') : null;
    if (storedToken && !user) {
      setLoading(true);
      authApi
        .me()
        .then((res) => {
          const userData = res.data.data || res.data;
          setAuth(userData, storedToken);
        })
        .catch(() => {
          clearAuth();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    const { token: newToken, user: newUser } = res.data.data || res.data;
    setAuth(newUser, newToken);
    return newUser;
  };

  const register = async (name: string, email: string, password: string) => {
    const res = await authApi.register(name, email, password);
    const { token: newToken, user: newUser } = res.data.data || res.data;
    setAuth(newUser, newToken);
    return newUser;
  };

  const logout = () => {
    clearAuth();
    router.push('/login');
  };

  const requireAuth = () => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  };

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    requireAuth,
    getErrorMessage,
  };
}
