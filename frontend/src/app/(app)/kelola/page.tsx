import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight } from "lucide-react";
import { StaffPageHeader } from "@/components/layout/staff-shell";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardTitle, StatCard } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/feedback";
import { getDeposits } from "@/lib/api/deposits";
import { getDashboardStats, getWasteSummary } from "@/lib/api/reports";
import { formatKg, formatLongDate, formatNumber, formatRupiah, formatTime } from "@/lib/format";
import { refName } from "@/features/ledger/ledger-utils";
import { HorizontalWeightBars } from "@/features/reports/weight-bars";

export const metadata: Metadata = { title: "Dashboard" };

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <Dashboard />
    </Suspense>
  );
}

async function Dashboard() {
  const [{ data: stats }, { data: summary }, recent] = await Promise.all([
    getDashboardStats(),
    getWasteSummary(),
    getDeposits({ limit: 5 }),
  ]);
  const pending = stats.withdrawals.pending_count;

  return (
    <>
      <StaffPageHeader
        title="Dashboard"
        description={formatLongDate(new Date())}
        actions={<ButtonLink href="/kelola/setoran/baru">+ Catat setoran</ButtonLink>}
      />

      {pending > 0 && (
        <Link
          href="/kelola/penarikan"
          className="mb-5 flex items-center justify-between gap-3 rounded-(--radius-card) bg-warning-soft px-5 py-4 font-semibold text-warning hover:brightness-[0.98]"
        >
          {pending} pengajuan penarikan menunggu verifikasi
          <ArrowRight className="size-4 shrink-0" aria-hidden />
        </Link>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Sampah terkumpul"
          value={formatKg(stats.deposits.total_weight_kg)}
          hint={`${formatNumber(stats.deposits.total_transactions)} setoran`}
        />
        <StatCard label="Nilai setoran" value={formatRupiah(stats.deposits.total_amount_rp)} hint="Sejak sistem dipakai" />
        <StatCard
          label="Saldo nasabah aktif"
          value={formatRupiah(stats.financials.total_nasabah_balance_rp)}
          hint={`Belum ditarik · ${formatNumber(stats.users.total_nasabah)} nasabah`}
        />
        <StatCard
          label="Sudah dicairkan"
          value={formatRupiah(stats.withdrawals.total_amount_rp)}
          hint={`${formatNumber(stats.withdrawals.total_transactions)} penarikan`}
        />
      </div>

      <div className="mt-4 grid grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Card className="p-5">
          <CardTitle className="mb-4">Berat per jenis sampah</CardTitle>
          <HorizontalWeightBars items={summary} />
        </Card>

        <Card className="p-5">
          <CardTitle
            className="mb-2"
            action={
              <Link href="/kelola/setoran" className="-my-2.5 inline-block py-2.5 text-sm font-medium text-brand">
                Lihat semua
              </Link>
            }
          >
            Setoran terbaru
          </CardTitle>
          {recent.data.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted">Belum ada setoran.</p>
          ) : (
            <ul className="divide-y divide-line">
              {recent.data.map((d) => (
                <li key={d._id}>
                  <Link href={`/kelola/setoran/${d._id}`} className="flex items-center justify-between gap-3 py-3">
                    <span className="min-w-0">
                      <span className="block truncate font-medium">{refName(d.nasabah_id)}</span>
                      <span className="block text-xs text-muted">
                        {formatTime(d.createdAt)} · {formatKg(d.total_weight_kg)} · {refName(d.petugas_id)}
                      </span>
                    </span>
                    <span className="shrink-0 font-semibold tabular-nums">{formatRupiah(d.total_amount)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-14 w-64" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
      <Skeleton className="h-72" />
    </div>
  );
}
