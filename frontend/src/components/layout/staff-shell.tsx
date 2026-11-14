// Kerangka halaman petugas & admin: sidebar + topbar + konten.

import { Suspense, type ReactNode } from "react";
import type { Role } from "@/types/api";
import { getCurrentUser } from "@/lib/api/profile";
import { getWithdrawals } from "@/lib/api/withdrawals";
import { ROLE_LABEL } from "@/lib/constants";
import { staffNav } from "@/lib/navigation";
import { initials } from "@/lib/utils";
import { StaffSidebar } from "./staff-sidebar";

export function StaffShell({ role, children }: { role: Role; children: ReactNode }) {
  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[16rem_minmax(0,1fr)]">
      <StaffSidebar
        sections={staffNav(role)}
        pendingBadge={
          <Suspense fallback={null}>
            <PendingBadge />
          </Suspense>
        }
      />
      <div className="flex min-w-0 flex-col">
        {/* Di bawah lg header menempel di atas: tombol menu (fixed) selalu duduk di atas header, tidak menutupi isi. */}
        <header className="no-print flex h-16 items-center justify-end gap-3 border-b border-line bg-surface px-4 max-lg:sticky max-lg:top-0 max-lg:z-20 sm:px-8">
          <Suspense fallback={<div className="h-9 w-40 animate-pulse rounded-lg bg-neutral-100" />}>
            <StaffUserMenu />
          </Suspense>
        </header>
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-8 sm:py-7">{children}</main>
      </div>
    </div>
  );
}

async function StaffUserMenu() {
  const user = await getCurrentUser();
  return (
    <div className="flex items-center gap-3">
      <div className="text-right leading-tight">
        <p className="text-sm font-semibold">{user.name}</p>
        <p className="text-xs text-muted">{ROLE_LABEL[user.role]}</p>
      </div>
      <span aria-hidden className="grid size-9 place-items-center rounded-full bg-avatar text-sm font-bold text-brand">
        {initials(user.name)}
      </span>
      <form action="/keluar" method="post">
        <button type="submit" className="h-10 rounded-lg px-3 text-sm text-neutral-600 hover:bg-neutral-100 hover:text-ink">
          Keluar
        </button>
      </form>
    </div>
  );
}

async function PendingBadge() {
  const res = await getWithdrawals({ status: "PENDING", limit: 1 }).catch(() => null);
  const total = res?.total ?? 0;
  if (!total) return null;
  return (
    <span
      aria-label={`${total} menunggu`}
      className="grid h-5 min-w-5 place-items-center rounded-full bg-ink px-1.5 text-[0.7rem] font-bold text-white"
    >
      {total}
    </span>
  );
}

/** Judul halaman petugas: judul, deskripsi, dan aksi di kanan. */
export function StaffPageHeader({
  title,
  description,
  actions,
  back,
}: {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  back?: ReactNode;
}) {
  return (
    <header className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {back}
        <h1 className="text-[1.65rem] leading-tight font-bold tracking-tight">{title}</h1>
        {description && <div className="mt-1 text-muted">{description}</div>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </header>
  );
}
