const LedgerEntry = require('../models/LedgerEntry');

/**
 * @desc    Nasabah melihat riwayat mutasi buku tabungan miliknya (Debit & Kredit)
 * @route   GET /api/ledger/my-history
 * @access  Private (Nasabah)
 */
const getMyLedger = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 0;
    const skip = limit > 0 ? (page - 1) * limit : 0;

    const filter = { user_id: req.user._id };
    const total = await LedgerEntry.countDocuments(filter);

    let query = LedgerEntry.find(filter).sort({ createdAt: -1 });
    if (limit > 0) {
      query = query.skip(skip).limit(limit);
    }

    const entries = await query;

    res.status(200).json({
      success: true,
      count: entries.length,
      total,
      page: limit > 0 ? page : 1,
      totalPages: limit > 0 ? Math.ceil(total / limit) : 1,
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
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 0;
    const skip = limit > 0 ? (page - 1) * limit : 0;

    const filter = { user_id: req.params.userId };
    const total = await LedgerEntry.countDocuments(filter);

    let query = LedgerEntry.find(filter).sort({ createdAt: -1 });
    if (limit > 0) {
      query = query.skip(skip).limit(limit);
    }

    const entries = await query;

    res.status(200).json({
      success: true,
      count: entries.length,
      total,
      page: limit > 0 ? page : 1,
      totalPages: limit > 0 ? Math.ceil(total / limit) : 1,
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
