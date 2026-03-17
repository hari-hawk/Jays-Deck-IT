# JAYS DECK — Phase 1 Foundation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build the complete foundation for JAYS DECK — monorepo structure, database schema, authentication system, seed data, frontend shell with design system, login page, and dashboard.

**Architecture:** pnpm monorepo with Express.js + Prisma backend and Next.js 14 App Router frontend. PostgreSQL for data, JWT (access + refresh) for auth, RBAC middleware for authorization. Dark-first luxury design system ("TechJays DNA") with Tailwind + shadcn/ui.

**Tech Stack:** Node.js 20+, TypeScript (strict), Express.js, Prisma, PostgreSQL, Next.js 14, Tailwind CSS, shadcn/ui, Zustand, React Query, Framer Motion, Recharts

---

## Prerequisites

Before starting, install:
- PostgreSQL: `brew install postgresql@16 && brew services start postgresql@16`
- Redis: `brew install redis && brew services start redis`
- Homebrew (if missing): `/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"`

If Homebrew/PostgreSQL cannot be installed, use Docker:
```bash
# Alternative: run Postgres + Redis via Docker
docker run -d --name jays-pg -p 5432:5432 -e POSTGRES_PASSWORD=jaysdeck -e POSTGRES_DB=jaysdeck postgres:16
docker run -d --name jays-redis -p 6379:6379 redis:7
```

---

## Task 1: Initialize Monorepo Structure

**Files:**
- Create: `pnpm-workspace.yaml`
- Create: `package.json` (root)
- Create: `server/package.json`
- Create: `client/package.json`
- Create: `.gitignore`
- Create: `.env.example`
- Create: `server/.env`

**Step 1: Initialize root package.json and workspace**

```bash
cd jays-deck
pnpm init
```

Edit `package.json`:
```json
{
  "name": "jays-deck",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "pnpm --parallel -r dev",
    "dev:server": "pnpm --filter server dev",
    "dev:client": "pnpm --filter client dev",
    "build": "pnpm --filter server build && pnpm --filter client build",
    "lint": "pnpm -r lint",
    "db:migrate": "pnpm --filter server db:migrate",
    "db:seed": "pnpm --filter server db:seed",
    "db:studio": "pnpm --filter server db:studio"
  }
}
```

Create `pnpm-workspace.yaml`:
```yaml
packages:
  - "server"
  - "client"
```

**Step 2: Initialize server package**

```bash
mkdir -p server/src/{config,middleware,routes,controllers,services,utils,types}
mkdir -p server/prisma
```

Create `server/package.json`:
```json
{
  "name": "server",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "lint": "eslint src/",
    "db:migrate": "prisma migrate dev",
    "db:seed": "tsx prisma/seed.ts",
    "db:studio": "prisma studio",
    "db:generate": "prisma generate"
  }
}
```

**Step 3: Initialize client package**

```bash
pnpm create next-app client --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --no-turbopack
```

**Step 4: Create .gitignore**

```
node_modules/
dist/
.next/
.env
.env.local
*.log
.DS_Store
uploads/
coverage/
```

**Step 5: Create .env.example**

```env
# Database
DATABASE_URL=postgresql://postgres:jaysdeck@localhost:5432/jaysdeck

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_REFRESH_SECRET=your-refresh-secret-change-this
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Server
PORT=4000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000

# Redis
REDIS_URL=redis://localhost:6379

# Email (optional for Phase 1)
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
SMTP_FROM=noreply@techjays.com
```

Copy to `server/.env` with real values for local dev.

**Step 6: Commit**

```bash
git add -A
git commit -m "chore: initialize monorepo structure with pnpm workspace"
```

---

## Task 2: Set Up TypeScript, ESLint, Prettier

**Files:**
- Create: `server/tsconfig.json`
- Create: `.prettierrc`
- Create: `server/.eslintrc.json`

**Step 1: Install server dependencies**

