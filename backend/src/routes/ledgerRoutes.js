const express = require('express');
const router = express.Router();
const { getMyLedger, getUserLedger } = require('../controllers/ledgerController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/my-history', authorize('nasabah'), getMyLedger);
router.get('/user/:userId', authorize('admin', 'petugas'), getUserLedger);

module.exports = router;
