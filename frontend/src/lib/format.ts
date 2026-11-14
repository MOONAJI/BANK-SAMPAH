const TZ = "Asia/Jakarta";

const rupiah = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });
const number = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 2 });
const kgFmt = new Intl.NumberFormat("id-ID", { minimumFractionDigits: 1, maximumFractionDigits: 2 });

/** 15000 → "Rp 15.000" */
export const formatRupiah = (value: number) => rupiah.format(value).replace(/ /g, " ");

/** 15000 → "15.000" */
export const formatNumber = (value: number) => number.format(value);

/** 2.5 → "2,5 kg" */
export const formatKg = (value: number) => `${kgFmt.format(value)} kg`;

const fmt = (opts: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("id-ID", { timeZone: TZ, ...opts });

/** "8 Nov" */
export const formatDayMonth = (iso: string) => fmt({ day: "numeric", month: "short" }).format(new Date(iso));

/** "8 Nov 2026" */
export const formatDate = (iso: string) =>
  fmt({ day: "numeric", month: "short", year: "numeric" }).format(new Date(iso));

/** "8 Nov 2026 · 09.12" */
export const formatDateTime = (iso: string) => {
  const d = new Date(iso);
  return `${formatDate(iso)} · ${fmt({ hour: "2-digit", minute: "2-digit" }).format(d)}`;
};

/** "09.12" */
export const formatTime = (iso: string) => fmt({ hour: "2-digit", minute: "2-digit" }).format(new Date(iso));

/** "NOVEMBER 2026" — untuk pengelompokan buku tabungan */
export const formatMonthYear = (iso: string) => fmt({ month: "long", year: "numeric" }).format(new Date(iso));

/** "Selasa, 10 November 2026" */
export const formatLongDate = (date: Date) =>
  fmt({ weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(date);

/**
 * Rentang tanggal dari input <input type="date"> (dibaca sebagai hari WIB) untuk filter backend.
 * Zona waktu ditulis eksplisit; tanpa itu backend membaca "2026-11-14" sebagai UTC sehingga
 * transaksi pukul 00.00–06.59 WIB ikut hilang. Kosong bila salah satu tanggal belum diisi.
 */
export function wibDateRange(dari?: string, sampai?: string) {
  if (!dari || !sampai) return {};
  return { startDate: `${dari}T00:00:00+07:00`, endDate: `${sampai}T23:59:59.999+07:00` };
}

/** Sapaan sesuai jam di WIB. */
export function greeting(date: Date) {
  const hour = Number(fmt({ hour: "numeric", hour12: false }).format(date));
  if (hour < 11) return "Selamat pagi";
  if (hour < 15) return "Selamat siang";
  if (hour < 18) return "Selamat sore";
  return "Selamat malam";
}
