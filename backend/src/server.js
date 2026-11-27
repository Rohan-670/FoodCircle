const app = require('./app');
const environment = require('./config/environment');
const { connectDatabase, disconnectDatabase } = require('./config/database');
const {
  startDonationExpiryJob,
  stopDonationExpiryJob,
} = require('./jobs/donationExpiry.job');
const logger = require('./utils/logger');

let server;

async function startServer() {
  // Attempt initial PostgreSQL connection (fails gracefully if DB is offline)
  await connectDatabase();

  // Start scheduled job to mark expired donations
  startDonationExpiryJob();

  server = app.listen(environment.port, () => {
    logger.info(`=======================================================`);
    logger.info(` Surplus Food Donation & NGO Coordination Backend API  `);
    logger.info(` Environment : ${environment.nodeEnv}`);
    logger.info(` Server URL  : http://localhost:${environment.port}`);
    logger.info(` Health API  : http://localhost:${environment.port}/api/v1/health`);
    logger.info(`=======================================================`);
  });
}

async function gracefulShutdown(signal) {
  logger.info(`Received ${signal}. Shutting down gracefully...`);
  stopDonationExpiryJob();

  if (server) {
    server.close(async () => {
      logger.info('HTTP server closed.');
      await disconnectDatabase();
      process.exit(0);
    });
  } else {
    await disconnectDatabase();
    process.exit(0);
  }
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Promise Rejection:', reason);
});

process.on('uncaughtException', async (error) => {
  logger.error('Uncaught Exception:', error);
  await disconnectDatabase();
  process.exit(1);
});

startServer();
