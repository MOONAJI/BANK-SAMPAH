# Tugas Kuliah Pengembangan Aplikasi Web

## Kategori Masalah
Digitalisasi sistem

## Domain
Bank sampah: Pencatatan Setoran & Saldo Otomatis

## Deskripsi Permasalahan
Sebuah bank sampah tingkat RW mencatat setoran nasabah pada buku tabungan manual: jenis sampah, beratnya, dan nilainya, lalu menjumlahkan seluruhnya menjadi saldo tiap nasabah yang sewaktu-waktu dapat ditarik dalam bentuk uang. Pencatatan dengan tangan seperti ini rawan salah hitung, terlebih ketika petugas melayani banyak nasabah sekaligus. Buku tabungan pun berisiko hilang atau rusak, dan bila itu terjadi, saldo nasabah praktis tidak dapat ditelusuri kembali. Pengelola ingin mendigitalkan keseluruhan proses: petugas menimbang dan memasukkan data setoran, saldo nasabah terakumulasi secara otomatis, dan nasabah dapat memeriksa saldonya sendiri serta mengajukan penarikan.

## Catatan
- Setiap jenis sampah memiliki harga per kilogram yang berbeda, misalnya plastik PET, kardus, kertas, kaleng, dan botol kaca. Harga ini dapat berubah sewaktu-waktu.
- Transaksi setoran memuat tanggal, nasabah, dan rincian berupa jenis sampah dikalikan berat dikalikan harga. Totalnya masuk ke saldo nasabah sebagai catatan buku besar.
- Nasabah dapat mengajukan penarikan saldo, baik secara tunai maupun ke dompet digital.
- Terdapat tiga peran dengan wewenang berbeda: petugas memasukkan hasil timbangan, nasabah memeriksa dan menarik saldo, dan admin mengatur harga serta melihat laporan. Perbedaan wewenang ini menjadi titik penerapan otorisasi.
- Peluang nilai tambah: pencairan melalui payment gateway atau e-wallet, serta API peta untuk menampilkan titik dan jadwal penjemputan."

## Rujukan Konteks Nyata
Startup pengelolaan sampah di Indonesia, misalnya Octopus, Rekosistem, atau Duitin, yang menerapkan setoran per kilogram, konversi menjadi poin atau saldo, dan penukaran ke e-wallet.

## Tech Stack
- ExpressJS
- MongoDB
- React
- NextJS

## API yang Perlu Dibangun
- 

## Target Milestone 1 (Backend)
### Laporan
- Analisis kebutuhan: daftar kebutuhan user berdasarkan user story
- Analisis fitur: daftar fitur yang perlu dibuat berdasarkan hasil analisis kebutuhan
- Daftar API yang dibuat beserta hasil pemanggilan API via Postman

## Aspek Penilaian
### Penilaian Umum (35%)
- Ketepatan Fitur (35%)
- Kontribusi (30%)
- Alur Pengembangan (10%)
- Presentasi (15%)
- Video Presentasi (10%)
### Backend (30%)
- Penggunaan ExpressJS (20%)
- Penggunaan MongoDB (20%)
- Operasi CRUD (30%)
- Penyandian kata sandi (10%)
- Perlindungan API (10%)
- Ketepatan waktu pengumpulan (10%)
### Frontend (30%)
- Penggunaan React/NextJS (10%)
- Penerjemahan desain ke antarmuka (20%)
- Frontend best practice (20%)
- Interaktivitas (10%)
- Konsumsi API dan validasi form (30%)
- Ketepatan waktu pengumpulan (10%)
### Integrasi fitur pihak ketiga, opsional (5%). Contoh:
- Penyimpanan berkas di Google Drive
- Pengiriman email otomatis
- Payment Gateway
- Penggunaan cache pada backend
- Deployment selain Vercel
- Masuk melalui akun Google (OAuth2)
- API peta, misalnya Leaflet atau Google Maps
- API chatbot
- API lain yang relevan dengan permasalahan
- Dan lain-lain