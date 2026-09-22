## 1. Gambaran Umum Sistem

Proyek ini merupakan **REST API Backend** untuk sistem pengelolaan bank sampah berbasis komunitas. Sistem ini dibangun dengan arsitektur **MVC (Model - Controller - Route)** menggunakan teknologi:
- **Runtime & Framework**: Node.js & Express.js
- **Database & ODM**: MongoDB & Mongoose
- **Keamanan**: JSON Web Token (JWT) untuk autentikasi dan `bcryptjs` untuk enkripsi kata sandi
- **Akses Kontrol (RBAC)**: Tiga tingkat peran (*role*):
  1. `admin`: Pengelola penuh (manajemen akun, katalog jenis sampah, laporan, verifikasi penarikan).
  2. `petugas`: Operasional lapangan (menimbang sampah nasabah, mencatat transaksi setoran, memproses pencairan saldo).
  3. `nasabah`: Warga yang menabung sampah (melihat katalog harga, memantau saldo, mengajukan penarikan saldo, melihat mutasi buku tabungan).

---

## 2. Peran Tiap File dan Direktori

```
BANK-SAMPAH/
├── README.md
├── frontend/                          # Folder disiapkan untuk antarmuka klien/UI (masih kosong)
└── backend/
    ├── package.json                   # Konfigurasi dependensi dan skrip proyek
    ├── test_e2e.js                    # Pengujian logika transaksi langsung ke database
    ├── test_http_endpoints.js         # Pengujian endpoint REST API via HTTP client
    └── src/
        ├── index.js                   # Entry point aplikasi & server Express
        ├── config/
        │   └── db.js                  # Koneksi database MongoDB
        ├── utils/
        │   └── codeGenerator.js       # Generator kode transaksi unik
        ├── middleware/
        │   ├── authMiddleware.js      # Verifikasi JWT dan otorisasi hak akses (RBAC)
        │   └── errorMiddleware.js     # Penanganan error global (404 & Mongoose validation)
        ├── models/
        │   ├── User.js                # Skema pengguna & method hashing password
        │   ├── WasteCategory.js       # Skema master data kategori & harga sampah
        │   ├── DepositTransaction.js  # Skema transaksi setoran sampah
        │   ├── WithdrawalTransaction.js # Skema transaksi penarikan saldo
        │   └── LedgerEntry.js         # Skema buku besar / mutasi saldo (Debit/Kredit)
        ├── routes/
        │   ├── authRoutes.js          # Rute registrasi, login, & profil
        │   ├── userRoutes.js          # Rute manajemen data pengguna (CRUD user)
        │   ├── wasteRoutes.js         # Rute katalog & harga sampah
        │   ├── depositRoutes.js       # Rute pencatatan & riwayat setoran
        │   ├── withdrawalRoutes.js    # Rute pengajuan & verifikasi penarikan saldo
        │   ├── ledgerRoutes.js        # Rute riwayat mutasi buku tabungan
        │   └── reportRoutes.js        # Rute statistik dashboard & rekapitulasi volume sampah
        ├── controllers/
        │   ├── authController.js      # Logika login, registrasi nasabah, profil pengguna
        │   ├── userController.js      # Logika manajemen user oleh admin/petugas
        │   ├── wasteController.js     # Logika pengelolaan jenis dan harga per kg sampah
        │   ├── depositController.js   # Logika timbang sampah, hitung subtotal & penambahan saldo
        │   ├── withdrawalController.js # Logika permohonan tarik dana & verifikasi debit saldo
        │   ├── ledgerController.js    # Logika query riwayat mutasi tabungan (Ledger)
        │   └── reportController.js    # Logika agregasi laporan statistik & dashboard
        └── seeders/
            └── seed.js                # Inisialisasi data awal (Admin, Petugas, Nasabah, Jenis Sampah)
```

### Penjelasan Detail Tiap File:

