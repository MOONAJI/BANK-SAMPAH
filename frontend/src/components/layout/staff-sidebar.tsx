"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Menu, X } from "lucide-react";
import { activeHref, type NavSection } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { Logo } from "./logo";
import { NavIcon } from "./nav-icon";

/**
 * Sidebar petugas & admin. Di layar < lg berubah jadi drawer yang dibuka tombol menu.
 * `pendingBadge` dirender di server (jumlah penarikan menunggu).
 */
export function StaffSidebar({ sections, pendingBadge }: { sections: NavSection[]; pendingBadge?: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const current = activeHref(
    pathname,
    sections.flatMap((s) => s.items.map((i) => i.href)),
  );

  const nav = (
    <nav aria-label="Menu" className="flex flex-col gap-5">
      {sections.map((section, i) => (
        <div key={section.title ?? i} className="flex flex-col gap-1">
          {section.title && (
            <p className="mb-1 px-3 text-xs font-semibold tracking-wider text-neutral-600 uppercase">{section.title}</p>
          )}
          {section.items.map((item) => {
            const active = item.href === current;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-10 items-center gap-3 rounded-lg px-3 py-2 text-[0.95rem] transition-colors",
                  active ? "bg-emerald-50 font-semibold text-ink" : "text-ink hover:bg-neutral-100",
                )}
              >
                <NavIcon name={item.icon} className="size-5 shrink-0" />
                <span className="flex-1">{item.label}</span>
                {item.badge === "pending" && pendingBadge}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );

  return (
    <>
      {/* Tombol menu (mobile) */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Buka menu"
        aria-expanded={open}
        className="fixed top-3 left-3 z-30 grid size-10 place-items-center rounded-lg border border-line bg-surface lg:hidden"
      >
        <Menu className="size-5" aria-hidden />
      </button>

      {/* Latar gelap saat drawer terbuka */}
      {open && <div className="fixed inset-0 z-40 bg-black/30 lg:hidden" onClick={() => setOpen(false)} aria-hidden />}

      <aside
        className={cn(
          "no-print fixed inset-y-0 left-0 z-50 flex w-64 flex-col gap-6 border-r border-line bg-surface px-3 py-4 transition-transform",
          "lg:sticky lg:top-0 lg:h-dvh lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between px-2">
          <Logo href="/kelola" />
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Tutup menu"
            className="grid size-9 place-items-center rounded-lg hover:bg-neutral-100 lg:hidden"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>
        <div className="overflow-y-auto">{nav}</div>
      </aside>
    </>
  );
}