```bash
cd server
pnpm add express cors helmet morgan cookie-parser dotenv
pnpm add express-validator express-rate-limit
pnpm add @prisma/client
pnpm add jsonwebtoken bcryptjs uuid
pnpm add winston date-fns
pnpm add -D typescript tsx @types/node @types/express @types/cors @types/morgan @types/cookie-parser @types/jsonwebtoken @types/bcryptjs @types/uuid
pnpm add -D prisma eslint prettier @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

**Step 2: Create server/tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "paths": {
      "@/*": ["./src/*"]
    },
    "baseUrl": "."
  },
  "include": ["src/**/*", "prisma/seed.ts"],
  "exclude": ["node_modules", "dist"]
}
```

**Step 3: Create root .prettierrc**

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "printWidth": 100,
  "tabWidth": 2
}
```

**Step 4: Commit**

```bash
git add -A
git commit -m "chore: configure TypeScript, ESLint, Prettier for server"
```

---

## Task 3: Prisma Schema & Database

**Files:**
- Create: `server/prisma/schema.prisma`

**Step 1: Create the complete Prisma schema**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─── ENUMS ──────────────────────────────────────────

enum Role {
  SUPER_ADMIN
  IT_ADMIN
  MANAGER
  EMPLOYEE
}

enum UserStatus {
  ACTIVE
  INACTIVE
  ON_LEAVE
  OFFBOARDED
}

enum Location {
  USA
  INDIA
  UAE
  UK
  CANADA
  AUSTRALIA
  BANGLADESH
}

enum AssetCategory {
  LAPTOP
  DESKTOP
  MONITOR
  KEYBOARD
  MOUSE
  HEADSET
  PHONE
  TABLET
  SERVER
  NETWORKING
  PRINTER
  SOFTWARE_LICENSE
  OTHER
}

enum AssetStatus {
  AVAILABLE
  ASSIGNED
  IN_MAINTENANCE
  RETIRED
  LOST
  DISPOSED
}

enum AssetCondition {
  NEW
  GOOD
  FAIR
  POOR
}

enum AccessLevel {
  READ
  WRITE
  ADMIN
  FULL
}

enum AccessStatus {
  ACTIVE
  REVOKED
  PENDING_REVIEW
  EXPIRED
}

enum AccessRequestStatus {
  PENDING
  APPROVED
  DENIED
  REVOKED
}

enum TicketCategory {
  HARDWARE
  SOFTWARE
  NETWORK
  ACCESS_REQUEST
  SECURITY
  GENERAL_IT
  FACILITIES
  OTHER
}

enum TicketPriority {
  URGENT
  HIGH
  MEDIUM
  LOW
}

enum TicketStatus {
  OPEN
  ASSIGNED
  IN_PROGRESS
  ON_HOLD
  RESOLVED
  CLOSED
  ESCALATED
}

enum AuditAction {
  CREATE
  UPDATE
  DELETE
  ASSIGN
  UNASSIGN
  APPROVE
  DENY
  LOGIN
  LOGOUT
  EXPORT
}

enum NotificationType {
  TICKET_UPDATE
  ASSET_ASSIGNED
  ACCESS_GRANTED
  SLA_WARNING
  SYSTEM
}

// ─── MODELS ──────────────────────────────────────────

model User {
  id           String     @id @default(uuid())
  email        String     @unique
  passwordHash String
  firstName    String
  lastName     String
  avatarUrl    String?
  role         Role       @default(EMPLOYEE)
  department   String?
  designation  String?
  employeeId   String     @unique
  phone        String?
  location     Location   @default(USA)
  dateOfJoining DateTime?
  status       UserStatus @default(ACTIVE)

  managerId String?
  manager   User?   @relation("ManagerSubordinates", fields: [managerId], references: [id])
  subordinates User[] @relation("ManagerSubordinates")

  // Relations
  assignedAssets      Asset[]           @relation("AssetAssignee")
  assetAssignments    AssetAssignment[] @relation("AssignmentUser")
  assignedByMe        AssetAssignment[] @relation("AssignmentAssigner")
  accessRecords       AccessRecord[]    @relation("AccessUser")
  accessGrantedByMe   AccessRecord[]    @relation("AccessGranter")
  accessRequests      AccessRequest[]   @relation("AccessRequester")
  accessApprovals     AccessRequest[]   @relation("AccessApprover")
  reportedTickets     Ticket[]          @relation("TicketReporter")
  assignedTickets     Ticket[]          @relation("TicketAssignee")
  ticketComments      TicketComment[]
  ticketAttachments   TicketAttachment[]
  knowledgeArticles   KnowledgeArticle[]
  notifications       Notification[]
  auditLogs           AuditLog[]

  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  deletedAt DateTime?

  @@index([email])
  @@index([employeeId])
  @@index([department])
  @@index([location])
  @@index([status])
}

model Asset {
  id           String         @id @default(uuid())
  assetTag     String         @unique
  name         String
  category     AssetCategory
  brand        String?
  model        String?
  serialNumber String?
  status       AssetStatus    @default(AVAILABLE)
  condition    AssetCondition @default(NEW)

  purchaseDate   DateTime?
  purchasePrice  Decimal?    @db.Decimal(10, 2)
  vendor         String?
  warrantyExpiry DateTime?
  specifications Json?
  notes          String?
  qrCodeUrl      String?

  currentAssigneeId String?
  currentAssignee   User?   @relation("AssetAssignee", fields: [currentAssigneeId], references: [id])

  // Relations
  assignments    AssetAssignment[]
  linkedTickets  Ticket[]

  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  deletedAt DateTime?

  @@index([status])
  @@index([currentAssigneeId])
  @@index([category, status])
  @@index([assetTag])
}

model AssetAssignment {
  id      String @id @default(uuid())
  assetId String
  asset   Asset  @relation(fields: [assetId], references: [id])
  userId  String
  user    User   @relation("AssignmentUser", fields: [userId], references: [id])

  assignedAt          DateTime @default(now())
  returnedAt          DateTime?
  assignedById        String
  assignedBy          User     @relation("AssignmentAssigner", fields: [assignedById], references: [id])
  notes               String?
  conditionAtAssign   AssetCondition?
  conditionAtReturn   AssetCondition?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([assetId])
  @@index([userId])
}

model AccessRecord {
  id          String       @id @default(uuid())
  userId      String
  user        User         @relation("AccessUser", fields: [userId], references: [id])
  systemName  String
  accessLevel AccessLevel
  grantedAt   DateTime     @default(now())
  revokedAt   DateTime?
  grantedById String
  grantedBy   User         @relation("AccessGranter", fields: [grantedById], references: [id])
  reviewDate  DateTime?
  status      AccessStatus @default(ACTIVE)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userId, status])
  @@index([systemName])
}

model AccessRequest {
  id                   String              @id @default(uuid())
  requesterId          String
  requester            User                @relation("AccessRequester", fields: [requesterId], references: [id])
  approverId           String?
  approver             User?               @relation("AccessApprover", fields: [approverId], references: [id])
  systemName           String
  requestedAccessLevel AccessLevel
  justification        String
  status               AccessRequestStatus @default(PENDING)
  approvedAt           DateTime?
  deniedAt             DateTime?
  denialReason         String?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([requesterId])
  @@index([status])
}

model Ticket {
  id           String         @id @default(uuid())
  ticketNumber String         @unique
  title        String
  description  String
  category     TicketCategory
  priority     TicketPriority @default(MEDIUM)
  status       TicketStatus   @default(OPEN)

  reporterId     String
  reporter       User    @relation("TicketReporter", fields: [reporterId], references: [id])
  assigneeId     String?
  assignee       User?   @relation("TicketAssignee", fields: [assigneeId], references: [id])
  relatedAssetId String?
  relatedAsset   Asset?  @relation(fields: [relatedAssetId], references: [id])

  slaDeadline        DateTime?
  resolvedAt         DateTime?
  closedAt           DateTime?
  satisfactionRating Int?
  satisfactionComment String?

  // Relations
  comments    TicketComment[]
  attachments TicketAttachment[]

  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  deletedAt DateTime?

  @@index([status])
  @@index([assigneeId])
  @@index([reporterId])
  @@index([priority, status])
  @@index([ticketNumber])
}

model TicketComment {
  id         String  @id @default(uuid())
  ticketId   String
  ticket     Ticket  @relation(fields: [ticketId], references: [id])
  authorId   String
  author     User    @relation(fields: [authorId], references: [id])
  content    String
  isInternal Boolean @default(false)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([ticketId])
}

model TicketAttachment {
  id         String @id @default(uuid())
  ticketId   String
  ticket     Ticket @relation(fields: [ticketId], references: [id])
  uploadedById String
  uploadedBy User   @relation(fields: [uploadedById], references: [id])
  fileName   String
  fileUrl    String
  fileSize   Int
  mimeType   String

  createdAt DateTime @default(now())

  @@index([ticketId])
}

model KnowledgeArticle {
  id          String   @id @default(uuid())
  title       String
  content     String
  category    String?
  tags        String[] @default([])
  authorId    String
  author      User     @relation(fields: [authorId], references: [id])
  isPublished Boolean  @default(false)
  viewCount   Int      @default(0)

  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  deletedAt DateTime?

  @@index([isPublished])
  @@index([category])
}

model AuditLog {
  id         String      @id @default(uuid())
  userId     String?
  user       User?       @relation(fields: [userId], references: [id])
  action     AuditAction
  entityType String
  entityId   String
  changes    Json?
  ipAddress  String?
  userAgent  String?

  createdAt DateTime @default(now())

  @@index([entityType, entityId])
  @@index([userId, createdAt])
  @@index([createdAt])
}

model Notification {
  id      String           @id @default(uuid())
  userId  String
  user    User             @relation(fields: [userId], references: [id])
  title   String
  message String
  type    NotificationType
  isRead  Boolean          @default(false)
  readAt  DateTime?
  link    String?

  createdAt DateTime @default(now())

  @@index([userId, isRead])
}

model Setting {
  id          String @id @default(uuid())
  key         String @unique
  value       Json
  description String?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([key])
}
```

