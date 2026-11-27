const express = require('express');
const dashboardController = require('../../controllers/dashboard.controller');
const { authenticate, authorize } = require('../../middleware/auth.middleware');

const router = express.Router();

router.use(authenticate);

router.get('/donor', authorize('DONOR'), dashboardController.getDonorDashboard);
router.get('/ngo', authorize('NGO'), dashboardController.getNgoDashboard);
router.get('/volunteer', authorize('VOLUNTEER'), dashboardController.getVolunteerDashboard);

module.exports = router;
