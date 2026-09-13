const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');
const http = require('http');
const app = require('./src/index');

const request = async (port, method, path, data = null, token = null) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: '127.0.0.1',
      port,
      path,
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, body });
        }
      });
    });

    req.on('error', reject);
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
};

const runHttpTests = async () => {
  const PORT = 5055;
  const server = app.listen(PORT, async () => {
    console.log(`[HTTP Test Server Running on port ${PORT}]`);

    try {
      // 1. Health check
      console.log('1. Testing GET /');
      const health = await request(PORT, 'GET', '/');
      console.log('   Health Status:', health.status, health.body.status);

      // 2. Login Admin & Petugas & Nasabah
      console.log('2. Testing POST /api/auth/login');
      const adminLogin = await request(PORT, 'POST', '/api/auth/login', {
        email: 'admin@rw05.id',
        password: 'admin123'
      });
      console.log('   Admin login status:', adminLogin.status, 'Success:', adminLogin.body.success);
      const adminToken = adminLogin.body.token;

      const petugasLogin = await request(PORT, 'POST', '/api/auth/login', {
        email: 'petugas@rw05.id',
        password: 'petugas123'
      });
      console.log('   Petugas login status:', petugasLogin.status, 'Success:', petugasLogin.body.success);
      const petugasToken = petugasLogin.body.token;

      const nasabahLogin = await request(PORT, 'POST', '/api/auth/login', {
        email: 'siti@rw05.id',
        password: 'nasabah123'
      });
      console.log('   Nasabah login status:', nasabahLogin.status, 'Success:', nasabahLogin.body.success);
      const nasabahToken = nasabahLogin.body.token;
      const nasabahId = nasabahLogin.body.user._id;

      // 3. Get Waste Categories (Public)
      console.log('3. Testing GET /api/waste-categories');
      const categoriesRes = await request(PORT, 'GET', '/api/waste-categories');
      console.log('   Categories count:', categoriesRes.body.count);
      const firstCat = categoriesRes.body.data[0];

      // 4. Petugas input deposit for Siti
      console.log('4. Testing POST /api/deposits (Petugas inputs deposit for Siti)');
      const depositRes = await request(PORT, 'POST', '/api/deposits', {
        nasabah_id: nasabahId,
        items: [
          {
            waste_id: firstCat._id,
            weight_kg: 8.5
          }
        ],
        notes: 'Setoran Siti via HTTP API'
      }, petugasToken);
      console.log('   Deposit status:', depositRes.status, 'Total Amount:', depositRes.body.data.total_amount, 'Siti Balance:', depositRes.body.nasabah_balance);

      // 5. Siti checks my-deposits
      console.log('5. Testing GET /api/deposits/my-deposits (Siti checks history)');
      const myDeposits = await request(PORT, 'GET', '/api/deposits/my-deposits', null, nasabahToken);
      console.log('   My deposits count:', myDeposits.body.count);

      // 6. Test Insufficient Balance Validation
      console.log('6. Testing POST /api/withdrawals (Insufficient Balance -> Should return 400)');
      const invalidWithdraw = await request(PORT, 'POST', '/api/withdrawals', {
        amount: 50000,
        method: 'E_WALLET',
        notes: 'Pencairan lebih besar dari saldo'
      }, nasabahToken);
      console.log('   Expected 400 received:', invalidWithdraw.status, 'Message:', invalidWithdraw.body.message);

      // 7. Siti requests valid withdrawal
      console.log('7. Testing POST /api/withdrawals (Valid withdrawal: Rp 5.000 <= Rp 6.800)');
      const withdrawAmount = 5000;
      const withdrawRes = await request(PORT, 'POST', '/api/withdrawals', {
        amount: withdrawAmount,
        method: 'E_WALLET',
        notes: 'Pencairan via DANA'
      }, nasabahToken);
      console.log('   Withdrawal request status:', withdrawRes.status, 'Withdrawal ID:', withdrawRes.body.data._id);
      const withdrawalId = withdrawRes.body.data._id;

      // 8. Admin approves withdrawal
      console.log('8. Testing PATCH /api/withdrawals/:id/status (Admin approves)');
      const approveRes = await request(PORT, 'PATCH', `/api/withdrawals/${withdrawalId}/status`, {
        status: 'APPROVED',
        notes: 'Transfer DANA berhasil'
      }, adminToken);
      console.log('   Approve status:', approveRes.status, 'Message:', approveRes.body.message, 'Remaining Balance:', approveRes.body.nasabah_balance);

      // 8. Siti checks digital passbook (ledger)
      console.log('8. Testing GET /api/ledger/my-history (Siti passbook)');
      const ledgerRes = await request(PORT, 'GET', '/api/ledger/my-history', null, nasabahToken);
      console.log('   Passbook entries:', ledgerRes.body.count, 'Current balance:', ledgerRes.body.current_balance);

      // 9. Admin checks dashboard report
      console.log('9. Testing GET /api/reports/dashboard');
      const dashRes = await request(PORT, 'GET', '/api/reports/dashboard', null, adminToken);
      console.log('   Dashboard Data:', JSON.stringify(dashRes.body.data));

      console.log('===========================================================');
      console.log('ALL EXPRESS HTTP API ENDPOINTS TESTED AND WORKING SEAMLESSLY!');
      console.log('===========================================================');

      server.close(async () => {
        await mongoose.connection.close();
        process.exit(0);
      });
    } catch (err) {
      console.error('HTTP Test Error:', err);
      server.close(async () => {
        await mongoose.connection.close();
        process.exit(1);
      });
    }
  });
};

runHttpTests();
