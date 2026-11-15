# Skenario Pengujian Frontend — Bank Sampah RW 05

Pengujian manual model **black-box**: penguji menjalankan aplikasi seperti pengguna biasa, lalu membandingkan hasilnya dengan "Hasil yang diharapkan". Isi kolom **Hasil** dengan ✅ (sesuai) atau ❌ (tidak sesuai, tulis apa yang terjadi).

Skenario disusun mengikuti aspek penilaian tugas: otorisasi tiga peran, CRUD, validasi form dan konsumsi API, interaktivitas, tampilan responsif, dan API peta.

---

## 1. Persiapan

1. Jalankan MongoDB, lalu isi data awal:
   ```bash
   npm --prefix backend run seed
   ```
   Seed **menghapus semua data lama** lalu membuat akun admin, petugas, dua nasabah, jenis sampah, dan contoh transaksi. Email dan kata sandi akun uji ada di `backend/src/seeders/seed.js` (sengaja tidak ditulis di dokumen ini).
2. Jalankan backend (port 5000) dan frontend (port 3000):
   ```bash
   npm --prefix backend run dev
   ```
   ```bash
   npm --prefix frontend run dev
   ```
3. Buka `http://localhost:3000`. Untuk menguji ukuran layar, pakai DevTools browser (F12 → ikon HP/tablet), lalu pilih lebar **360 px**, **375 px**, **768 px**, dan **1280 px**.
4. Agar sesi tidak tercampur, uji tiap peran di jendela penyamaran (incognito) terpisah, atau keluar dulu sebelum masuk dengan akun lain.

Singkatan: **N** = nasabah, **P** = petugas, **A** = admin.

---

## 2. Halaman publik (tanpa login)

| ID | Skenario | Langkah | Hasil yang diharapkan | Hasil |
|---|---|---|---|---|
| PUB-01 | Beranda tampil | Buka `/` | Hero, ilustrasi, "Cara kerjanya", "Harga hari ini", dan "Lokasi pos" tampil | |
| PUB-02 | Harga hari ini dari API | Lihat bagian "Harga hari ini" | Kartu harga per golongan berisi data dari backend, bukan teks contoh | |
| PUB-03 | Peta lokasi (API peta) | Gulir ke "Lokasi pos" | Peta Google Maps tampil dengan penanda di Bank Sampah Simul 5; alamat dan jadwal tampil di sampingnya/bawahnya | |
| PUB-04 | Tombol Google Maps | Klik "Buka di Google Maps" | Google Maps terbuka di **tab baru** pada lokasi yang sama | |
| PUB-05 | Daftar harga lengkap | Buka `/harga`, klik chip golongan (Plastik, Kertas, …) | Daftar tersaring sesuai golongan; URL ikut berubah | |
| PUB-06 | Backend mati | Matikan backend, buka `/harga` | Muncul pesan bahwa harga belum bisa dimuat, halaman tidak rusak | |
| PUB-07 | Header di HP | Lebar 360 px, buka `/` | Logo, "Masuk", dan "Daftar" muat dalam satu baris; "Harga Sampah" disembunyikan; halaman tidak bisa digeser ke samping | |

## 3. Daftar akun nasabah (`/daftar`)

| ID | Skenario | Langkah | Hasil yang diharapkan | Hasil |
|---|---|---|---|---|
| REG-01 | Form kosong | Klik "Daftar sebagai nasabah" tanpa mengisi apa pun | Pesan di bawah kolom: nama minimal 3 karakter, format email tidak valid, alamat wajib diisi, kata sandi minimal 6 karakter | |
| REG-02 | Format email salah | Isi email `budi@` | "Format email tidak valid." | |
| REG-03 | Nomor HP salah | Isi nomor HP `12345` | "Gunakan format nomor Indonesia, contoh 08123456789." | |
| REG-04 | Nomor HP dengan spasi/strip | Isi `0812-3456 7890`, data lain benar | Diterima (spasi dan strip dibuang otomatis) | |
| REG-05 | Kata sandi tidak sama | Isi "Ulangi kata sandi" berbeda | "Kata sandi tidak sama." | |
| REG-06 | Isian tidak hilang | Picu error mana pun | Nama, email, HP, dan alamat yang sudah diketik tetap ada | |
| REG-07 | Email sudah terdaftar | Daftar memakai email akun seed | Pesan "Email sudah terdaftar…" di bawah kolom email | |
| REG-08 | Daftar berhasil | Isi semua data dengan benar | Tombol berubah "Mendaftarkan…", lalu masuk ke beranda nasabah dengan nama dan saldo Rp 0 | |
| REG-09 | Sudah login membuka `/daftar` | Setelah REG-08, buka `/daftar` | Langsung dialihkan ke beranda sesuai peran | |