**Step 2: Create database and run migration**

```bash
createdb jaysdeck  # or via Docker
cd server
pnpm db:generate
pnpm db:migrate --name init
```

**Step 3: Commit**

```bash
git add -A
git commit -m "feat: add complete Prisma schema with all models and enums"
```

---

## Task 4: Server Foundation (Express App + Config + Middleware)

**Files:**
- Create: `server/src/config/index.ts`
- Create: `server/src/config/logger.ts`
- Create: `server/src/config/prisma.ts`
- Create: `server/src/middleware/auth.ts`
- Create: `server/src/middleware/rbac.ts`
- Create: `server/src/middleware/audit.ts`
- Create: `server/src/middleware/errorHandler.ts`
- Create: `server/src/middleware/validate.ts`
- Create: `server/src/utils/apiResponse.ts`
- Create: `server/src/utils/jwt.ts`
- Create: `server/src/utils/pagination.ts`
- Create: `server/src/app.ts`
- Create: `server/src/index.ts`

**Step 1: Create config/index.ts**

Environment config loader with validation — ensures all required env vars are present at startup.

```typescript
import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '4000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  database: {
    url: process.env.DATABASE_URL!,
  },
  jwt: {
    secret: process.env.JWT_SECRET!,
    refreshSecret: process.env.JWT_REFRESH_SECRET!,
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },
} as const;

// Validate required config at startup
const required = ['DATABASE_URL', 'JWT_SECRET', 'JWT_REFRESH_SECRET'];
for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}
```

