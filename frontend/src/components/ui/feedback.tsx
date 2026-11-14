import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Pesan error / sukses di atas form. */
export function FormAlert({ message, tone = "danger" }: { message?: string; tone?: "danger" | "success" }) {
  if (!message) return null;
  return (
    <p
      role={tone === "danger" ? "alert" : "status"}
      className={cn(
        "rounded-lg px-4 py-3 text-sm font-medium",
        tone === "danger" ? "bg-danger-soft text-danger" : "bg-brand-soft text-brand",
      )}
    >
      {message}
    </p>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn("animate-pulse rounded-lg bg-neutral-200/70", className)} />;
}

/** Kotak kosong bergaris putus-putus, sesuai desain "[Empty state …]". */
export function EmptyState({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "rounded-(--radius-card) border border-dashed border-neutral-400 px-4 py-6 text-center text-sm text-muted",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Error data di dalam halaman (bukan error boundary). */
export function DataError({ message }: { message: string }) {
  return <p className="rounded-lg bg-danger-soft px-4 py-3 text-sm text-danger">{message}</p>;
}
