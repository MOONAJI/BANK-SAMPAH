// Next.js 16: "middleware" sekarang bernama "proxy".
// Pengecekan cepat dari isi JWT di cookie, hanya untuk redirect.
// Keamanan sebenarnya tetap di backend (protect + authorize).

import { NextResponse, type NextRequest } from "next/server";
import { TOKEN_COOKIE, decodeToken, homeFor } from "@/lib/auth/token";
import { ADMIN_ONLY_PATHS } from "@/lib/navigation";

const AUTH_PAGES = ["/login", "/daftar"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = decodeToken(request.cookies.get(TOKEN_COOKIE)?.value, Date.now());
  const to = (path: string) => NextResponse.redirect(new URL(path, request.url));

  // Sudah login → tidak perlu membuka halaman login/daftar lagi.
  if (AUTH_PAGES.includes(pathname)) {
    return session ? to(homeFor(session.role)) : NextResponse.next();
  }

  if (!session) {
    // Simpan tujuan awal supaya setelah masuk langsung kembali ke halaman itu.
    const login = new URL("/login", request.url);
    login.searchParams.set("next", pathname + request.nextUrl.search);
    return NextResponse.redirect(login);
  }

  const isStaff = session.role === "admin" || session.role === "petugas";
  if (pathname.startsWith("/nasabah") && isStaff) return to(homeFor(session.role));
  if (pathname.startsWith("/kelola") && !isStaff) return to(homeFor(session.role));
  if (ADMIN_ONLY_PATHS.some((p) => pathname.startsWith(p)) && session.role !== "admin") return to("/kelola");

  return NextResponse.next();
}

export const config = {
  matcher: ["/nasabah/:path*", "/kelola/:path*", "/profil", "/login", "/daftar"],
};
