const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Nama lengkap wajib diisi'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email wajib diisi'],
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: [true, 'Kata sandi wajib diisi'],
      minlength: [6, 'Kata sandi minimal 6 karakter']
    },
    phone: {
      type: String,
      trim: true,
      default: ''
    },
    role: {
      type: String,
      enum: ['admin', 'petugas', 'nasabah'],
      default: 'nasabah'
    },
    balance: {
      type: Number,
      default: 0,
      min: [0, 'Saldo tidak boleh negatif']
    },
    address: {
      type: String,
      trim: true,
      default: ''
    },
    ewallet_info: {
      provider: {
        type: String,
        enum: ['GOPAY', 'OVO', 'DANA', 'SHOPEEPAY', 'BANK_TRANSFER', 'TUNAI', 'LAINNYA'],
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
    }
  },
  {
    timestamps: true
  }
);

// Hash password sebelum disimpan (Mongoose 9+ async hook)
userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method untuk verifikasi password saat login
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
