import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor - attach JWT token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('st_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle 401
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('st_token');
        localStorage.removeItem('st_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// ============================================================
// Auth API
// ============================================================
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (name: string, email: string, password: string) =>
    api.post('/auth/register', { name, email, password }),
  me: () => api.get('/auth/me'),
};

// ============================================================
// Topics API
// ============================================================
export const topicsApi = {
  list: () => api.get('/topics'),
  create: (data: { title: string; description?: string; category?: string; color?: string }) =>
    api.post('/topics', data),
  update: (id: string, data: Partial<{ title: string; description: string; category: string; color: string }>) =>
    api.put(`/topics/${id}`, data),
  delete: (id: string) => api.delete(`/topics/${id}`),
};

// ============================================================
// Progress API
// ============================================================
export const progressApi = {
  list: () => api.get('/progress'),
  create: (data: { topicId: string; duration: number; note?: string; studiedAt?: string }) =>
    api.post('/progress', data),
};

// ============================================================
// Streak API
// ============================================================
export const streakApi = {
  get: () => api.get('/streak'),
  checkIn: () => api.post('/streak/check-in'),
};

// ============================================================
// Quiz API
// ============================================================
export const quizApi = {
  list: () => api.get('/quiz'),
  create: (data: {
    question: string;
    options: string[];
    correctAnswer: number;
    explanation?: string;
    topicId?: string;
    difficulty?: string;
  }) => api.post('/quiz', data),
};

// ============================================================
// Calendar API
// ============================================================
export const calendarApi = {
  get: (year?: number, month?: number) =>
    api.get('/calendar', { params: { year, month } }),
};

// ============================================================
// Chat API
// ============================================================
export const chatApi = {
  send: (message: string, history?: { role: string; content: string }[]) =>
    api.post('/chat', { message, history }),
};

// ============================================================
// Admin API
// ============================================================
export const adminApi = {
  getUsers: () => api.get('/admin/users'),
  getTopics: () => api.get('/admin/topics'),
};
