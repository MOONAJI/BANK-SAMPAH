import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface TabLink {
  href: string;
  label: ReactNode;
  active: boolean;
}

/**
 * Tab berbentuk segmented control (filter disimpan di URL).
 * "raised": tab aktif putih menonjol (desain petugas). "filled": tab aktif hijau (buku tabungan nasabah).
 */
export function SegmentedLinks({
  tabs,
  variant = "raised",
  label,
  className,
}: {
  tabs: TabLink[];
  variant?: "raised" | "filled";
  label: string;
  className?: string;
}) {
  return (
    <nav aria-label={label} className={cn("flex gap-1 overflow-x-auto rounded-xl bg-neutral-200/60 p-1 [scrollbar-width:none]", className)}>
      {tabs.map((t) => (
        <Link
          key={t.href}
          href={t.href}
          scroll={false}
          aria-current={t.active ? "page" : undefined}
          className={cn(
            "flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-lg px-2.5 text-sm font-medium whitespace-nowrap transition-colors sm:px-4",
            t.active
              ? variant === "filled"
                ? "bg-emerald-600 text-white"
                : "bg-surface font-semibold text-ink shadow-sm"
              : "text-neutral-600 hover:text-ink",
          )}
        >
          {t.label}
        </Link>
      ))}
    </nav>
  );
}

/** Chip filter bulat (golongan sampah, status penarikan). */
export function ChipLinks({
  tabs,
  label,
  accent = "neutral",
  className,
}: {
  tabs: TabLink[];
  label: string;
  accent?: "neutral" | "brand";
  className?: string;
}) {
  return (
    <nav aria-label={label} className={cn("flex gap-2 overflow-x-auto [scrollbar-width:none]", className)}>
      {tabs.map((t) => (
        <Link
          key={t.href}
          href={t.href}
          scroll={false}
          aria-current={t.active ? "page" : undefined}
          className={cn(
            "inline-flex h-9 shrink-0 items-center rounded-full border px-3 text-sm transition-colors sm:px-4",
            t.active
              ? accent === "brand"
                ? "border-emerald-700 bg-emerald-50 font-semibold text-brand"
                : "border-neutral-400 bg-neutral-200 font-semibold text-ink"
              : "border-neutral-300 bg-surface text-ink hover:bg-neutral-50",
          )}
        >
          {t.label}
        </Link>
      ))}
    </nav>
  );
}
