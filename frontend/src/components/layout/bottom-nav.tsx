"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { activeHref, NASABAH_NAV } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { NavIcon } from "./nav-icon";

/** Halaman alur (satu tugas) yang tampil tanpa bottom nav, sesuai desain. */
const HIDDEN_ON = ["/nasabah/penarikan/baru"];

export function BottomNav() {
  const pathname = usePathname();
  if (HIDDEN_ON.includes(pathname)) return null;
  const current = activeHref(
    pathname,
    NASABAH_NAV.map((i) => i.href),
  );

  return (
    <nav
      aria-label="Navigasi utama"
      className="no-print fixed bottom-0 z-20 grid w-full max-w-md grid-cols-5 border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] md:max-w-2xl"
    >
      {NASABAH_NAV.map((item) => {
        const active = item.href === current;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex h-[4.5rem] flex-col items-center justify-center gap-1 border-t-[3px] text-xs",
              active ? "border-emerald-600 font-semibold text-emerald-600" : "border-transparent text-ink",
            )}
          >
            <NavIcon name={item.icon} className="size-6" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
