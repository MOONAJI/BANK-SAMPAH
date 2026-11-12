# Rancangan UI/UX & Struktur Frontend — Bank Sampah RW 05

Dokumen ini adalah struktur kasar (low-fidelity) untuk frontend Next.js. Semua halaman sudah dibuat di `frontend/src/app` dalam bentuk wireframe: kotak bergaris putus-putus berisi nama bagian dan endpoint backend yang akan dipakai. Jalankan `npm run dev` di folder `frontend` untuk melihatnya.

Yang sudah berfungsi penuh: landing page, halaman harga (data asli), login, daftar, logout, penjaga rute per peran, beranda nasabah (saldo + 5 mutasi terakhir), dan dashboard petugas/admin (statistik).

---

## 1. Siapa penggunanya

| Peran | Konteks pemakaian | Perangkat utama | Yang paling penting bagi mereka |
| --- | --- | --- | --- |
| **Nasabah** (warga) | Cek saldo di rumah, ajukan penarikan | HP | Saldo terlihat jelas, riwayat mudah dibaca, bahasa sederhana |
| **Petugas** | Di pos timbang, melayani antrean warga | Laptop / tablet | Input setoran secepat mungkin, minim klik, angka besar |
| **Admin** | Mengatur harga & akun, melihat laporan | Laptop | Tabel yang bisa difilter, ekspor CSV |

Prinsip desain yang diturunkan dari tabel di atas:

1. **Mobile-first untuk nasabah**: navigasi bawah (bottom nav) di HP, sidebar di desktop.
2. **Satu layar utama untuk petugas**: "Catat Setoran" bisa dibuka dari mana saja (tombol di dashboard, sidebar, bottom nav).
3. **Uang selalu tampil dalam Rupiah lengkap** (`Rp 15.000`) dengan angka tabular, hijau untuk masuk, merah untuk keluar.
4. **Status selalu berwarna sama**: Menunggu = kuning, Disetujui = hijau, Ditolak = merah.
5. **Tidak ada aksi uang tanpa konfirmasi**: setujui/tolak penarikan dan simpan setoran selalu menampilkan ringkasan dulu.

---

## 2. Sitemap

```
Publik
├── /                      Landing: hero, cara kerja, harga hari ini, lokasi pos
├── /harga                 Katalog harga per kg (semua jenis)
├── /login                 Masuk (semua peran)
└── /daftar                Daftar sebagai nasabah

Nasabah  (/nasabah/*)
├── /nasabah               Beranda: kartu saldo, mutasi terakhir, status penarikan
├── /nasabah/tabungan      Buku tabungan (ledger CREDIT/DEBIT)
├── /nasabah/setoran       Riwayat setoran
│   └── /[id]              Detail setoran (struk digital)
├── /nasabah/penarikan     Riwayat pengajuan penarikan
│   └── /baru              Form ajukan penarikan (3 langkah)
└── /profil                Data diri + tujuan pencairan (e-wallet/bank)

Petugas & Admin  (/kelola/*)
├── /kelola                Dashboard statistik + peringatan penarikan menunggu
├── /kelola/setoran/baru   ★ Catat setoran (layar utama petugas)
├── /kelola/setoran        Riwayat semua setoran + filter tanggal + CSV
│   └── /[id]              Detail setoran
├── /kelola/penarikan      Antrean verifikasi penarikan
├── /kelola/nasabah        Cari nasabah
│   └── /[id]              Profil nasabah + buku tabungan + riwayat
├── /kelola/laporan        Rekap per jenis sampah + ekspor CSV
├── /kelola/jenis-sampah   (admin) Kelola jenis & harga
├── /kelola/pengguna       (admin) Kelola akun semua peran
└── /profil                Data diri
```

Aturan akses (di `src/proxy.ts`, backend tetap jadi penjaga utama):

| Rute | Nasabah | Petugas | Admin | Belum login |
| --- | --- | --- | --- | --- |
| `/`, `/harga` | ✓ | ✓ | ✓ | ✓ |
| `/login`, `/daftar` | → beranda | → dashboard | → dashboard | ✓ |
| `/nasabah/*` | ✓ | → `/kelola` | → `/kelola` | → `/login` |
| `/kelola/*` | → `/nasabah` | ✓ | ✓ | → `/login` |
| `/kelola/jenis-sampah`, `/kelola/pengguna` | → `/nasabah` | → `/kelola` | ✓ | → `/login` |
| `/profil` | ✓ | ✓ | ✓ | → `/login` |

