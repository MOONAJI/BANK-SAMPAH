const User = require('../models/User');
const { generateToken } = require('../middleware/authMiddleware');

/**
 * @desc    Registrasi nasabah baru
 * @route   POST /api/auth/register
 * @access  Publik
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, address, ewallet_info } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Nama, email, dan kata sandi wajib diisi.'
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'Email sudah terdaftar. Silakan gunakan email lain atau login.'
      });
    }

    // Pendaftaran publik selalu sebagai nasabah
    const user = await User.create({
      name,
      email,
      password,
      phone,
      address,
      ewallet_info,
      role: 'nasabah'
    });

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      message: 'Registrasi nasabah berhasil.',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        balance: user.balance,
        phone: user.phone,
        address: user.address,
        ewallet_info: user.ewallet_info
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Login pengguna (Semua role: Admin, Petugas, Nasabah)
 * @route   POST /api/auth/login
 * @access  Publik
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email dan kata sandi wajib diisi.'
      });
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Email atau kata sandi tidak sesuai.'
      });
    }

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      message: 'Login berhasil.',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        balance: user.balance,
        phone: user.phone,
        address: user.address,
        ewallet_info: user.ewallet_info
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mendapatkan profil pengguna yang sedang login
 * @route   GET /api/auth/me
 * @access  Private (Logged-in user)
 */
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update profil pengguna yang sedang login
 * @route   PUT /api/auth/me
 * @access  Private (Logged-in user)
 */
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, address, ewallet_info } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Pengguna tidak ditemukan.'
      });
    }

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (address !== undefined) user.address = address;
    if (ewallet_info) user.ewallet_info = { ...user.ewallet_info.toObject(), ...ewallet_info };

    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      message: 'Profil berhasil diperbarui.',
      data: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        balance: updatedUser.balance,
        phone: updatedUser.phone,
        address: updatedUser.address,
        ewallet_info: updatedUser.ewallet_info
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile
};
