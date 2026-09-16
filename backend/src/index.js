const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Import Middleware
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const wasteRoutes = require('./routes/wasteRoutes');
const depositRoutes = require('./routes/depositRoutes');
const withdrawalRoutes = require('./routes/withdrawalRoutes');
const ledgerRoutes = require('./routes/ledgerRoutes');
const reportRoutes = require('./routes/reportRoutes');

// Inisialisasi Database
connectDB();

const app = express();

// Global Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rute Informasi Server / Health Check
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Backend Bank Sampah RW 05 API is running smoothly',
    timestamp: new Date().toISOString(),
    documentation: {
      auth: '/api/auth',
      users: '/api/users',
      waste_categories: '/api/waste-categories',
      deposits: '/api/deposits',
      withdrawals: '/api/withdrawals',
      ledger: '/api/ledger',
      reports: '/api/reports'
    }
  });
});

// Pemasangan Rute Modul (1 - 5)
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/waste-categories', wasteRoutes);
app.use('/api/deposits', depositRoutes);
app.use('/api/withdrawals', withdrawalRoutes);
app.use('/api/ledger', ledgerRoutes);
app.use('/api/reports', reportRoutes);

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`[Server Running]: http://localhost:${PORT}`);
});

module.exports = app;
