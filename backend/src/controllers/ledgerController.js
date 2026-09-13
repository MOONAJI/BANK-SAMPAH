const LedgerEntry = require('../models/LedgerEntry');

/**
 * @desc    Nasabah melihat riwayat mutasi buku tabungan miliknya (Debit & Kredit)
 * @route   GET /api/ledger/my-history
 * @access  Private (Nasabah)
 */
const getMyLedger = async (req, res, next) => {
  try {
    const entries = await LedgerEntry.find({ user_id: req.user._id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: entries.length,
      current_balance: req.user.balance,
      data: entries
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Petugas / Admin melihat buku tabungan dari nasabah tertentu
 * @route   GET /api/ledger/user/:userId
 * @access  Private (Admin, Petugas)
 */
const getUserLedger = async (req, res, next) => {
  try {
    const entries = await LedgerEntry.find({ user_id: req.params.userId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: entries.length,
      data: entries
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyLedger,
  getUserLedger
};
