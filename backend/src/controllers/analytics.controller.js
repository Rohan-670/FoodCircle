const analyticsService = require('../services/analytics.service');
const { sendSuccess } = require('../utils/response');

async function getImpact(req, res, next) {
  try {
    const analytics = await analyticsService.getImpactAnalytics();
    return sendSuccess(res, 200, 'Impact analytics retrieved', { analytics });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getImpact,
};