### Halaman ↔ endpoint

| Halaman | Endpoint |
| --- | --- |
| `/`, `/harga` | `GET /waste-categories` |
| `/login`, `/daftar` | `POST /auth/login`, `POST /auth/register` |
| `/nasabah` | `GET /ledger/my-history?limit=5`, `GET /withdrawals/my-withdrawals?limit=3`, `GET /deposits/my-deposits?limit=1` |
| `/nasabah/tabungan` | `GET /ledger/my-history?page&limit` |
| `/nasabah/setoran`, `/[id]` | `GET /deposits/my-deposits`, `GET /deposits/:id` |
| `/nasabah/penarikan`, `/baru` | `GET /withdrawals/my-withdrawals`, `POST /withdrawals` |
| `/profil` | `GET /auth/me`, `PUT /auth/me` |
| `/kelola` | `GET /reports/dashboard`, `GET /reports/waste-summary`, `GET /deposits?limit=5` |
| `/kelola/setoran/baru` | `GET /users?role=nasabah&search=`, `GET /waste-categories`, `POST /deposits` |
| `/kelola/setoran`, `/[id]` | `GET /deposits?…`, `GET /deposits/:id`, `/api/export/deposits` |
| `/kelola/penarikan` | `GET /withdrawals?status=PENDING`, `PATCH /withdrawals/:id/status` |
| `/kelola/nasabah`, `/[id]` | `GET /users?role=nasabah`, `GET /users/:id`, `GET /ledger/user/:id`, `/api/export/ledger?user_id=` |
| `/kelola/laporan` | `GET /reports/dashboard`, `GET /reports/waste-summary`, `/api/export/*` |
| `/kelola/jenis-sampah` | `GET /waste-categories?all=true`, `POST/PUT/DELETE /waste-categories/:id` |
| `/kelola/pengguna` | `GET/POST /users`, `PUT/DELETE /users/:id` |

---

## 3. Alur utama (user flow)

### A. Petugas mencatat setoran (paling sering dipakai)

```
Dashboard ──[+ Catat setoran]──▶ Catat Setoran
  1. Ketik nama/HP nasabah ─▶ pilih ─▶ saldo nasabah tampil
  2. Pilih jenis sampah ─▶ ketik berat (kg) ─▶ subtotal otomatis
     [+ Tambah jenis] untuk baris berikutnya
  3. Panel ringkasan: total kg, total Rp, saldo sebelum → sesudah
  4. [Simpan setoran] ─▶ POST /deposits
        ├─ sukses ─▶ layar sukses (kode DEP-…, saldo baru)
        │            ├─ [Catat setoran berikutnya] (form kosong, fokus ke cari nasabah)
        │            └─ [Lihat struk]
        └─ gagal ─▶ pesan dari backend di atas form, isian tidak hilang
```

### B. Nasabah menarik saldo

```
Beranda ──[Tarik saldo]──▶ Ajukan Penarikan
  1. Nominal (tombol cepat 10rb / 25rb / 50rb / Semua), cek ≥ Rp 1.000 dan ≤ saldo
  2. Metode: Tunai di pos · E-wallet · Transfer bank (tujuan terisi dari profil)
  3. Konfirmasi ─▶ POST /withdrawals ─▶ status "Menunggu"
  ─▶ Riwayat Penarikan: badge kuning sampai diproses petugas
```

### C. Petugas memverifikasi penarikan

```
Dashboard (banner "3 pengajuan menunggu") ─▶ Verifikasi Penarikan [tab Menunggu]
  Kartu: nasabah, saldo sekarang, nominal, metode & tujuan
  ├─ [Setujui] ─▶ dialog konfirmasi ─▶ PATCH status=APPROVED ─▶ saldo dipotong
  └─ [Tolak]   ─▶ dialog + alasan wajib ─▶ PATCH status=REJECTED
  Peringatan merah bila saldo < nominal (backend juga akan menolak)
```

### D. Admin mengubah harga

