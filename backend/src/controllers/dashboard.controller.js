const dashboardService = require('../services/dashboard.service');
const { sendSuccess } = require('../utils/response');

async function getDonorDashboard(req, res, next) {
  try {
    const dashboard = await dashboardService.getDonorDashboard(req.user.id);
    return sendSuccess(res, 200, 'Donor dashboard retrieved', { dashboard });
  } catch (error) {
    return next(error);
  }
}

async function getNgoDashboard(req, res, next) {
  try {
    const dashboard = await dashboardService.getNgoDashboard(req.user.id);
    return sendSuccess(res, 200, 'NGO dashboard retrieved', { dashboard });
  } catch (error) {
    return next(error);
  }
}

async function getVolunteerDashboard(req, res, next) {
  try {
    const dashboard = await dashboardService.getVolunteerDashboard(req.user.id);
    return sendSuccess(res, 200, 'Volunteer dashboard retrieved', { dashboard });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getDonorDashboard,
  getNgoDashboard,
  getVolunteerDashboard,
};
