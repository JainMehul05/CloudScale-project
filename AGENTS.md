# CloudScale - Agent Instructions

## Project Architecture

Monorepo with npm workspaces:
- **apps/web** - Next.js 16 frontend (React 19, TypeScript, Tailwind CSS 4)
- **apps/worker** - Node.js background worker (BullMQ + Redis, Prisma + PostgreSQL, Dockerode)

Worker processes deployment jobs: clones GitHub repo → builds Docker image → runs container → updates DB status.

---

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

---

## Critical Configuration

- **DATABASE_URL** in `apps/worker/.env` and `apps/web/.env` (local PostgreSQL via docker-compose)
- **ENV_ENCRYPTION_KEY** in both `.env` files (32+ chars, required for env var encryption)
- **Redis** on localhost:6379 (via docker-compose)
- **Worker** reads from `deployment-queue` in Redis
- **Deployments** cloned to `apps/worker/deployments/` (gitignored)

---

## Worker Deployment Flow (`apps/worker/worker.js`)

### BullMQ Job Processing
```js
const worker = new Worker('deployment-queue', async (job) => { ... }, {
  connection: { host: 'localhost', port: 6379 }
});
```

**Job Data:**
```js
{
  deploymentId: 'uuid',
  projectId: 'uuid', 
  projectName: 'string',
  repoUrl: 'https://github.com/...',
  branch: 'main',
  assignedPort: 3001-3900,
  environmentVariables?: { key: value }
}
```

**Progress:** 25% (clone) → 50% (build) → 75% (container start) → 100% (complete)

### Container Creation (lines 251-294)
- **Name:** `app-${projectName}-${deploymentId.slice(0,8)}`
- **Labels:** `cloudscale.projectId`, `cloudscale.deploymentId`
- **Resource limits:** 512MB memory, 0.5 CPU
- **Port mapping:** `assignedPort` (host) → 3000 (container)
- **Env:** `PORT=3000` + project env vars (injected at build)

---

## Database Schema (Prisma)

```
Project { id, name, githubRepo, branch, port, deployments[], envVars[] }
Deployment { id, projectId, status, logs, aiDiagnosis, project, containerId?, containerName?, containerPort?, imageName?, liveUrl? }
EnvironmentVariable { id, projectId, key, valueEncrypted }
```
Status: `PENDING` | `BUILDING` | `DEPLOYED` | `FAILED`

---

## Conventions

- Path aliases: `@/*` → `apps/web/src/*` (tsconfig.json)
- Prisma singleton in `apps/web/src/lib/prisma.ts`
- ESLint extends `eslint-config-next`
- Tailwind CSS v4 with PostCSS
- Redis pub/sub for live logs: channel `logs:${deploymentId}`

---

## Existing API Routes (Web)

| Route | Methods | Status |
|-------|---------|--------|
| `/api/projects` | GET, POST | ✅ List all + create project + queue deployment |
| `/api/projects/[id]` | GET | ✅ Single project with deployments & env vars |
| `/api/projects/[id]/env` | GET, POST | ✅ List & create env vars |
| `/api/projects/[id]/env/[envId]` | PATCH, DELETE | ✅ Update & delete env vars |
| `/api/deployments/[id]/logs` | GET | ✅ SSE stream (historical + live) |

---

## Security Notes

- `validateRepoUrl()` blocks private IPs, non-HTTPS, non-github.com
- `.git`, `node_modules`, `.env*` excluded from Docker build context
- Env vars encrypted at rest (AES-256-GCM via `apps/web/src/lib/encryption.ts`)
- Docker daemon access = full host access if container escapes (future concern)

---

## Phase 2 Gaps (Current State)

1. **No authentication/authorization** on any API route
2. **No test scripts** in package.json files
3. **No deployment cleanup** (disk exhaustion risk from old deployments)
4. **Placeholder GitHub URL** in `apps/web/src/app/page.tsx:21`
5. **No stop/restart/delete deployment controls** (API exists in worker but no web endpoints)
6. **Framework detection** - auto-detect from repo, suggest Dockerfile
7. **No production Docker daemon security** (TLS, user namespaces, etc.)