# BANK-SAMPAH

Project for Web Development class. Work in progress.

Install dependencies and initiate seed:

```bash
git clone https://github.com/MOONAJI/BANK-SAMPAH.git
cd BANK-SAMPAH/backend
npm install
npm run seed
```

Run program:

```bash
npm run dev
```

Or run via Docker:

```bash
cd BANK-SAMPAH/backend
docker run --rm -it $(docker build -q .)
```

## 👥 Nama Kelompok dan Daftar Anggota

**Mata Kuliah:** Pengembangan Aplikasi Web  
**Departemen:** Departemen Teknik Elektro dan Teknologi Informasi (DTETI), Fakultas Teknik  
**Institusi:** Universitas Gadjah Mada (UGM) — T.A. 2026/2027  

| No | Nama Anggota | NIM |
| :---: | :--- | :---: |
| 1 | **Gilbert S. H. Nainggolan** | `24/543841/TK/60447` |
| 2 | **Rakan Hendian Ramadhan** | `24/540158/TK/59909` |
| 3 | **Rian Prasetya Munaji** | `24/545573/TK/60702` |
| 4 | **Arin Evangelica Patabang** | `24/534030/TK/59182` |

---

## 📄 URL Laporan (Google Drive)

- **URL Laporan Milestone 1**: 

---

## 📌 Deskripsi Aplikasi

Sistem Pengelolaan Bank Sampah ini dirancang untuk mendigitalkan proses pencatatan setoran sampah serta pembukuan tabungan warga di tingkat RW yang sebelumnya masih manual.

### Permasalahan:
1. **Risiko Salah Hitung Manual**: Pencatatan jenis sampah, berat timbangan, dan nilai rupiah pada buku tabungan manual rentan terjadi kesalahan hitung (*human error*), khususnya saat antrean nasabah ramai.
2. **Risiko Buku Tabungan Hilang atau Rusak**: Buku fisik mudah robek, basah, atau hilang. Jika hilang, riwayat dan saldo nasabah sulit ditelusuri.
3. **Fluktuasi Harga Sampah**: Harga sampah per kilogram dapat berubah sewaktu-waktu sehingga membutuhkan sistem yang mengunci (*snapshot*) harga saat transaksi berlangsung.
4. **Keterbatasan Akses Saldo**: Nasabah kesulitan memantau saldo akumulasi secara mandiri dan transparan.

### Solusi Sistem:
- **Kalkulasi & Akumulasi Otomatis**: Petugas memasukkan data timbangan, sistem otomatis mengalikan dengan harga terkini dan menambahkan saldo ke akun nasabah.
- **Buku Besar / Mutasi Real-time (*Audit Trail*)**: Setiap penambahan (kredit) maupun pengurangan (debit) saldo tercatat rapi pada mutasi buku besar (*ledger*) beserta saldo sebelum dan sesudahnya.
- **Hak Akses Terpisah (RBAC)**:
  - `nasabah`: Mengecek katalog harga, memantau saldo, melihat riwayat mutasi tabungan, dan mengajukan permohonan penarikan dana.
  - `petugas`: Menimbang sampah warga, mencatat transaksi setoran, dan memproses persetujuan penarikan dana.
  - `admin`: Mengatur master data harga per kg sampah, manajemen akun pengguna, serta memantau dashboard laporan analitik.
- **Pengajuan & Pencairan Saldo**: Nasabah dapat mengajukan penarikan (tunai/e-wallet) yang akan diverifikasi oleh petugas dengan proteksi saldo tidak boleh minus.
- **Laporan & Ekspor Data**: Menyediakan agregasi statistik volume sampah serta fitur ekspor data riwayat setoran dan buku kas ke format CSV.

---

## 🛠️ Teknologi yang Digunakan

- **Runtime & Backend Framework**: Node.js & Express.js (v5.x)
- **Database & ODM**: MongoDB & Mongoose (v9.x)
- **Autentikasi & Keamanan**: JSON Web Token (JWT) & BcryptJS (hashing password)
- **Kontainerisasi**: Docker & Docker Compose
- **Version Control**: Git & GitHub
- **API Testing**: Postman & Skrip Uji Otomatis (`test_http_endpoints.js`, `test_e2e.js`)

---

## 📂 Struktur Folder dan File Proyek

```
BANK-SAMPAH/
├── README.md                      # Dokumentasi utama repository
├── .gitignore                     # Daftar file/folder yang diabaikan Git
├── docs/                          # Dokumentasi pendukung proyek
│   ├── readme.md                  # Dokumentasi teknis & arsitektur mendalam
│   └── tugas.md                   # Spesifikasi & target penugasan kuliah
└── backend/                       # RESTful API Backend
    ├── .env.example               # Template konfigurasi variabel lingkungan
    ├── .dockerignore              # Pengecualian berkas build Docker
    ├── Dockerfile                 # Konfigurasi container backend
    ├── compose.yaml               # Orkestrasi Docker Compose (Backend + MongoDB)
    ├── package.json               # Dependensi npm dan skrip proyek
    ├── package-lock.json          # Lockfile dependensi
    ├── test_e2e.js                # Pengujian alur database hulu-ke-hilir
    ├── test_http_endpoints.js     # Pengujian pemanggilan HTTP endpoint & RBAC
    └── src/
        ├── index.js               # Inisialisasi Express server & rute
        ├── config/
        │   └── db.js              # Pengaturan koneksi MongoDB
        ├── utils/
        │   └── codeGenerator.js   # Generator kode transaksi otomatis
        ├── middleware/
        │   ├── authMiddleware.js  # Verifikasi JWT dan hak akses (RBAC)
        │   ├── errorMiddleware.js # Handler error terpusat (404 & validasi)
        │   └── validateMiddleware.js # Validasi format payload request body
        ├── models/                # Skema Mongoose
        │   ├── User.js            # Model pengguna (Admin, Petugas, Nasabah)
        │   ├── WasteCategory.js   # Model jenis dan harga sampah per kg
        │   ├── DepositTransaction.js    # Model transaksi setoran timbangan
        │   ├── WithdrawalTransaction.js # Model pengajuan penarikan saldo
        │   └── LedgerEntry.js     # Model buku besar / riwayat mutasi
        ├── routes/                # Rute API Express
        │   ├── authRoutes.js      # /api/auth (register, login, me)
        │   ├── userRoutes.js      # /api/users
        │   ├── wasteRoutes.js     # /api/waste-categories
        │   ├── depositRoutes.js   # /api/deposits
        │   ├── withdrawalRoutes.js# /api/withdrawals
        │   ├── ledgerRoutes.js    # /api/ledger
        │   └── reportRoutes.js    # /api/reports
        ├── controllers/           # Logika bisnis transaksi dan controller
        │   ├── authController.js
        │   ├── userController.js
        │   ├── wasteController.js
        │   ├── depositController.js
        │   ├── withdrawalController.js
        │   ├── ledgerController.js
        │   └── reportController.js
        └── seeders/
            └── seed.js            # Seeder data awal pengguna dan jenis sampah
```

---

## 🔑 Informasi Akun Seeder Bawaan (Uji Coba)

Untuk pengujian cepat, database seeder (`npm run seed`) telah menyiapkan akun default:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@rw05.id` | `admin123` |
| **Petugas** | `petugas@rw05.id` | `petugas123` |
| **Nasabah** | `budi@rw05.id` | `nasabah123` |
| **Nasabah 2** | `siti@rw05.id` | `nasabah123` |