**Step 2: Create config/prisma.ts**

```typescript
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});
```

**Step 3: Create config/logger.ts**

```typescript
import winston from 'winston';
import { config } from './index.js';

export const logger = winston.createLogger({
  level: config.nodeEnv === 'development' ? 'debug' : 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: config.nodeEnv === 'development'
        ? winston.format.combine(winston.format.colorize(), winston.format.simple())
        : winston.format.json(),
    }),
  ],
});
```

**Step 4: Create utils/apiResponse.ts**

Standardized API response format used by ALL endpoints.

```typescript
import { Response } from 'express';

interface SuccessResponse<T> {
  success: true;
  data: T;
  meta?: { page: number; limit: number; total: number; totalPages: number };
}

interface ErrorResponse {
  success: false;
  error: { code: string; message: string; details?: unknown };
}

export function sendSuccess<T>(res: Response, data: T, statusCode = 200, meta?: SuccessResponse<T>['meta']) {
  const response: SuccessResponse<T> = { success: true, data };
  if (meta) response.meta = meta;
  return res.status(statusCode).json(response);
}

export function sendError(res: Response, statusCode: number, code: string, message: string, details?: unknown) {
  const response: ErrorResponse = { success: false, error: { code, message } };
  if (details) response.error.details = details;
  return res.status(statusCode).json(response);
}
```

