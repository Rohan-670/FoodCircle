const express = require('express');
const adminController = require('../../controllers/admin.controller');
const validate = require('../../middleware/validate');
const { authenticate, authorize } = require('../../middleware/auth.middleware');
const {
  updateAccountStatusSchema,
  verifyNgoSchema,
} = require('../../validators/auth.validator');

const router = express.Router();

// All admin routes require valid authentication AND ADMIN role
router.use(authenticate, authorize('ADMIN'));

router.get('/users', adminController.getUsers);
router.patch(
  '/users/:userId/status',
  validate({ body: updateAccountStatusSchema }),
  adminController.updateAccountStatus
);
router.patch(
  '/ngos/:ngoId/verify',
  validate({ body: verifyNgoSchema }),
  adminController.verifyNgo
);

module.exports = router;
