// Logout: hapus cookie token lalu kembali ke /login.
// POST dipakai tombol "Keluar"; GET dipakai saat token ditolak backend:
//   /keluar?alasan=sesi  → token kedaluwarsa / akun dihapus (401)
//   /keluar?alasan=peran → peran akun diubah admin (token menyimpan peran lama)

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { TOKEN_COOKIE } from "@/lib/auth/token";

const ALASAN = new Set(["sesi", "peran"]);

async function logout(request: Request) {
  (await cookies()).delete(TOKEN_COOKIE);
  const login = new URL("/login", request.url);
  const alasan = new URL(request.url).searchParams.get("alasan");
  if (alasan && ALASAN.has(alasan)) login.searchParams.set("alasan", alasan);
  return NextResponse.redirect(login, 303);
}

export { logout as GET, logout as POST };
