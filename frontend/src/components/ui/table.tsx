import Link from "next/link";
import type { ComponentProps, CSSProperties } from "react";
import { cn } from "@/lib/utils";

type Align = "left" | "right";

/** Link teks di dalam sel: area sentuh diperbesar (± 40px) tanpa mengubah tinggi baris. */
export const CELL_LINK = "-my-2.5 inline-block py-2.5";

/**
 * Kotak tabel yang responsif:
 * - Tablet/laptop (≥ md): tabel biasa; bila lebih sempit dari `minWidth` bisa digulir ke samping.
 * - HP (< md): tiap baris jadi kartu bertumpuk 2 kolom, judul kolom tampil dari `label` di <Td>,
 *   sehingga tidak perlu menggeser layar ke samping.
 */
export function TableBox({
  className,
  minWidth = 640,
  children,
}: {
  className?: string;
  /** Lebar minimum tabel (px) di tablet/laptop sebelum mulai bisa digulir ke samping. */
  minWidth?: number;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("overflow-x-auto rounded-(--radius-card) border border-line bg-surface", className)}>
      <table
        style={{ "--table-min": `${minWidth}px` } as CSSProperties}
        className={cn(
          "w-full border-collapse text-sm md:min-w-(--table-min)",
          // Mode kartu untuk HP
          "max-md:block max-md:[&_thead]:hidden max-md:[&_tbody]:block",
          "max-md:[&_tbody_tr]:grid max-md:[&_tbody_tr]:grid-cols-2 max-md:[&_tbody_tr]:gap-x-4 max-md:[&_tbody_tr]:gap-y-3",
          "max-md:[&_tbody_tr]:border-b max-md:[&_tbody_tr]:border-line max-md:[&_tbody_tr]:p-4 max-md:[&_tbody_tr:last-child]:border-b-0",
        )}
      >
        {children}
      </table>
    </div>
  );
}

export function Th({ className, align = "left", ...props }: ComponentProps<"th"> & { align?: Align }) {
  return (
    <th
      className={cn(
        "border-b border-line px-4 py-3 text-xs font-semibold tracking-wider text-neutral-600 uppercase",
        align === "right" ? "text-right" : "text-left",
        className,
      )}
      {...props}
    />
  );
}

/**
 * Sel tabel.
 * - `label`: judul kolom yang tampil di atas nilai saat mode kartu (HP).
 * - `full`: di HP sel memakai lebar penuh kartu (mis. nama, kode transaksi).
 * - `align`: perataan di tablet/laptop. Di HP sel kanan tetap rata kanan di kolom kanan kartu.
 */
export function Td({
  className,
  label,
  full,
  align = "left",
  ...props
}: ComponentProps<"td"> & { label?: string; full?: boolean; align?: Align }) {
  return (
    <td
      data-label={label}
      className={cn(
        "border-b border-line px-4 py-3 align-middle max-md:border-0 max-md:p-0",
        align === "right" && "text-right",
        full && "max-md:col-span-2 max-md:text-left",
        label &&
          "max-md:before:mb-0.5 max-md:before:block max-md:before:text-xs max-md:before:font-normal max-md:before:text-muted max-md:before:content-[attr(data-label)]",
        className,
      )}
      {...props}
    />
  );
}

export function EmptyRow({ colSpan, children }: { colSpan: number; children: React.ReactNode }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-10 text-center text-muted max-md:col-span-2">
        {children}
      </td>
    </tr>
  );
}

/** "Menampilkan 1–20 dari 57" + tombol Sebelumnya/Berikutnya. */
export function Pagination({
  page,
  totalPages,
  total,
  pageSize,
  hrefFor,
}: {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  hrefFor: (page: number) => string;
}) {
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  const btn = "inline-flex h-10 items-center rounded-lg border border-neutral-400 bg-surface px-3 text-sm";
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted">
      <span>
        Menampilkan {from}–{to} dari {total}
      </span>
      <div className="flex gap-2">
        {page > 1 ? (
          <Link href={hrefFor(page - 1)} className={cn(btn, "text-ink hover:bg-neutral-50")}>
            ‹ Sebelumnya
          </Link>
        ) : (
          <span className={cn(btn, "opacity-50")}>‹ Sebelumnya</span>
        )}
        {page < totalPages ? (
          <Link href={hrefFor(page + 1)} className={cn(btn, "text-ink hover:bg-neutral-50")}>
            Berikutnya ›
          </Link>
        ) : (
          <span className={cn(btn, "opacity-50")}>Berikutnya ›</span>
        )}
      </div>
    </div>
  );
}
