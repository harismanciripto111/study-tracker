import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,

      setUser: (user) => set({ user, isAuthenticated: true }),

      setToken: (token) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('st_token', token);
        }
        set({ token });
      },

      setAuth: (user, token) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('st_token', token);
        }
        set({ user, token, isAuthenticated: true, isLoading: false });
      },

      clearAuth: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('st_token');
          localStorage.removeItem('st_user');
        }
        set({ user: null, token: null, isAuthenticated: false, isLoading: false });
      },

      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'st_auth',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? localStorage : {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        }
      ),
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
    }
  )
);