## 4. Masuk dan keluar (`/login`)

| ID | Skenario | Langkah | Hasil yang diharapkan | Hasil |
|---|---|---|---|---|
| LOG-01 | Form kosong | Klik "Masuk" tanpa isian | Pesan email tidak valid dan "Kata sandi wajib diisi." | |
| LOG-02 | Kata sandi salah | Email benar, kata sandi salah | Banner merah "Email atau kata sandi tidak sesuai."; email tetap terisi | |
| LOG-03 | Email huruf besar | Tulis email akun dengan huruf besar | Tetap bisa masuk | |
| LOG-04 | Masuk sebagai nasabah | Login akun nasabah | Diarahkan ke `/nasabah` | |
| LOG-05 | Masuk sebagai petugas/admin | Login akun petugas lalu admin | Keduanya diarahkan ke `/kelola` | |
| LOG-06 | Kembali ke halaman asal | Belum login, buka `/nasabah/tabungan`, lalu login | URL login berisi `?next=…`; setelah masuk langsung ke Buku Tabungan | |
| LOG-07 | Tujuan ke situs luar ditolak | Buka `/login?next=//example.com`, lalu login | Tetap di aplikasi (beranda sesuai peran), **tidak** pindah ke example.com | |
| LOG-08 | Keluar | Klik "Keluar" (profil atau topbar staf) | Kembali ke `/login`; membuka `/nasabah` atau `/kelola` lagi dialihkan ke `/login` | |
| LOG-09 | Cookie aman | Setelah login, buka DevTools → Console, ketik `document.cookie` | Token `bs_token` **tidak** terlihat (cookie httpOnly) | |

## 5. Hak akses / otorisasi

| ID | Skenario | Langkah | Hasil yang diharapkan | Hasil |
|---|---|---|---|---|
| AKS-01 | Belum login | Buka `/kelola` dan `/profil` | Dialihkan ke `/login` | |
| AKS-02 | Nasabah ke area staf | Login N, buka `/kelola` | Dialihkan ke `/nasabah` | |
| AKS-03 | Staf ke area nasabah | Login P, buka `/nasabah` | Dialihkan ke `/kelola` | |
| AKS-04 | Petugas ke menu admin | Login P, buka `/kelola/pengguna` dan `/kelola/jenis-sampah` | Dialihkan ke `/kelola`; menu "Admin" tidak tampil di sidebar petugas | |
| AKS-05 | Ekspor CSV tanpa izin | Login N, buka `/api/export/deposits` | Ditolak (bukan file CSV) | |
| AKS-06 | Akun dihapus saat login | Login N di jendela 1; admin menghapus akun N di jendela 2; N menekan Simpan di profil | N diarahkan ke login dengan pesan "Sesi kamu sudah berakhir. Silakan masuk lagi." | |
| AKS-07 | Peran diubah saat login | Login N; admin mengubah perannya jadi petugas; N membuka halaman nasabah | Diarahkan ke login dengan pesan "Peran akunmu baru diubah admin…"; setelah login ulang masuk ke `/kelola` | |

## 6. Petugas — Catat setoran (`/kelola/setoran/baru`)

