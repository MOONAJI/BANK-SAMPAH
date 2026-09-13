const mongoose = require('mongoose');

const withdrawalTransactionSchema = new mongoose.Schema(
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
    amount: {
      type: Number,
      required: [true, 'Nominal penarikan wajib diisi'],
      min: [1000, 'Nominal penarikan minimal Rp 1.000']
    },
    method: {
      type: String,
      enum: ['TUNAI', 'E_WALLET', 'BANK_TRANSFER'],
      required: [true, 'Metode penarikan wajib dipilih']
    },
    destination: {
      provider: {
        type: String,
        default: 'TUNAI'
      },
      account_number: {
        type: String,
        default: ''
      },
      account_name: {
        type: String,
        default: ''
      }
    },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'PENDING'
    },
    processed_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    rejection_reason: {
      type: String,
      trim: true,
      default: ''
    },
    notes: {
      type: String,
      trim: true,
      default: ''
    },
    processed_at: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('WithdrawalTransaction', withdrawalTransactionSchema);