```
Jenis & Harga Sampah ─▶ edit harga ─▶ PUT /waste-categories/:id
  ─▶ updateTag('waste-categories') ─▶ halaman /harga publik ikut berubah
  Catatan di layar: "Perubahan harga hanya berlaku untuk setoran berikutnya."
```

### E. Login

```
/login ─▶ Server Action ─▶ POST /auth/login ─▶ token disimpan di cookie httpOnly
  ├─ nasabah        ─▶ /nasabah
  └─ petugas/admin  ─▶ /kelola
Token kedaluwarsa (401 dari backend) ─▶ /keluar ─▶ cookie dihapus ─▶ /login
```

---

## 4. Wireframe layar kunci

### Beranda nasabah (HP)

```
┌──────────────────────────────┐
│ BS Bank Sampah RW 05   (AB)  │  topbar
├──────────────────────────────┤
│ Beranda                      │
│ ┌──────────────────────────┐ │
│ │ Saldo tabungan           │ │  kartu hijau
│ │ Rp 125.000               │ │
│ │ [Tarik saldo] Buku tab.  │ │
│ └──────────────────────────┘ │
│ Mutasi terakhir   Lihat semua│
│ Setoran DEP-…    +Rp 12.000  │
│ Penarikan WD-…   −Rp 50.000  │
│ ┌ Penarikan diproses ──────┐ │
│ │ Rp 50.000 · Menunggu     │ │
│ └──────────────────────────┘ │
├──────────────────────────────┤
│Beranda Tabungan Setoran Tarik Profil│ bottom nav
└──────────────────────────────┘
```

### Catat setoran (petugas, desktop)

```
┌ Sidebar ┬──────────────────────────────────────────────────────┐
│Dashboard│ Catat Setoran                                        │
│Catat ★  │ ┌ 1. Nasabah ───────────────────┐ ┌ Ringkasan ─────┐ │
│Riwayat  │ │ [🔍 cari nama / HP        ]   │ │ Total  7,5 kg  │ │
│Penarikan│ │ Siti Aminah · saldo Rp 40.000 │ │ Rp 21.500      │ │
│Nasabah  │ └───────────────────────────────┘ │ Saldo:         │ │
│Laporan  │ ┌ 2. Rincian timbangan ─────────┐ │ 40.000→61.500  │ │
│─ Admin ─│ │ [Botol PET ▾] [ 3,5 ] kg  Rp… ✕│ │                │ │
│Harga    │ │ [Kardus    ▾] [ 4,0 ] kg  Rp… ✕│ │[Simpan setoran]│ │
│Pengguna │ │ [+ Tambah jenis]              │ └────────────────┘ │
│         │ └───────────────────────────────┘   (sticky)         │
└─────────┴──────────────────────────────────────────────────────┘
```

### Verifikasi penarikan

```
[ Menunggu (3) ] [ Disetujui ] [ Ditolak ] [ Semua ]
┌────────────────────────────────────────────────────────────┐
│ Budi Santoso · saldo Rp 80.000          diajukan 2 jam lalu │
│ Rp 50.000 · E-wallet DANA 0812… a.n. Budi                   │
│                                     [Tolak]  [Setujui]      │
└────────────────────────────────────────────────────────────┘
```

---

## 5. Design system

### Warna (token di `src/app/globals.css`, dipakai sebagai class Tailwind)

| Token | Nilai | Dipakai untuk |
| --- | --- | --- |
| `brand-700` | `#1b5e3b` | Tombol utama, kartu saldo, menu aktif |
| `brand-50` / `brand-100` | `#eef7f1` / `#d6ecde` | Latar menu aktif, avatar |
| `canvas` | `#f7f6f2` | Latar halaman (nuansa kertas buku tabungan) |
| `surface` | `#ffffff` | Kartu, tabel, form |
| `line` | `#e4e2db` | Garis & border |
| `ink` / `muted` | `#1d1c19` / `#6b6860` | Teks utama / teks pendukung |
| `success` (+`-soft`) | `#1f7a4d` | Uang masuk, Disetujui |
| `warning` (+`-soft`) | `#9a6200` | Menunggu |
| `danger` (+`-soft`) | `#b42318` | Uang keluar, Ditolak, error form |

### Tipografi