| ID | Skenario | Langkah | Hasil yang diharapkan | Hasil |
|---|---|---|---|---|
| SET-01 | Tanpa nasabah | Isi rincian, klik "Simpan setoran" | Tombol nonaktif / pesan "Pilih nasabah terlebih dahulu." | |
| SET-02 | Cari nasabah | Ketik sebagian nama/HP di pencarian | Daftar nasabah cocok muncul; pilih satu → kartu nasabah dan saldonya tampil | |
| SET-03 | Dari halaman Nasabah | Di `/kelola/nasabah`, klik "Catat setoran" pada satu baris | Form terbuka dengan nasabah itu sudah terpilih | |
| SET-04 | Berat kosong/nol | Pilih jenis, berat `0` | "Isi minimal satu jenis sampah dengan berat lebih dari 0 kg." | |
| SET-05 | Berat desimal koma | Berat `3,5` | Diterima sebagai 3,5 kg | |
| SET-06 | Hitung otomatis | Pilih jenis dengan harga diketahui, isi berat | Subtotal = berat × harga/kg; total berat, total nilai, "Saldo sesudah" ikut berubah | |
| SET-07 | Banyak jenis | Klik "+ Tambah jenis sampah", isi 2–3 baris | Total = jumlah semua subtotal; jenis yang sudah dipilih tidak bisa dipilih lagi di baris lain | |
| SET-08 | Hapus baris | Klik ✕ pada salah satu baris | Baris hilang, total dihitung ulang; baris terakhir tidak bisa dihapus | |
| SET-09 | Simpan berhasil | Klik "Simpan setoran" | Kartu "Setoran tersimpan" dengan kode `DEP-…`, total, dan saldo baru | |
| SET-10 | Saldo nasabah bertambah | Buka detail nasabah tersebut | Saldo bertambah sebesar total; mutasi "Setoran" tercatat di buku tabungan | |
| SET-11 | Setoran berikutnya | Klik "Catat setoran berikutnya" | Form kosong kembali, siap untuk nasabah berikutnya | |
| SET-12 | Struk | Klik "Lihat struk", lalu "Cetak" | Halaman detail setoran tampil; pratinjau cetak tanpa menu dan tombol | |

## 7. Petugas — Riwayat setoran dan data nasabah

| ID | Skenario | Langkah | Hasil yang diharapkan | Hasil |
|---|---|---|---|---|
| RIW-01 | Filter tanggal | Di `/kelola/setoran`, isi "Dari" dan "Sampai" hari ini | Hanya setoran hari ini; filter langsung berlaku tanpa tombol | |
| RIW-02 | Setoran dini hari (WIB) | Catat setoran antara 00.00–06.59 WIB, filter tanggal hari itu | Setoran tersebut **ikut tampil** (rentang memakai zona WIB) | |
| RIW-03 | Filter nasabah | Pilih satu nasabah di filter | Hanya setoran nasabah itu | |
| RIW-04 | Unduh CSV | Isi rentang tanggal, klik "Unduh CSV" | File CSV setoran terunduh sesuai **rentang tanggal** (filter nasabah tidak ikut ke CSV) | |
| RIW-05 | Cari nasabah | Di `/kelola/nasabah`, ketik nama/email/HP | Daftar tersaring setelah berhenti mengetik | |
| RIW-06 | Detail nasabah | Klik "Detail" | Profil, saldo, dan tab Buku tabungan / Setoran / Penarikan tampil | |

## 8. Penarikan saldo