#### Root & Konfigurasi
- [README.md]: Dokumentasi dasar proyek serta petunjuk instalasi awal.
- [package.json]: Berisi manifes proyek Node.js, dependensi (`express`, `mongoose`, `jsonwebtoken`, `bcryptjs`, `cors`, `dotenv`), serta skrip perintah (`start`, `dev`, `seed`).
- [index.js]: File utama aplikasi. Bertugas menginisialisasi Express, menghubungkan database via [connectDB], mengaktifkan middleware global (`cors`, parser JSON/urlencoded), memasang rute modul API, serta mendaftarkan handler error global.
- [db.js]: Mengelola siklus koneksi ke MongoDB menggunakan Mongoose berdasarkan variabel lingkungan `MONGO_URI`.

#### Utilitas & Middleware
- [codeGenerator.js]: Menyediakan fungsi pembantu `generateTransactionCode(prefix)` untuk membuat kode transaksi berformat otomatis (contoh: `DEP-20260913-1234` untuk setoran dan `WD-20260913-5678` untuk penarikan).
- [authMiddleware.js]:
  - `generateToken(id, role)`: Membuat JWT token berdurasi aktif 7 hari.
  - `protect`: Memeriksa header `Authorization: Bearer <token>`, memvalidasi token, dan melampirkan objek pengguna ke `req.user`.
  - `authorize(...roles)`: Menjaga endpoint agar hanya dapat diakses oleh peran tertentu (contoh: hanya `admin` atau `petugas`).
- [errorMiddleware.js]:
  - `notFound`: Menangkap URL yang tidak terdaftar dan menghasilkan pesan 404 terstruktur.
  - `errorHandler`: Menangkap exception server, memformat error validasi Mongoose (seperti duplicate email atau format ObjectId salah) agar ramah klien.

#### Model Data (MongoDB Schema)
- [User.js]: Menyimpan data akun (`name`, `email`, `password`, `phone`, `role`, `balance`, `address`, `ewallet_info`). Memiliki hook otomatis Mongoose `pre('save')` untuk mengenkripsi password sebelum tersimpan ke database, serta method `matchPassword()`.
- [WasteCategory.js]: Master data jenis sampah (`name`, `category_group` [Plastik/Kertas/Logam/Kaca/Lainnya], `price_per_kg`, `unit`, `isActive`).
- [DepositTransaction.js]: Menyimpan data transaksi setoran sampah (`transaction_code`, relasi `nasabah_id`, relasi `petugas_id`, array `items` [ID sampah, nama, harga satuan saat transaksi, berat kg, subtotal], `total_weight_kg`, `total_amount`).
- [WithdrawalTransaction.js]: Menyimpan pengajuan penarikan saldo (`transaction_code`, `nasabah_id`, `amount`, `method` [TUNAI/E_WALLET/BANK_TRANSFER], rekening/nomor tujuan, `status` [PENDING/APPROVED/REJECTED], relasi petugas pemroses `processed_by`).
- [LedgerEntry.js]: Log audit pembukuan saldo nasabah (*double-entry ledger / passbook*). Setiap kali saldo bertambah (CREDIT) atau berkurang (DEBIT), mutasi dicatat bersama `balance_before` dan `balance_after`.

#### Rute & Pengontrol (Routes & Controllers)
- **Modul Autentikasi**:
  - [authRoutes.js]: Rute `/api/auth/register`, `/login`, dan `/me`.
  - [authController.js]: Mengatur pendaftaran akun nasabah, pengecekan kecocokan email/password, pembentukan token JWT, serta pembaruan profil pengguna.
- **Modul Pengguna**:
  - [userRoutes.js]: Rute `/api/users` dan `/api/users/:id`.
  - [userController.js]: Mengelola operasi CRUD akun, pencarian nasabah berdasarkan nama/email/telepon, serta pengubahan peran oleh Admin.
- **Modul Jenis Sampah**:
  - [wasteRoutes.js]: Rute `/api/waste-categories`. Publik dapat melihat katalog, sedangkan penambahan/perubahan harga dibatasi untuk Admin.
  - [wasteController.js]: Pengelolaan katalog harga per kg sampah, termasuk fitur *soft-delete* agar riwayat transaksi lama tidak rusak.
- **Modul Setoran (Deposit)**:
  - [depositRoutes.js]: Rute `/api/deposits` dan `/api/deposits/my-deposits`.
  - [depositController.js]: Mesin kalkulasi setoran. Mengunci harga saat transaksi terjadi, menghitung subtotal dan berat kumulatif, menambah saldo nasabah secara otomatis, dan merekam entri CREDIT pada buku tabungan.
