const authService = require('../services/auth.service');
const { setAuthCookie, clearAuthCookie } = require('../utils/jwt');
const { sendSuccess } = require('../utils/response');

async function register(req, res, next) {
  try {
    const { user, token } = await authService.registerUser(req.body);
    setAuthCookie(res, token);

    return sendSuccess(res, 201, 'Registration successful', {
      user,
      token,
    });
  } catch (error) {
    return next(error);
  }
}

async function login(req, res, next) {
  try {
    const { user, token } = await authService.loginUser(req.body);
    setAuthCookie(res, token);

    return sendSuccess(res, 200, 'Login successful', {
      user,
      token,
    });
  } catch (error) {
    return next(error);
  }
}

function logout(req, res) {
  clearAuthCookie(res);
  return sendSuccess(res, 200, 'Logged out successfully', null);
}

async function getMe(req, res, next) {
  try {
    const user = await authService.getProfile(req.user.id);
    return sendSuccess(res, 200, 'User profile retrieved successfully', { user });
  } catch (error) {
    return next(error);
  }
}

async function updateMe(req, res, next) {
  try {
    const user = await authService.updateProfile(
      req.user.id,
      req.user.role,
      req.body
    );
    return sendSuccess(res, 200, 'Profile updated successfully', { user });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  register,
  login,
  logout,
  getMe,
  updateMe,
};