- Font: **Plus Jakarta Sans** (`next/font/google`), dirancang di Indonesia dan nyaman dibaca.
- Judul halaman `text-2xl font-bold`, judul kartu `text-base font-semibold`, isi `text-base`, keterangan `text-sm text-muted`.
- Angka uang & berat selalu `tabular-nums` supaya kolom rata.

### Komponen dasar (`src/components/ui`)

| Komponen | Status | Catatan |
| --- | --- | --- |
| `Button`, `ButtonLink` | ada | varian primary / secondary / ghost / danger, ukuran md / lg |
| `Card`, `CardHeader`, `StatCard` | ada | |
| `Badge` | ada | tone neutral / brand / success / warning / danger |
| `Field` | ada | label + input + pesan error/hint terhubung `aria-describedby` |
| `FormAlert` | ada | pesan error umum dari backend |
| `Skeleton` | ada | fallback `<Suspense>` |
| `Select`, `Textarea` | perlu dibuat | mengikuti gaya `Field` |
| `Dialog` | perlu dibuat | konfirmasi setujui/tolak, form jenis sampah & pengguna (bisa pakai `<dialog>` native) |
| `DataTable` + `Pagination` | perlu dibuat | tabel desktop, berubah jadi daftar kartu di HP |
| `Tabs` / `SegmentedControl` | perlu dibuat | filter status & tipe mutasi, disimpan di URL |
| `Combobox` | perlu dibuat | cari nasabah di form setoran |
| `EmptyState` | perlu dibuat | "Belum ada setoran…" + ajakan bertindak |
| `Toast` | perlu dibuat | notifikasi sukses setelah aksi |

### Microcopy

- Bahasa santai tapi sopan, pakai "kamu" untuk nasabah.
- Tombol berisi kata kerja: "Simpan setoran", "Ajukan penarikan", "Setujui", bukan "OK" atau "Submit".
- Pesan error menjelaskan cara memperbaiki: "Gunakan format nomor Indonesia, contoh 08123456789."
- Label enum dari backend diterjemahkan lewat `src/lib/constants.ts` (mis. `PENDING` → "Menunggu").

---

## 6. Struktur frontend

```
frontend/
├── .env.example                 API_URL=http://localhost:5000/api
└── src/
    ├── proxy.ts                 Penjaga rute per peran (Next 16: pengganti middleware)
    ├── app/
    │   ├── layout.tsx           Root: font, metadata, lang="id"
    │   ├── globals.css          Design token
    │   ├── error.tsx            Error boundary root
    │   ├── not-found.tsx
    │   ├── keluar/route.ts      Logout (hapus cookie)
    │   ├── api/export/[type]/route.ts   Unduh CSV (teruskan token ke backend)
    │   ├── (public)/            Header + footer publik
    │   │   ├── page.tsx         Landing
    │   │   └── harga/page.tsx
    │   ├── (auth)/              Kartu di tengah layar
    │   │   ├── login/page.tsx
    │   │   └── daftar/page.tsx
    │   └── (app)/               Sidebar + topbar + bottom nav
    │       ├── layout.tsx
    │       ├── error.tsx
    │       ├── profil/
    │       ├── nasabah/…        (lihat sitemap)
    │       └── kelola/…
    ├── components/
    │   ├── ui/                  Komponen dasar tanpa logika bisnis
    │   ├── layout/              Logo, header publik, sidebar, topbar, nav
    │   └── wireframe.tsx        Penanda bagian yang belum dibangun (hapus bertahap)
    ├── features/                Komponen + Server Action per domain
    │   ├── auth/                actions.ts, login-form, register-form, current-user
    │   ├── ledger/              balance-summary
    │   ├── reports/             dashboard-stats
    │   └── waste/               price-list
    │   (tambahkan: deposits/, withdrawals/, users/ dengan pola yang sama)
    ├── lib/
    │   ├── api/                 Satu file per modul backend: auth, waste, deposits,
    │   │                        withdrawals, ledger, reports, users + client.ts
    │   ├── auth/                token.ts (decode JWT, aman untuk proxy), session.ts (cookie)
    │   ├── config.ts            API_URL, APP_NAME
    │   ├── constants.ts         Label enum & warna status
    │   ├── format.ts            formatRupiah, formatKg, formatDate
    │   ├── navigation.ts        Menu per peran + daftar rute khusus admin
    │   ├── validation.ts        Aturan validasi (sama dengan backend)
    │   └── utils.ts             cn()
    └── types/api.ts             Tipe data sesuai model & response backend
```

