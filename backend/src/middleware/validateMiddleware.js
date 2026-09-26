/**
 * Middleware untuk validasi request payload
 */

const validateRegister = (req, res, next) => {
  const { name, email, password, phone } = req.body;

  if (!name || name.trim().length < 3) {
    return res.status(400).json({
      success: false,
      message: 'Nama lengkap wajib diisi minimal 3 karakter.'
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email.trim())) {
    return res.status(400).json({
      success: false,
      message: 'Format email tidak valid.'
    });
  }

  if (!password || password.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Kata sandi wajib diisi minimal 6 karakter.'
    });
  }

  if (phone) {
    const phoneRegex = /^(\+62|62|0)[0-9]{8,14}$/;
    if (!phoneRegex.test(phone.replace(/\s|-/g, ''))) {
      return res.status(400).json({
        success: false,
        message: 'Format nomor telepon tidak valid. Gunakan format Indonesia (contoh: 08123456789).'
      });
    }
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email dan kata sandi wajib diisi.'
    });
  }

  next();
};

const validateWasteCategory = (req, res, next) => {
  const { name, price_per_kg } = req.body;

  if (!name || name.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Nama jenis sampah wajib diisi.'
    });
  }

  if (price_per_kg === undefined || isNaN(price_per_kg) || Number(price_per_kg) < 0) {
    return res.status(400).json({
      success: false,
      message: 'Harga per kg harus berupa angka positif.'
    });
  }

  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateWasteCategory
};