| ID | Skenario | Langkah | Hasil yang diharapkan | Hasil |
|---|---|---|---|---|
| WD-01 | Nominal di bawah minimum | N ajukan Rp 500 | "Nominal minimal Rp 1.000." | |
| WD-02 | Melebihi saldo | N ajukan lebih dari saldo | "Nominal melebihi saldo (Rp …)." | |
| WD-03 | Pilihan cepat | Klik 10rb / 25rb / 50rb / Semua | Kolom nominal terisi otomatis; "Semua" = seluruh saldo | |
| WD-04 | Ajukan berhasil | N ajukan Rp 1.000 metode Tunai | Muncul di daftar penarikan berstatus **Menunggu**; saldo **belum** berkurang | |
| WD-05 | Metode e-wallet | N pilih E-wallet | Tujuan pencairan diambil dari data e-wallet di Profil | |
| WD-06 | Petugas menyetujui | P buka Verifikasi Penarikan → Setujui | Status **Disetujui**; saldo N berkurang; mutasi "Penarikan" tercatat | |
| WD-07 | Tolak tanpa alasan | P klik Tolak, alasan kosong | "Alasan penolakan wajib diisi." | |
| WD-08 | Tolak dengan alasan | P isi alasan lalu Tolak | Status **Ditolak** beserta alasannya; saldo N tidak berubah | |
| WD-09 | Dua pengajuan melebihi saldo | Saldo N Rp 10.000; ajukan Rp 8.000 dua kali; P setujui keduanya | Yang pertama disetujui; yang kedua gagal dengan pesan saldo tidak mencukupi | |
| WD-10 | Lencana menunggu | Ada pengajuan berstatus Menunggu | Angka jumlah pengajuan tampil di menu "Verifikasi Penarikan" | |

## 9. Admin — Jenis sampah, pengguna, laporan

| ID | Skenario | Langkah | Hasil yang diharapkan | Hasil |
|---|---|---|---|---|
| ADM-01 | Tambah jenis sampah | `/kelola/jenis-sampah` → "+ Tambah jenis" | Jenis baru muncul di tabel, di `/harga`, dan di pilihan form setoran | |
| ADM-02 | Validasi jenis sampah | Simpan dengan nama kosong / harga huruf | "Nama jenis sampah wajib diisi." / "Harga per kg harus berupa angka." | |
| ADM-03 | Ubah harga | Ubah harga satu jenis | Pesan "Harga baru berlaku untuk setoran berikutnya."; `/harga` ikut berubah | |
| ADM-04 | Harga lama tetap | Buka detail setoran **lama** dengan jenis itu | Harga/kg di setoran lama **tidak** berubah | |
| ADM-05 | Nonaktifkan jenis | Nonaktifkan satu jenis | Hilang dari `/harga` dan form setoran; muncul lagi bila "Tampilkan nonaktif" dicentang | |
| ADM-06 | Tambah pengguna | `/kelola/pengguna` → "+ Tambah pengguna", peran Petugas | Pengguna baru muncul di tabel dan bisa login | |
| ADM-07 | Validasi pengguna | Email salah, sandi < 6, HP salah | Pesan error di bawah masing-masing kolom; isian lain tidak hilang | |
| ADM-08 | Ubah pengguna | Klik "Ubah", ganti nama/peran | Panel tetap terbuka dengan pesan "Data pengguna tersimpan."; tabel ikut berubah | |
| ADM-09 | Hapus pengguna | Klik "Hapus" → konfirmasi | Pengguna hilang dari tabel; admin tidak bisa menghapus dirinya sendiri | |
| ADM-10 | Laporan | `/kelola/laporan` | Total sampah, nilai setoran, sudah dicairkan, saldo nasabah, grafik berat per jenis, dan tabel ringkasan tampil | |
| ADM-11 | Filter laporan & ekspor | Isi rentang tanggal, unduh CSV | Angka menyesuaikan rentang; CSV terunduh | |

## 10. Nasabah — Beranda, buku tabungan, profil

| ID | Skenario | Langkah | Hasil yang diharapkan | Hasil |
|---|---|---|---|---|
| NSB-01 | Beranda | Login N | Sapaan sesuai waktu (pagi/siang/sore/malam), saldo, dan 4 mutasi terakhir; bila ada penarikan berstatus Menunggu, muncul pemberitahuannya | |
| NSB-02 | Buku tabungan | `/nasabah/tabungan`, klik Semua / Masuk / Keluar | Mutasi tersaring; dikelompokkan per bulan; saldo setelah tiap mutasi tampil | |
| NSB-03 | Riwayat & detail setoran | `/nasabah/setoran` → klik satu setoran | Rincian jenis × berat × harga, total, petugas, dan catatan tampil | |
| NSB-04 | Bagikan struk | Klik "Bagikan struk" | Di HP: menu bagikan muncul. Di laptop: teks struk tersalin ke clipboard | |
| NSB-05 | Ubah profil | Ubah nama/HP/alamat, simpan | "Profil berhasil disimpan."; nama di beranda ikut berubah | |
| NSB-06 | Data e-wallet | Pilih provider (mis. GoPay), isi nomor & nama | Tersimpan dan dipakai sebagai tujuan saat penarikan e-wallet | |

