# Use Debian-based image (has proper OpenSSL 1.1 support)
FROM node:22-slim AS builder

# Install pnpm and OpenSSL
RUN apt-get update && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

WORKDIR /app

# Copy root package files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/database/package.json ./packages/database/
COPY apps/api/package.json ./apps/api/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source files
COPY packages/database ./packages/database
COPY apps/api ./apps/api

# Generate Prisma client
RUN cd packages/database && npx prisma generate

# Build the API
RUN pnpm --filter api build

# Production stage - also Debian-based
FROM node:22-slim AS runner

RUN apt-get update && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy everything needed for runtime
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=builder /app/apps/api/package.json ./apps/api/

ENV NODE_ENV=production
EXPOSE 4000

WORKDIR /app/apps/api
CMD ["node", "dist/main.js"]
