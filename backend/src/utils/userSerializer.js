/**
 * Remove sensitive fields (such as passwordHash) from a user record
 * before sending it in an API response.
 *
 * @param {object} user
 * @returns {object|null}
 */
function sanitizeUser(user) {
  if (!user) return null;

  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

module.exports = {
  sanitizeUser,
};
