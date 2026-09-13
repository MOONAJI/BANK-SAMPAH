const mongoose = require('mongoose');

const depositItemSchema = new mongoose.Schema(
  {
    waste_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WasteCategory',
      required: true
    },
    waste_name: {
      type: String,
      required: true
    },
    price_per_kg: {
      type: Number,
      required: true,
      min: 0
    },
    weight_kg: {
      type: Number,
      required: true,
      min: 0.01
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0
    }
  },
  { _id: false }
);

const depositTransactionSchema = new mongoose.Schema(
  {
    transaction_code: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    nasabah_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    petugas_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    items: {
      type: [depositItemSchema],
      validate: [v => Array.isArray(v) && v.length > 0, 'Setoran harus memiliki minimal satu jenis sampah']
    },
    total_weight_kg: {
      type: Number,
      required: true,
      min: 0.01
    },
    total_amount: {
      type: Number,
      required: true,
      min: 0
    },
    notes: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('DepositTransaction', depositTransactionSchema);
