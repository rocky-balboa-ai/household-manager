# Household Manager Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a complete household management app for the Haddad family with task management, inventory tracking, kids hub, and real-time updates.

**Architecture:** Monorepo with pnpm workspaces. Next.js 16 frontend in `apps/web`, NestJS backend in `apps/api`, shared Prisma schema in `packages/database`. Socket.io for real-time. JWT auth with PIN-based login for staff.

**Tech Stack:** Next.js 16, NestJS, PostgreSQL, Prisma, Socket.io, Tailwind CSS, TypeScript

---

## Phase 1: Project Setup

### Task 1.1: Initialize Monorepo

**Files:**
- Create: `package.json`
- Create: `pnpm-workspace.yaml`
- Create: `.gitignore`
- Create: `.nvmrc`

**Step 1: Create root package.json**

```json
{
  "name": "household-manager",
  "private": true,
  "scripts": {
    "dev": "pnpm -r --parallel dev",
    "build": "pnpm -r build",
    "lint": "pnpm -r lint",
    "test": "pnpm -r test",
    "db:generate": "pnpm --filter database generate",
    "db:push": "pnpm --filter database push",
    "db:seed": "pnpm --filter database seed"
  },
  "devDependencies": {
    "typescript": "^5.3.0"
  },
  "packageManager": "pnpm@9.0.0"
}
```

**Step 2: Create pnpm-workspace.yaml**

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

**Step 3: Create .gitignore**

```
node_modules
.env
.env.local
.next
dist
.turbo
*.log
.DS_Store
```

**Step 4: Create .nvmrc**

```
22
```

**Step 5: Initialize git and commit**

```bash
git add -A
git commit -m "chore: initialize monorepo structure"
```

---

### Task 1.2: Setup Database Package (Prisma)

**Files:**
- Create: `packages/database/package.json`
- Create: `packages/database/prisma/schema.prisma`
- Create: `packages/database/src/index.ts`
- Create: `packages/database/tsconfig.json`

**Step 1: Create packages/database/package.json**

```json
{
  "name": "database",
  "version": "1.0.0",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "generate": "prisma generate",
    "push": "prisma db push",
    "seed": "tsx prisma/seed.ts",
    "studio": "prisma studio"
  },
  "dependencies": {
    "@prisma/client": "^5.10.0"
  },
  "devDependencies": {
    "prisma": "^5.10.0",
    "tsx": "^4.7.0",
    "typescript": "^5.3.0"
  }
}
```

**Step 2: Create packages/database/prisma/schema.prisma**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id          String   @id @default(uuid())
  name        String
  email       String?  @unique
  password    String?  // Hashed, for Fred only
  phone       String?
  role        Role
  pin         String?  // Hashed 4-digit PIN
  pinSetAt    DateTime?
  language    String   @default("en")
  altLanguage String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  tasks        TaskAssignment[]
  activityLogs ActivityLog[]
  dayOffs      DayOff[]
  createdTasks Task[]           @relation("CreatedTasks")
}

enum Role {
  ADMIN
  MANAGER
  DRIVER
  NANNY
  MAID
}

model Task {
  id          String     @id @default(uuid())
  title       String
  description String?
  category    String
  status      TaskStatus @default(PENDING)
  dueDate     DateTime?
  recurring   String?
  photoProof  String?
  createdById String
  createdBy   User       @relation("CreatedTasks", fields: [createdById], references: [id])
  completedAt DateTime?
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  assignments TaskAssignment[]
}

enum TaskStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
}

model TaskAssignment {
  id     String @id @default(uuid())
  taskId String
  userId String
  task   Task   @relation(fields: [taskId], references: [id], onDelete: Cascade)
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([taskId, userId])
}

