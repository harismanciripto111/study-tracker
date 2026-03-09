# Study Tracker

A full-stack web application for tracking study sessions, managing topics, taking quizzes, and monitoring learning progress — built with Next.js 14, Express, PostgreSQL, and Docker.

## Tech Stack

| Layer      | Technology                                      |
|------------|-------------------------------------------------|
| Frontend   | Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui |
| Backend    | Express.js, TypeScript, Zod validation          |
| Database   | PostgreSQL 16, Prisma ORM                       |
| Auth       | JWT (httpOnly cookies + Bearer token)           |
| AI Chat    | OpenAI API (optional)                           |
| DevOps     | Docker, Docker Compose, Nginx                   |

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) >= 24.x and Docker Compose v2
- [Node.js](https://nodejs.org/) >= 20.x (for local development without Docker)
- [Make](https://www.gnu.org/software/make/) (optional, for Makefile shortcuts)

## Quick Start with Docker

### 1. Clone and configure

```bash
git clone <your-repo-url> study-tracker
cd study-tracker

# Copy environment file and edit as needed
cp env.example .env
```

### 2. Start all services

```bash
# Using Make (recommended)
make dev

# Or directly with Docker Compose
docker-compose up --build
```

### 3. Run database migrations

```bash
# In a separate terminal (after services are running)
make migrate

# Optionally seed with sample data
make seed
```

### 4. Open the app

| Service        | URL                        |
|----------------|----------------------------|
| Frontend       | http://localhost:3000      |
| Backend API    | http://localhost:4000      |
| Via Nginx      | http://localhost           |
| Prisma Studio  | http://localhost:5555      |

---

## Manual Setup (without Docker)

### Backend

```bash
cd backend
npm install

# Create .env file
cp ../env.example .env
# Edit DATABASE_URL to point to your local PostgreSQL

# Run migrations
npx prisma migrate dev

# Start dev server (with hot reload)
npm run dev
```

### Frontend

```bash
cd frontend
npm install

# Create .env.local
echo 'NEXT_PUBLIC_API_URL=http://localhost:4000' > .env.local

# Start dev server
npm run dev
```

---

## Environment Variables

Copy `env.example` to `.env` at the root of the project:

```bash
cp env.example .env
```

| Variable             | Description                                         | Default                          |
|----------------------|-----------------------------------------------------|----------------------------------|
| `DATABASE_URL`       | Full PostgreSQL connection string                   | (auto-built from POSTGRES_*)     |
| `POSTGRES_USER`      | PostgreSQL username                                 | `studytracker`                   |
| `POSTGRES_PASSWORD`  | PostgreSQL password                                 | `studytracker`                   |
| `POSTGRES_DB`        | PostgreSQL database name                            | `study_tracker`                  |
| `NODE_ENV`           | Runtime environment                                 | `development`                    |
| `PORT`               | Backend server port                                 | `4000`                           |
| `JWT_SECRET`         | Secret key for signing JWTs — **change in prod!**  | *(required)*                     |
| `JWT_EXPIRES_IN`     | JWT expiration duration                             | `7d`                             |
| `CORS_ORIGIN`        | Allowed frontend origin for CORS                   | `http://localhost:3000`          |
| `NEXT_PUBLIC_API_URL`| Backend API base URL (client-side visible)         | `http://localhost:4000`          |
| `OPENAI_API_KEY`     | OpenAI key for AI chat feature (optional)          | *(empty)*                        |

---

## Available Scripts (Make)

```bash
make help          # Show all available commands
make dev           # Start in development mode (foreground)
make dev-d         # Start in development mode (detached/background)
make prod          # Start in production mode (detached)
make down          # Stop and remove containers
make down-v        # Stop containers AND remove volumes (deletes DB!)
make logs          # Follow logs from all services
make logs-backend  # Follow backend logs only
make logs-frontend # Follow frontend logs only
make ps            # Show container status
make build         # Rebuild all Docker images
make migrate       # Run Prisma migrations (dev)
make migrate-prod  # Deploy Prisma migrations (prod)
make seed          # Seed database with sample data
make studio        # Open Prisma Studio GUI
make db-reset      # Reset database (destroys all data!)
make shell-backend # Open shell in backend container
make shell-frontend# Open shell in frontend container
make shell-db      # Connect to PostgreSQL CLI
make clean         # Remove dangling Docker resources
make setup         # First-time setup (copy .env, build, migrate)
```

---

## API Endpoints

All endpoints are prefixed with `/api/v1`.

### Auth
| Method | Endpoint               | Description            | Auth Required |
|--------|------------------------|------------------------|---------------|
| POST   | `/api/v1/auth/register`| Register new user      | No            |
| POST   | `/api/v1/auth/login`   | Login, get JWT         | No            |
| POST   | `/api/v1/auth/logout`  | Logout, clear cookie   | Yes           |
| GET    | `/api/v1/auth/me`      | Get current user       | Yes           |

### Topics
| Method | Endpoint                  | Description              | Auth Required |
|--------|---------------------------|--------------------------|---------------|
| GET    | `/api/v1/topics`          | List all user topics     | Yes           |
| POST   | `/api/v1/topics`          | Create a topic           | Yes           |
| GET    | `/api/v1/topics/:id`      | Get topic details        | Yes           |
| PUT    | `/api/v1/topics/:id`      | Update a topic           | Yes           |
| DELETE | `/api/v1/topics/:id`      | Delete a topic           | Yes           |

### Study Sessions
| Method | Endpoint                   | Description              | Auth Required |
|--------|----------------------------|--------------------------|---------------|
| GET    | `/api/v1/sessions`         | List all sessions        | Yes           |
| POST   | `/api/v1/sessions`         | Log a study session      | Yes           |
| GET    | `/api/v1/sessions/:id`     | Get session details      | Yes           |
| PUT    | `/api/v1/sessions/:id`     | Update a session         | Yes           |
| DELETE | `/api/v1/sessions/:id`     | Delete a session         | Yes           |

### Progress & Analytics
| Method | Endpoint                      | Description                 | Auth Required |
|--------|-------------------------------|-----------------------------|---------------|
| GET    | `/api/v1/progress/summary`    | Overall stats summary       | Yes           |
| GET    | `/api/v1/progress/daily`      | Daily activity (last 14d)   | Yes           |
| GET    | `/api/v1/progress/streak`     | Current study streak        | Yes           |
| GET    | `/api/v1/progress/topics`     | Per-topic progress          | Yes           |

### Quiz
| Method | Endpoint                      | Description                 | Auth Required |
|--------|-------------------------------|-----------------------------|---------------|
| GET    | `/api/v1/quiz/questions`      | Get quiz questions          | Yes           |
| POST   | `/api/v1/quiz/submit`         | Submit quiz answers         | Yes           |
| GET    | `/api/v1/quiz/history`        | Quiz attempt history        | Yes           |

### AI Chat
| Method | Endpoint                 | Description                  | Auth Required |
|--------|--------------------------|------------------------------|---------------|
| POST   | `/api/v1/chat`           | Send message to AI assistant | Yes           |
| GET    | `/api/v1/chat/history`   | Get chat history             | Yes           |

### Admin (Admin only)
| Method | Endpoint                    | Description           | Auth Required |
|--------|-----------------------------|-----------------------|---------------|
| GET    | `/api/v1/admin/users`       | List all users        | Admin         |
| DELETE | `/api/v1/admin/users/:id`   | Delete a user         | Admin         |
| GET    | `/api/v1/admin/topics`      | List all topics       | Admin         |
| DELETE | `/api/v1/admin/topics/:id`  | Delete any topic      | Admin         |

---

## Project Structure

```
study-tracker/
├── backend/                   # Express + TypeScript API
│   ├── src/
│   │   ├── index.ts           # Entry point
│   │   ├── app.ts             # Express app + middleware
│   │   ├── routes/            # Route definitions
│   │   ├── controllers/       # Request handlers
│   │   ├── middleware/        # Auth, validation, error handlers
│   │   ├── services/          # Business logic
│   │   └── lib/               # Prisma client, JWT helpers
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema
│   │   ├── migrations/        # SQL migration files
│   │   └── seed.ts            # Database seeder
│   ├── Dockerfile             # Production Docker image
│   ├── Dockerfile.dev         # Development Docker image
│   └── package.json
│
├── frontend/                  # Next.js 14 App Router
│   ├── src/
│   │   ├── app/               # Pages (App Router)
│   │   │   ├── (auth)/        # Login / Register
│   │   │   └── (dashboard)/   # Protected pages
│   │   ├── components/        # Reusable UI components
│   │   ├── lib/               # API client, auth helpers, hooks
│   │   └── types/             # TypeScript types
│   ├── Dockerfile             # Production Docker image
│   ├── Dockerfile.dev         # Development Docker image
│   └── package.json
│
├── nginx/
│   └── nginx.conf             # Reverse proxy configuration
│
├── docker-compose.yml         # Development orchestration
├── docker-compose.prod.yml    # Production overrides
├── env.example                # Environment variable template
├── Makefile                   # Shortcut commands
└── README.md                  # This file
```

---

## Production Deployment

### 1. Set secure environment variables

```bash
cp env.example .env
# Edit .env — set strong JWT_SECRET, POSTGRES_PASSWORD, CORS_ORIGIN, etc.
echo "JWT_SECRET=$(openssl rand -base64 32)" >> .env
```

### 2. Deploy with production config

```bash
make prod
# or:
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up --build -d
```

### 3. SSL / HTTPS (optional)

Uncomment the HTTPS server block in `nginx/nginx.conf` and provide SSL certificates:

```bash
# Using Let's Encrypt (Certbot)
certbot certonly --webroot -w /var/www/certbot -d yourdomain.com

# Then mount certs in docker-compose.prod.yml (see commented section)
```

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'feat: add your feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

## License

MIT
