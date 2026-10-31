import { createApp } from './app.js';
import { env } from './config/env.js';
import { connectDatabase, disconnectDatabase } from './prisma/client.js';
import { logger } from './utils/logger.js';

async function bootstrap() {
  await connectDatabase();

  const app = createApp();

  const server = app.listen(env.PORT, () => {
    logger.info(`🚀 SubscriptIQ Backend running in ${env.NODE_ENV} mode on port ${env.PORT}`);
    logger.info(`📖 Interactive API Documentation available at http://localhost:${env.PORT}/api-docs`);
    logger.info(`🩺 Health check endpoint: http://localhost:${env.PORT}/health`);
  });

  const handleShutdown = async (signal: string) => {
    logger.info(`Received ${signal}. Shutting down gracefully...`);
    server.close(async () => {
      logger.info('HTTP server closed');
      await disconnectDatabase();
      process.exit(0);
    });

    // Force shutdown after 10s timeout
    setTimeout(() => {
      logger.error('Forced shutdown due to timeout');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => handleShutdown('SIGTERM'));
  process.on('SIGINT', () => handleShutdown('SIGINT'));
}

bootstrap().catch((err) => {
  logger.error('Fatal error during application startup', err);
  process.exit(1);
});
