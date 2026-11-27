const environment = require('../config/environment');

/**
 * Service to aggregate health and system diagnostics
 * @returns {object} Health status details
 */
function getSystemHealth() {
  const uptimeSeconds = Math.floor(process.uptime());

  return {
    status: 'healthy',
    service: 'Surplus Food Donation & NGO Coordination Backend API',
    uptime: `${uptimeSeconds} seconds`,
    environment: environment.nodeEnv,
    timestamp: new Date().toISOString(),
  };
}

module.exports = {
  getSystemHealth,
};
