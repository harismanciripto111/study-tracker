# AGENT.md — Study Tracker: Konteks Lengkap untuk AI Agent

> Baca file ini sebelum melakukan apapun. Ini adalah sumber kebenaran tunggal tentang project ini.

---

## 1. Ringkasan Project

**Study Tracker** adalah web app full-stack untuk mahasiswa teknik kimia (dan pelajar umum) untuk:
- Tracking sesi belajar harian + streak
- Manajemen topik/materi kuliah
- Kuis interaktif dengan AI (Gemini API)
- Chat AI untuk tanya materi
- Kalender sesi belajar
- Progress tracking & analytics
- Admin panel untuk manage users + soal

**Owner:** harismanciripto111 (Raiman)
**Repo:** https://github.com/harismanciripto111/study-tracker
**Stack:** Next.js 14 (App Router) + Express/TypeScript + PostgreSQL + Docker

---

## 2. Keputusan Arsitektur Penting

### AUTH: Session-based (BUKAN JWT)
- **JWT sudah dihapus dari rencana.** Jangan tambahkan JWT lagi.
- Auth menggunakan **session + cookie** (express-session + connect-pg-simple)
- Session disimpan di PostgreSQL (tabel `sessions`)
- Cookie httpOnly, secure di production
- File `backend/src/lib/jwt.ts` sudah ada tapi JWT **tidak dipakai** — bisa dihapus

### AI: Gemini API (BUKAN OpenAI/Claude/agent lain)
- User input Gemini API key sendiri via settings page
- API key disimpan di database (kolom `users.geminiApiKey`), BUKAN di .env
- Dua fitur yang pakai Gemini:
  1. **Quiz Generator** — generate soal dari topik yang dipilih user
  2. **AI Chat** — tanya jawab materi kuliah
- Tidak ada hardcoded API key di server

### DEPLOYMENT: VPS Manual (BUKAN cloud/Heroku/Vercel)
- User run di VPS sendiri via Docker Compose
- `docker-compose.yml` — production
- `docker-compose.dev.yml` — development
- `docker-compose.prod.yml` — production dengan nginx
- Nginx sebagai reverse proxy (port 80/443 ke frontend :3000 dan backend :5000)
- Tidak perlu CI/CD pipeline, tidak perlu GitHub Actions

---

## 3. Struktur Project Lengkap

```
study-tracker/
├── docker-compose.yml
├── docker-compose.dev.yml
├── docker-compose.prod.yml
├── .env.example
├── Makefile
├── nginx/
│   └── nginx.conf
├── backend/
│   ├── Dockerfile
│   ├── Dockerfile.dev
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   └── seed.ts
│   └── src/
│       ├── index.ts
│       ├── lib/
│       │   ├── prisma.ts
│       │   ├── password.ts
│       │   └── jwt.ts  (DEPRECATED)
│       ├── middleware/
│       │   ├── auth.ts
│       │   ├── validate.ts
│       │   └── errorHandler.ts
│       ├── types/
│       │   └── index.ts
│       └── routes/
│           ├── auth.ts
│           ├── topics.ts
│           ├── sessions.ts
│           ├── progress.ts
│           ├── streak.ts
│           ├── quiz.ts
│           ├── chat.ts
│           ├── calendar.ts
│           └── admin.ts
└── frontend/
    ├── Dockerfile
    ├── Dockerfile.dev
    ├── package.json
    ├── tsconfig.json
    ├── next.config.ts
    ├── tailwind.config.ts
    ├── postcss.config.js
    ├── .env.example
    └── src/
        ├── types/index.ts
        ├── lib/api.ts
        ├── store/authStore.ts
        ├── hooks/useAuth.ts
        ├── app/
        │   ├── layout.tsx
        │   ├── page.tsx
        │   ├── globals.css
        │   ├── (auth)/
        │   │   ├── login/page.tsx
        │   │   └── register/page.tsx
        │   └── (dashboard)/
        │       ├── layout.tsx
        │       ├── dashboard/page.tsx
        │       ├── topics/page.tsx
        │       ├── progress/page.tsx
        │       ├── quiz/page.tsx
        │       ├── chat/page.tsx
        │       ├── calendar/page.tsx
        │       └── admin/page.tsx
        └── components/
            ├── layout/
            │   ├── Sidebar.tsx
            │   ├── Header.tsx
            │   └── PageWrapper.tsx
            ├── dashboard/
            │   ├── StatsCard.tsx
            │   ├── StreakWidget.tsx
            │   ├── WeeklyChart.tsx
            │   └── RecentSessions.tsx
            ├── topics/
            │   ├── TopicCard.tsx
            │   ├── TopicForm.tsx
            │   └── TopicList.tsx
            ├── quiz/
            │   ├── QuizCard.tsx
            │   └── QuizResult.tsx
            ├── progress/
            │   ├── ProgressBar.tsx
            │   └── ProgressChart.tsx
            └── ui/  (shadcn components)
```

