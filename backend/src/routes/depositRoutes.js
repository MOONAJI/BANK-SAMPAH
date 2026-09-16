const express = require('express');
const router = express.Router();
const {
  createDeposit,
  getDeposits,
  getMyDeposits,
  getDepositById
} = require('../controllers/depositController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router
  .route('/')
  .post(authorize('admin', 'petugas'), createDeposit)
  .get(authorize('admin', 'petugas'), getDeposits);

router.get('/my-deposits', authorize('nasabah'), getMyDeposits);
router.get('/:id', getDepositById);

module.exports = router;
