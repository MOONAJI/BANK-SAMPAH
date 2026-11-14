// Kerangka halaman nasabah (mobile-first): kolom selebar HP + bottom navigation.
// Mulai tablet (md) kolom dilebarkan supaya tidak terlihat seperti layar HP kecil di tengah layar besar.

import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronLeft } from "lucide-react";
import { BottomNav } from "./bottom-nav";

export function NasabahShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh justify-center bg-neutral-100">
      <div className="relative flex w-full max-w-md flex-col bg-canvas shadow-sm md:max-w-2xl">
        <div className="flex-1 pb-24">{children}</div>
        <BottomNav />
      </div>
    </div>
  );
}

/** Header halaman nasabah: judul, tombol kembali (opsional), aksi di kanan. */
export function MobileHeader({ title, backHref, action }: { title: string; backHref?: string; action?: ReactNode }) {
  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-1 border-b border-line bg-surface px-2 md:h-16 md:px-4">
      {backHref ? (
        <Link href={backHref} aria-label="Kembali" className="grid size-11 place-items-center rounded-lg hover:bg-neutral-100">
          <ChevronLeft className="size-5" aria-hidden />
        </Link>
      ) : (
        <span className="w-2" />
      )}
      <h1 className="flex-1 text-lg font-bold">{title}</h1>
      {action && <div className="pr-2">{action}</div>}
    </header>
  );
}

/** Isi halaman nasabah dengan jarak standar. */
export function MobileBody({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-4 p-4 md:gap-5 md:p-6">{children}</div>;
}
