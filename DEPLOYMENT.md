# Household Manager - Deployment Guide

## Project Structure

```
household-manager/
├── apps/
│   ├── api/          # NestJS Backend API
│   └── web/          # Next.js Frontend
├── packages/
│   └── database/     # Prisma schema & client
├── Dockerfile        # API Docker build (for Railway)
└── docker-compose.yml # Local development
```

## Prerequisites

- Node.js 22+
- pnpm 9+
- PostgreSQL database

## Local Development

```bash
# Install dependencies
pnpm install

# Generate Prisma client
pnpm db:generate

# Push schema to database
pnpm db:push

# Seed the database
pnpm db:seed

# Start development servers
pnpm dev
```

## Deployment Options

### Option 1: Railway (Recommended)

#### Backend API

1. Go to [Railway Dashboard](https://railway.com)
2. Create new project
3. Add PostgreSQL database service
4. Add new service → GitHub Repo → `rocky-balboa-ai/household-manager`
5. Set root directory to `/` (uses Dockerfile in root)
6. Configure environment variables:
   ```
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   JWT_SECRET=your-secure-jwt-secret-here
   FRONTEND_URL=https://household.mycyborg.ai
   PORT=4000
   ```
7. Deploy
8. Get the public URL (e.g., `https://api-production-xxxx.up.railway.app`)
9. Add custom domain: `api.household.mycyborg.ai`

#### Frontend

1. Add another service → GitHub Repo → same repo
2. Set root directory to `/`
3. Set Dockerfile path to `apps/web/Dockerfile`
4. Configure environment variables:
   ```
   NEXT_PUBLIC_API_URL=https://api.household.mycyborg.ai
   ```
5. Deploy
6. Add custom domain: `household.mycyborg.ai`

### Option 2: Vercel + Railway

#### Backend (Railway)
Same as above for the API.

#### Frontend (Vercel)

1. Go to [Vercel Dashboard](https://vercel.com)
2. Import from GitHub: `rocky-balboa-ai/household-manager`
3. Set Framework Preset: Next.js
4. Set Root Directory: `apps/web`
5. Configure build settings:
   - Build Command: `cd ../.. && pnpm install && pnpm --filter web build`
   - Output Directory: `.next`
6. Add environment variable:
   ```
   NEXT_PUBLIC_API_URL=https://api.household.mycyborg.ai
   ```
7. Deploy
8. Configure domain: `household.mycyborg.ai`

### Option 3: Docker Compose (Self-hosted)

```yaml
# docker-compose.production.yml
version: '3.8'

services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_USER: household
      POSTGRES_PASSWORD: secure-password
      POSTGRES_DB: household
    volumes:
      - postgres_data:/var/lib/postgresql/data

  api:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "4000:4000"
    environment:
      DATABASE_URL: postgresql://household:secure-password@postgres:5432/household
      JWT_SECRET: your-jwt-secret
      FRONTEND_URL: https://household.mycyborg.ai
      PORT: 4000
    depends_on:
      - postgres

  web:
    build:
      context: .
      dockerfile: apps/web/Dockerfile
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_API_URL: http://api:4000

volumes:
  postgres_data:
```

## Database Setup

After deployment, run migrations:

```bash
# Using Railway CLI
railway run npx prisma db push

# Or connect directly
DATABASE_URL="your-production-url" npx prisma db push
DATABASE_URL="your-production-url" npx ts-node packages/database/prisma/seed.ts
```

## Environment Variables

### API (.env)
```
DATABASE_URL=postgresql://user:pass@host:5432/db
JWT_SECRET=your-super-secret-jwt-key
FRONTEND_URL=https://household.mycyborg.ai
PORT=4000
```

### Web (.env.local)
```
NEXT_PUBLIC_API_URL=https://api.household.mycyborg.ai
```

## DNS Configuration

Point your domain to the deployed services:

```
household.mycyborg.ai    → Frontend (Vercel/Railway)
api.household.mycyborg.ai → Backend API (Railway)
```

## Default Users (from seed)

| User     | Email              | Password/PIN | Role    |
|----------|-------------------|--------------|---------|
| Fred     | fred@haddad.com   | password123  | ADMIN   |
| Elsy     | elsy@elsy.com     | (PIN sent)   | MANAGER |
| Saleem   | saleem@haddad.com | 1234         | DRIVER  |
| Karen    | karen@haddad.com  | 1234         | NANNY   |
| Wincate  | wincate@haddad.com| 1234         | NANNY   |
| Ada      | ada@haddad.com    | 1234         | MAID    |
| Bella    | bella@haddad.com  | 1234         | MAID    |

## Troubleshooting

### Prisma OpenSSL Error
If you see OpenSSL errors on Alpine Linux, ensure the Dockerfile includes:
```dockerfile
RUN apk add --no-cache openssl
```

### Cannot connect to database
Ensure DATABASE_URL is properly set and the database is accessible from the deployment environment.

### CORS errors
Ensure FRONTEND_URL in the API matches the actual frontend domain.
