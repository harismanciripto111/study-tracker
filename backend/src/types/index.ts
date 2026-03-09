import { Request } from 'express';

// ─── User roles (aligned with Prisma enum) ────────────────────────────────────
export type UserRole = 'USER' | 'ADMIN';

// ─── Topic categories (aligned with Prisma enum) ──────────────────────────────
export type TopicCategory =
  | 'CHEMISTRY'
  | 'ENGLISH'
  | 'MATH'
  | 'PHYSICS'
  | 'BIOLOGY'
  | 'HISTORY'
  | 'OTHER';

// ─── Extends Express Request with authenticated user ──────────────────────────
export interface AuthRequest extends Request {
  user: {
    userId: string;
    role: UserRole;
  };
}

// ─── Generic API response wrapper ─────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
  meta?: PaginationMeta;
}

// ─── Pagination ────────────────────────────────────────────────────────────────
export interface PaginationQuery {
  page?: number;
  limit?: number;
  search?: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ─── Domain types ──────────────────────────────────────────────────────────────
export interface UserPublic {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string | null;
  createdAt: Date;
}

export interface TopicSummary {
  id: string;
  name: string;
  description?: string | null;
  category: TopicCategory;
  color: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StudySessionSummary {
  id: string;
  userId: string;
  topicId: string;
  startTime: Date;
  endTime?: Date | null;
  durationMin?: number | null;
  notes?: string | null;
  createdAt: Date;
}

export interface QuizQuestion {
  id: string;
  topicId: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string | null;
}

export interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  lastStudiedAt?: Date | null;
}

export interface CalendarDay {
  date: string; // ISO date string YYYY-MM-DD
  sessionCount: number;
  totalMinutes: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// ─── Auth request/response shapes ─────────────────────────────────────────────
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface AuthTokenResponse {
  token: string;
  user: UserPublic;
}
