# Bank Sampah RW 05

Aplikasi web untuk mendigitalisasi pencatatan setoran sampah dan saldo nasabah. Petugas mencatat jenis serta berat sampah, sistem menghitung nilai setoran dan memperbarui saldo, lalu nasabah dapat melihat riwayat dan mengajukan penarikan.

## Aplikasi

- **Aplikasi berjalan:** [bank-sampah-bay.vercel.app](https://bank-sampah-bay.vercel.app/)
- **Repository:** [MOONAJI/BANK-SAMPAH](https://github.com/MOONAJI/BANK-SAMPAH)
- **Laporan Milestone 1:** [Buka laporan](https://drive.google.com/file/d/1TLz5Z-wCFXOySfe3nDN5IuIpPzO4_eB/view?usp=drive_link)

> Harga sampah di aplikasi dapat berubah. Informasi lokasi dan jadwal pos pada halaman publik merupakan data contoh untuk keperluan proyek.

## Latar belakang

Bank sampah tingkat RW sebelumnya mencatat jenis sampah, berat, nilai setoran, dan saldo pada buku tabungan manual. Pencatatan ini rawan salah hitung saat petugas melayani banyak nasabah. Buku juga dapat hilang atau rusak sehingga riwayat saldo sulit ditelusuri.

Aplikasi ini menyediakan pencatatan transaksi digital, perhitungan saldo otomatis, buku tabungan digital, serta alur pengajuan dan verifikasi penarikan. Ringkasan kebutuhan proyek tersedia di [`docs/tugas.md`](docs/tugas.md), sedangkan rancangan halaman dan alur pengguna ada di [`docs/frontend-uiux.md`](docs/frontend-uiux.md).

## Peran pengguna

| Peran | Kemampuan utama |
| --- | --- |
| **Nasabah** | Melihat saldo, buku tabungan, riwayat setoran dan penarikan; mengubah profil; mengajukan penarikan. |
| **Petugas** | Mencatat setoran, melihat data nasabah dan riwayatnya, memverifikasi penarikan, melihat laporan, dan mengunduh CSV. |
| **Admin** | Semua kemampuan petugas, ditambah mengelola jenis dan harga sampah serta akun pengguna. |

Pendaftaran publik membuat akun nasabah. Akun admin dan petugas dibuat oleh admin. Akses halaman dan API dibatasi berdasarkan peran.

## Fitur

- Halaman publik dengan cara kerja, daftar harga sampah, lokasi dan jadwal pos.
- Registrasi nasabah, login, logout, dan pengelolaan profil.
- Pencatatan setoran yang dapat memuat beberapa jenis sampah sekaligus.
- Perhitungan subtotal berdasarkan berat dan harga per kilogram; harga transaksi disimpan agar perubahan harga berikutnya tidak mengubah transaksi lama.
- Pembaruan saldo otomatis dan pencatatan mutasi di buku tabungan digital.
- Riwayat dan detail transaksi setoran.
- Pengajuan penarikan dengan metode tunai, e-wallet, atau transfer bank. Batas minimum pengajuan Rp1.000.
- Verifikasi penarikan oleh petugas atau admin. Saldo didebit saat disetujui; penolakan tidak mengurangi saldo.
- Dashboard, ringkasan sampah per kategori, filter transaksi, dan ekspor CSV.
- Pengelolaan kategori/harga sampah dan akun pengguna oleh admin.
- Antarmuka responsif untuk ponsel, tablet, dan desktop.

## Alur utama

1. **Setoran:** petugas memilih nasabah, memasukkan jenis dan berat sampah, lalu menyimpan transaksi. Backend menghitung nilai setoran, menambah saldo, dan membuat mutasi kredit.
2. **Penarikan:** nasabah mengajukan nominal dan metode pencairan. Status awalnya `PENDING`. Petugas atau admin menyetujui atau menolak pengajuan. Persetujuan membuat mutasi debit; penolakan menyimpan alasan tanpa mengubah saldo.
3. **Buku tabungan:** setiap perubahan saldo dicatat sebagai mutasi kredit atau debit beserta saldo sebelum dan sesudah transaksi.
4. **Harga sampah:** admin dapat menambah, mengubah, atau menonaktifkan kategori. Perubahan harga berlaku untuk setoran berikutnya; transaksi lama mempertahankan harga saat setoran dicatat.

## Teknologi dan arsitektur

```text
Browser
  └── Next.js / React (antarmuka web)
        └── Express REST API
              └── MongoDB melalui Mongoose
```

| Bagian | Teknologi |
| --- | --- |
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS 4 |
| Backend | Node.js, Express 5 |
| Database | MongoDB, Mongoose |
| Autentikasi | JSON Web Token (JWT), bcryptjs |
| Deployment | Vercel |

Backend menggunakan kontrol akses berbasis peran (RBAC). Password di-hash sebelum disimpan. Konfigurasi lokal menggunakan MongoDB lokal secara default; deployment dapat menggunakan MongoDB Atlas melalui `MONGO_URI`.

## Menjalankan secara lokal

### Prasyarat

- Node.js dan npm
- MongoDB lokal atau MongoDB Atlas

### 1. Siapkan backend

```bash
git clone https://github.com/MOONAJI/BANK-SAMPAH.git
cd BANK-SAMPAH/backend
npm install
```

Salin `backend/.env.example` menjadi `backend/.env`, lalu sesuaikan nilainya. Contoh konfigurasi lokal:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/bank_sampah
JWT_SECRET=ganti_dengan_secret_lokal_yang_kuat
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
```

Jalankan backend:

```bash
npm run dev
```

API berjalan di `http://localhost:5000`. Buka alamat tersebut untuk melihat health check dan daftar modul API.

### 2. Siapkan frontend

Buka terminal kedua dari folder repository:

```bash
cd frontend
npm install
```

Buat `frontend/.env.local`:

```env
API_URL=http://localhost:5000/api
```

Jalankan frontend:

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

### Data contoh

Untuk membuat data awal lokal, jalankan dari folder `backend`:

```bash
npm run seed
```

**Perhatian:** seeder menghapus seluruh pengguna, kategori sampah, setoran, penarikan, dan mutasi yang ada pada database dalam `MONGO_URI`, lalu membuat data contoh. Gunakan hanya pada database lokal atau database uji yang boleh dikosongkan. Jangan jalankan pada database produksi.

## Konfigurasi deployment

- Frontend publik tersedia di [https://bank-sampah-bay.vercel.app/](https://bank-sampah-bay.vercel.app/).
- Backend menyediakan konfigurasi Vercel di `backend/vercel.json` dan entry point serverless di `backend/api/index.js`.
- Atur `API_URL` pada environment frontend agar menunjuk ke URL API yang digunakan.
- Atur `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, dan `FRONTEND_URL` pada environment backend. Simpan nilai rahasia di pengaturan environment deployment, jangan commit ke repository.
- Ganti nilai contoh `JWT_SECRET` dengan secret yang kuat untuk deployment.

## Ringkasan API

Semua endpoint API menggunakan awalan `/api`. Endpoint terlindungi membutuhkan header `Authorization: Bearer <token>`.

| Modul | Endpoint utama | Akses |
| --- | --- | --- |
| Autentikasi & profil | `POST /api/auth/register`, `POST /api/auth/login`, `GET/PUT /api/auth/me` | Publik / pengguna login |
| Pengguna | `GET/POST /api/users`, `GET/PUT/DELETE /api/users/:id` | Admin dan petugas untuk baca; admin untuk perubahan |
| Jenis sampah | `GET /api/waste-categories`, `GET/POST/PUT/DELETE /api/waste-categories/:id` | Baca publik; perubahan oleh admin |
| Setoran | `POST/GET /api/deposits`, `GET /api/deposits/my-deposits`, `GET /api/deposits/:id` | Petugas/admin; nasabah untuk data sendiri |
| Penarikan | `POST /api/withdrawals`, `GET /api/withdrawals`, `GET /api/withdrawals/my-withdrawals`, `PATCH /api/withdrawals/:id/status` | Nasabah mengajukan; petugas/admin memverifikasi |
| Buku tabungan | `GET /api/ledger/my-history`, `GET /api/ledger/user/:userId` | Nasabah untuk data sendiri; petugas/admin untuk nasabah |
| Laporan | `GET /api/reports/dashboard`, `GET /api/reports/waste-summary`, `GET /api/reports/export/deposits`, `GET /api/reports/export/ledger` | Petugas dan admin |

Endpoint daftar transaksi mendukung pagination dengan `page` dan `limit`. Filter yang tersedia bergantung pada modul, misalnya tanggal, status, nasabah, jenis mutasi, dan pengguna.

## Struktur repository

```text
backend/
├── api/                 # Entry point serverless Vercel
├── src/
│   ├── config/          # Koneksi database
│   ├── controllers/     # Logika bisnis API
│   ├── middleware/      # Autentikasi, otorisasi, validasi, error
│   ├── models/          # Skema MongoDB
│   ├── routes/          # Rute REST API
│   ├── seeders/         # Data awal lokal
│   └── utils/           # Utilitas transaksi
└── vercel.json
frontend/
└── src/
    ├── app/             # Halaman publik, autentikasi, nasabah, pengelola
    ├── features/        # Komponen dan alur fitur
    └── lib/             # Klien API, sesi, konstanta, navigasi
docs/                    # User story, rancangan UI/UX, skenario pengujian
```

## Dokumentasi terkait

- [User story dan kebutuhan proyek](docs/tugas.md)
- [Rancangan UI/UX dan alur frontend](docs/frontend-uiux.md)
- [Skenario pengujian manual](docs/skenario-pengujian.md)
- [Dokumentasi backend](docs/readme.md)

## Kontributor

| Anggota | NIM | Kontribusi utama |
| --- | --- | --- |
| Rakan Hendian Ramadhan | 24/540158/TK/59909 | Fondasi backend/API, autentikasi, alur transaksi, dan konfigurasi deployment backend. |
| Arin Evangelica Patabang | 24/534030/TK/59182 | Pengembangan backend lanjutan, termasuk validasi, pagination, dan ekspor CSV. |
| Rian Prasetya Munaji | 24/545573/TK/60702 | Frontend Next.js, integrasi API, tampilan responsif, dan deployment frontend. |
| Gilbert S. H. Nainggolan | 24/543841/TK/60447 | Perancangan desain UI seluruh halaman aplikasi, termasuk layout dan elemen visual. |
