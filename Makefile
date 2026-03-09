# =============================================================================
# Study Tracker - Makefile
# Shortcut commands for development and production
# =============================================================================

.PHONY: dev prod down logs ps migrate seed studio build clean help

# Default target
.DEFAULT_GOAL := help

# Colors
GREEN  := \033[0;32m
YELLOW := \033[1;33m
NC     := \033[0m

help: ## Show this help message
	@echo '$(GREEN)Study Tracker - Available Commands$(NC)'
	@echo ''
	@awk 'BEGIN {FS = ":.*##"} /^[a-zA-Z_-]+:.*##/ { printf "  $(YELLOW)%-15s$(NC) %s\n", $$1, $$2 }' $(MAKEFILE_LIST)
	@echo ''

# ---------------------------------------------------------------------------
# Docker commands
# ---------------------------------------------------------------------------

dev: ## Start all services in development mode (with hot reload)
	@echo '$(GREEN)Starting Study Tracker in development mode...$(NC)'
	cp -n .env.example .env 2>/dev/null || true
	docker-compose up --build

dev-d: ## Start all services in development mode (detached)
	@echo '$(GREEN)Starting Study Tracker in development mode (detached)...$(NC)'
	cp -n .env.example .env 2>/dev/null || true
	docker-compose up --build -d

prod: ## Start all services in production mode
	@echo '$(GREEN)Starting Study Tracker in production mode...$(NC)'
	docker-compose -f docker-compose.yml -f docker-compose.prod.yml up --build -d

down: ## Stop and remove all containers
	@echo '$(YELLOW)Stopping Study Tracker...$(NC)'
	docker-compose down

down-v: ## Stop containers and remove volumes (WARNING: deletes database!)
	@echo '$(YELLOW)Stopping Study Tracker and removing volumes...$(NC)'
	docker-compose down -v

logs: ## Follow logs from all services
	docker-compose logs -f

logs-backend: ## Follow backend logs only
	docker-compose logs -f backend

logs-frontend: ## Follow frontend logs only
	docker-compose logs -f frontend

ps: ## Show status of all containers
	docker-compose ps

build: ## Build (or rebuild) all Docker images
	docker-compose build --no-cache

# ---------------------------------------------------------------------------
# Database / Prisma commands
# ---------------------------------------------------------------------------

migrate: ## Run Prisma migrations (development)
	@echo '$(GREEN)Running Prisma migrations...$(NC)'
	docker-compose exec backend npx prisma migrate dev

migrate-prod: ## Deploy Prisma migrations (production)
	@echo '$(GREEN)Deploying Prisma migrations to production...$(NC)'
	docker-compose exec backend npx prisma migrate deploy

seed: ## Seed the database with sample data
	@echo '$(GREEN)Seeding database...$(NC)'
	docker-compose exec backend npx prisma db seed

studio: ## Open Prisma Studio (database GUI)
	@echo '$(GREEN)Opening Prisma Studio at http://localhost:5555 ...$(NC)'
	docker-compose exec backend npx prisma studio

db-reset: ## Reset database (WARNING: destroys all data!)
	@echo '$(YELLOW)Resetting database...$(NC)'
	docker-compose exec backend npx prisma migrate reset

# ---------------------------------------------------------------------------
# Utility
# ---------------------------------------------------------------------------

shell-backend: ## Open a shell in the backend container
	docker-compose exec backend sh

shell-frontend: ## Open a shell in the frontend container
	docker-compose exec frontend sh

shell-db: ## Connect to PostgreSQL CLI
	docker-compose exec postgres psql -U $${POSTGRES_USER:-studytracker} -d $${POSTGRES_DB:-study_tracker}

clean: ## Remove stopped containers, dangling images, and build cache
	@echo '$(YELLOW)Cleaning Docker resources...$(NC)'
	docker system prune -f

setup: ## First-time setup: copy .env, build images, run migrations
	@echo '$(GREEN)Running first-time setup...$(NC)'
	cp -n .env.example .env 2>/dev/null && echo 'Created .env from .env.example' || echo '.env already exists, skipping'
	docker-compose up --build -d
	@echo '$(YELLOW)Waiting for postgres to be healthy...$(NC)'
	sleep 5
	docker-compose exec backend npx prisma migrate dev --name init
	@echo '$(GREEN)Setup complete! Visit http://localhost$(NC)'
