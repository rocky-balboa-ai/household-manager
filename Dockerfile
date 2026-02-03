FROM node:22-alpine AS base

# Install pnpm and OpenSSL 1.1 compatibility
RUN apk add --no-cache openssl1.1-compat
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

# Production stage
FROM node:22-alpine AS production

# Install OpenSSL 1.1 compatibility for Prisma
RUN apk add --no-cache openssl1.1-compat

WORKDIR /app

# Copy everything needed for runtime
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/packages ./packages
COPY --from=base /app/apps/api/dist ./apps/api/dist
COPY --from=base /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=base /app/apps/api/package.json ./apps/api/

ENV NODE_ENV=production
EXPOSE 4000

WORKDIR /app/apps/api
CMD ["node", "dist/main.js"]
