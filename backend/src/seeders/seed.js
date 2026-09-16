const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');
const User = require('../models/User');
const WasteCategory = require('../models/WasteCategory');
const DepositTransaction = require('../models/DepositTransaction');
const WithdrawalTransaction = require('../models/WithdrawalTransaction');
const LedgerEntry = require('../models/LedgerEntry');

const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/bank_sampah';
  await mongoose.connect(mongoURI);
  console.log(`[Database Connected for Seeding]: ${mongoURI}`);
};

const seedData = async () => {
  try {
    await connectDB();

    console.log('[1/4] Membersihkan data lama...');
    await User.deleteMany({});
    await WasteCategory.deleteMany({});
    await DepositTransaction.deleteMany({});
    await WithdrawalTransaction.deleteMany({});
    await LedgerEntry.deleteMany({});

    console.log('[2/4] Menginisialisasi Pengguna (Admin, Petugas, Nasabah)...');
    const admin = await User.create({
      name: 'Ketua Pengelola RW (Admin)',
      email: 'admin@rw05.id',
      password: 'admin123',
      role: 'admin',
      phone: '081211112222',
      address: 'Sekretariat RW 05'
    });

    const petugas = await User.create({
      name: 'Pak Joko (Petugas Timbang)',
      email: 'petugas@rw05.id',
      password: 'petugas123',
      role: 'petugas',
      phone: '081233334444',
      address: 'Pos Bank Sampah RW 05'
    });

    const nasabah1 = await User.create({
      name: 'Budi Santoso',
      email: 'budi@rw05.id',
      password: 'nasabah123',
      role: 'nasabah',
      phone: '081255556666',
      address: 'RT 01 / RW 05 No. 10',
      balance: 0,
      ewallet_info: {
        provider: 'GOPAY',
        account_number: '081255556666',
        account_name: 'Budi Santoso'
      }
    });

    const nasabah2 = await User.create({
      name: 'Siti Aminah',
      email: 'siti@rw05.id',
      password: 'nasabah123',
      role: 'nasabah',
      phone: '081277778888',
      address: 'RT 03 / RW 05 No. 25',
      balance: 0,
      ewallet_info: {
        provider: 'DANA',
        account_number: '081277778888',
        account_name: 'Siti Aminah'
      }
    });

    console.log('[3/4] Menginisialisasi Master Data Jenis Sampah & Harga...');
    const wasteCategories = await WasteCategory.insertMany([
      {
        name: 'Botol Plastik PET Bening',
        category_group: 'Plastik',
        price_per_kg: 4000,
        unit: 'kg',
        description: 'Botol air mineral bening bersih tanpa tutup dan label'
      },
      {
        name: 'Gelas Plastik Bersih (PP)',
        category_group: 'Plastik',
        price_per_kg: 3000,
        unit: 'kg',
        description: 'Gelas plastik minuman bersih tanpa sablon tebal'
      },
      {
        name: 'Kardus Cokelat Bekas',
        category_group: 'Kertas',
        price_per_kg: 2200,
        unit: 'kg',
        description: 'Kardus box bersih, kering, dan dilipat rapi'
      },
      {
        name: 'Kertas Arsip / HVS Putih',
        category_group: 'Kertas',
        price_per_kg: 2800,
        unit: 'kg',
        description: 'Kertas putih bekas kantor/skripsi tanpa klip staples'
      },
      {
        name: 'Kaleng Minuman Aluminium',
        category_group: 'Logam',
        price_per_kg: 14000,
        unit: 'kg',
        description: 'Kaleng minuman softdrink aluminium diinjak/dipipihkan'
      },
      {
        name: 'Besi Tua / Logam Padat',
        category_group: 'Logam',
        price_per_kg: 4500,
        unit: 'kg',
        description: 'Besi behel, seng, atau paku bekas'
      },
      {
        name: 'Botol Kaca Kecap / Sirup',
        category_group: 'Kaca',
        price_per_kg: 800,
        unit: 'kg',
        description: 'Botol kaca utuh tidak pecah'
      }
    ]);

    console.log('[4/4] Inisialisasi Selesai!');
    console.log('====================================================');
    console.log('AKUN PENGUJIAN DEFAULT:');
    console.log('1. Admin:   admin@rw05.id   / admin123   (Role: admin)');
    console.log('2. Petugas: petugas@rw05.id / petugas123 (Role: petugas)');
    console.log('3. Nasabah: budi@rw05.id    / nasabah123 (Role: nasabah)');
    console.log('4. Nasabah: siti@rw05.id    / nasabah123 (Role: nasabah)');
    console.log(`TOTAL KATEGORI SAMPAH DIBUAT: ${wasteCategories.length} jenis`);
    console.log('====================================================');

    process.exit(0);
  } catch (error) {
    console.error(`[Seeder Error]: ${error.message}`);
    process.exit(1);
  }
};

seedData();
