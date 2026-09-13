const mongoose = require('mongoose');

const ledgerEntrySchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    type: {
      type: String,
      enum: ['CREDIT', 'DEBIT'], // CREDIT = Saldo bertambah (setor), DEBIT = Saldo berkurang (tarik)
      required: true
    },
    reference_type: {
      type: String,
      enum: ['DEPOSIT', 'WITHDRAWAL'],
      required: true
    },
    reference_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    balance_before: {
      type: Number,
      required: true
    },
    balance_after: {
      type: Number,
      required: true
    },
    description: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('LedgerEntry', ledgerEntrySchema);
