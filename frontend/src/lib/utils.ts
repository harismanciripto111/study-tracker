import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';

// shadcn/ui cn helper
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format minutes to human readable
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}j ${m}m` : `${h}j`;
}

// Format minutes to hours decimal
export function minutesToHours(minutes: number): number {
  return Math.round((minutes / 60) * 10) / 10;
}

// Format date to locale string
export function formatDate(dateStr: string): string {
  try {
    return format(parseISO(dateStr), 'dd MMM yyyy', { locale: id });
  } catch {
    return dateStr;
  }
}

// Format date relative (e.g. "2 hours ago")
export function formatRelative(dateStr: string): string {
  try {
    return formatDistanceToNow(parseISO(dateStr), { addSuffix: true, locale: id });
  } catch {
    return dateStr;
  }
}

// Format date for calendar display
export function formatCalendarDate(dateStr: string): string {
  try {
    return format(parseISO(dateStr), 'EEEE, dd MMMM yyyy', { locale: id });
  } catch {
    return dateStr;
  }
}

// Get initials from name
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// Generate color from string (for topic colors)
export function stringToColor(str: string): string {
  const colors = [
    '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e',
    '#f97316', '#eab308', '#22c55e', '#14b8a6',
    '#06b6d4', '#3b82f6',
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

// Get error message from axios error
export function getErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosErr = error as { response?: { data?: { error?: string; message?: string } } };
    return axiosErr.response?.data?.error ||
           axiosErr.response?.data?.message ||
           'Terjadi kesalahan';
  }
  if (error instanceof Error) return error.message;
  return 'Terjadi kesalahan';
}

// Topic category colors
export const CATEGORY_COLORS: Record<string, string> = {
  'Matematika': '#6366f1',
  'Fisika': '#8b5cf6',
  'Kimia': '#ec4899',
  'Biologi': '#22c55e',
  'Bahasa Inggris': '#3b82f6',
  'Bahasa Indonesia': '#f97316',
  'Sejarah': '#eab308',
  'Geografi': '#14b8a6',
  'Ekonomi': '#f43f5e',
  'Pemrograman': '#06b6d4',
};

// Day names in Indonesian
export const DAY_NAMES = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

// Difficulty label map
export const DIFFICULTY_LABELS: Record<string, string> = {
  EASY: 'Mudah',
  MEDIUM: 'Sedang',
  HARD: 'Sulit',
};

// Difficulty badge color
export const DIFFICULTY_COLORS: Record<string, string> = {
  EASY: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  MEDIUM: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  HARD: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};
