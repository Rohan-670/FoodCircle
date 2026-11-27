const environment = require('../config/environment');
const { checkDatabaseConnection } = require('../config/database');

/**
 * Service to aggregate API and PostgreSQL database health diagnostics.
 * @returns {Promise<object>} Health status details
 */
async function getSystemHealth() {
  const uptimeSeconds = Math.floor(process.uptime());
  const dbStatus = await checkDatabaseConnection();

  return {
    status: dbStatus.connected ? 'healthy' : 'degraded',
    service: 'Surplus Food Donation & NGO Coordination Backend API',
    version: 'v1',
    uptime: `${uptimeSeconds} seconds`,
    environment: environment.nodeEnv,
    database: {
      status: dbStatus.connected ? 'connected' : 'disconnected',
      ...(dbStatus.latencyMs !== undefined && { latencyMs: dbStatus.latencyMs }),
      ...(dbStatus.error && { error: dbStatus.error }),
    },
    timestamp: new Date().toISOString(),
  };
}

module.exports = {
  getSystemHealth,
};
