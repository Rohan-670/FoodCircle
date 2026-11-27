const app = require('./app');
const environment = require('./config/environment');

const server = app.listen(environment.port, () => {
  console.log(`=======================================================`);
  console.log(` Surplus Food Donation & NGO Coordination Backend API  `);
  console.log(` Server running in [${environment.nodeEnv}] mode       `);
  console.log(` Listening at: http://localhost:${environment.port}             `);
  console.log(` Health check: http://localhost:${environment.port}/api/health     `);
  console.log(`=======================================================`);
});

// Handle graceful shutdown
function gracefulShutdown(signal) {
  console.log(`Received ${signal}. Shutting down gracefully...`);
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
