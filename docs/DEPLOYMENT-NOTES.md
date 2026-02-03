# Deployment Notes

## Railway + Prisma on Alpine Linux (2026-02-03)

### Problem
Prisma Client couldn't locate the Query Engine at runtime on Railway:
```
PrismaClientInitializationError: Prisma Client could not locate the Query Engine for runtime "linux-musl"
```

### Root Causes
1. **Invalid binary target**: `linux-musl-openssl-1.1.x` doesn't exist. Valid musl targets are:
   - `linux-musl`
   - `linux-musl-openssl-3.0.x`
   - `linux-musl-arm64-openssl-1.1.x`
   - `linux-musl-arm64-openssl-3.0.x`

2. **Alpine 3.21+ doesn't have `openssl1.1-compat`**: The package was removed. Use default `openssl` (3.x).

3. **Docker layer caching**: Railway aggressively caches Docker layers. Git-triggered builds may use stale cached layers even after pushing fixes.

4. **Wrong Dockerfile**: Railway was using `apps/api/Dockerfile`, not the root `Dockerfile`.

### Solution

#### 1. Correct Prisma schema (`packages/database/prisma/schema.prisma`)
```prisma
generator client {
  provider      = "prisma-client-js"
  binaryTargets = ["native", "linux-musl", "linux-musl-openssl-3.0.x", "debian-openssl-3.0.x", "debian-openssl-1.1.x"]
}
```

#### 2. Correct Dockerfile (`apps/api/Dockerfile`)
```dockerfile
FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages ./packages
COPY apps/api/package.json ./apps/api/
RUN pnpm install --frozen-lockfile

FROM base AS builder
RUN apk add --no-cache openssl libc6-compat  # NO openssl1.1-compat!
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=deps /app/packages ./packages
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/api ./apps/api
RUN cd packages/database && npx prisma generate
RUN pnpm --filter api build

FROM base AS runner
ENV NODE_ENV=production
RUN apk add --no-cache openssl libc6-compat
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/packages ./packages
# Re-generate Prisma client in runner to ensure correct binaries
RUN cd packages/database && npx prisma generate
WORKDIR /app/apps/api
EXPOSE 4000
CMD ["node", "dist/main.js"]
```

Key points:
- Run `prisma generate` in BOTH builder AND runner stages
- Use `openssl libc6-compat` (not `openssl1.1-compat`)
- Only use valid binary targets

#### 3. Bypass Railway Docker cache
If git-triggered builds fail with stale cache:
```bash
# Direct upload bypasses git-triggered cache
railway up --detach
```

Or add a cache-bust comment to Dockerfile:
```dockerfile
# Force rebuild: 2026-02-03-003
```

### Testing Locally
Always test prisma generate locally before deploying:
```bash
cd packages/database && npx prisma generate
```

### Valid Prisma Binary Targets (as of v5.22.0)
```
darwin, darwin-arm64, debian-openssl-1.0.x, debian-openssl-1.1.x, 
debian-openssl-3.0.x, rhel-openssl-1.0.x, rhel-openssl-1.1.x, 
rhel-openssl-3.0.x, linux-arm64-openssl-1.1.x, linux-arm64-openssl-1.0.x, 
linux-arm64-openssl-3.0.x, linux-arm-openssl-1.1.x, linux-arm-openssl-1.0.x, 
linux-arm-openssl-3.0.x, linux-musl, linux-musl-openssl-3.0.x, 
linux-musl-arm64-openssl-1.1.x, linux-musl-arm64-openssl-3.0.x, 
linux-nixos, linux-static-x64, linux-static-arm64, windows, 
freebsd11-15, openbsd, netbsd, arm, native
```

Note: `linux-musl-openssl-1.1.x` does NOT exist!