---

## 4. Database Schema (Prisma)

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  username      String    @unique
  passwordHash  String
  role          Role      @default(STUDENT)
  geminiApiKey  String?   // User input sendiri via settings
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  topics        Topic[]
  sessions      StudySession[]
  progress      Progress[]
  quizAttempts  QuizAttempt[]
  chatHistory   ChatMessage[]
  streak        Streak?
}

model Topic {
  id          String     @id @default(cuid())
  title       String
  description String?
  subject     String
  difficulty  Difficulty @default(MEDIUM)
  userId      String
  user        User       @relation(fields: [userId], references: [id])
  createdAt   DateTime   @default(now())
  sessions    StudySession[]
  questions   Question[]
  progress    Progress[]
}

model StudySession {
  id        String   @id @default(cuid())
  userId    String
  topicId   String?
  duration  Int
  notes     String?
  startTime DateTime
  endTime   DateTime
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id])
  topic     Topic?   @relation(fields: [topicId], references: [id])
}

model Progress {
  id           String   @id @default(cuid())
  userId       String
  topicId      String
  percentage   Float    @default(0)
  lastStudied  DateTime @default(now())
  totalMinutes Int      @default(0)
  user         User     @relation(fields: [userId], references: [id])
  topic        Topic    @relation(fields: [topicId], references: [id])
  @@unique([userId, topicId])
}

model Question {
  id          String         @id @default(cuid())
  topicId     String
  text        String
  options     Json
  answer      String
  explanation String?
  difficulty  Difficulty     @default(MEDIUM)
  source      QuestionSource @default(MANUAL)
  topic       Topic          @relation(fields: [topicId], references: [id])
  attempts    QuizAttempt[]
}

model QuizAttempt {
  id         String   @id @default(cuid())
  userId     String
  questionId String
  answer     String
  isCorrect  Boolean
  createdAt  DateTime @default(now())
  user       User     @relation(fields: [userId], references: [id])
  question   Question @relation(fields: [questionId], references: [id])
}

model ChatMessage {
  id        String   @id @default(cuid())
  userId    String
  role      String
  content   String
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id])
}

model Streak {
  id          String    @id @default(cuid())
  userId      String    @unique
  current     Int       @default(0)
  longest     Int       @default(0)
  lastStudied DateTime?
  user        User      @relation(fields: [userId], references: [id])
}

