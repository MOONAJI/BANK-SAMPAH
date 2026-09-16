const express = require('express');
const router = express.Router();
const { getDashboardStats, getWasteSummary } = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('admin', 'petugas'));

router.get('/dashboard', getDashboardStats);
router.get('/waste-summary', getWasteSummary);

module.exports = router;
