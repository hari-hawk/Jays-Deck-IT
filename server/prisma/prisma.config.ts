import path from 'node:path';
import { defineConfig } from 'prisma/config';
import dotenv from 'dotenv';

dotenv.config({ path: path.join(import.meta.dirname, '../.env') });

export default defineConfig({
  earlyAccess: true,
  schema: path.join(import.meta.dirname, 'schema.prisma'),
  migrations: {
    path: path.join(import.meta.dirname, 'migrations'),
  },
  datasource: {
    url: process.env.DATABASE_URL!,
  },
});