enum Role           { STUDENT ADMIN }
enum Difficulty     { EASY MEDIUM HARD }
enum QuestionSource { MANUAL AI_GENERATED }
```

---

## 5. API Endpoints

### Auth `/api/auth`
| Method | Path | Keterangan |
|--------|------|------------|
| POST | `/register` | Register user baru |
| POST | `/login` | Login, set session cookie |
| POST | `/logout` | Destroy session |
| GET | `/me` | Get current user dari session |
| PUT | `/settings` | Update Gemini API key / password |

### Topics `/api/topics`
| Method | Path | Keterangan |
|--------|------|------------|
| GET | `/` | List topics milik user |
| POST | `/` | Buat topic baru |
| PUT | `/:id` | Update topic |
| DELETE | `/:id` | Hapus topic |

### Sessions `/api/sessions` (sesi belajar)
| Method | Path | Keterangan |
|--------|------|------------|
| GET | `/` | List semua sesi user |
| POST | `/` | Log sesi belajar baru |
| DELETE | `/:id` | Hapus sesi |

### Progress `/api/progress`
| Method | Path | Keterangan |
|--------|------|------------|
| GET | `/` | Progress semua topik user |
| PUT | `/:topicId` | Update progress topik |

### Streak `/api/streak`
| Method | Path | Keterangan |
|--------|------|------------|
| GET | `/` | Get streak current user |
| POST | `/check` | Check & update streak hari ini |

### Quiz `/api/quiz`
| Method | Path | Keterangan |
|--------|------|------------|
| GET | `/questions/:topicId` | Get soal dari DB |
| POST | `/generate` | Generate soal via Gemini AI |
| POST | `/submit` | Submit jawaban |
| GET | `/history` | History attempts |

### Chat `/api/chat`
| Method | Path | Keterangan |
|--------|------|------------|
| POST | `/` | Kirim pesan ke Gemini |
| GET | `/history` | Get chat history |
| DELETE | `/history` | Clear history |

### Calendar `/api/calendar`
| Method | Path | Keterangan |
|--------|------|------------|
| GET | `/` | Get sesi by bulan (query: year, month) |
| POST | `/schedule` | Buat jadwal mendatang |

### Admin `/api/admin` (ADMIN only)
| Method | Path | Keterangan |
|--------|------|------------|
| GET | `/users` | List semua users |
| DELETE | `/users/:id` | Hapus user |
| GET | `/questions` | List semua soal |
| POST | `/questions` | Tambah soal manual |
| PUT | `/questions/:id` | Edit soal |
| DELETE | `/questions/:id` | Hapus soal |
| GET | `/stats` | Statistik global |

---

## 6. Environment Variables

### Root `.env`
```env
POSTGRES_DB=studytracker
POSTGRES_USER=postgres
POSTGRES_PASSWORD=yourpassword
DATABASE_URL=postgresql://postgres:yourpassword@db:5432/studytracker
```

### Backend `.env`
```env
DATABASE_URL=postgresql://postgres:yourpassword@db:5432/studytracker
SESSION_SECRET=your-super-secret-session-key-min-32-chars
NODE_ENV=production
PORT=5000
FRONTEND_URL=http://localhost:3000
```

### Frontend `.env.local`
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

---

## 7. Status Pekerjaan

### Backend — SEBAGIAN SELESAI
- [x] Middleware: errorHandler.ts, validate.ts
- [x] Types: src/types/index.ts
- [x] Lib: password.ts (bcrypt)
- [x] Dockerfile + Dockerfile.dev
- [x] prisma/seed.ts
- [ ] BELUM: prisma/schema.prisma
- [ ] BELUM: src/lib/prisma.ts (Prisma client singleton)
- [ ] BELUM: src/middleware/auth.ts (session-based)
- [ ] BELUM: src/index.ts (Express server lengkap)
- [ ] BELUM: semua route files di src/routes/

### Frontend — HAMPIR SELESAI
- [x] Next.js 14 + Tailwind + shadcn/ui
- [x] Layout: Sidebar, Header, PageWrapper
- [x] Auth pages: login, register
- [x] Dashboard, Topics, Progress, Quiz, Chat, Calendar, Admin pages
- [x] Semua components (dashboard, topics, quiz, progress, ui)
- [ ] BELUM: src/lib/api.ts (axios + semua API calls)
- [ ] BELUM: src/store/authStore.ts (Zustand)
- [ ] BELUM: src/hooks/useAuth.ts
- [ ] PERLU UPDATE: pages masih pakai dummy data, perlu dihubungkan ke real API

### Infrastructure — SELESAI
- [x] docker-compose.yml, docker-compose.dev.yml, docker-compose.prod.yml
- [x] nginx/nginx.conf
- [x] Makefile
- [x] README.md

---

## 8. Prioritas Pekerjaan Selanjutnya

### Priority 1: Backend Core
1. Buat `backend/prisma/schema.prisma`
2. Buat `backend/src/lib/prisma.ts`
3. Buat `backend/src/middleware/auth.ts` (session)
4. Buat `backend/src/index.ts` (Express + semua routes)
5. Buat semua `backend/src/routes/*.ts`

### Priority 2: Frontend API Integration
1. Buat `frontend/src/lib/api.ts` (axios, withCredentials: true)
2. Buat `frontend/src/store/authStore.ts` (Zustand)
3. Buat `frontend/src/hooks/useAuth.ts`
4. Update semua pages: ganti dummy data dengan real API calls

### Priority 3: Deploy ke VPS
1. Test dengan docker-compose.dev.yml
2. Clone repo di VPS, setup .env files
3. Run docker-compose.prod.yml
4. Setup SSL certbot (optional)

---

## 9. Cara Deploy di VPS

```bash
# Clone
git clone https://github.com/harismanciripto111/study-tracker.git
cd study-tracker

# Setup env
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
nano .env  # edit dengan credentials asli

# Run production
docker compose -f docker-compose.prod.yml up -d --build

# Migrations + seed
docker compose exec backend npx prisma migrate deploy
docker compose exec backend npx prisma db seed

# Logs
docker compose logs -f
```

### Makefile shortcuts
```bash
make dev      # Start development
make prod     # Start production
make down     # Stop all
make logs     # View logs
make migrate  # Run migrations
make seed     # Run seed
make shell-be # Shell ke backend
make shell-db # Shell ke PostgreSQL
```

---

## 10. Catatan Teknis Penting

### Session Auth Flow
```
1. User POST /api/auth/login dengan email + password
2. Backend verify password dengan bcrypt
3. Backend set req.session.userId = user.id
4. Session disimpan di PostgreSQL via connect-pg-simple
5. Cookie session_id dikirim ke browser (httpOnly)
6. Setiap request berikutnya cookie dikirim otomatis
7. Backend middleware cek req.session.userId
8. GET /api/auth/me return user dari session
```

### Gemini API Flow
```
1. User input API key di Settings page
2. Frontend PUT /api/auth/settings dengan { geminiApiKey }
3. Backend simpan ke DB (users.geminiApiKey)
4. Saat quiz generate atau chat:
   - Backend ambil geminiApiKey dari DB user
   - Backend call Gemini API dengan key tersebut
   - Return response ke frontend
```

### Frontend API Instance
```typescript
// frontend/src/lib/api.ts — PENTING: withCredentials
import axios from 'axios'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,  // kirim cookie session
})

export default api
```

### Docker Network
- Semua services dalam network `study-tracker-network`
- Frontend ke Backend: lewat nginx atau langsung http://backend:5000
- Backend ke DB: postgresql://db:5432
- Akses external: semua lewat Nginx port 80

### Package dependencies backend yang diperlukan
```json
{
  "dependencies": {
    "express": "^4.18",
    "express-session": "^1.17",
    "connect-pg-simple": "^9",
    "@prisma/client": "^5",
    "bcryptjs": "^2.4",
    "zod": "^3",
    "cors": "^2.8",
    "@google/generative-ai": "^0.1"
  },
  "devDependencies": {
    "prisma": "^5",
    "typescript": "^5",
    "@types/express": "^4",
    "@types/express-session": "^1",
    "@types/connect-pg-simple": "^7",
    "@types/bcryptjs": "^2",
    "@types/cors": "^2",
    "ts-node-dev": "^2",
    "tsx": "^4"
  }
}
```

---

*Last updated: 2026-03-09 | Maintainer: Raiman (harismanciripto111)*