model InventoryItem {
  id           String   @id @default(uuid())
  name         String
  category     String
  subCategory  String?
  quantity     Int      @default(0)
  unit         String?
  lowThreshold Int?
  location     String?
  brand        String?
  flavor       String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

model FrozenMeal {
  id          String   @id @default(uuid())
  name        String
  quantity    Int      @default(0)
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model ShoppingList {
  id          String         @id @default(uuid())
  type        String
  assignedTo  String?
  status      String         @default("active")
  createdAt   DateTime       @default(now())
  completedAt DateTime?
  updatedAt   DateTime       @updatedAt

  items ShoppingItem[]
}

model ShoppingItem {
  id        String       @id @default(uuid())
  listId    String
  list      ShoppingList @relation(fields: [listId], references: [id], onDelete: Cascade)
  name      String
  quantity  Int          @default(1)
  unit      String?
  purchased Boolean      @default(false)
  createdAt DateTime     @default(now())
  updatedAt DateTime     @updatedAt
}

model Kid {
  id        String   @id @default(uuid())
  name      String
  birthDate DateTime
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  healthLogs   HealthLog[]
  mealLogs     MealLog[]
  activityLogs KidActivityLog[]
  schedules    KidSchedule[]
}

model HealthLog {
  id        String   @id @default(uuid())
  kidId     String
  kid       Kid      @relation(fields: [kidId], references: [id], onDelete: Cascade)
  type      String
  notes     String?
  loggedBy  String
  createdAt DateTime @default(now())
}

model MealLog {
  id           String   @id @default(uuid())
  kidId        String
  kid          Kid      @relation(fields: [kidId], references: [id], onDelete: Cascade)
  mealType     String
  foodSource   String
  foodName     String
  frozenMealId String?
  rating       Int
  photo        String
  portions     String?
  loggedBy     String
  createdAt    DateTime @default(now())
}

model KidActivityLog {
  id        String   @id @default(uuid())
  kidId     String
  kid       Kid      @relation(fields: [kidId], references: [id], onDelete: Cascade)
  activity  String
  category  String
  notes     String?
  loggedBy  String
  createdAt DateTime @default(now())
}

model KidSchedule {
  id        String   @id @default(uuid())
  kidId     String
  kid       Kid      @relation(fields: [kidId], references: [id], onDelete: Cascade)
  activity  String
  dayOfWeek Int
  time      String
  location  String?
  notes     String?
  active    Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model DayOff {
  id         String   @id @default(uuid())
  userId     String
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  date       DateTime
  type       String
  status     String   @default("pending")
  approvedBy String?
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}

model FredSchedule {
  id        String   @id @default(uuid())
  date      DateTime @unique
  location  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model ActivityLog {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  action    String
  details   Json?
  createdAt DateTime @default(now())
}

model Translation {
  id        String   @id @default(uuid())
  key       String
  language  String
  value     String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([key, language])
}
```

**Step 3: Create packages/database/src/index.ts**

```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export * from '@prisma/client';
export default prisma;
```

**Step 4: Create packages/database/tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "declaration": true,
    "declarationMap": true,
    "outDir": "./dist"
  },
  "include": ["src/**/*", "prisma/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: add database package with Prisma schema"
```

---

### Task 1.3: Setup NestJS Backend

**Files:**
- Create: `apps/api/package.json`
- Create: `apps/api/tsconfig.json`
- Create: `apps/api/nest-cli.json`
- Create: `apps/api/src/main.ts`
- Create: `apps/api/src/app.module.ts`
- Create: `apps/api/.env.example`

**Step 1: Create apps/api/package.json**

```json
{
  "name": "api",
  "version": "1.0.0",
  "scripts": {
    "dev": "nest start --watch",
    "build": "nest build",
    "start": "node dist/main",
    "start:prod": "node dist/main",
    "lint": "eslint \"{src,apps,libs,test}/**/*.ts\" --fix",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage"
  },
  "dependencies": {
    "@nestjs/common": "^10.3.0",
    "@nestjs/config": "^3.2.0",
    "@nestjs/core": "^10.3.0",
    "@nestjs/jwt": "^10.2.0",
    "@nestjs/passport": "^10.0.3",
    "@nestjs/platform-express": "^10.3.0",
    "@nestjs/platform-socket.io": "^10.3.0",
    "@nestjs/swagger": "^7.3.0",
    "@nestjs/websockets": "^10.3.0",
    "bcrypt": "^5.1.1",
    "class-transformer": "^0.5.1",
    "class-validator": "^0.14.1",
    "database": "workspace:*",
    "passport": "^0.7.0",
    "passport-jwt": "^4.0.1",
    "passport-local": "^1.0.0",
    "reflect-metadata": "^0.2.1",
    "rxjs": "^7.8.1"
  },
  "devDependencies": {
    "@nestjs/cli": "^10.3.0",
    "@nestjs/schematics": "^10.1.0",
    "@nestjs/testing": "^10.3.0",
    "@types/bcrypt": "^5.0.2",
    "@types/express": "^4.17.21",
    "@types/jest": "^29.5.12",
    "@types/node": "^20.11.0",
    "@types/passport-jwt": "^4.0.1",
    "@types/passport-local": "^1.0.38",
    "jest": "^29.7.0",
    "ts-jest": "^29.1.2",
    "typescript": "^5.3.0"
  },
  "jest": {
    "moduleFileExtensions": ["js", "json", "ts"],
    "rootDir": "src",
    "testRegex": ".*\\.spec\\.ts$",
    "transform": {
      "^.+\\.(t|j)s$": "ts-jest"
    },
    "collectCoverageFrom": ["**/*.(t|j)s"],
    "coverageDirectory": "../coverage",
    "testEnvironment": "node"
  }
}
```

**Step 2: Create apps/api/tsconfig.json**

```json
{
  "compilerOptions": {
    "module": "commonjs",
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "target": "ES2022",
    "sourceMap": true,
    "outDir": "./dist",
    "baseUrl": "./",
    "incremental": true,
    "skipLibCheck": true,
    "strictNullChecks": true,
    "noImplicitAny": true,
    "strictBindCallApply": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "esModuleInterop": true
  }
}
```

**Step 3: Create apps/api/nest-cli.json**

```json
{
  "$schema": "https://json.schemastore.org/nest-cli",
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": {
    "deleteOutDir": true
  }
}
```

**Step 4: Create apps/api/src/main.ts**

```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));

  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('Household Manager API')
    .setDescription('API for Haddad family household management')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`API running on http://localhost:${port}`);
}
bootstrap();
```

**Step 5: Create apps/api/src/app.module.ts**

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
})
export class AppModule {}
```

**Step 6: Create apps/api/.env.example**

```
DATABASE_URL=postgresql://user:password@localhost:5432/household
JWT_SECRET=your-super-secret-jwt-key
FRONTEND_URL=http://localhost:3000
PORT=4000
```

**Step 7: Commit**

```bash
git add -A
git commit -m "feat: add NestJS backend scaffolding"
```

---

### Task 1.4: Setup Next.js Frontend

**Files:**
- Create: `apps/web/package.json`
- Create: `apps/web/next.config.ts`
- Create: `apps/web/tsconfig.json`
- Create: `apps/web/tailwind.config.ts`
- Create: `apps/web/postcss.config.js`
- Create: `apps/web/src/app/layout.tsx`
- Create: `apps/web/src/app/page.tsx`
- Create: `apps/web/src/app/globals.css`
- Create: `apps/web/.env.example`

**Step 1: Create apps/web/package.json**

```json
{
  "name": "web",
  "version": "1.0.0",
  "scripts": {
    "dev": "next dev -p 3000",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "^15.1.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "socket.io-client": "^4.7.4",
    "zustand": "^4.5.0",
    "date-fns": "^3.3.1",
    "lucide-react": "^0.330.0"
  },
  "devDependencies": {
    "@types/node": "^20.11.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "autoprefixer": "^10.4.17",
    "postcss": "^8.4.35",
    "tailwindcss": "^3.4.1",
    "typescript": "^5.3.0"
  }
}
```

**Step 2: Create apps/web/next.config.ts**

```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
```

**Step 3: Create apps/web/tsconfig.json**

```json
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

**Step 4: Create apps/web/tailwind.config.ts**

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        warm: {
          50: '#fefdfb',
          100: '#fdf8f0',
          200: '#faecd8',
          300: '#f5dbb8',
          400: '#e9bb7a',
          500: '#d9973b',
          600: '#c27c1e',
          700: '#a1651a',
          800: '#82511b',
          900: '#6b4419',
        },
      },
    },
  },
  plugins: [],
};

export default config;
```

**Step 5: Create apps/web/postcss.config.js**

```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

**Step 6: Create apps/web/src/app/globals.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --background: #fefdfb;
  --foreground: #1a1a1a;
}

body {
  color: var(--foreground);
  background: var(--background);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* Mobile-first touch targets */
button, a, input, select, textarea {
  min-height: 44px;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}
```

**Step 7: Create apps/web/src/app/layout.tsx**

```typescript
import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Household Manager',
  description: 'Haddad Family Household Management',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-warm-50">{children}</body>
    </html>
  );
}
```

**Step 8: Create apps/web/src/app/page.tsx**

```typescript
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold text-primary-700">Household Manager</h1>
      <p className="mt-2 text-gray-600">Welcome to the Haddad Family Home</p>
    </main>
  );
}
```

**Step 9: Create apps/web/.env.example**

```
NEXT_PUBLIC_API_URL=http://localhost:4000
```

**Step 10: Commit**

```bash
git add -A
git commit -m "feat: add Next.js frontend scaffolding"
```

---

### Task 1.5: Install Dependencies and Verify Setup

**Step 1: Install all dependencies**

```bash
pnpm install
```

**Step 2: Create .env files from examples**

```bash
cp packages/database/.env.example packages/database/.env 2>/dev/null || echo "DATABASE_URL=postgresql://postgres:postgres@localhost:5432/household" > packages/database/.env
cp apps/api/.env.example apps/api/.env 2>/dev/null || true
cp apps/web/.env.example apps/web/.env.local 2>/dev/null || echo "NEXT_PUBLIC_API_URL=http://localhost:4000" > apps/web/.env.local
```

**Step 3: Generate Prisma client**

```bash
pnpm db:generate
```

**Step 4: Commit .env.example files and lockfile**

```bash
git add pnpm-lock.yaml
git commit -m "chore: add pnpm lockfile"
```

---

## Phase 2: Backend API (NestJS)

### Task 2.1: Database Module

**Files:**
- Create: `apps/api/src/database/database.module.ts`
- Create: `apps/api/src/database/database.service.ts`

**Step 1: Create apps/api/src/database/database.module.ts**

```typescript
import { Global, Module } from '@nestjs/common';
import { DatabaseService } from './database.service';

@Global()
@Module({
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {}
```

**Step 2: Create apps/api/src/database/database.service.ts**

```typescript
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from 'database';

@Injectable()
export class DatabaseService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
```

**Step 3: Update apps/api/src/app.module.ts**

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
  ],
})
export class AppModule {}
```

**Step 4: Commit**

```bash
git add -A
git commit -m "feat(api): add database module"
```

---

### Task 2.2: Auth Module - DTOs and Types

**Files:**
- Create: `apps/api/src/auth/dto/login.dto.ts`
- Create: `apps/api/src/auth/dto/pin-request.dto.ts`
- Create: `apps/api/src/auth/dto/pin-verify.dto.ts`
- Create: `apps/api/src/auth/dto/pin-set.dto.ts`

**Step 1: Create apps/api/src/auth/dto/login.dto.ts**

```typescript
import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'fred@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  password: string;
}
```

**Step 2: Create apps/api/src/auth/dto/pin-request.dto.ts**

```typescript
import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PinRequestDto {
  @ApiProperty({ example: 'elsy@elsy.com' })
  @IsEmail()
  email: string;
}
```

**Step 3: Create apps/api/src/auth/dto/pin-verify.dto.ts**

```typescript
import { IsString, Length, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PinVerifyDto {
  @ApiPropertyOptional({ description: 'User ID for staff login' })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiPropertyOptional({ description: 'Email for manager login' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty({ example: '1234' })
  @IsString()
  @Length(4, 4)
  pin: string;
}
```

**Step 4: Create apps/api/src/auth/dto/pin-set.dto.ts**

```typescript
import { IsString, Length, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PinSetDto {
  @ApiProperty({ description: 'User ID' })
  @IsUUID()
  userId: string;

  @ApiProperty({ example: '1234' })
  @IsString()
  @Length(4, 4)
  pin: string;
}
```

**Step 5: Commit**

```bash
git add -A
git commit -m "feat(api): add auth DTOs"
```

---

### Task 2.3: Auth Service

**Files:**
- Create: `apps/api/src/auth/auth.service.ts`
- Create: `apps/api/src/auth/auth.service.spec.ts`

**Step 1: Write failing test - apps/api/src/auth/auth.service.spec.ts**

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { DatabaseService } from '../database/database.service';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let databaseService: DatabaseService;
  let jwtService: JwtService;

  const mockUser = {
    id: 'user-1',
    name: 'Fred',
    email: 'fred@example.com',
    password: '$2b$10$hashedpassword',
    role: 'ADMIN',
    pin: null,
    pinSetAt: null,
    language: 'en',
  };

  const mockStaffUser = {
    id: 'user-2',
    name: 'Karen',
    email: null,
    password: null,
    role: 'NANNY',
    pin: '$2b$10$hashedpin',
    pinSetAt: new Date(),
    language: 'en',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: DatabaseService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              findFirst: jest.fn(),
              update: jest.fn(),
            },
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mock-jwt-token'),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('test-secret'),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    databaseService = module.get<DatabaseService>(DatabaseService);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('login', () => {
    it('should return token for valid credentials', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      jest.spyOn(databaseService.user, 'findUnique').mockResolvedValue({
        ...mockUser,
        password: hashedPassword,
      } as any);

      const result = await service.login('fred@example.com', 'password123');

      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('user');
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      jest.spyOn(databaseService.user, 'findUnique').mockResolvedValue(mockUser as any);

      await expect(service.login('fred@example.com', 'wrongpassword')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for non-existent user', async () => {
      jest.spyOn(databaseService.user, 'findUnique').mockResolvedValue(null);

      await expect(service.login('nobody@example.com', 'password')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('verifyPin', () => {
    it('should return token for valid staff PIN', async () => {
      const hashedPin = await bcrypt.hash('1234', 10);
      jest.spyOn(databaseService.user, 'findUnique').mockResolvedValue({
        ...mockStaffUser,
        pin: hashedPin,
      } as any);

      const result = await service.verifyPin({ userId: 'user-2', pin: '1234' });

      expect(result).toHaveProperty('access_token');
    });

    it('should throw UnauthorizedException for invalid PIN', async () => {
      jest.spyOn(databaseService.user, 'findUnique').mockResolvedValue(mockStaffUser as any);

      await expect(service.verifyPin({ userId: 'user-2', pin: '0000' })).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('setPin', () => {
    it('should set PIN for user without existing PIN', async () => {
      jest.spyOn(databaseService.user, 'findUnique').mockResolvedValue({
        ...mockStaffUser,
        pin: null,
        pinSetAt: null,
      } as any);
      jest.spyOn(databaseService.user, 'update').mockResolvedValue({
        ...mockStaffUser,
        pin: '$2b$10$newhashed',
        pinSetAt: new Date(),
      } as any);

      const result = await service.setPin('user-2', '5678');

      expect(result).toHaveProperty('success', true);
      expect(databaseService.user.update).toHaveBeenCalled();
    });

    it('should reset PIN if pinSetAt was yesterday', async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      jest.spyOn(databaseService.user, 'findUnique').mockResolvedValue({
        ...mockStaffUser,
        pinSetAt: yesterday,
      } as any);
      jest.spyOn(databaseService.user, 'update').mockResolvedValue({
        ...mockStaffUser,
        pin: '$2b$10$newhashed',
        pinSetAt: new Date(),
      } as any);

      const result = await service.setPin('user-2', '5678');

      expect(result).toHaveProperty('success', true);
    });
  });
});
```

**Step 2: Run test to verify it fails**

```bash
cd apps/api && pnpm test -- --testPathPattern=auth.service.spec.ts
```

Expected: FAIL (AuthService not found)

**Step 3: Create apps/api/src/auth/auth.service.ts**

```typescript
import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { DatabaseService } from '../database/database.service';
import { PinVerifyDto } from './dto/pin-verify.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly db: DatabaseService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.db.user.findUnique({
      where: { email },
    });

    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateToken(user);
  }

  async requestPin(email: string) {
    const user = await this.db.user.findUnique({
      where: { email },
    });

    if (!user || user.role !== 'MANAGER') {
      throw new BadRequestException('Invalid email');
    }

    // Generate a 6-digit PIN
    const pin = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedPin = await bcrypt.hash(pin, 10);

    await this.db.user.update({
      where: { id: user.id },
      data: {
        pin: hashedPin,
        pinSetAt: new Date(),
      },
    });

    // TODO: Send PIN via email
    console.log(`PIN for ${email}: ${pin}`);

    return { success: true, message: 'PIN sent to email' };
  }

  async verifyPin(dto: PinVerifyDto) {
    let user;

    if (dto.userId) {
      user = await this.db.user.findUnique({
        where: { id: dto.userId },
      });
    } else if (dto.email) {
      user = await this.db.user.findUnique({
        where: { email: dto.email },
      });
    }

    if (!user || !user.pin) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPinValid = await bcrypt.compare(dto.pin, user.pin);
    if (!isPinValid) {
      throw new UnauthorizedException('Invalid PIN');
    }

    return this.generateToken(user);
  }

  async setPin(userId: string, pin: string) {
    const user = await this.db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Check if PIN needs to be reset (new day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (user.pinSetAt) {
      const pinDate = new Date(user.pinSetAt);
      pinDate.setHours(0, 0, 0, 0);

      if (pinDate.getTime() === today.getTime()) {
        throw new BadRequestException('PIN already set for today');
      }
    }

    const hashedPin = await bcrypt.hash(pin, 10);

    await this.db.user.update({
      where: { id: userId },
      data: {
        pin: hashedPin,
        pinSetAt: new Date(),
      },
    });

    return { success: true };
  }

  async getStaffList() {
    return this.db.user.findMany({
      where: {
        role: {
          in: ['DRIVER', 'NANNY', 'MAID'],
        },
      },
      select: {
        id: true,
        name: true,
        role: true,
        language: true,
        pinSetAt: true,
      },
    });
  }

  private generateToken(user: any) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        language: user.language,
        altLanguage: user.altLanguage,
      },
    };
  }
}
```

**Step 4: Run test to verify it passes**

```bash
cd apps/api && pnpm test -- --testPathPattern=auth.service.spec.ts
```

Expected: PASS

**Step 5: Commit**

```bash
git add -A
git commit -m "feat(api): add auth service with tests"
```

---

### Task 2.4: Auth Controller and Module

**Files:**
- Create: `apps/api/src/auth/auth.controller.ts`
- Create: `apps/api/src/auth/auth.module.ts`
- Create: `apps/api/src/auth/jwt.strategy.ts`
- Create: `apps/api/src/auth/guards/jwt-auth.guard.ts`
- Create: `apps/api/src/auth/guards/roles.guard.ts`
- Create: `apps/api/src/auth/decorators/roles.decorator.ts`
- Create: `apps/api/src/auth/decorators/current-user.decorator.ts`

**Step 1: Create apps/api/src/auth/auth.controller.ts**

```typescript
import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { PinRequestDto } from './dto/pin-request.dto';
import { PinVerifyDto } from './dto/pin-verify.dto';
import { PinSetDto } from './dto/pin-set.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Login with email and password (Admin only)' })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }

  @Post('pin-request')
  @ApiOperation({ summary: 'Request PIN to be sent to email (Manager only)' })
  async requestPin(@Body() dto: PinRequestDto) {
    return this.authService.requestPin(dto.email);
  }

  @Post('pin-verify')
  @ApiOperation({ summary: 'Verify PIN for login' })
  async verifyPin(@Body() dto: PinVerifyDto) {
    return this.authService.verifyPin(dto);
  }

  @Post('pin-set')
  @ApiOperation({ summary: 'Set daily PIN for staff' })
  async setPin(@Body() dto: PinSetDto) {
    return this.authService.setPin(dto.userId, dto.pin);
  }

  @Get('staff')
  @ApiOperation({ summary: 'Get list of staff for PIN login selection' })
  async getStaffList() {
    return this.authService.getStaffList();
  }
}
```

**Step 2: Create apps/api/src/auth/jwt.strategy.ts**

```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly db: DatabaseService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET') || 'dev-secret-key',
    });
  }

  async validate(payload: any) {
    const user = await this.db.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      language: user.language,
      altLanguage: user.altLanguage,
    };
  }
}
```

**Step 3: Create apps/api/src/auth/guards/jwt-auth.guard.ts**

```typescript
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
```

**Step 4: Create apps/api/src/auth/guards/roles.guard.ts**

```typescript
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from 'database';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user.role === role);
  }
}
```

**Step 5: Create apps/api/src/auth/decorators/roles.decorator.ts**

```typescript
import { SetMetadata } from '@nestjs/common';
import { Role } from 'database';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
```

**Step 6: Create apps/api/src/auth/decorators/current-user.decorator.ts**

```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
```

**Step 7: Create apps/api/src/auth/auth.module.ts**

```typescript
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET') || 'dev-secret-key',
        signOptions: { expiresIn: '24h' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
```

**Step 8: Update apps/api/src/app.module.ts**

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    AuthModule,
  ],
})
export class AppModule {}
```

**Step 9: Commit**

```bash
git add -A
git commit -m "feat(api): add auth controller, guards, and decorators"
```

---

### Task 2.5: Users Module

**Files:**
- Create: `apps/api/src/users/users.module.ts`
- Create: `apps/api/src/users/users.service.ts`
- Create: `apps/api/src/users/users.controller.ts`
- Create: `apps/api/src/users/dto/update-user.dto.ts`

**Step 1: Create apps/api/src/users/dto/update-user.dto.ts**

```typescript
import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ enum: ['en', 'ur', 'tl', 'sw', 'am'] })
  @IsOptional()
  @IsString()
  language?: string;
}

