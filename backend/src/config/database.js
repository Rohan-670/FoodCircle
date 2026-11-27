const { PrismaClient } = require('@prisma/client');
const environment = require('./environment');
const logger = require('../utils/logger');

// Reuse PrismaClient across hot-reloads in development to avoid exhausting connections
const globalForPrisma = global;

const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: environment.nodeEnv === 'development' ? ['warn', 'error'] : ['error'],
  });

if (environment.nodeEnv !== 'production') {
  globalForPrisma.prisma = prisma;
}

/**
 * Attempt to establish an initial connection to PostgreSQL.
 * Handles connection failures gracefully without crashing or exposing credentials.
 * @returns {Promise<boolean>} true if connected, false otherwise
 */
async function connectDatabase() {
  try {
    await prisma.$connect();
    await prisma.$queryRaw`SELECT 1`;
    logger.info('PostgreSQL database connected successfully.');
    return true;
  } catch (error) {
    logger.error('Failed to connect to PostgreSQL database. Check that PostgreSQL is running and DATABASE_URL is valid.');
    return false;
  }
}

/**
 * Disconnect Prisma client cleanly during server shutdown.
 */
async function disconnectDatabase() {
  try {
    await prisma.$disconnect();
    logger.info('PostgreSQL database disconnected cleanly.');
  } catch (error) {
    logger.error('Error while disconnecting PostgreSQL database.', error);
  }
}

/**
 * Ping PostgreSQL to verify live connectivity for health checks.
 * @returns {Promise<{ connected: boolean, latencyMs?: number, error?: string }>}
 */
async function checkDatabaseConnection() {
  const start = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return {
      connected: true,
      latencyMs: Date.now() - start,
    };
  } catch (error) {
    return {
      connected: false,
      error: 'Database connection unavailable',
    };
  }
}

module.exports = {
  prisma,
  connectDatabase,
  disconnectDatabase,
  checkDatabaseConnection,
};
