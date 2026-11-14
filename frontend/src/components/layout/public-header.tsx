import { ButtonLink } from "@/components/ui/button";
import { Logo } from "./logo";
import { PublicNavLink } from "./public-nav-link";

export function PublicHeader() {
  return (
    <header className="border-b border-line bg-surface">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <Logo />
        <nav aria-label="Utama" className="flex items-center gap-1 sm:gap-3">
          {/* Dibungkus: cn() tidak menyelesaikan bentrok class, jadi "hidden" tidak boleh ditumpuk dengan "inline-flex". */}
          <div className="hidden sm:block">
            <PublicNavLink href="/harga">Harga Sampah</PublicNavLink>
          </div>
          <PublicNavLink href="/login">Masuk</PublicNavLink>
          <ButtonLink href="/daftar">Daftar</ButtonLink>
        </nav>
      </div>
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="mt-auto border-t border-line bg-surface">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-sm text-muted sm:flex-row sm:justify-between sm:px-6">
        <p>Bank Sampah RW 05 — pilah dari rumah, tabung di pos.</p>
        <p>Dibuat untuk warga RW 05</p>
      </div>
    </footer>
  );
}
