// Label Bahasa Indonesia untuk nilai enum dari backend.

import type { EwalletProvider, Role, WasteGroup, WithdrawalMethod, WithdrawalStatus } from "@/types/api";

export const ROLE_LABEL: Record<Role, string> = {
  admin: "Admin",
  petugas: "Petugas",
  nasabah: "Nasabah",
};

export const WITHDRAWAL_STATUS_LABEL: Record<WithdrawalStatus, string> = {
  PENDING: "Menunggu",
  APPROVED: "Disetujui",
  REJECTED: "Ditolak",
};

export const WITHDRAWAL_METHOD_LABEL: Record<WithdrawalMethod, string> = {
  TUNAI: "Tunai di pos",
  E_WALLET: "E-wallet",
  BANK_TRANSFER: "Transfer bank",
};

export const PROVIDER_LABEL: Record<EwalletProvider, string> = {
  GOPAY: "GoPay",
  OVO: "OVO",
  DANA: "DANA",
  SHOPEEPAY: "ShopeePay",
  BANK_TRANSFER: "Rekening bank",
  TUNAI: "Tunai",
  LAINNYA: "Lainnya",
};

export const WASTE_GROUPS: WasteGroup[] = ["Plastik", "Kertas", "Logam", "Kaca", "Lainnya"];

/** Nominal minimal penarikan (sama dengan validasi backend). */
export const MIN_WITHDRAWAL = 1000;

/** Jumlah baris per halaman tabel. */
export const PAGE_SIZE = 20;

/**
 * Lokasi pos penimbangan untuk landing page (contoh untuk tugas, bukan bank sampah RW 05 sungguhan).
 * Nomor telepon tempat aslinya sengaja tidak dicantumkan.
 * Ganti data di sini saja bila lokasi berubah; peta & tombol Google Maps ikut menyesuaikan.
 */
export const POS_LOCATION = {
  name: "Bank Sampah Simul 5",
  address: "Jl. Sidomulyo No. 345, Bener, Kec. Tegalrejo, Kota Yogyakarta, Daerah Istimewa Yogyakarta 55243",
  lat: -7.7791859,
  lng: 110.3559197,
  /** Halaman tempat di Google Maps (parameter pelacak dari URL asli sudah dibuang). */
  mapsUrl:
    "https://www.google.com/maps/place/Bank+sampah+simul+5/@-7.7791859,110.3559197,17z/data=!3m1!4b1!4m6!3m5!1s0x2e7a59e08d43c32b:0x4d758b5e92001d11!8m2!3d-7.7791859!4d110.3559197!16s%2Fg%2F11j0c4b_7n",
  schedule: [
    { days: "Senin – Jumat", hours: "09.00 – 17.00 WIB" },
    { days: "Sabtu", hours: "Buka 24 jam" },
    { days: "Minggu", hours: "09.00 – 17.00 WIB" },
  ],
} as const;

/** Peta Google Maps untuk <iframe>, tanpa API key. */
export const POS_MAP_EMBED_URL = `https://maps.google.com/maps?q=${POS_LOCATION.lat},${POS_LOCATION.lng}&z=17&hl=id&output=embed`;
