const express = require('express');
const adminController = require('../../controllers/admin.controller');
const validate = require('../../middleware/validate');
const { authenticate, authorize } = require('../../middleware/auth.middleware');
const { updateAccountStatusSchema } = require('../../validators/auth.validator');
const {
  usersFilterQuerySchema,
  verificationDecisionSchema,
  verificationHistoryQuerySchema,
  reportsQuerySchema,
  reviewReportSchema,
  adminDonationsQuerySchema,
  adminDeliveriesQuerySchema,
  auditLogsQuerySchema,
} = require('../../validators/admin.validator');

const router = express.Router();

// All admin routes require valid authentication AND ADMIN role
router.use(authenticate, authorize('ADMIN'));

// Dashboard summary metrics
router.get('/dashboard', adminController.getDashboard);

// User & account status management
router.get(
  '/users',
  validate({ query: usersFilterQuerySchema }),
  adminController.getUsers
);
router.patch(
  '/users/:userId/status',
  validate({ body: updateAccountStatusSchema }),
  adminController.updateAccountStatus
);

// Verification (NGO & Donor) + verification history
router.patch(
  '/ngos/:ngoId/verify',
  validate({ body: verificationDecisionSchema }),
  adminController.verifyNgo
);
router.patch(
  '/donors/:donorId/verify',
  validate({ body: verificationDecisionSchema }),
  adminController.verifyDonor
);
router.get(
  '/verifications/history',
  validate({ query: verificationHistoryQuerySchema }),
  adminController.getVerificationHistory
);

// Reported donations
router.get(
  '/reports',
  validate({ query: reportsQuerySchema }),
  adminController.getReports
);
router.patch(
  '/reports/:reportId',
  validate({ body: reviewReportSchema }),
  adminController.reviewReport
);

// Donations, deliveries, and audit logs (paginated & filtered)
router.get(
  '/donations',
  validate({ query: adminDonationsQuerySchema }),
  adminController.getDonations
);
router.get(
  '/deliveries',
  validate({ query: adminDeliveriesQuerySchema }),
  adminController.getDeliveries
);
router.get(
  '/audit-logs',
  validate({ query: auditLogsQuerySchema }),
  adminController.getAuditLogs
);

module.exports = router;
