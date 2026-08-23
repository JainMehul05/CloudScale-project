# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./
COPY apps/worker/package.json ./apps/worker/

# Install worker dependencies only
RUN --mount=type=cache,target=/root/.npm \
    npm install --workspace=worker --include-workspace-root --prefer-offline --no-audit --no-fund

# Copy Prisma schema
COPY apps/worker/prisma ./apps/worker/prisma

# Generate Prisma Client
RUN npx prisma generate --schema=apps/worker/prisma/schema.prisma

# Copy worker source files
COPY apps/worker/worker.js ./apps/worker/
COPY apps/worker/test-producer.js ./apps/worker/
COPY apps/worker/test-docker.js ./apps/worker/

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Install git for repository cloning
RUN apk add --no-cache git

# Copy built dependencies and source
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/worker ./apps/worker
COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json ./

# Create deployments directory
RUN mkdir -p /app/apps/worker/deployments

WORKDIR /app/apps/worker

CMD ["node", "worker.js"]