# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Build args for environment variables needed at build time
ARG ENV_ENCRYPTION_KEY
ARG NEXTAUTH_SECRET
ARG NEXTAUTH_URL
ARG NEXT_PUBLIC_DEV_MODE
ENV ENV_ENCRYPTION_KEY=${ENV_ENCRYPTION_KEY}
ENV NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
ENV NEXTAUTH_URL=${NEXTAUTH_URL}
ENV NEXT_PUBLIC_DEV_MODE=${NEXT_PUBLIC_DEV_MODE}

# Copy package files from root and workspace
COPY package.json package-lock.json ./
COPY apps/web/package.json ./apps/web/

# Install web dependencies only (skip worker)
RUN --mount=type=cache,target=/root/.npm \
    npm install --workspace=web --include-workspace-root --prefer-offline --no-audit --no-fund

# Copy Prisma schema for web
COPY apps/web/prisma ./apps/web/prisma

# Generate Prisma Client for web
RUN npx prisma generate --schema=apps/web/prisma/schema.prisma

# Copy source code
COPY apps/web/src ./apps/web/src
COPY apps/web/next.config.ts ./apps/web/
COPY apps/web/tsconfig.json ./apps/web/

# Build web app
WORKDIR /app/apps/web
ENV TURBOPACK=0
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=development

# Build args for runtime
ARG ENV_ENCRYPTION_KEY
ARG NEXTAUTH_SECRET
ARG NEXTAUTH_URL
ENV ENV_ENCRYPTION_KEY=${ENV_ENCRYPTION_KEY}
ENV NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
ENV NEXTAUTH_URL=${NEXTAUTH_URL}

# Copy standalone output
COPY --from=builder /app/apps/web/.next/standalone/apps/web/ ./apps/web/
# Use builder's full node_modules instead of standalone (which doesn't trace dockerode deps properly)
COPY --from=builder /app/node_modules ./node_modules

WORKDIR /app/apps/web

EXPOSE 3000

ENV HOSTNAME=0.0.0.0
ENV PORT=3000

CMD ["node", "server.js"]