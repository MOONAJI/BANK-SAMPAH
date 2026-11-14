import type { Role } from "@/types/api";

export type NavIcon =
  | "dashboard"
  | "catat"
  | "riwayat"
  | "verifikasi"
  | "nasabah"
  | "laporan"
  | "jenis"
  | "pengguna"
  | "profil"
  | "beranda"
  | "tabungan"
  | "setoran"
  | "tarik";

export interface NavItem {
  href: string;
  label: string;
  icon: NavIcon;
  /** Tampilkan jumlah penarikan menunggu di samping menu. */
  badge?: "pending";
}

export interface NavSection {
  title?: string;
  items: NavItem[];
}

const STAFF_MAIN: NavSection = {
  items: [
    { href: "/kelola", label: "Dashboard", icon: "dashboard" },
    { href: "/kelola/setoran/baru", label: "Catat Setoran", icon: "catat" },
    { href: "/kelola/setoran", label: "Riwayat Setoran", icon: "riwayat" },
    { href: "/kelola/penarikan", label: "Verifikasi Penarikan", icon: "verifikasi", badge: "pending" },
    { href: "/kelola/nasabah", label: "Nasabah", icon: "nasabah" },
    { href: "/kelola/laporan", label: "Laporan", icon: "laporan" },
  ],
};

const STAFF_ADMIN: NavSection = {
  title: "Admin",
  items: [
    { href: "/kelola/jenis-sampah", label: "Jenis & Harga Sampah", icon: "jenis" },
    { href: "/kelola/pengguna", label: "Pengguna", icon: "pengguna" },
  ],
};

const STAFF_ACCOUNT: NavSection = { title: "Akun", items: [{ href: "/profil", label: "Profil", icon: "profil" }] };

/** Menu sidebar petugas & admin. */
export function staffNav(role: Role): NavSection[] {
  return role === "admin" ? [STAFF_MAIN, STAFF_ADMIN, STAFF_ACCOUNT] : [STAFF_MAIN, STAFF_ACCOUNT];
}

/** Bottom navigation nasabah. */
export const NASABAH_NAV: NavItem[] = [
  { href: "/nasabah", label: "Beranda", icon: "beranda" },
  { href: "/nasabah/tabungan", label: "Tabungan", icon: "tabungan" },
  { href: "/nasabah/setoran", label: "Setoran", icon: "setoran" },
  { href: "/nasabah/penarikan", label: "Tarik", icon: "tarik" },
  { href: "/profil", label: "Profil", icon: "profil" },
];

/** Halaman yang hanya boleh dibuka admin (dipakai proxy.ts). */
export const ADMIN_ONLY_PATHS = ["/kelola/jenis-sampah", "/kelola/pengguna"];

/** Menu aktif = href terpanjang yang cocok dengan pathname. */
export function activeHref(pathname: string, hrefs: string[]) {
  return hrefs
    .filter((href) => pathname === href || pathname.startsWith(href + "/"))
    .sort((a, b) => b.length - a.length)[0];
}
