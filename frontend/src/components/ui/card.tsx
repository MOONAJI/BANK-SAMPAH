import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

const CARD_BORDER = {
  default: "border border-line",
  strong: "border-2 border-ink",
  success: "border-2 border-emerald-600",
} as const;

/**
 * Kotak putih berbingkai. Bingkai diatur lewat `tone`, bukan className:
 * cn() hanya menggabungkan class, jadi "border-2" yang ditumpuk di atas "border" hasilnya tidak pasti.
 */
export function Card({ className, tone = "default", ...props }: ComponentProps<"section"> & { tone?: keyof typeof CARD_BORDER }) {
  return <section className={cn("rounded-(--radius-card) bg-surface", CARD_BORDER[tone], className)} {...props} />;
}

export function CardTitle({ children, action, className }: { children: ReactNode; action?: ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-center justify-between gap-3", className)}>
      <h2 className="text-base font-semibold">{children}</h2>
      {action}
    </div>
  );
}

/** Angka ringkasan: label kecil, nilai besar, keterangan. */
export function StatCard({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) {
  return (
    <Card className="p-5">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 text-[1.65rem] leading-tight font-bold tracking-tight tabular-nums">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </Card>
  );
}
