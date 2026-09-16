const express = require('express');
const router = express.Router();
const {
  createWithdrawal,
  getWithdrawals,
  getMyWithdrawals,
  updateWithdrawalStatus
} = require('../controllers/withdrawalController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router
  .route('/')
  .post(authorize('nasabah'), createWithdrawal)
  .get(authorize('admin', 'petugas'), getWithdrawals);

router.get('/my-withdrawals', authorize('nasabah'), getMyWithdrawals);
router.patch('/:id/status', authorize('admin', 'petugas'), updateWithdrawalStatus);

module.exports = router;