**Step 5: Create utils/jwt.ts**

```typescript
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';

interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.expiresIn });
}

export function generateRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, config.jwt.refreshSecret, { expiresIn: config.jwt.refreshExpiresIn });
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, config.jwt.secret) as TokenPayload;
}

export function verifyRefreshToken(token: string): TokenPayload {
  return jwt.verify(token, config.jwt.refreshSecret) as TokenPayload;
}
```

**Step 6: Create middleware/auth.ts**

```typescript
import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt.js';
import { sendError } from '../utils/apiResponse.js';

export interface AuthRequest extends Request {
  user?: { userId: string; email: string; role: string };
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return sendError(res, 401, 'UNAUTHORIZED', 'Missing or invalid authorization header');
  }

  try {
    const token = authHeader.split(' ')[1];
    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch {
    return sendError(res, 401, 'TOKEN_EXPIRED', 'Access token is invalid or expired');
  }
}
```

**Step 7: Create middleware/rbac.ts**

```typescript
import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.js';
import { sendError } from '../utils/apiResponse.js';

type Role = 'SUPER_ADMIN' | 'IT_ADMIN' | 'MANAGER' | 'EMPLOYEE';

const ROLE_HIERARCHY: Record<Role, number> = {
  SUPER_ADMIN: 4,
  IT_ADMIN: 3,
  MANAGER: 2,
  EMPLOYEE: 1,
};

export function requireRole(...allowedRoles: Role[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendError(res, 401, 'UNAUTHORIZED', 'Authentication required');
    }
    const userRole = req.user.role as Role;
    if (!allowedRoles.includes(userRole)) {
      return sendError(res, 403, 'FORBIDDEN', 'Insufficient permissions');
    }
    next();
  };
}

export function requireMinRole(minRole: Role) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendError(res, 401, 'UNAUTHORIZED', 'Authentication required');
    }
    const userLevel = ROLE_HIERARCHY[req.user.role as Role] || 0;
    const requiredLevel = ROLE_HIERARCHY[minRole];
    if (userLevel < requiredLevel) {
      return sendError(res, 403, 'FORBIDDEN', 'Insufficient permissions');
    }
    next();
  };
}
```

**Step 8: Create middleware/audit.ts**

```typescript
import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.js';
import { prisma } from '../config/prisma.js';
import { AuditAction } from '@prisma/client';
import { logger } from '../config/logger.js';

export function auditLog(action: AuditAction, entityType: string) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    // Store original json method to intercept response
    const originalJson = res.json.bind(res);

    res.json = function (body: any) {
      // Only log successful mutations
      if (res.statusCode >= 200 && res.statusCode < 300 && body?.success) {
        const entityId = req.params.id || body?.data?.id || 'unknown';
        prisma.auditLog
          .create({
            data: {
              userId: req.user?.userId,
              action,
              entityType,
              entityId,
              changes: body.data ? JSON.parse(JSON.stringify(body.data)) : undefined,
              ipAddress: req.ip || req.socket.remoteAddress,
              userAgent: req.headers['user-agent'],
            },
          })
          .catch((err) => logger.error('Audit log failed', { error: err }));
      }
      return originalJson(body);
    };
    next();
  };
}
```

**Step 9: Create middleware/errorHandler.ts**

```typescript
import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger.js';
import { sendError } from '../utils/apiResponse.js';

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction) {
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  if (err.name === 'ValidationError') {
    return sendError(res, 422, 'VALIDATION_ERROR', err.message);
  }

  if (err.name === 'PrismaClientKnownRequestError') {
    return sendError(res, 409, 'DATABASE_ERROR', 'A database constraint was violated');
  }

  return sendError(res, 500, 'INTERNAL_ERROR', 'An unexpected error occurred');
}
```

**Step 10: Create utils/pagination.ts**

