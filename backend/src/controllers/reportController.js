const User = require('../models/User');
const DepositTransaction = require('../models/DepositTransaction');
const WithdrawalTransaction = require('../models/WithdrawalTransaction');

/**
 * @desc    Mengambil statistik dashboard utama Bank Sampah
 * @route   GET /api/reports/dashboard
 * @access  Private (Admin, Petugas)
 */
const getDashboardStats = async (req, res, next) => {
  try {
    // 1. Jumlah pengguna per role
    const totalNasabah = await User.countDocuments({ role: 'nasabah' });
    const totalPetugas = await User.countDocuments({ role: 'petugas' });

    // 2. Total saldo aktif seluruh nasabah
    const balanceAgg = await User.aggregate([
      { $match: { role: 'nasabah' } },
      { $group: { _id: null, totalBalance: { $sum: '$balance' } } }
    ]);
    const totalCurrentBalance = balanceAgg.length > 0 ? balanceAgg[0].totalBalance : 0;

    // 3. Akumulasi transaksi setoran (Total Kg & Total Nilai Rp)
    const depositAgg = await DepositTransaction.aggregate([
      {
        $group: {
          _id: null,
          totalWeightKg: { $sum: '$total_weight_kg' },
          totalDepositAmount: { $sum: '$total_amount' },
          totalTransactions: { $sum: 1 }
        }
      }
    ]);
    const depositStats = depositAgg.length > 0
      ? depositAgg[0]
      : { totalWeightKg: 0, totalDepositAmount: 0, totalTransactions: 0 };

    // 4. Akumulasi penarikan yang telah disetujui (Approved)
    const withdrawalAgg = await WithdrawalTransaction.aggregate([
      { $match: { status: 'APPROVED' } },
      {
        $group: {
          _id: null,
          totalWithdrawnAmount: { $sum: '$amount' },
          totalWithdrawals: { $sum: 1 }
        }
      }
    ]);
    const withdrawalStats = withdrawalAgg.length > 0
      ? withdrawalAgg[0]
      : { totalWithdrawnAmount: 0, totalWithdrawals: 0 };

    // 5. Penarikan yang masih menunggu persetujuan (Pending)
    const pendingWithdrawalsCount = await WithdrawalTransaction.countDocuments({ status: 'PENDING' });

    res.status(200).json({
      success: true,
      data: {
        users: {
          total_nasabah: totalNasabah,
          total_petugas: totalPetugas
        },
        deposits: {
          total_weight_kg: parseFloat(depositStats.totalWeightKg.toFixed(2)),
          total_amount_rp: depositStats.totalDepositAmount,
          total_transactions: depositStats.totalTransactions
        },
        withdrawals: {
          total_amount_rp: withdrawalStats.totalWithdrawnAmount,
          total_transactions: withdrawalStats.totalWithdrawals,
          pending_count: pendingWithdrawalsCount
        },
        financials: {
          total_nasabah_balance_rp: totalCurrentBalance
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mengambil rekapitulasi volume dan nilai sampah berdasarkan jenisnya
 * @route   GET /api/reports/waste-summary
 * @access  Private (Admin, Petugas)
 */
const getWasteSummary = async (req, res, next) => {
  try {
    const summary = await DepositTransaction.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.waste_name',
          waste_id: { $first: '$items.waste_id' },
          total_weight_kg: { $sum: '$items.weight_kg' },
          total_amount_rp: { $sum: '$items.subtotal' },
          transaction_count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          waste_name: '$_id',
          waste_id: 1,
          total_weight_kg: { $round: ['$total_weight_kg', 2] },
          total_amount_rp: 1,
          transaction_count: 1
        }
      },
      { $sort: { total_weight_kg: -1 } }
    ]);

    res.status(200).json({
      success: true,
      count: summary.length,
      data: summary
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getWasteSummary
};
