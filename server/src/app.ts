import express, { type Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { config } from './config/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { logger } from './config/logger.js';
import { authRouter } from './routes/auth.js';
import { dashboardRouter } from './routes/dashboard.js';
import { usersRouter } from './routes/users.js';
import { assetsRouter } from './routes/assets.js';
import { ticketsRouter } from './routes/tickets.js';
import { knowledgeRouter } from './routes/knowledge.js';
import { auditRouter } from './routes/audit.js';
import { notificationsRouter } from './routes/notifications.js';

const app: Express = express();

// Security
app.use(helmet());
app.use(cors({ origin: config.corsOrigin, credentials: true, methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'] }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 500, standardHeaders: true, legacyHeaders: false }));

// Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Logging
app.use(morgan('short', { stream: { write: (msg: string) => logger.info(msg.trim()) } }));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ success: true, data: { status: 'healthy', timestamp: new Date().toISOString() } });
});

// Routes
app.use('/api/auth', authRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/users', usersRouter);
app.use('/api/assets', assetsRouter);
app.use('/api/tickets', ticketsRouter);
app.use('/api/knowledge', knowledgeRouter);
app.use('/api/audit', auditRouter);
app.use('/api/notifications', notificationsRouter);

// Error handling
app.use(errorHandler);

export { app };