```typescript
export interface PaginationParams {
  page: number;
  limit: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export function parsePagination(query: Record<string, any>): PaginationParams {
  return {
    page: Math.max(1, parseInt(query.page as string) || 1),
    limit: Math.min(100, Math.max(1, parseInt(query.limit as string) || 25)),
    sort: query.sort as string || 'createdAt',
    order: (query.order as string) === 'asc' ? 'asc' : 'desc',
  };
}

export function paginationMeta(page: number, limit: number, total: number) {
  return { page, limit, total, totalPages: Math.ceil(total / limit) };
}
```

**Step 11: Create app.ts**

```typescript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { config } from './config/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { logger } from './config/logger.js';
// Routes will be imported here as they're built
import { authRouter } from './routes/auth.js';

const app = express();

// Security
app.use(helmet());
app.use(cors({ origin: config.corsOrigin, credentials: true }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100, standardHeaders: true }));

// Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Logging
app.use(morgan('short', { stream: { write: (msg) => logger.info(msg.trim()) } }));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ success: true, data: { status: 'healthy', timestamp: new Date().toISOString() } });
});

// Routes
app.use('/api/auth', authRouter);

// Error handling
app.use(errorHandler);

export { app };
```

**Step 12: Create index.ts (entry point)**

```typescript
import { app } from './app.js';
import { config } from './config/index.js';
import { logger } from './config/logger.js';
import { prisma } from './config/prisma.js';

async function main() {
  // Test database connection
  await prisma.$connect();
  logger.info('Database connected');

  app.listen(config.port, () => {
    logger.info(`JAYS DECK server running on port ${config.port}`);
    logger.info(`Environment: ${config.nodeEnv}`);
  });
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down...');
  await prisma.$disconnect();
  process.exit(0);
});

main().catch((err) => {
  logger.error('Failed to start server', { error: err });
  process.exit(1);
});
```

**Step 13: Commit**

```bash
git add -A
git commit -m "feat: add Express server foundation with auth middleware, RBAC, audit logging"
```

---

## Task 5: Authentication Routes & Controller

**Files:**
- Create: `server/src/routes/auth.ts`
- Create: `server/src/controllers/auth.controller.ts`
- Create: `server/src/services/auth.service.ts`

**Step 1: Create services/auth.service.ts**

```typescript
import bcrypt from 'bcryptjs';
import { prisma } from '../config/prisma.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.js';

export class AuthService {
  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.deletedAt) {
      throw new Error('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }

    if (user.status !== 'ACTIVE') {
      throw new Error('Account is inactive');
    }

    const tokenPayload = { userId: user.id, email: user.email, role: user.role };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        avatarUrl: user.avatarUrl,
      },
    };
  }

  async refresh(refreshToken: string) {
    const payload = verifyRefreshToken(refreshToken);
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user || user.deletedAt || user.status !== 'ACTIVE') {
      throw new Error('Invalid refresh token');
    }

    const tokenPayload = { userId: user.id, email: user.email, role: user.role };
    const newAccessToken = generateAccessToken(tokenPayload);
    const newRefreshToken = generateRefreshToken(tokenPayload);

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, email: true, firstName: true, lastName: true,
        avatarUrl: true, role: true, department: true, designation: true,
        employeeId: true, phone: true, location: true, dateOfJoining: true, status: true,
      },
    });
    if (!user) throw new Error('User not found');
    return user;
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) throw new Error('Current password is incorrect');

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
  }
}

export const authService = new AuthService();
```

**Step 2: Create controllers/auth.controller.ts**

