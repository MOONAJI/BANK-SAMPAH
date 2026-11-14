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
