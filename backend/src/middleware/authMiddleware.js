const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Generate JWT Token
 * @param {string} id 
 * @param {string} role 
 * @returns {string}
 */
const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET || 'rahasia_super_bank_sampah_jwt_key_2026',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

/**
 * Middleware untuk memproteksi rute (memerlukan token valid)
 */
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Akses ditolak. Token otentikasi tidak ditemukan.'
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'rahasia_super_bank_sampah_jwt_key_2026'
    );
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Pengguna yang terkait dengan token ini tidak ditemukan.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token tidak valid atau telah kedaluwarsa.',
      error: error.message
    });
  }
};

/**
 * Middleware untuk otorisasi hak akses berdasarkan peran (Role-Based Access Control)
 * @param  {...string} roles Daftar role yang diperbolehkan (misal: 'admin', 'petugas')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Peran '${req.user ? req.user.role : 'tamu'}' tidak memiliki izin untuk mengakses sumber daya ini.`
      });
    }
    next();
  };
};

module.exports = {
  generateToken,
  protect,
  authorize
};
