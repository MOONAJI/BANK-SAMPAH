import { Suspense } from "react";
import { requireSession } from "@/lib/auth/session";
import { NasabahShell } from "@/components/layout/nasabah-shell";
import { StaffShell } from "@/components/layout/staff-shell";

// Area setelah login. Kerangka dipilih dari peran di token:
// nasabah → tampilan HP + bottom nav, petugas/admin → sidebar + topbar.
// Membaca cookie wajib di dalam <Suspense> karena cacheComponents aktif.
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-canvas" aria-busy />}>
      <RoleShell>{children}</RoleShell>
    </Suspense>
  );
}

async function RoleShell({ children }: { children: React.ReactNode }) {
  const session = await requireSession();
  return session.role === "nasabah" ? (
    <NasabahShell>{children}</NasabahShell>
  ) : (
    <StaffShell role={session.role}>{children}</StaffShell>
  );
}
