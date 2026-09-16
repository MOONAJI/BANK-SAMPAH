const mongoose = require('mongoose');

const wasteCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Nama jenis sampah wajib diisi'],
      trim: true,
      unique: true
    },
    category_group: {
      type: String,
      enum: ['Plastik', 'Kertas', 'Logam', 'Kaca', 'Lainnya'],
      default: 'Lainnya'
    },
    price_per_kg: {
      type: Number,
      required: [true, 'Harga per kilogram wajib diisi'],
      min: [0, 'Harga per kilogram tidak boleh negatif']
    },
    unit: {
      type: String,
      default: 'kg'
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('WasteCategory', wasteCategorySchema);
