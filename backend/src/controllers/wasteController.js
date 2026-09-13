const WasteCategory = require('../models/WasteCategory');

/**
 * @desc    Mengambil seluruh jenis sampah (Katalog)
 * @route   GET /api/waste-categories
 * @access  Publik / All Users
 */
const getWasteCategories = async (req, res, next) => {
  try {
    const filter = {};
    // Jika bukan admin atau tidak meminta semua, tampilkan hanya yang aktif
    if (req.query.all !== 'true') {
      filter.isActive = true;
    }
    if (req.query.group) {
      filter.category_group = req.query.group;
    }

    const categories = await WasteCategory.find(filter).sort({ category_group: 1, name: 1 });

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mengambil detail 1 jenis sampah
 * @route   GET /api/waste-categories/:id
 * @access  Publik / All Users
 */
const getWasteCategoryById = async (req, res, next) => {
  try {
    const category = await WasteCategory.findById(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Jenis sampah tidak ditemukan.'
      });
    }

    res.status(200).json({
      success: true,
      data: category
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Admin menambahkan jenis sampah baru
 * @route   POST /api/waste-categories
 * @access  Private (Admin)
 */
const createWasteCategory = async (req, res, next) => {
  try {
    const { name, category_group, price_per_kg, unit, description } = req.body;

    if (!name || price_per_kg === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Nama sampah dan harga per kg wajib diisi.'
      });
    }

    const category = await WasteCategory.create({
      name,
      category_group: category_group || 'Lainnya',
      price_per_kg,
      unit: unit || 'kg',
      description: description || ''
    });

    res.status(201).json({
      success: true,
      message: 'Jenis sampah berhasil ditambahkan.',
      data: category
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Admin mengubah data / harga jenis sampah
 * @route   PUT /api/waste-categories/:id
 * @access  Private (Admin)
 */
const updateWasteCategory = async (req, res, next) => {
  try {
    const { name, category_group, price_per_kg, unit, description, isActive } = req.body;
    const category = await WasteCategory.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Jenis sampah tidak ditemukan.'
      });
    }

    if (name) category.name = name;
    if (category_group) category.category_group = category_group;
    if (price_per_kg !== undefined) category.price_per_kg = price_per_kg;
    if (unit) category.unit = unit;
    if (description !== undefined) category.description = description;
    if (isActive !== undefined) category.isActive = isActive;

    const updatedCategory = await category.save();

    res.status(200).json({
      success: true,
      message: 'Jenis sampah berhasil diperbarui.',
      data: updatedCategory
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Admin menghapus atau menonaktifkan jenis sampah
 * @route   DELETE /api/waste-categories/:id
 * @access  Private (Admin)
 */
const deleteWasteCategory = async (req, res, next) => {
  try {
    const category = await WasteCategory.findById(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Jenis sampah tidak ditemukan.'
      });
    }

    // Secara default, lakukan soft delete (nonaktifkan) agar riwayat transaksi masa lalu tetap valid
    if (req.query.hard === 'true') {
      await WasteCategory.findByIdAndDelete(req.params.id);
      return res.status(200).json({
        success: true,
        message: 'Jenis sampah berhasil dihapus permanen.'
      });
    }

    category.isActive = false;
    await category.save();

    res.status(200).json({
      success: true,
      message: 'Jenis sampah berhasil dinonaktifkan.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWasteCategories,
  getWasteCategoryById,
  createWasteCategory,
  updateWasteCategory,
  deleteWasteCategory
};