export class UpdateLanguageDto {
  @ApiPropertyOptional({ enum: ['en', 'ur', 'tl', 'sw', 'am'] })
  @IsString()
  language: string;
}
```

**Step 2: Create apps/api/src/users/users.service.ts**

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly db: DatabaseService) {}

  async findAll() {
    return this.db.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        language: true,
        altLanguage: true,
        createdAt: true,
      },
    });
  }

  async findOne(id: string) {
    const user = await this.db.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        language: true,
        altLanguage: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async update(id: string, dto: UpdateUserDto) {
    const user = await this.db.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.db.user.update({
      where: { id },
      data: dto,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        language: true,
        altLanguage: true,
      },
    });
  }

  async updateLanguage(id: string, language: string) {
    const user = await this.db.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // If user has alt language, toggle between main and alt
    if (user.altLanguage && language === user.altLanguage) {
      return this.db.user.update({
        where: { id },
        data: { language },
        select: {
          id: true,
          name: true,
          language: true,
          altLanguage: true,
        },
      });
    }

    return this.db.user.update({
      where: { id },
      data: { language },
      select: {
        id: true,
        name: true,
        language: true,
        altLanguage: true,
      },
    });
  }
}
```

**Step 3: Create apps/api/src/users/users.controller.ts**

```typescript
import { Controller, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto, UpdateLanguageDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  async findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user' })
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  @Patch(':id/language')
  @ApiOperation({ summary: 'Update user language' })
  async updateLanguage(@Param('id') id: string, @Body() dto: UpdateLanguageDto) {
    return this.usersService.updateLanguage(id, dto.language);
  }
}
```

