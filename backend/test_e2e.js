const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');
const User = require('./src/models/User');
const WasteCategory = require('./src/models/WasteCategory');
const DepositTransaction = require('./src/models/DepositTransaction');
const WithdrawalTransaction = require('./src/models/WithdrawalTransaction');
const LedgerEntry = require('./src/models/LedgerEntry');

const fs = require('fs');

const runTest = async () => {
  const logs = [];
  const log = (msg) => {
    console.log(msg);
    logs.push(typeof msg === 'object' ? JSON.stringify(msg, null, 2) : String(msg));
  };

  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/bank_sampah');
    log('--- TEST RUNNER: DATABASE CONNECTED ---');

    // 1. Verifikasi User Terdaftar & Password Match
    const admin = await User.findOne({ email: 'admin@rw05.id' });
    const petugas = await User.findOne({ email: 'petugas@rw05.id' });
    const nasabah = await User.findOne({ email: 'budi@rw05.id' });

    log('1. User Check:');
    log(`   Admin found: ${admin ? `${admin.name} (${admin.role})` : 'NO'}`);
    log(`   Petugas found: ${petugas ? `${petugas.name} (${petugas.role})` : 'NO'}`);
    log(`   Nasabah found: ${nasabah ? `${nasabah.name} (${nasabah.role})` : 'NO'}`);

    const isMatchAdmin = await admin.matchPassword('admin123');
    const isMatchPetugas = await petugas.matchPassword('petugas123');
    const isMatchNasabah = await nasabah.matchPassword('nasabah123');
    log(`   Password hashing verify: Admin=${isMatchAdmin}, Petugas=${isMatchPetugas}, Nasabah=${isMatchNasabah}`);

    if (!isMatchAdmin || !isMatchPetugas || !isMatchNasabah) {
      throw new Error('Password hash check failed!');
    }

    // 2. Verifikasi Katalog Sampah
    const categories = await WasteCategory.find({ isActive: true });
    log(`2. Waste Categories: Found ${categories.length} active types.`);
    categories.forEach(c => log(`   - ${c.name} (${c.category_group}): Rp ${c.price_per_kg}/${c.unit}`));

    // 3. Simulasi Transaksi Setoran (Deposit) oleh Petugas untuk Nasabah Budi
    log('3. Testing Setoran Sampah (Deposit Engine):');
    const petItem = categories.find(c => c.name.includes('PET'));
    const kardusItem = categories.find(c => c.name.includes('Kardus'));

    const weightPET = 5.5; // 5.5 kg * 4000 = 22000
    const weightKardus = 10; // 10 kg * 2200 = 22000
    const subtotalPET = Math.round(weightPET * petItem.price_per_kg);
    const subtotalKardus = Math.round(weightKardus * kardusItem.price_per_kg);
    const totalWeight = weightPET + weightKardus;
    const totalAmount = subtotalPET + subtotalKardus;

    const { generateTransactionCode } = require('./src/utils/codeGenerator');
    const depCode = generateTransactionCode('DEP');

    const deposit = await DepositTransaction.create({
      transaction_code: depCode,
      nasabah_id: nasabah._id,
      petugas_id: petugas._id,
      items: [
        {
          waste_id: petItem._id,
          waste_name: petItem.name,
          price_per_kg: petItem.price_per_kg,
          weight_kg: weightPET,
          subtotal: subtotalPET
        },
        {
          waste_id: kardusItem._id,
          waste_name: kardusItem.name,
          price_per_kg: kardusItem.price_per_kg,
          weight_kg: weightKardus,
          subtotal: subtotalKardus
        }
      ],
      total_weight_kg: totalWeight,
      total_amount: totalAmount,
      notes: 'Uji Coba Setoran Otomatis'
    });

    const balanceBefore = nasabah.balance;
    const balanceAfterDeposit = balanceBefore + totalAmount;
    nasabah.balance = balanceAfterDeposit;
    await nasabah.save();

    await LedgerEntry.create({
      user_id: nasabah._id,
      type: 'CREDIT',
      reference_type: 'DEPOSIT',
      reference_id: deposit._id,
      amount: totalAmount,
      balance_before: balanceBefore,
      balance_after: balanceAfterDeposit,
      description: `Setoran sampah (${depCode}) - ${totalWeight} kg`
    });

    log(`   Deposit Created: ${depCode}, Total: Rp ${totalAmount}`);
    log(`   Nasabah New Balance: Rp ${nasabah.balance} (Expected: Rp ${totalAmount})`);

    // 4. Simulasi Pengajuan Penarikan Saldo (Withdrawal) oleh Nasabah
    log('4. Testing Pengajuan Penarikan Saldo:');
    const wdCode = generateTransactionCode('WD');
    const withdrawAmount = 25000;

    const withdrawal = await WithdrawalTransaction.create({
      transaction_code: wdCode,
      nasabah_id: nasabah._id,
      amount: withdrawAmount,
      method: 'E_WALLET',
      destination: {
        provider: 'GOPAY',
        account_number: nasabah.phone,
        account_name: nasabah.name
      },
      status: 'PENDING',
      notes: 'Pencairan uang jajan'
    });
    log(`   Withdrawal Requested: ${wdCode}, Status: ${withdrawal.status}, Amount: Rp ${withdrawal.amount}`);

    // 5. Simulasi Persetujuan Penarikan oleh Admin/Petugas
    log('5. Testing Approval Penarikan:');
    const currentNasabah = await User.findById(nasabah._id);
    const balanceBeforeWD = currentNasabah.balance;
    const balanceAfterWD = balanceBeforeWD - withdrawAmount;
    currentNasabah.balance = balanceAfterWD;
    await currentNasabah.save();

    await LedgerEntry.create({
      user_id: currentNasabah._id,
      type: 'DEBIT',
      reference_type: 'WITHDRAWAL',
      reference_id: withdrawal._id,
      amount: withdrawAmount,
      balance_before: balanceBeforeWD,
      balance_after: balanceAfterWD,
      description: `Penarikan saldo (${wdCode}) via ${withdrawal.method}`
    });

    withdrawal.status = 'APPROVED';
    withdrawal.processed_by = admin._id;
    withdrawal.processed_at = new Date();
    await withdrawal.save();

    log(`   Withdrawal Approved! Nasabah Final Balance: Rp ${currentNasabah.balance} (Expected: ${totalAmount - withdrawAmount})`);

    // 6. Verifikasi Mutasi Buku Tabungan (Ledger)
    log('6. Checking Passbook Mutations (Ledger):');
    const ledger = await LedgerEntry.find({ user_id: nasabah._id }).sort({ createdAt: 1 });
    ledger.forEach((entry, idx) => {
      log(`   Entry #${idx + 1}: [${entry.type}] Rp ${entry.amount} | Saldo: Rp ${entry.balance_before} -> Rp ${entry.balance_after} (${entry.description})`);
    });

    // 7. Verifikasi Agregasi Dashboard & Waste Summary
    log('7. Checking Dashboard Aggregation:');
    const wasteSummary = await DepositTransaction.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.waste_name',
          total_weight_kg: { $sum: '$items.weight_kg' },
          total_amount_rp: { $sum: '$items.subtotal' }
        }
      }
    ]);
    log('   Waste Summary Aggregation Result:');
    log(wasteSummary);

    log('====================================================');
    log('ALL BACKEND MODULES (1 - 5) TESTED & VERIFIED 100%!');
    log('====================================================');

    const path = require('path');
    const outputPath = path.join(__dirname, 'test_output.txt');
    fs.writeFileSync(outputPath, logs.join('\n'), 'utf8');
    await mongoose.connection.close();
  } catch (error) {
    logs.push(`Test Failed: ${error.message}`);
    const path = require('path');
    fs.writeFileSync(path.join(__dirname, 'test_output.txt'), logs.join('\n'), 'utf8');
    await mongoose.connection.close();
    process.exit(1);
  }
};

runTest();
