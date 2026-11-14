import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-3 px-4 py-20 text-center">
      <p className="text-sm font-semibold text-brand">404</p>
      <h1 className="text-2xl font-bold">Halaman tidak ditemukan</h1>
      <p className="text-muted">Alamat yang kamu buka tidak ada atau sudah dipindahkan.</p>
      <ButtonLink href="/" className="mt-4">
        Kembali ke beranda
      </ButtonLink>
    </main>
  );
}