**Step 4: Create apps/api/src/users/users.module.ts**

```typescript
import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
```

**Step 5: Update apps/api/src/app.module.ts to include UsersModule**

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    AuthModule,
    UsersModule,
  ],
})
export class AppModule {}
```

**Step 6: Commit**

```bash
git add -A
git commit -m "feat(api): add users module"
```

---

### Task 2.6: Tasks Module

**Files:**
- Create: `apps/api/src/tasks/dto/create-task.dto.ts`
- Create: `apps/api/src/tasks/dto/update-task.dto.ts`
- Create: `apps/api/src/tasks/tasks.service.ts`
- Create: `apps/api/src/tasks/tasks.controller.ts`
- Create: `apps/api/src/tasks/tasks.module.ts`

**Step 1: Create apps/api/src/tasks/dto/create-task.dto.ts**

```typescript
import { IsString, IsOptional, IsArray, IsUUID, IsDateString, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTaskDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: ['cleaning', 'cooking', 'laundry', 'kids', 'shopping', 'other'] })
  @IsString()
  category: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiPropertyOptional({ description: 'Cron expression for recurring tasks' })
  @IsOptional()
  @IsString()
  recurring?: string;

  @ApiProperty({ type: [String], description: 'Array of user IDs to assign' })
  @IsArray()
  @IsUUID('4', { each: true })
  assigneeIds: string[];
}
```

**Step 2: Create apps/api/src/tasks/dto/update-task.dto.ts**

```typescript
import { IsString, IsOptional, IsArray, IsUUID, IsDateString, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { TaskStatus } from 'database';

export class UpdateTaskDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: ['cleaning', 'cooking', 'laundry', 'kids', 'shopping', 'other'] })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ enum: TaskStatus })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  recurring?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  assigneeIds?: string[];
}

