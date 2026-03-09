'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, BookOpen, TrendingUp, Brain,
  Calendar, MessageSquare, Shield, GraduationCap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/topics', label: 'Topik', icon: BookOpen },
  { href: '/progress', label: 'Progress', icon: TrendingUp },
  { href: '/quiz', label: 'Quiz', icon: Brain },
  { href: '/calendar', label: 'Kalender', icon: Calendar },
  { href: '/chat', label: 'AI Chat', icon: MessageSquare },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();

  return (
    <aside className="hidden md:flex flex-col w-64 min-h-screen bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-sidebar-border">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <GraduationCap className="w-5 h-5 text-primary-foreground" />
        </div>
        <span className="font-bold text-lg text-sidebar-foreground">Study Tracker</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          );
        })}

        {/* Admin link - only for admins */}
        {user?.role === 'ADMIN' && (
          <Link
            href="/admin"
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors mt-2',
              pathname === '/admin'
                ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
            )}
          >
            <Shield className="w-4 h-4 shrink-0" />
            Admin Panel
          </Link>
        )}
      </nav>

      {/* Bottom info */}
      <div className="px-6 py-4 border-t border-sidebar-border">
        <p className="text-xs text-sidebar-foreground/40">Study Tracker v1.0</p>
      </div>
    </aside>
  );
}