```typescript
import { Request, Response } from 'express';
import { authService } from '../services/auth.service.js';
import { AuthRequest } from '../middleware/auth.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);

    // Set refresh token as httpOnly cookie
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return sendSuccess(res, { accessToken: result.accessToken, user: result.user });
  } catch (err: any) {
    return sendError(res, 401, 'AUTH_FAILED', err.message);
  }
}

export async function refresh(req: Request, res: Response) {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return sendError(res, 401, 'NO_TOKEN', 'No refresh token provided');

    const result = await authService.refresh(refreshToken);

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return sendSuccess(res, { accessToken: result.accessToken });
  } catch (err: any) {
    return sendError(res, 401, 'REFRESH_FAILED', err.message);
  }
}

export async function logout(_req: Request, res: Response) {
  res.clearCookie('refreshToken');
  return sendSuccess(res, { message: 'Logged out successfully' });
}

export async function me(req: AuthRequest, res: Response) {
  try {
    if (!req.user) return sendError(res, 401, 'UNAUTHORIZED', 'Not authenticated');
    const profile = await authService.getProfile(req.user.userId);
    return sendSuccess(res, profile);
  } catch (err: any) {
    return sendError(res, 404, 'NOT_FOUND', err.message);
  }
}

export async function changePassword(req: AuthRequest, res: Response) {
  try {
    if (!req.user) return sendError(res, 401, 'UNAUTHORIZED', 'Not authenticated');
    const { currentPassword, newPassword } = req.body;
    await authService.changePassword(req.user.userId, currentPassword, newPassword);
    return sendSuccess(res, { message: 'Password changed successfully' });
  } catch (err: any) {
    return sendError(res, 400, 'PASSWORD_CHANGE_FAILED', err.message);
  }
}
```

**Step 3: Create routes/auth.ts**

```typescript
import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate } from '../middleware/auth.js';
import * as authController from '../controllers/auth.controller.js';

export const authRouter = Router();

authRouter.post(
  '/login',
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  authController.login
);

authRouter.post('/refresh', authController.refresh);
authRouter.post('/logout', authController.logout);
authRouter.get('/me', authenticate, authController.me);

authRouter.put(
  '/change-password',
  authenticate,
  body('currentPassword').isLength({ min: 8 }),
  body('newPassword').isLength({ min: 8 }),
  authController.changePassword
);
```

**Step 4: Verify server starts**

```bash
cd server
pnpm dev
# Expected: "JAYS DECK server running on port 4000"
# Test: curl http://localhost:4000/api/health
```

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: add authentication system with JWT, login, refresh, RBAC"
```

---

## Task 6: Seed Script

**Files:**
- Create: `server/prisma/seed.ts`

**Step 1: Create comprehensive seed script**

This is a large file. The seed creates:
- 100 users (5 IT Admins, 10 Managers, 85 Employees) with bcrypt-hashed passwords
- 120 assets with realistic device names
- 80 assignments + 30 tickets + 20 access records + 10 knowledge articles
- Audit log entries

Password for all seed users: `JaysDeck2024!`

(Full seed script implementation — too long to include inline, but covers all entities from the spec with realistic TechJays-themed data across 7 countries.)

**Step 2: Run seed**

```bash
pnpm db:seed
```

**Step 3: Commit**

```bash
git add -A
git commit -m "feat: add seed script with 100 users, 120 assets, 30 tickets, sample data"
```

---

## Task 7: Next.js Setup with TechJays Design System

**Files:**
- Modify: `client/tailwind.config.ts`
- Create: `client/src/styles/globals.css` (design tokens)
- Modify: `client/src/app/layout.tsx`
- Create: `client/src/lib/fonts.ts`

**Step 1: Install client dependencies**

```bash
cd client
pnpm add zustand @tanstack/react-query axios date-fns framer-motion recharts lucide-react sonner
pnpm add @hookform/resolvers zod react-hook-form
pnpm add -D @types/node
npx shadcn@latest init
```

**Step 2: Configure Tailwind with JAYS DECK design tokens**

Extend `tailwind.config.ts` with all color, typography, spacing, and animation tokens from the design spec. Add JetBrains Mono for monospace, Inter for body/headings.

**Step 3: Set up global CSS with design tokens as CSS custom properties**

All tokens from the spec (--bg-primary, --text-primary, --accent-primary, etc.) as CSS variables.

**Step 4: Configure layout.tsx with Inter + JetBrains Mono fonts**

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: configure Next.js with TechJays DNA design system tokens"
```

---

## Task 8: App Shell (Sidebar + Layout)

**Files:**
- Create: `client/src/components/layout/Sidebar.tsx`
- Create: `client/src/components/layout/AppShell.tsx`
- Create: `client/src/components/layout/Header.tsx`
- Create: `client/src/stores/sidebar.ts`

The sidebar follows the spec: 280px width, collapsible to 72px, dark canvas, section-numbered nav items [01]–[06], TechJays logo at top, user avatar at bottom.

**Step 1: Create Zustand store for sidebar state**

**Step 2: Create Sidebar component with nav items**

