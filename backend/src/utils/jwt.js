const jwt = require('jsonwebtoken');
const environment = require('../config/environment');

const AUTH_COOKIE_NAME = 'auth_token';

/**
 * Sign a JWT for an authenticated user.
 * @param {{ userId: string, role: string }} payload
 * @returns {string}
 */
function signToken(payload) {
  return jwt.sign(payload, environment.jwtSecret, {
    expiresIn: environment.jwtExpiresIn,
  });
}

/**
 * Verify and decode a JWT.
 * @param {string} token
 * @returns {object}
 */
function verifyToken(token) {
  return jwt.verify(token, environment.jwtSecret);
}

/**
 * Cookie options for HTTP-only JWT storage.
 * Prevents client-side JavaScript access (mitigating XSS token theft).
 */
function getCookieOptions() {
  return {
    httpOnly: true,
    secure: environment.nodeEnv === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };
}

/**
 * Attach JWT as an HTTP-only cookie on the response.
 */
function setAuthCookie(res, token) {
  res.cookie(AUTH_COOKIE_NAME, token, getCookieOptions());
}

/**
 * Clear the authentication cookie on logout.
 */
function clearAuthCookie(res) {
  res.clearCookie(AUTH_COOKIE_NAME, {
    httpOnly: true,
    secure: environment.nodeEnv === 'production',
    sameSite: 'lax',
    path: '/',
  });
}

module.exports = {
  AUTH_COOKIE_NAME,
  signToken,
  verifyToken,
  setAuthCookie,
  clearAuthCookie,
};
