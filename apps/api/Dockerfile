FROM node:22-alpine AS base
ARG CACHE_BUST=default
RUN echo "Cache bust: ${CACHE_BUST}" && corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# Copy workspace files
FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages ./packages
COPY apps/api/package.json ./apps/api/
RUN pnpm install --frozen-lockfile

# Build
FROM base AS builder
RUN apk add --no-cache openssl libc6-compat
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=deps /app/packages ./packages
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/api ./apps/api
RUN cd packages/database && npx prisma generate
RUN pnpm --filter api build

# Run
FROM base AS runner
ENV NODE_ENV=production

# Install runtime dependencies for Prisma
RUN apk add --no-cache openssl libc6-compat

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/packages ./packages

# Re-generate Prisma client in runner to get correct binaries
RUN cd packages/database && npx prisma generate

WORKDIR /app/apps/api
EXPOSE 4000
ENV PORT=4000
CMD ["node", "dist/main.js"]
