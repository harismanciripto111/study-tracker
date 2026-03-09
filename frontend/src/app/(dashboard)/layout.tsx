'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/lib/api';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, isLoading, setAuth, clearAuth, setLoading } = useAuthStore();

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('st_token') : null;
    if (!token) {
      router.replace('/login');
      return;
    }
    if (!isAuthenticated) {
      setLoading(true);
      authApi
        .me()
        .then((res) => {
          const userData = res.data.data || res.data;
          setAuth(userData, token);
        })
        .catch(() => {
          clearAuth();
          router.replace('/login');
        })
        .finally(() => setLoading(false));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex">
        <div className="hidden md:flex w-64 flex-col bg-sidebar border-r border-border p-4 gap-3">
          <Skeleton className="h-10 w-full" />
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-9 w-full" />)}
        </div>
        <div className="flex-1 flex flex-col">
          <Skeleton className="h-16 w-full" />
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)}
            </div>
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
