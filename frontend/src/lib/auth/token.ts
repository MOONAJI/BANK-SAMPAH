// Helper token yang aman dipakai di proxy.ts maupun di server.
// Isi JWT hanya DIBACA (tanpa verifikasi) untuk keperluan redirect;
// otorisasi sebenarnya tetap dilakukan backend di setiap request.

import type { Role } from "@/types/api";

/** Nama cookie tempat token JWT dari POST /api/auth/login disimpan. */
export const TOKEN_COOKIE = "bs_token";
export const TOKEN_MAX_AGE = 60 * 60 * 24 * 7; // sama dengan JWT_EXPIRES_IN backend (7d)

export interface TokenPayload {
  id: string;
  role: Role;
  iat: number;
  exp: number;
}

/**
 * Baca isi JWT. Kirim `now` (mis. Date.now() di proxy) untuk sekaligus menolak token kedaluwarsa.
 * Di Server Component `now` sengaja tidak dikirim: membaca jam saat prerender dilarang oleh
 * Cache Components, dan token kedaluwarsa tetap ditolak backend (401 → /keluar).
 */
export function decodeToken(token: string | undefined | null, now?: number): TokenPayload | null {
  if (!token) return null;
  try {
    const part = token.split(".")[1];
    const base64 = part.replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, "="))) as Partial<TokenPayload>;
    if (!payload.id || !payload.role) return null;
    if (now !== undefined && payload.exp && payload.exp * 1000 < now) return null;
    return payload as TokenPayload;
  } catch {
    return null;
  }
}

/** Halaman awal tiap peran setelah login. */
export function homeFor(role: Role) {
  return role === "nasabah" ? "/nasabah" : "/kelola";
}
