import { app } from './app.js';
import { config } from './config/index.js';
import { logger } from './config/logger.js';
import { prisma } from './config/prisma.js';

async function main() {
  try {
    await prisma.$connect();
    logger.info('Database connected');
  } catch (err) {
    logger.warn('Database not available — server starting without DB connection', { error: err });
  }

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

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down...');
  await prisma.$disconnect();
  process.exit(0);
});

main().catch((err) => {
  logger.error('Failed to start server', { error: err });
  process.exit(1);
});