- **Modul Penarikan (Withdrawal)**:
  - [withdrawalRoutes.js]: Rute `/api/withdrawals` dan `/api/withdrawals/:id/status`.
  - [withdrawalController.js]: Mengatur validasi kecukupan saldo saat nasabah mengajukan penarikan, serta pemrosesan persetujuan (APPROVED) yang otomatis memotong saldo nasabah dan mencatat DEBIT pada buku tabungan.
- **Modul Buku Tabungan (Ledger)**:
  - [ledgerRoutes.js]: Rute `/api/ledger/my-history` dan `/api/ledger/user/:userId`.
  - [ledgerController.js]: Menampilkan riwayat arus kas saldo nasabah (kredit dari setoran sampah, debit dari penarikan dana).
- **Modul Laporan & Dashboard**:
  - [reportRoutes.js]: Rute `/api/reports/dashboard` dan `/api/reports/waste-summary`.
  - [reportController.js]: Menjalankan *MongoDB Aggregation Pipeline* untuk menghitung metrik utama: total tonase sampah terkumpul (kg), total perputaran uang setoran (Rp), total dana yang telah ditarik, saldo aktif warga, dan peringkat sampah terbanyak.

#### Seeder & Skrip Uji
- [seed.js]: Mengisi database lokal dengan data awal siap pakai (1 Admin, 1 Petugas, 2 Nasabah, dan 7 jenis sampah dasar).
- [test_e2e.js]: Skrip pengujian alur logika database dari hulu ke hilir (timbang sampah -> akumulasi saldo -> mutasi ledger -> pengajuan pencairan dana -> persetujuan pencairan dana -> pengecekan agregasi).
- [test_http_endpoints.js]: Skrip otomatisasi pengujian endpoint jaringan HTTP dengan simulasi request login, Bearer Token, dan proteksi hak akses.

---

## 3. Alur Kerja Program (Business Logic Flow)

Berikut adalah alur transaksi utama dalam sistem Bank Sampah:

```
[ Nasabah Datang Membawa Sampah ]
               │
               ▼
   1. Petugas Timbang Sampah
   (Memilih jenis sampah & memasukkan bobot kg di form setoran)
               │
               ▼
   2. Endpoint: POST /api/deposits
   - Validasi ID nasabah & status keaktifan jenis sampah
   - Snapshot harga per kg saat ini (mencegah perubahan di masa depan mempengaruhi transaksi lalu)
   - Hitung subtotal = bobot * harga
   - Buat dokumen DepositTransaction (kode unik: DEP-YYYYMMDD-XXXX)
   - Tambah balance pada akun nasabah: balance_baru = balance_lama + total_setoran
   - Simpan entri mutasi CREDIT pada LedgerEntry
               │
               ▼
   3. Nasabah Mengecek Saldo & Tabungan
   - Endpoint GET /api/ledger/my-history (melihat riwayat setoran & saldo terkini)
               │
               ▼
   4. Nasabah Mengajukan Penarikan Dana
   - Endpoint: POST /api/withdrawals
   - Sistem memvalidasi apakah saldo mencukupi (balance >= permohonan)
   - Jika cukup, simpan dokumen WithdrawalTransaction dengan status "PENDING"
               │
               ▼
   5. Petugas / Admin Menyetujui Pencairan Dana
   - Endpoint: PATCH /api/withdrawals/:id/status (status: "APPROVED")
   - Verifikasi ulang kecukupan saldo nasabah saat persetujuan
   - Potong saldo nasabah: balance_baru = balance_lama - nominal_penarikan
   - Simpan entri mutasi DEBIT pada LedgerEntry
   - Uang tunai atau transfer e-wallet diserahkan ke nasabah
               │
               ▼
   6. Pengelola Melihat Laporan & Dashboard
   - Endpoint: GET /api/reports/dashboard & GET /api/reports/waste-summary
   - Sistem mengagregasi total tonase sampah terkelola dan keuangan bank sampah
```

Sistem ini telah dirancang terisolasi secara modular, aman dengan pembatasan hak akses berbasis token (RBAC), serta memiliki rekam jejak mutasi keuangan yang transparan (*audit trail* melalui buku besar).
