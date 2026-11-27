const adminService = require('../services/admin.service');
const { sendSuccess } = require('../utils/response');

async function getDashboard(req, res, next) {
  try {
    const stats = await adminService.getDashboardStats();
    return sendSuccess(res, 200, 'Admin dashboard metrics retrieved', { stats });
  } catch (error) {
    return next(error);
  }
}

async function getUsers(req, res, next) {
  try {
    const result = await adminService.listUsers(req.query);
    return sendSuccess(res, 200, 'Users retrieved successfully', result);
  } catch (error) {
    return next(error);
  }
}

async function updateAccountStatus(req, res, next) {
  try {
    const user = await adminService.updateUserAccountStatus(
      req.params.userId,
      req.body.isActive,
      req.user.id
    );
    return sendSuccess(res, 200, 'Account status updated successfully', { user });
  } catch (error) {
    return next(error);
  }
}

async function verifyNgo(req, res, next) {
  try {
    const ngoProfile = await adminService.verifyNgoProfile(
      req.params.ngoId,
      req.body,
      req.user.id
    );
    return sendSuccess(res, 200, 'NGO verification status updated', { ngoProfile });
  } catch (error) {
    return next(error);
  }
}

async function verifyDonor(req, res, next) {
  try {
    const donorProfile = await adminService.verifyDonorProfile(
      req.params.donorId,
      req.body,
      req.user.id
    );
    return sendSuccess(res, 200, 'Donor verification status updated', {
      donorProfile,
    });
  } catch (error) {
    return next(error);
  }
}

async function getVerificationHistory(req, res, next) {
  try {
    const result = await adminService.getVerificationHistory(req.query);
    return sendSuccess(res, 200, 'Verification history retrieved', result);
  } catch (error) {
    return next(error);
  }
}

async function getReports(req, res, next) {
  try {
    const result = await adminService.listReports(req.query);
    return sendSuccess(res, 200, 'Donation reports retrieved', result);
  } catch (error) {
    return next(error);
  }
}

async function reviewReport(req, res, next) {
  try {
    const report = await adminService.reviewReport(
      req.params.reportId,
      req.body,
      req.user.id
    );
    return sendSuccess(res, 200, 'Donation report reviewed', { report });
  } catch (error) {
    return next(error);
  }
}

async function getDonations(req, res, next) {
  try {
    const result = await adminService.listDonations(req.query);
    return sendSuccess(res, 200, 'Donations retrieved', result);
  } catch (error) {
    return next(error);
  }
}

async function getDeliveries(req, res, next) {
  try {
    const result = await adminService.listDeliveries(req.query);
    return sendSuccess(res, 200, 'Deliveries retrieved', result);
  } catch (error) {
    return next(error);
  }
}

async function getAuditLogs(req, res, next) {
  try {
    const result = await adminService.listAuditLogs(req.query);
    return sendSuccess(res, 200, 'Audit logs retrieved', result);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getDashboard,
  getUsers,
  updateAccountStatus,
  verifyNgo,
  verifyDonor,
  getVerificationHistory,
  getReports,
  reviewReport,
  getDonations,
  getDeliveries,
  getAuditLogs,
};