### Arsitektur data

```
Browser ──(form / link)──▶ Next.js server ──(fetch + Bearer token)──▶ Express API ──▶ MongoDB
              ▲                    │
              └── cookie httpOnly ─┘  (token tidak pernah bisa dibaca JavaScript di browser)
```

- **Membaca data**: Server Component memanggil fungsi di `lib/api/*` (mis. `getMyLedger()`), dibungkus `<Suspense>` dengan skeleton. Next.js 16 dengan `cacheComponents` mewajibkan ini untuk data yang membaca cookie.
- **Mengubah data**: Server Action di `features/<domain>/actions.ts` → validasi → panggil `lib/api/*` → `refresh()` / `revalidatePath()` / `updateTag()` → kembalikan pesan ke form lewat `useActionState`.
- **Data publik** (harga sampah): `'use cache'` + `cacheLife('minutes')` + `cacheTag('waste-categories')`, jadi landing & halaman harga tampil instan.
- **Error**: `ApiError` membawa pesan dari backend dan ditampilkan apa adanya di form. 401 → `/keluar`. Error lain → `error.tsx`.
- **Filter & pagination** disimpan di URL (`?status=PENDING&page=2`) supaya bisa dibagikan dan tombol back berfungsi.
- **CORS**: semua request ke backend berjalan dari server Next.js, jadi CORS tidak dibutuhkan untuk alur ini.

### Pola menambah fitur baru (contoh: riwayat setoran nasabah)

1. Pastikan fungsi API sudah ada di `lib/api/deposits.ts` (`getMyDeposits`).
2. Buat komponen server `features/deposits/my-deposit-list.tsx` yang memanggilnya.
3. Di `app/(app)/nasabah/setoran/page.tsx`, ganti `<Wireframe>` dengan `<Suspense fallback={<Skeleton/>}><MyDepositList/></Suspense>`.
4. Untuk form: buat `actions.ts` + komponen form client dengan `useActionState`, ikuti `features/auth/`.

### Library yang disarankan (belum dipasang)

| Library | Untuk |
| --- | --- |
| `zod` | Skema validasi form yang dipakai bersama di client & Server Action |
| `lucide-react` | Ikon menu & tombol |
| `recharts` | Grafik berat per jenis sampah di dashboard & laporan |
| `sonner` | Toast notifikasi |

---

## 7. Catatan untuk backend

Hal-hal yang ditemukan saat memetakan UI dan mungkin perlu ditambah di backend:

1. **Tidak ada laporan per periode** (harian/bulanan). Dashboard hanya bisa menampilkan total keseluruhan; grafik tren butuh endpoint seperti `GET /reports/trend?period=month`.
2. **Petugas tidak bisa mendaftarkan nasabah** (`POST /users` hanya admin). Di pos, warga baru biasanya didaftarkan petugas.
3. **Nasabah tidak bisa membatalkan penarikan** yang masih `PENDING`.
4. **Tidak ada endpoint ganti kata sandi** (untuk diri sendiri maupun reset oleh admin).
5. **Tidak ada `GET /withdrawals/:id`**, jadi belum bisa membuat halaman detail penarikan.
6. `PUT /users/:id` menerima `isActive` tetapi model `User` tidak punya field itu, jadi nilainya diabaikan.
7. `GET /users` belum mendukung pagination seperti endpoint list lainnya.

---

## 8. Urutan pengerjaan yang disarankan

1. Komponen dasar yang kurang: `Select`, `Dialog`, `DataTable`, `Pagination`, `Tabs`, `EmptyState`.
2. **Catat Setoran** (inti penilaian & alur utama) + detail setoran.
3. **Verifikasi Penarikan** + **Ajukan Penarikan**.
4. Buku tabungan & riwayat (nasabah), daftar & detail nasabah (petugas).
5. Admin: Jenis & Harga Sampah, Pengguna.
6. Laporan + grafik + ekspor CSV.
7. Profil.
8. Nilai tambah: peta lokasi pos (Leaflet) di landing page.
