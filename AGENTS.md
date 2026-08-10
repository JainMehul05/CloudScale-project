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

- **DATABASE_URL** in `apps/worker/.env` and `apps/web/.env` (Neon PostgreSQL)
- **Redis** on localhost:6379 (via docker-compose)
- **Worker** reads from `deployment-queue` in Redis
- **Deployments** cloned to `apps/worker/deployments/` (gitignored)

---

## Worker Deployment Flow (`apps/worker/worker.js`)

### Current Status
- ✅ Clone GitHub repo (simple-git)
- ✅ Docker build (REAL - docker.buildImage with tar-stream)
- ✅ **Container creation & start (REAL - docker.createContainer + container.start)**
- ✅ Docker health check (real docker.info)
- ✅ Mark DEPLOYED (returns real container info)

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
  assignedPort: 3001-3900
}
```

**Progress:** 25% (clone) → 50% (build) → 75% (container start) → 100% (complete)

### Docker Build Implementation (lines 212-237)
```js
let buildLogs = '';
const imageTag = `cloudscale/${projectName}:latest`;

const tarStream = await createTarStream(deploymentDir);  // Excludes .git, node_modules, .env*

const buildStream = await docker.buildImage(tarStream, { t: imageTag });

await new Promise((resolve, reject) => {
  buildStream.on('data', (chunk) => { buildLogs += chunk; console.log(chunk); });
  buildStream.on('end', resolve);
  buildStream.on('error', reject);
});
```

**Exclusions in `createTarStream`:** `.git`, `node_modules`, `.env`, `.env.*`

### Container Creation Implementation (lines 251-294)
```js
const containerName = `app-${projectName}-${deploymentId.slice(0, 8)}`;

container = await docker.createContainer({
  Image: imageTag,
  HostConfig: {
    PortBindings: { '3000/tcp': [{ HostPort: String(assignedPort) }] },
    Memory: 512 * 1024 * 1024,      // 512MB
    MemorySwap: 512 * 1024 * 1024,  // No swap
    CpuPeriod: 100000,
    CpuQuota: 50000,                // 0.5 CPU
    AutoRemove: false,
  },
  ExposedPorts: { '3000/tcp': {} },
  Env: ['PORT=3000'],
  Labels: {
    'cloudscale.projectId': projectId,
    'cloudscale.deploymentId': deploymentId,
  },
  name: containerName,
});

await container.start();

// Verify running after 2s
const inspect = await container.inspect();
if (!inspect.State.Running) throw new Error('Container failed to start');
```

**Labels:** `cloudscale.projectId`, `cloudscale.deploymentId`
**Resource limits:** 512MB memory, 0.5 CPU
**Port mapping:** `assignedPort` (host) → 3000 (container)

---

## Database Schema (Prisma)

```
Project { id, name, githubRepo, branch, port, deployments[] }
Deployment { id, projectId, status, logs, aiDiagnosis, project }
```
Status: `PENDING` | `BUILDING` | `DEPLOYED` | `FAILED`

---

## Conventions

- Path aliases: `@/*` → `apps/web/src/*` (tsconfig.json)
- Prisma singleton in `apps/web/src/lib/prisma.ts`
- ESLint extends `eslint-config-next`
- Tailwind CSS v4 with PostCSS

---

## Existing API Routes (Web)

| Route | Method | Status |
|-------|--------|--------|
| `/api/projects` | GET | ✅ All projects + deployments |
| `/api/projects` | POST | ✅ Create project + deployment + queue job |
| `/api/projects/[id]` | - | ❌ Not implemented |
| `/api/deployments` | - | ❌ Not implemented |

---

## Current Issues

1. **Container not created/run** - Worker builds image but doesn't `createContainer()` + `start()`
2. **Duplicate DATABASE_URL** in `apps/worker/.env` (lines 1-3)
3. **Placeholder GitHub URL** in `apps/web/src/app/page.tsx:21`
4. **No API routes** for individual project/deployment CRUD
5. **No authentication/authorization** on any API route
6. **No test scripts** in package.json files
7. **No container resource limits** (memory, CPU) - for future container creation
8. **No deployment cleanup** (disk exhaustion risk)

---

## Next Steps (Priority)

1. **Container creation & start** - Implement `docker.createContainer()` + `container.start()` in worker.js
2. **Add container resource limits** (memory, CPU, unique names)
3. **Repo URL validation** - Already implemented in `validateRepoUrl()`
4. **Add REST API routes** in `apps/web/src/app/api/`
5. **Add authentication** (NextAuth.js)
6. **Add test scripts and CI pipeline**
7. **Fix duplicate DATABASE_URL** in worker/.env
8. **Add deployment retention/cleanup job**

---

## Security Notes

- `validateRepoUrl()` blocks private IPs, non-HTTPS, non-github.com
- `.git`, `node_modules`, `.env*` excluded from Docker build context
- Docker daemon access = full host access if container escapes (future concern)