export class CompleteTaskDto {
  @ApiPropertyOptional({ description: 'URL of photo proof' })
  @IsOptional()
  @IsString()
  photoProof?: string;
}
```

**Step 3: Create apps/api/src/tasks/tasks.service.ts**

```typescript
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto, CompleteTaskDto } from './dto/update-task.dto';
import { TaskStatus } from 'database';

@Injectable()
export class TasksService {
  constructor(private readonly db: DatabaseService) {}

  async findAll(userId?: string, role?: string) {
    const where: any = {};

    // Staff only see their assigned tasks
    if (role && !['ADMIN', 'MANAGER'].includes(role)) {
      where.assignments = {
        some: {
          userId,
        },
      };
    }

    return this.db.task.findMany({
      where,
      include: {
        assignments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                role: true,
              },
            },
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [
        { status: 'asc' },
        { dueDate: 'asc' },
        { createdAt: 'desc' },
      ],
    });
  }

  async findOne(id: string) {
    const task = await this.db.task.findUnique({
      where: { id },
      include: {
        assignments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                role: true,
              },
            },
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }

  async create(dto: CreateTaskDto, createdById: string) {
    const task = await this.db.task.create({
      data: {
        title: dto.title,
        description: dto.description,
        category: dto.category,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        recurring: dto.recurring,
        createdById,
        assignments: {
          create: dto.assigneeIds.map((userId) => ({ userId })),
        },
      },
      include: {
        assignments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                role: true,
              },
            },
          },
        },
      },
    });

    return task;
  }

  async update(id: string, dto: UpdateTaskDto) {
    const task = await this.db.task.findUnique({ where: { id } });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Handle assignee updates separately
    if (dto.assigneeIds) {
      await this.db.taskAssignment.deleteMany({
        where: { taskId: id },
      });

      await this.db.taskAssignment.createMany({
        data: dto.assigneeIds.map((userId) => ({
          taskId: id,
          userId,
        })),
      });
    }

    const { assigneeIds, ...updateData } = dto;

    return this.db.task.update({
      where: { id },
      data: {
        ...updateData,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      },
      include: {
        assignments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                role: true,
              },
            },
          },
        },
      },
    });
  }

  async complete(id: string, dto: CompleteTaskDto, userId: string) {
    const task = await this.db.task.findUnique({
      where: { id },
      include: {
        assignments: true,
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Check if user is assigned to this task
    const isAssigned = task.assignments.some((a) => a.userId === userId);
    if (!isAssigned) {
      throw new ForbiddenException('You are not assigned to this task');
    }

    return this.db.task.update({
      where: { id },
      data: {
        status: TaskStatus.COMPLETED,
        completedAt: new Date(),
        photoProof: dto.photoProof,
      },
      include: {
        assignments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                role: true,
              },
            },
          },
        },
      },
    });
  }

  async delete(id: string) {
    const task = await this.db.task.findUnique({ where: { id } });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    await this.db.task.delete({ where: { id } });

    return { success: true };
  }
}
```

**Step 4: Create apps/api/src/tasks/tasks.controller.ts**

```typescript
import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto, CompleteTaskDto } from './dto/update-task.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('tasks')
@Controller('tasks')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  @ApiOperation({ summary: 'Get all tasks' })
  async findAll(@CurrentUser() user: any) {
    return this.tasksService.findAll(user.id, user.role);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get task by ID' })
  async findOne(@Param('id') id: string) {
    return this.tasksService.findOne(id);
  }

  @Post()
  @Roles('ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'Create a new task' })
  async create(@Body() dto: CreateTaskDto, @CurrentUser() user: any) {
    return this.tasksService.create(dto, user.id);
  }

  @Patch(':id')
  @Roles('ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'Update a task' })
  async update(@Param('id') id: string, @Body() dto: UpdateTaskDto) {
    return this.tasksService.update(id, dto);
  }

  @Post(':id/complete')
  @ApiOperation({ summary: 'Mark task as complete' })
  async complete(
    @Param('id') id: string,
    @Body() dto: CompleteTaskDto,
    @CurrentUser() user: any,
  ) {
    return this.tasksService.complete(id, dto, user.id);
  }

  @Delete(':id')
  @Roles('ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'Delete a task' })
  async delete(@Param('id') id: string) {
    return this.tasksService.delete(id);
  }
}
```

**Step 5: Create apps/api/src/tasks/tasks.module.ts**

```typescript
import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';

@Module({
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}
```

**Step 6: Update apps/api/src/app.module.ts**

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TasksModule } from './tasks/tasks.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    TasksModule,
  ],
})
export class AppModule {}
```

**Step 7: Commit**

```bash
git add -A
git commit -m "feat(api): add tasks module"
```

---

### Task 2.7: Inventory Module

**Files:**
- Create: `apps/api/src/inventory/dto/create-inventory.dto.ts`
- Create: `apps/api/src/inventory/dto/adjust-inventory.dto.ts`
- Create: `apps/api/src/inventory/inventory.service.ts`
- Create: `apps/api/src/inventory/inventory.controller.ts`
- Create: `apps/api/src/inventory/inventory.module.ts`

**Step 1: Create apps/api/src/inventory/dto/create-inventory.dto.ts**

```typescript
import { IsString, IsOptional, IsInt, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateInventoryDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ enum: ['pantry', 'freezer', 'fridge', 'shisha'] })
  @IsString()
  category: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  subCategory?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  quantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  lowThreshold?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  flavor?: string;
}

export class UpdateInventoryDto extends CreateInventoryDto {}
```

**Step 2: Create apps/api/src/inventory/dto/adjust-inventory.dto.ts**

```typescript
import { IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AdjustInventoryDto {
  @ApiProperty({ description: 'Amount to add (positive) or remove (negative)' })
  @IsInt()
  amount: number;
}
```

**Step 3: Create apps/api/src/inventory/inventory.service.ts**

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateInventoryDto, UpdateInventoryDto } from './dto/create-inventory.dto';
import { AdjustInventoryDto } from './dto/adjust-inventory.dto';

@Injectable()
export class InventoryService {
  constructor(private readonly db: DatabaseService) {}

  async findAll(category?: string) {
    const where = category ? { category } : {};

    return this.db.inventoryItem.findMany({
      where,
      orderBy: [
        { category: 'asc' },
        { name: 'asc' },
      ],
    });
  }

  async findOne(id: string) {
    const item = await this.db.inventoryItem.findUnique({
      where: { id },
    });

    if (!item) {
      throw new NotFoundException('Inventory item not found');
    }

    return item;
  }

  async create(dto: CreateInventoryDto) {
    return this.db.inventoryItem.create({
      data: {
        name: dto.name,
        category: dto.category,
        subCategory: dto.subCategory,
        quantity: dto.quantity || 0,
        unit: dto.unit,
        lowThreshold: dto.lowThreshold,
        location: dto.location,
        brand: dto.brand,
        flavor: dto.flavor,
      },
    });
  }

  async update(id: string, dto: UpdateInventoryDto) {
    const item = await this.db.inventoryItem.findUnique({ where: { id } });

    if (!item) {
      throw new NotFoundException('Inventory item not found');
    }

    return this.db.inventoryItem.update({
      where: { id },
      data: dto,
    });
  }

  async adjust(id: string, dto: AdjustInventoryDto) {
    const item = await this.db.inventoryItem.findUnique({ where: { id } });

    if (!item) {
      throw new NotFoundException('Inventory item not found');
    }

    const newQuantity = Math.max(0, item.quantity + dto.amount);

    return this.db.inventoryItem.update({
      where: { id },
      data: { quantity: newQuantity },
    });
  }

  async delete(id: string) {
    const item = await this.db.inventoryItem.findUnique({ where: { id } });

    if (!item) {
      throw new NotFoundException('Inventory item not found');
    }

    await this.db.inventoryItem.delete({ where: { id } });

    return { success: true };
  }

  async getLowStock() {
    return this.db.inventoryItem.findMany({
      where: {
        lowThreshold: {
          not: null,
        },
        quantity: {
          lte: this.db.inventoryItem.fields.lowThreshold,
        },
      },
    });
  }
}
```

**Step 4: Create apps/api/src/inventory/inventory.controller.ts**

```typescript
import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import { CreateInventoryDto, UpdateInventoryDto } from './dto/create-inventory.dto';
import { AdjustInventoryDto } from './dto/adjust-inventory.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('inventory')
@Controller('inventory')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  @ApiOperation({ summary: 'Get all inventory items' })
  @ApiQuery({ name: 'category', required: false })
  async findAll(@Query('category') category?: string) {
    return this.inventoryService.findAll(category);
  }

  @Get('low-stock')
  @ApiOperation({ summary: 'Get low stock items' })
  async getLowStock() {
    return this.inventoryService.getLowStock();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get inventory item by ID' })
  async findOne(@Param('id') id: string) {
    return this.inventoryService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create inventory item' })
  async create(@Body() dto: CreateInventoryDto) {
    return this.inventoryService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update inventory item' })
  async update(@Param('id') id: string, @Body() dto: UpdateInventoryDto) {
    return this.inventoryService.update(id, dto);
  }

  @Post(':id/adjust')
  @ApiOperation({ summary: 'Adjust inventory quantity' })
  async adjust(@Param('id') id: string, @Body() dto: AdjustInventoryDto) {
    return this.inventoryService.adjust(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete inventory item' })
  async delete(@Param('id') id: string) {
    return this.inventoryService.delete(id);
  }
}
```

**Step 5: Create apps/api/src/inventory/inventory.module.ts**

```typescript
import { Module } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';

@Module({
  controllers: [InventoryController],
  providers: [InventoryService],
  exports: [InventoryService],
})
export class InventoryModule {}
```

**Step 6: Update apps/api/src/app.module.ts**

Add `InventoryModule` to imports.

**Step 7: Commit**

```bash
git add -A
git commit -m "feat(api): add inventory module"
```

---

### Task 2.8: Frozen Meals Module

**Files:**
- Create: `apps/api/src/frozen-meals/frozen-meals.module.ts`
- Create: `apps/api/src/frozen-meals/frozen-meals.service.ts`
- Create: `apps/api/src/frozen-meals/frozen-meals.controller.ts`
- Create: `apps/api/src/frozen-meals/dto/create-frozen-meal.dto.ts`

(Similar structure to inventory module)

**Step 1: Create apps/api/src/frozen-meals/dto/create-frozen-meal.dto.ts**

```typescript
import { IsString, IsOptional, IsInt, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFrozenMealDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  quantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateFrozenMealDto extends CreateFrozenMealDto {}
```

**Step 2: Create apps/api/src/frozen-meals/frozen-meals.service.ts**

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateFrozenMealDto, UpdateFrozenMealDto } from './dto/create-frozen-meal.dto';

@Injectable()
export class FrozenMealsService {
  constructor(private readonly db: DatabaseService) {}

  async findAll() {
    return this.db.frozenMeal.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const meal = await this.db.frozenMeal.findUnique({ where: { id } });
    if (!meal) throw new NotFoundException('Frozen meal not found');
    return meal;
  }

  async create(dto: CreateFrozenMealDto) {
    return this.db.frozenMeal.create({
      data: {
        name: dto.name,
        quantity: dto.quantity || 0,
        description: dto.description,
      },
    });
  }

  async update(id: string, dto: UpdateFrozenMealDto) {
    await this.findOne(id);
    return this.db.frozenMeal.update({ where: { id }, data: dto });
  }

  async delete(id: string) {
    await this.findOne(id);
    await this.db.frozenMeal.delete({ where: { id } });
    return { success: true };
  }

  async adjust(id: string, amount: number) {
    const meal = await this.findOne(id);
    const newQuantity = Math.max(0, meal.quantity + amount);
    return this.db.frozenMeal.update({
      where: { id },
      data: { quantity: newQuantity },
    });
  }
}
```

**Step 3: Create apps/api/src/frozen-meals/frozen-meals.controller.ts**

```typescript
import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FrozenMealsService } from './frozen-meals.service';
import { CreateFrozenMealDto, UpdateFrozenMealDto } from './dto/create-frozen-meal.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdjustInventoryDto } from '../inventory/dto/adjust-inventory.dto';

@ApiTags('frozen-meals')
@Controller('frozen-meals')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FrozenMealsController {
  constructor(private readonly service: FrozenMealsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all frozen meals' })
  findAll() { return this.service.findAll(); }

  @Get(':id')
  @ApiOperation({ summary: 'Get frozen meal by ID' })
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Post()
  @ApiOperation({ summary: 'Create frozen meal' })
  create(@Body() dto: CreateFrozenMealDto) { return this.service.create(dto); }

  @Patch(':id')
  @ApiOperation({ summary: 'Update frozen meal' })
  update(@Param('id') id: string, @Body() dto: UpdateFrozenMealDto) {
    return this.service.update(id, dto);
  }

  @Post(':id/adjust')
  @ApiOperation({ summary: 'Adjust frozen meal quantity' })
  adjust(@Param('id') id: string, @Body() dto: AdjustInventoryDto) {
    return this.service.adjust(id, dto.amount);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete frozen meal' })
  delete(@Param('id') id: string) { return this.service.delete(id); }
}
```

**Step 4: Create apps/api/src/frozen-meals/frozen-meals.module.ts**

```typescript
import { Module } from '@nestjs/common';
import { FrozenMealsService } from './frozen-meals.service';
import { FrozenMealsController } from './frozen-meals.controller';

@Module({
  controllers: [FrozenMealsController],
  providers: [FrozenMealsService],
  exports: [FrozenMealsService],
})
export class FrozenMealsModule {}
```

**Step 5: Update app.module.ts and commit**

```bash
git add -A
git commit -m "feat(api): add frozen meals module"
```

---

### Task 2.9: Shopping Lists Module

(Similar pattern - create DTOs, service, controller, module)

**Files:**
- Create: `apps/api/src/shopping/dto/*.ts`
- Create: `apps/api/src/shopping/shopping.service.ts`
- Create: `apps/api/src/shopping/shopping.controller.ts`
- Create: `apps/api/src/shopping/shopping.module.ts`

---

### Task 2.10: Kids Module (Health, Meals, Activities, Schedules)

**Files:**
- Create: `apps/api/src/kids/dto/*.ts`
- Create: `apps/api/src/kids/kids.service.ts`
- Create: `apps/api/src/kids/kids.controller.ts`
- Create: `apps/api/src/kids/kids.module.ts`

---

### Task 2.11: Day Off Module

**Files:**
- Create: `apps/api/src/day-off/dto/*.ts`
- Create: `apps/api/src/day-off/day-off.service.ts`
- Create: `apps/api/src/day-off/day-off.controller.ts`
- Create: `apps/api/src/day-off/day-off.module.ts`

---

### Task 2.12: Fred Schedule Module

**Files:**
- Create: `apps/api/src/fred-schedule/dto/*.ts`
- Create: `apps/api/src/fred-schedule/fred-schedule.service.ts`
- Create: `apps/api/src/fred-schedule/fred-schedule.controller.ts`
- Create: `apps/api/src/fred-schedule/fred-schedule.module.ts`

---

### Task 2.13: WebSocket Gateway

**Files:**
- Create: `apps/api/src/websocket/websocket.gateway.ts`
- Create: `apps/api/src/websocket/websocket.module.ts`

---

### Task 2.14: Database Seed Script

**Files:**
- Create: `packages/database/prisma/seed.ts`

---

## Phase 3: Frontend (Next.js)

### Task 3.1: API Client and Auth Context

**Files:**
- Create: `apps/web/src/lib/api.ts`
- Create: `apps/web/src/lib/socket.ts`
- Create: `apps/web/src/stores/auth.ts`
- Create: `apps/web/src/stores/socket.ts`

---

### Task 3.2: Login Pages

**Files:**
- Create: `apps/web/src/app/login/page.tsx`
- Create: `apps/web/src/app/login/staff/page.tsx`
- Create: `apps/web/src/components/ui/button.tsx`
- Create: `apps/web/src/components/ui/input.tsx`

---

### Task 3.3: Dashboard Layout

**Files:**
- Create: `apps/web/src/app/(dashboard)/layout.tsx`
- Create: `apps/web/src/app/(dashboard)/page.tsx`
- Create: `apps/web/src/components/navigation/bottom-nav.tsx`
- Create: `apps/web/src/components/navigation/header.tsx`

---

### Task 3.4: Tasks Pages

**Files:**
- Create: `apps/web/src/app/(dashboard)/tasks/page.tsx`
- Create: `apps/web/src/app/(dashboard)/tasks/[id]/page.tsx`
- Create: `apps/web/src/app/(dashboard)/tasks/new/page.tsx`
- Create: `apps/web/src/components/tasks/task-card.tsx`
- Create: `apps/web/src/components/tasks/task-form.tsx`

---

### Task 3.5: Inventory Pages

**Files:**
- Create: `apps/web/src/app/(dashboard)/inventory/page.tsx`
- Create: `apps/web/src/components/inventory/inventory-item.tsx`
- Create: `apps/web/src/components/inventory/quantity-adjuster.tsx`

---

### Task 3.6: Kids Hub Pages

**Files:**
- Create: `apps/web/src/app/(dashboard)/kids/page.tsx`
- Create: `apps/web/src/app/(dashboard)/kids/[id]/page.tsx`
- Create: `apps/web/src/components/kids/health-log-form.tsx`
- Create: `apps/web/src/components/kids/meal-log-form.tsx`
- Create: `apps/web/src/components/kids/activity-log-form.tsx`

---

### Task 3.7: Shopping Lists Pages

**Files:**
- Create: `apps/web/src/app/(dashboard)/shopping/page.tsx`
- Create: `apps/web/src/components/shopping/shopping-list.tsx`
- Create: `apps/web/src/components/shopping/shopping-item.tsx`

---

### Task 3.8: Staff Management Pages

**Files:**
- Create: `apps/web/src/app/(dashboard)/staff/page.tsx`
- Create: `apps/web/src/app/(dashboard)/day-off/page.tsx`
- Create: `apps/web/src/components/staff/staff-card.tsx`
- Create: `apps/web/src/components/day-off/day-off-form.tsx`

---

### Task 3.9: Fred Schedule Page

**Files:**
- Create: `apps/web/src/app/(dashboard)/schedule/page.tsx`
- Create: `apps/web/src/components/schedule/week-view.tsx`

---

### Task 3.10: Profile Page with Language Toggle

**Files:**
- Create: `apps/web/src/app/(dashboard)/profile/page.tsx`
- Create: `apps/web/src/components/profile/language-toggle.tsx`

---

### Task 3.11: Translation System

**Files:**
- Create: `apps/web/src/lib/translations.ts`
- Create: `apps/web/src/hooks/useTranslation.ts`

---

## Phase 4: Deployment

### Task 4.1: Railway Backend Setup

**Files:**
- Create: `apps/api/railway.toml`
- Create: `apps/api/Dockerfile`

---

### Task 4.2: Vercel Frontend Setup

**Files:**
- Create: `apps/web/vercel.json`

---

### Task 4.3: Environment Variables

Configure production environment variables for both platforms.

---

### Task 4.4: Domain Configuration

Point household.mycyborg.ai to Vercel deployment.

---

## Phase 5: Testing & Polish

### Task 5.1: End-to-End Testing

Verify all user flows work correctly.

### Task 5.2: Mobile Testing

Test on iPhone and Android devices.

### Task 5.3: Real-time Updates Testing

Verify WebSocket connections work across devices.

---

**Plan complete and saved to `docs/plans/2026-02-01-household-manager.md`. Two execution options:**

**1. Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

**Which approach?**

Given the deadline, I recommend **Subagent-Driven** so we can move fast with parallel execution where possible.
