import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const connectionString = process.env.DATABASE_URL!;

// For Neon (production on Vercel) vs local PostgreSQL:
// Both work fine with @prisma/adapter-pg — the PrismaPg adapter connects over
// standard PostgreSQL protocol which Neon supports. The @prisma/adapter-neon
// adapter is only required when you need Neon's HTTP/WebSocket serverless driver
// (e.g. edge runtime). Since Vercel serverless functions run on Node.js (not edge),
// @prisma/adapter-pg works with both local PostgreSQL and Neon.

const adapter = new PrismaPg({ connectionString });

export const prisma = new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});
