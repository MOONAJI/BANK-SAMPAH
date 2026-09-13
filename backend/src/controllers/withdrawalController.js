const WithdrawalTransaction = require('../models/WithdrawalTransaction');
const User = require('../models/User');
const LedgerEntry = require('../models/LedgerEntry');
const { generateTransactionCode } = require('../utils/codeGenerator');

/**
 * @desc    Nasabah mengajukan penarikan saldo
 * @route   POST /api/withdrawals
 * @access  Private (Nasabah)
 */
const createWithdrawal = async (req, res, next) => {
  try {
    const { amount, method, destination, notes } = req.body;

    if (!amount || Number(amount) < 1000) {
      return res.status(400).json({
        success: false,
        message: 'Nominal penarikan minimal adalah Rp 1.000.'
      });
    }

    if (!method || !['TUNAI', 'E_WALLET', 'BANK_TRANSFER'].includes(method)) {
      return res.status(400).json({
        success: false,
        message: 'Metode penarikan harus salah satu dari: TUNAI, E_WALLET, atau BANK_TRANSFER.'
      });
    }

    const nasabah = await User.findById(req.user._id);

    // Cek kecukupan saldo
    if (nasabah.balance < Number(amount)) {
      return res.status(400).json({
        success: false,
        message: `Saldo tidak mencukupi. Saldo Anda saat ini adalah Rp ${nasabah.balance.toLocaleString('id-ID')}, sedangkan permohonan penarikan sebesar Rp ${Number(amount).toLocaleString('id-ID')}.`
      });
    }

    // Tentukan data tujuan transfer/pencairan
    let destData = destination;
    if (!destData && method !== 'TUNAI') {
      destData = nasabah.ewallet_info || { provider: 'LAINNYA', account_number: '', account_name: nasabah.name };
    } else if (method === 'TUNAI') {
      destData = { provider: 'TUNAI', account_number: '-', account_name: nasabah.name };
    }

    const transactionCode = generateTransactionCode('WD');

    const withdrawal = await WithdrawalTransaction.create({
      transaction_code: transactionCode,
      nasabah_id: nasabah._id,
      amount: Number(amount),
      method,
      destination: destData,
      status: 'PENDING',
      notes: notes || ''
    });

    res.status(201).json({
      success: true,
      message: 'Pengajuan penarikan saldo berhasil dikirim. Menunggu verifikasi petugas/admin.',
      data: withdrawal
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mengambil semua pengajuan penarikan (Admin & Petugas)
 * @route   GET /api/withdrawals
 * @access  Private (Admin, Petugas)
 */
const getWithdrawals = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.status) {
      filter.status = req.query.status;
    }
    if (req.query.nasabah_id) {
      filter.nasabah_id = req.query.nasabah_id;
    }

    const withdrawals = await WithdrawalTransaction.find(filter)
      .populate('nasabah_id', 'name email phone address balance')
      .populate('processed_by', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: withdrawals.length,
      data: withdrawals
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Nasabah melihat riwayat permohonan penarikan miliknya
 * @route   GET /api/withdrawals/my-withdrawals
 * @access  Private (Nasabah)
 */
const getMyWithdrawals = async (req, res, next) => {
  try {
    const withdrawals = await WithdrawalTransaction.find({ nasabah_id: req.user._id })
      .populate('processed_by', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: withdrawals.length,
      data: withdrawals
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Admin / Petugas menyetujui atau menolak permohonan penarikan
 * @route   PATCH /api/withdrawals/:id/status
 * @access  Private (Admin, Petugas)
 */
const updateWithdrawalStatus = async (req, res, next) => {
  try {
    const { status, rejection_reason, notes } = req.body;

    if (!status || !['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status pemrosesan harus 'APPROVED' atau 'REJECTED'."
      });
    }

    const withdrawal = await WithdrawalTransaction.findById(req.params.id);
    if (!withdrawal) {
      return res.status(404).json({
        success: false,
        message: 'Pengajuan penarikan tidak ditemukan.'
      });
    }

    if (withdrawal.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: `Pengajuan penarikan ini sudah diproses sebelumnya dengan status '${withdrawal.status}'.`
      });
    }

    const nasabah = await User.findById(withdrawal.nasabah_id);
    if (!nasabah) {
      return res.status(404).json({
        success: false,
        message: 'Data nasabah tidak ditemukan.'
      });
    }

    if (status === 'APPROVED') {
      // Verifikasi ulang apakah saldo mencukupi pada saat disetujui
      if (nasabah.balance < withdrawal.amount) {
        return res.status(400).json({
          success: false,
          message: `Gagal menyetujui. Saldo nasabah saat ini (Rp ${nasabah.balance.toLocaleString('id-ID')}) tidak mencukupi nominal penarikan (Rp ${withdrawal.amount.toLocaleString('id-ID')}).`
        });
      }

      // Potong saldo nasabah
      const balanceBefore = nasabah.balance;
      const balanceAfter = balanceBefore - withdrawal.amount;
      nasabah.balance = balanceAfter;
      await nasabah.save();

      // Catat mutasi DEBIT di Buku Besar
      await LedgerEntry.create({
        user_id: nasabah._id,
        type: 'DEBIT',
        reference_type: 'WITHDRAWAL',
        reference_id: withdrawal._id,
        amount: withdrawal.amount,
        balance_before: balanceBefore,
        balance_after: balanceAfter,
        description: `Penarikan saldo (${withdrawal.transaction_code}) via ${withdrawal.method}`
      });

      withdrawal.status = 'APPROVED';
      withdrawal.processed_by = req.user._id;
      withdrawal.processed_at = new Date();
      if (notes) withdrawal.notes = notes;
      await withdrawal.save();

      return res.status(200).json({
        success: true,
        message: `Penarikan saldo sebesar Rp ${withdrawal.amount.toLocaleString('id-ID')} berhasil disetujui dan saldo nasabah telah didebit.`,
        data: withdrawal,
        nasabah_balance: balanceAfter
      });
    } else {
      // Status REJECTED
      withdrawal.status = 'REJECTED';
      withdrawal.rejection_reason = rejection_reason || 'Pengajuan penarikan ditolak oleh pengelola.';
      withdrawal.processed_by = req.user._id;
      withdrawal.processed_at = new Date();
      if (notes) withdrawal.notes = notes;
      await withdrawal.save();

      return res.status(200).json({
        success: true,
        message: 'Pengajuan penarikan saldo berhasil ditolak.',
        data: withdrawal
      });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createWithdrawal,
  getWithdrawals,
  getMyWithdrawals,
  updateWithdrawalStatus
};
