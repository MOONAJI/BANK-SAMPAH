const DepositTransaction = require('../models/DepositTransaction');
const WasteCategory = require('../models/WasteCategory');
const User = require('../models/User');
const LedgerEntry = require('../models/LedgerEntry');
const { generateTransactionCode } = require('../utils/codeGenerator');

/**
 * @desc    Petugas mencatat setoran sampah nasabah (Otomatis hitung nilai & tambah saldo)
 * @route   POST /api/deposits
 * @access  Private (Petugas, Admin)
 */
const createDeposit = async (req, res, next) => {
  try {
    const { nasabah_id, items, notes } = req.body;

    if (!nasabah_id || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'ID nasabah dan minimal satu rincian sampah wajib diisi.'
      });
    }

    // 1. Validasi nasabah
    const nasabah = await User.findById(nasabah_id);
    if (!nasabah) {
      return res.status(404).json({
        success: false,
        message: 'Data nasabah tidak ditemukan.'
      });
    }

    // 2. Kalkulasi rincian & snapshot harga saat ini
    const processedItems = [];
    let totalWeight = 0;
    let totalAmount = 0;

    for (const item of items) {
      const { waste_id, weight_kg } = item;

      if (!waste_id || !weight_kg || Number(weight_kg) <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Setiap item setoran harus memiliki ID jenis sampah dan berat timbangan > 0 kg.'
        });
      }

      const wasteCategory = await WasteCategory.findById(waste_id);
      if (!wasteCategory || !wasteCategory.isActive) {
        return res.status(400).json({
          success: false,
          message: `Jenis sampah dengan ID ${waste_id} tidak valid atau sedang tidak aktif.`
        });
      }

      const weight = parseFloat(Number(weight_kg).toFixed(2));
      const price = wasteCategory.price_per_kg;
      const subtotal = Math.round(weight * price);

      processedItems.push({
        waste_id: wasteCategory._id,
        waste_name: wasteCategory.name,
        price_per_kg: price,
        weight_kg: weight,
        subtotal: subtotal
      });

      totalWeight += weight;
      totalAmount += subtotal;
    }

    totalWeight = parseFloat(totalWeight.toFixed(2));

    // 3. Simpan transaksi setoran
    const transactionCode = generateTransactionCode('DEP');

    const deposit = await DepositTransaction.create({
      transaction_code: transactionCode,
      nasabah_id: nasabah._id,
      petugas_id: req.user._id,
      items: processedItems,
      total_weight_kg: totalWeight,
      total_amount: totalAmount,
      notes: notes || ''
    });

    // 4. Akumulasi saldo nasabah secara otomatis
    const balanceBefore = nasabah.balance || 0;
    const balanceAfter = balanceBefore + totalAmount;

    nasabah.balance = balanceAfter;
    await nasabah.save();

    // 5. Catat mutasi kredit pada Buku Besar (LedgerEntry)
    await LedgerEntry.create({
      user_id: nasabah._id,
      type: 'CREDIT',
      reference_type: 'DEPOSIT',
      reference_id: deposit._id,
      amount: totalAmount,
      balance_before: balanceBefore,
      balance_after: balanceAfter,
      description: `Setoran sampah (${transactionCode}) - ${totalWeight} kg`
    });

    const populatedDeposit = await DepositTransaction.findById(deposit._id)
      .populate('nasabah_id', 'name email phone address')
      .populate('petugas_id', 'name email');

    res.status(201).json({
      success: true,
      message: 'Setoran berhasil dicatat dan saldo nasabah telah diakumulasikan secara otomatis.',
      data: populatedDeposit,
      nasabah_balance: balanceAfter
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mengambil semua data setoran (Petugas & Admin)
 * @route   GET /api/deposits
 * @access  Private (Petugas, Admin)
 */
const getDeposits = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.nasabah_id) {
      filter.nasabah_id = req.query.nasabah_id;
    }
    if (req.query.startDate && req.query.endDate) {
      filter.createdAt = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    }

    const deposits = await DepositTransaction.find(filter)
      .populate('nasabah_id', 'name email phone address')
      .populate('petugas_id', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: deposits.length,
      data: deposits
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Nasabah melihat riwayat setorannya sendiri
 * @route   GET /api/deposits/my-deposits
 * @access  Private (Nasabah)
 */
const getMyDeposits = async (req, res, next) => {
  try {
    const deposits = await DepositTransaction.find({ nasabah_id: req.user._id })
      .populate('petugas_id', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: deposits.length,
      data: deposits
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Melihat rincian 1 transaksi setoran
 * @route   GET /api/deposits/:id
 * @access  Private (Admin, Petugas, atau Nasabah pemilik)
 */
const getDepositById = async (req, res, next) => {
  try {
    const deposit = await DepositTransaction.findById(req.params.id)
      .populate('nasabah_id', 'name email phone address')
      .populate('petugas_id', 'name email');

    if (!deposit) {
      return res.status(404).json({
        success: false,
        message: 'Transaksi setoran tidak ditemukan.'
      });
    }

    // Jika nasabah, pastikan hanya melihat miliknya sendiri
    if (
      req.user.role === 'nasabah' &&
      deposit.nasabah_id._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Anda tidak memiliki hak untuk melihat transaksi ini.'
      });
    }

    res.status(200).json({
      success: true,
      data: deposit
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createDeposit,
  getDeposits,
  getMyDeposits,
  getDepositById
};
