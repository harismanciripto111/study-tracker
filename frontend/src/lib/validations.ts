import { z } from 'zod';

// ============================================================
// Auth Schemas
// ============================================================
export const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter').max(50, 'Nama maksimal 50 karakter'),
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter').max(100, 'Password terlalu panjang'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Password tidak cocok',
  path: ['confirmPassword'],
});

export type RegisterFormData = z.infer<typeof registerSchema>;

// ============================================================
// Topic Schema
// ============================================================
export const topicSchema = z.object({
  title: z.string().min(2, 'Judul minimal 2 karakter').max(100, 'Judul maksimal 100 karakter'),
  description: z.string().max(500, 'Deskripsi maksimal 500 karakter').optional(),
  category: z.string().max(50).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Format warna tidak valid').optional(),
});

export type TopicFormData = z.infer<typeof topicSchema>;

// ============================================================
// Progress Schema
// ============================================================
export const progressSchema = z.object({
  topicId: z.string().min(1, 'Pilih topik terlebih dahulu'),
  duration: z.number().min(1, 'Durasi minimal 1 menit').max(1440, 'Durasi maksimal 24 jam'),
  note: z.string().max(500, 'Catatan maksimal 500 karakter').optional(),
  studiedAt: z.string().optional(),
});

export type ProgressFormData = z.infer<typeof progressSchema>;

// ============================================================
// Quiz Schema
// ============================================================
export const quizSchema = z.object({
  question: z.string().min(10, 'Pertanyaan minimal 10 karakter'),
  options: z.array(z.string().min(1, 'Opsi tidak boleh kosong')).length(4, 'Harus ada 4 opsi'),
  correctAnswer: z.number().min(0).max(3),
  explanation: z.string().max(500).optional(),
  topicId: z.string().optional(),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).default('MEDIUM'),
});

export type QuizFormData = z.infer<typeof quizSchema>;
