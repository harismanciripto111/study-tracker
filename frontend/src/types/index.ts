// ============================================================
// Auth Types
// ============================================================
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// ============================================================
// Topic Types
// ============================================================
export interface Topic {
  id: string;
  title: string;
  description?: string;
  category?: string;
  color?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    progressLogs: number;
  };
}

export interface CreateTopicDto {
  title: string;
  description?: string;
  category?: string;
  color?: string;
}

export interface UpdateTopicDto extends Partial<CreateTopicDto> {}

// ============================================================
// Progress Types
// ============================================================
export interface ProgressLog {
  id: string;
  topicId: string;
  userId: string;
  duration: number; // minutes
  note?: string;
  studiedAt: string;
  topic?: Topic;
}

export interface CreateProgressDto {
  topicId: string;
  duration: number;
  note?: string;
  studiedAt?: string;
}

export interface ProgressSummary {
  topicId: string;
  topicTitle: string;
  totalMinutes: number;
  sessionCount: number;
  lastStudied?: string;
}

// ============================================================
// Streak Types
// ============================================================
export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastCheckIn?: string;
  checkedInToday: boolean;
  totalCheckIns: number;
}

// ============================================================
// Quiz Types
// ============================================================
export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  topicId?: string;
  topic?: Topic;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  createdAt: string;
}

export interface CreateQuizDto {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  topicId?: string;
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
}

export interface QuizAttempt {
  questionId: string;
  selectedAnswer: number;
  isCorrect: boolean;
}

export interface QuizResult {
  total: number;
  correct: number;
  score: number;
  attempts: QuizAttempt[];
}

// ============================================================
// Calendar Types
// ============================================================
export interface CalendarEvent {
  id: string;
  date: string;
  totalMinutes: number;
  sessionCount: number;
  topics: string[];
}

// ============================================================
// Chat Types
// ============================================================
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export interface ChatRequest {
  message: string;
  history?: { role: 'user' | 'assistant'; content: string }[];
}

// ============================================================
// Admin Types
// ============================================================
export interface AdminStats {
  totalUsers: number;
  totalTopics: number;
  totalSessions: number;
  activeToday: number;
}

// ============================================================
// API Response Types
// ============================================================
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  error: string;
  details?: unknown;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ============================================================
// Dashboard Types
// ============================================================
export interface DashboardStats {
  totalMinutes: number;
  totalSessions: number;
  topicsCount: number;
  streak: StreakData;
  weeklyData: WeeklyData[];
  recentSessions: ProgressLog[];
}

export interface WeeklyData {
  day: string;
  minutes: number;
  sessions: number;
}
