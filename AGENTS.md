# CloudScale - Agent Instructions

## Project Architecture

Monorepo with npm workspaces containing two apps:
- **apps/web** - Next.js 16 frontend (React 19, TypeScript, Tailwind CSS 4)
- **apps/worker** - Node.js background worker (BullMQ + Redis queue, Prisma + PostgreSQL, Dockerode)

Worker processes deployment jobs: clones GitHub repo → builds Docker image → runs container → updates DB status.

## Key Commands

```bash
# Install all dependencies
npm install

# Start infrastructure (PostgreSQL + Redis)
docker-compose up -d

# Run database migrations
cd apps/worker && npx prisma migrate dev

# Start web dev server
cd apps/web && npm run dev

# Start worker (processes deployment queue)
cd apps/worker && node worker.js

# Queue a test deployment job
cd apps/worker && node test-producer.js

# Test Docker connection
cd apps/worker && node test-docker.js

# Lint web app
cd apps/web && npm run lint

# Build web app
cd apps/web && npm run build
```

## Critical Configuration

- **DATABASE_URL** in both `apps/worker/.env` and `apps/web/.env` (Neon PostgreSQL)
- **Redis** on localhost:6379 (via docker-compose)
- **Worker** reads from `deployment-queue` in Redis
- **Deployments** cloned to `apps/worker/deployments/` (gitignored)

## Current Issues

1. **Worker Docker build is mocked** - `worker.js:109-111` uses `setTimeout` instead of real `docker.buildImage()`
2. **No container run logic** - Worker logs success but doesn't actually `docker.run()` or `container.start()`
3. **Duplicate DATABASE_URL** in `apps/worker/.env` (lines 1-3)
4. **Placeholder GitHub URL** in `apps/web/src/app/page.tsx:21`
5. **No API routes** in web for creating projects/triggering deployments
6. **No authentication/authorization**
7. **No test scripts** defined in package.json files

## Conventions

- Path aliases: `@/*` → `apps/web/src/*` (tsconfig.json)
- Prisma singleton pattern in `apps/web/src/lib/prisma.ts`
- ESLint extends `eslint-config-next` (core-web-vitals + typescript)
- Tailwind CSS v4 with PostCSS plugin
- Font variables: `--font-display`, `--font-body`, `--font-mono`

## Database Schema (Prisma)

```
Project { id, name, githubRepo, branch, port, deployments[] }
Deployment { id, projectId, status, logs, aiDiagnosis, project }
```

Status values: `PENDING` | `BUILDING` | `DEPLOYED` | `FAILED`

## Recommended Next Steps

1. Implement real Docker build/run in `worker.js` (replace mocked steps)
2. Add REST API routes in `apps/web/src/app/api/` for project/deployment CRUD
3. Add authentication (NextAuth.js or similar)
4. Add test scripts and CI pipeline
5. Fix duplicate DATABASE_URL in worker/.env