const adminService = require('../services/admin.service');
const { sendSuccess } = require('../utils/response');

async function getUsers(req, res, next) {
  try {
    const users = await adminService.listUsers();
    return sendSuccess(res, 200, 'Users retrieved successfully', { users });
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
      req.body.isVerified
    );
    return sendSuccess(res, 200, 'NGO verification status updated', { ngoProfile });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getUsers,
  updateAccountStatus,
  verifyNgo,
};
