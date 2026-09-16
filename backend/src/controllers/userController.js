const User = require('../models/User');

/**
 * @desc    Mengambil semua data pengguna (dengan opsi filter role, misal ?role=nasabah)
 * @route   GET /api/users
 * @access  Private (Admin, Petugas)
 */
const getUsers = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.role) {
      filter.role = req.query.role;
    }
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } },
        { phone: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const users = await User.find(filter).select('-password').sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mengambil detail 1 pengguna berdasarkan ID
 * @route   GET /api/users/:id
 * @access  Private (Admin, Petugas)
 */
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Pengguna tidak ditemukan.'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Admin membuat pengguna baru (misal Petugas atau Nasabah)
 * @route   POST /api/users
 * @access  Private (Admin)
 */
const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, phone, address, balance } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Nama, email, dan kata sandi wajib diisi.'
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email sudah terdaftar.'
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'nasabah',
      phone: phone || '',
      address: address || '',
      balance: balance || 0
    });

    res.status(201).json({
      success: true,
      message: 'Pengguna berhasil ditambahkan.',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        balance: user.balance,
        phone: user.phone,
        address: user.address
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Admin memperbarui data pengguna
 * @route   PUT /api/users/:id
 * @access  Private (Admin)
 */
const updateUser = async (req, res, next) => {
  try {
    const { name, role, phone, address, isActive } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Pengguna tidak ditemukan.'
      });
    }

    if (name) user.name = name;
    if (role && ['admin', 'petugas', 'nasabah'].includes(role)) user.role = role;
    if (phone !== undefined) user.phone = phone;
    if (address !== undefined) user.address = address;

    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      message: 'Data pengguna berhasil diperbarui.',
      data: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        balance: updatedUser.balance,
        phone: updatedUser.phone,
        address: updatedUser.address
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Admin menghapus pengguna
 * @route   DELETE /api/users/:id
 * @access  Private (Admin)
 */
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Pengguna tidak ditemukan.'
      });
    }

    // Hindari admin menghapus dirinya sendiri
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Admin tidak dapat menghapus akunnya sendiri.'
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Pengguna berhasil dihapus.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
};
