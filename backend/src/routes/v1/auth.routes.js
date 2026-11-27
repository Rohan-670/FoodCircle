const express = require('express');
const authController = require('../../controllers/auth.controller');
const validate = require('../../middleware/validate');
const { authenticate } = require('../../middleware/auth.middleware');
const {
  registerSchema,
  loginSchema,
  updateProfileSchema,
} = require('../../validators/auth.validator');

const router = express.Router();

// Public authentication endpoints
router.post('/register', validate({ body: registerSchema }), authController.register);
router.post('/login', validate({ body: loginSchema }), authController.login);
router.post('/logout', authController.logout);

// Protected profile endpoints
router.get('/me', authenticate, authController.getMe);
router.patch(
  '/me',
  authenticate,
  validate({ body: updateProfileSchema }),
  authController.updateMe
);

module.exports = router;