Nav items:
- [00] COMMAND BRIDGE → /
- [01] ASSET VAULT → /assets
- [02] PEOPLE LINK → /employees
- [03] ACCESS GATE → /access
- [04] SERVICE HUB → /tickets
- [05] KNOW HUB → /knowledge
- [06] AUDIT TRAIL → /audit

**Step 3: Create AppShell layout wrapper**

**Step 4: Create Header with breadcrumbs, search, notifications bell**

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: add app shell with collapsible sidebar, header, TechJays branding"
```

---

## Task 9: Login Page

**Files:**
- Create: `client/src/app/login/page.tsx`
- Create: `client/src/lib/api.ts` (API client)
- Create: `client/src/stores/auth.ts` (auth store)

Full-screen dark login with centered glass card, TechJays logo, JAYS DECK wordmark, email + password fields, loading state on button.

**Step 1: Create API client with Axios + interceptors for token refresh**

**Step 2: Create auth Zustand store**

**Step 3: Create login page component**

**Step 4: Test login flow against backend**

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: add login page with auth flow, API client, token management"
```

---

## Task 10: Dashboard Page (Command Bridge)

**Files:**
- Create: `client/src/app/(dashboard)/page.tsx`
- Create: `client/src/components/dashboard/MetricCard.tsx`
- Create: `client/src/components/dashboard/TicketTrendChart.tsx`
- Create: `client/src/components/dashboard/AssetDistribution.tsx`
- Create: `client/src/components/dashboard/RecentActivity.tsx`
- Create: `client/src/components/dashboard/SLARiskBoard.tsx`

Dashboard with:
- Welcome message with time-of-day greeting
- 4 metric cards (monospaced numbers, trend indicators)
- Quick action buttons
- Charts (Recharts): ticket trend line, asset donut, tickets by status bar
- Recent activity feed
- SLA risk board

**Step 1: Create backend dashboard endpoints**

`server/src/routes/dashboard.ts`, `server/src/controllers/dashboard.controller.ts`, `server/src/services/dashboard.service.ts`

```
GET /api/dashboard/stats
GET /api/dashboard/tickets/trends
GET /api/dashboard/assets/overview
```

**Step 2: Create MetricCard component with glassmorphism + hover lift**

**Step 3: Create chart components with dark theme**

**Step 4: Compose dashboard page**

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: add Command Bridge dashboard with metrics, charts, activity feed"
```

---

## Task 11: Docker Compose Configuration

**Files:**
- Create: `docker-compose.yml`
- Create: `server/Dockerfile`
- Create: `client/Dockerfile`

```yaml
services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_DB: jaysdeck
      POSTGRES_PASSWORD: jaysdeck
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  server:
    build: ./server
    ports:
      - "4000:4000"
    env_file: ./server/.env
    depends_on:
      - postgres
      - redis

  client:
    build: ./client
    ports:
      - "3000:3000"
    depends_on:
      - server

volumes:
  pgdata:
```

**Step 1: Create Dockerfiles**

**Step 2: Test docker-compose up**

**Step 3: Commit**

```bash
git add -A
git commit -m "feat: add Docker Compose config for local development"
```

---

## Execution Order Summary

| Task | What | Est. Time |
|------|------|-----------|
| 1 | Monorepo init | 5 min |
| 2 | TS/ESLint/Prettier | 5 min |
| 3 | Prisma schema + migration | 10 min |
| 4 | Server foundation (Express + middleware) | 15 min |
| 5 | Auth routes + controller + service | 10 min |
| 6 | Seed script | 15 min |
| 7 | Next.js + design system | 10 min |
| 8 | App shell (sidebar + layout) | 15 min |
| 9 | Login page | 10 min |
| 10 | Dashboard page | 20 min |
| 11 | Docker Compose | 5 min |

**Total estimated: ~2 hours**

---

## Notes for Executor

- pnpm must be on PATH: `export PNPM_HOME="/Users/harivershan/Library/pnpm" && export PATH="$PNPM_HOME:$PATH"`
- PostgreSQL must be running before Task 3
- All passwords in seed: `JaysDeck2024!`
- Frontend runs on :3000, backend on :4000
- Test each task's server startup before moving on
