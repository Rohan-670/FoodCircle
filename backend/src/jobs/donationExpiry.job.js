const donationService = require('../services/donation.service');
const logger = require('../utils/logger');

const EXPIRY_INTERVAL_MS = 60 * 1000; // Every 60 seconds
let intervalHandle = null;

async function runExpiryCheck() {
  try {
    const { expiredCount } = await donationService.expireOverdueDonations();
    if (expiredCount > 0) {
      logger.info(`Expiry job marked ${expiredCount} overdue donation(s) as EXPIRED.`);
    }
  } catch (error) {
    logger.warn('Scheduled donation expiry check skipped (database unavailable).');
  }
}

function startDonationExpiryJob() {
  if (intervalHandle) return;

  // Run an initial check on startup, then every 60 seconds
  runExpiryCheck();
  intervalHandle = setInterval(runExpiryCheck, EXPIRY_INTERVAL_MS);

  // Do not prevent Node.js from exiting cleanly during shutdown
  if (typeof intervalHandle.unref === 'function') {
    intervalHandle.unref();
  }

  logger.info('Scheduled donation expiry job started (interval: 60s).');
}

function stopDonationExpiryJob() {
  if (intervalHandle) {
    clearInterval(intervalHandle);
    intervalHandle = null;
    logger.info('Scheduled donation expiry job stopped.');
  }
}

module.exports = {
  startDonationExpiryJob,
  stopDonationExpiryJob,
  runExpiryCheck,
};
