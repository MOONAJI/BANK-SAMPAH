import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { TOKEN_COOKIE, TOKEN_MAX_AGE, decodeToken } from "./token";

export async function getToken() {
  return (await cookies()).get(TOKEN_COOKIE)?.value ?? null;
}

/**
 * Simpan token setelah login/daftar berhasil (dipanggil dari Server Action halaman login & daftar):
 *   const res = await apiFetch<{ token: string; user: User }>("/auth/login", { method: "POST", body });
 *   await setToken(res.token);
 *   redirect(homeFor(res.user.role));
 */
export async function setToken(token: string) {
  (await cookies()).set(TOKEN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: TOKEN_MAX_AGE,
  });
}

/**
 * Sesi ringan dari isi JWT (id + role), tanpa memanggil backend.
 * Membaca cookie dan decode JWT sangat murah, jadi tidak perlu React.cache.
 *
 * Catatan: di `next dev` (Next 16.4.5) form yang dikirim SEBELUM JavaScript aktif bisa
 * memunculkan "InvariantError … cookies or mutableCookies" di log. Itu bug pemeriksaan
 * khusus mode dev di Next.js; di `next build && next start` tidak terjadi dan halaman tetap benar.
 */
export async function getSession() {
  return decodeToken(await getToken());
}

/** Untuk halaman terproteksi: ke /login bila belum masuk. */
export async function requireSession() {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}
