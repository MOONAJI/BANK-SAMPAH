import type { WasteSummaryItem } from "@/types/api";
import { formatKg } from "@/lib/format";

/** Grafik batang horizontal: berat per jenis sampah (dashboard). */
export function HorizontalWeightBars({ items }: { items: WasteSummaryItem[] }) {
  if (items.length === 0) return <p className="py-8 text-center text-sm text-muted">Belum ada data setoran.</p>;
  const max = Math.max(...items.map((i) => i.total_weight_kg), 1);
  return (
    <ul className="flex flex-col gap-2.5">
      {items.map((i) => (
        <li key={i.waste_name} className="grid grid-cols-[minmax(0,9rem)_1fr_4.5rem] items-center gap-3 text-sm">
          <span className="truncate text-neutral-600" title={i.waste_name}>
            {i.waste_name}
          </span>
          <span className="h-3 rounded-full bg-neutral-100">
            <span
              className="block h-full rounded-full bg-orange-500"
              style={{ width: `${Math.max((i.total_weight_kg / max) * 100, 2)}%` }}
            />
          </span>
          <span className="text-right text-neutral-600 tabular-nums">{formatKg(i.total_weight_kg)}</span>
        </li>
      ))}
    </ul>
  );
}

/** Grafik batang vertikal: berat per jenis sampah (laporan). */
export function VerticalWeightBars({ items }: { items: WasteSummaryItem[] }) {
  if (items.length === 0) return <p className="py-8 text-center text-sm text-muted">Belum ada data setoran.</p>;
  const max = Math.max(...items.map((i) => i.total_weight_kg), 1);
  return (
    <figure>
      <div
        className="flex h-56 items-end gap-2 border-b border-neutral-400 px-1 sm:gap-3"
        role="img"
        aria-label={items.map((i) => `${i.waste_name} ${formatKg(i.total_weight_kg)}`).join(", ")}
      >
        {items.map((i) => (
          <div key={i.waste_name} className="flex h-full min-w-0 flex-1 flex-col justify-end" title={`${i.waste_name}: ${formatKg(i.total_weight_kg)}`}>
            <span className="mb-1 text-center text-xs text-muted tabular-nums">{Math.round(i.total_weight_kg)}</span>
            <span className="block rounded-t bg-orange-500" style={{ height: `${Math.max((i.total_weight_kg / max) * 100, 2)}%` }} />
          </div>
        ))}
      </div>
      <figcaption className="mt-2 flex gap-2 px-1 sm:gap-3" aria-hidden>
        {items.map((i) => (
          <span key={i.waste_name} className="min-w-0 flex-1 truncate text-center text-xs text-muted" title={i.waste_name}>
            {i.waste_name}
          </span>
        ))}
      </figcaption>
    </figure>
  );
}
