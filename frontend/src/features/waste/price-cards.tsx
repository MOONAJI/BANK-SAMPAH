import type { WasteCategory, WasteGroup } from "@/types/api";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

/** Kartu harga per golongan sampah (landing & /harga). */
export function PriceCards({
  categories,
  groups,
  maxPerGroup,
  showEmpty = false,
  className,
}: {
  categories: WasteCategory[];
  groups: WasteGroup[];
  maxPerGroup?: number;
  showEmpty?: boolean;
  className?: string;
}) {
  const cards = groups
    .map((group) => {
      const items = categories.filter((c) => c.category_group === group);
      return { group, items: maxPerGroup ? items.slice(0, maxPerGroup) : items };
    })
    .filter((c) => showEmpty || c.items.length > 0);

  return (
    <div className={cn("grid items-start gap-4 sm:grid-cols-2 lg:grid-cols-4", className)}>
      {cards.map(({ group, items }) => (
        <section key={group} className="rounded-(--radius-card) border border-line bg-surface px-5 pt-4 pb-2">
          <h3 className="border-b border-line pb-3 text-sm font-semibold tracking-wider text-brand uppercase">{group}</h3>
          {items.length === 0 ? (
            <p className="py-4 text-sm text-muted">Belum ada jenis sampah di golongan ini.</p>
          ) : (
            <ul className="divide-y divide-line">
              {items.map((c) => (
                <li key={c._id} className="flex items-start justify-between gap-3 py-3">
                  <span className="text-[0.95rem]">{c.name}</span>
                  <span className="shrink-0 font-semibold tabular-nums">
                    Rp {formatNumber(c.price_per_kg)}
                    <span className="text-xs font-normal text-muted">/{c.unit || "kg"}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </div>
  );
}

export function PriceUnavailable() {
  return (
    <p className="rounded-(--radius-card) border border-line bg-surface p-5 text-sm text-muted">
      Daftar harga belum bisa dimuat. Coba muat ulang halaman beberapa saat lagi.
    </p>
  );
}