## 11. Tampilan responsif

Lakukan untuk lebar **360 px, 375 px, 768 px, dan 1280 px**.

| ID | Skenario | Langkah | Hasil yang diharapkan | Hasil |
|---|---|---|---|---|
| RES-01 | Tidak ada geser ke samping | Buka setiap halaman, coba geser layar ke kiri/kanan | Halaman tidak bisa digeser ke samping (kecuali chip filter yang memang bisa digeser) | |
| RES-02 | Tabel di HP | Lebar 375 px, buka Riwayat Setoran, Nasabah, Pengguna | Setiap baris tampil sebagai kartu berlabel; tidak perlu menggeser tabel | |
| RES-03 | Tabel di tablet/laptop | Lebar 768 dan 1280 px | Tampil sebagai tabel biasa; kolom angka rata kanan | |
| RES-04 | Catat setoran di HP | Lebar 375 px | Tiap baris: jenis → berat (besar) → harga & subtotal; tanpa geser ke samping | |
| RES-05 | Menu staf di HP | Lebar 375 px, gulir ke bawah | Tombol ☰ tetap di header, tidak menutupi isi; ☰ membuka menu samping | |
| RES-06 | Grafik laporan | Lebar 375 px vs 1280 px | HP: batang mendatar, nama jenis terbaca; laptop: batang tegak | |
| RES-07 | Area nasabah | Lebar 768 dan 1280 px | Kolom nasabah lebih lebar (± 672 px) dengan menu bawah | |
| RES-08 | Panel ubah di layar kecil | Lebar 768 px, klik "Ubah" pada pengguna | Panel ubah tampil **di atas** tabel | |
| RES-09 | Ukuran sentuh | Lebar 375 px, ketuk link kecil (Detail, Ubah, Lihat semua) | Mudah diketuk dengan jari, tidak salah sasaran | |

## 12. Ketahanan

| ID | Skenario | Langkah | Hasil yang diharapkan | Hasil |
|---|---|---|---|---|
| ERR-01 | Backend mati saat login | Matikan backend, coba login | Pesan "Server tidak dapat dihubungi…", bukan halaman rusak | |
| ERR-02 | Database mati | Matikan MongoDB, coba login | Pesan "Server sedang bermasalah…"; **tidak** menampilkan detail teknis (mis. `ECONNREFUSED`) | |
| ERR-03 | Halaman tidak ada | Buka `/asal-asalan` | Halaman 404 dengan tombol kembali ke beranda | |
| ERR-04 | Setoran tidak ada | Buka `/kelola/setoran/000000000000000000000000` | Halaman 404, bukan error | |
| ERR-05 | Klik ganda | Klik tombol "Daftar"/"Simpan" dua kali cepat | Hanya satu data tersimpan; tombol nonaktif saat memproses | |
| ERR-06 | Tanpa JavaScript | Matikan JavaScript di browser, lalu login | Form tetap terkirim dan login berhasil (progressive enhancement) | |

---

## 13. Rekap hasil

| Bagian | Jumlah skenario | ✅ | ❌ |
|---|---|---|---|
| Publik | 7 | | |
| Daftar | 9 | | |
| Masuk & keluar | 9 | | |
| Hak akses | 7 | | |
| Catat setoran | 12 | | |
| Riwayat & nasabah | 6 | | |
| Penarikan | 10 | | |
| Admin | 11 | | |
| Nasabah | 6 | | |
| Responsif | 9 | | |
| Ketahanan | 6 | | |
| **Total** | **92** | | |

Penguji: ____________ Tanggal: ____________ Browser/perangkat: ____________
