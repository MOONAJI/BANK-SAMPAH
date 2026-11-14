import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { MobileBody, MobileHeader } from "@/components/layout/nasabah-shell";
import { Card } from "@/components/ui/card";
import { EmptyState, Skeleton } from "@/components/ui/feedback";
import { getMyDeposits } from "@/lib/api/deposits";
import { formatDayMonth, formatKg, formatRupiah } from "@/lib/format";
import { refName } from "@/features/ledger/ledger-utils";

export const metadata: Metadata = { title: "Riwayat Setoran" };

export default function NasabahSetoranPage() {
  return (
    <>
      <MobileHeader title="Riwayat Setoran" />
      <MobileBody>
        <Suspense fallback={<Skeleton className="h-96" />}>
          <Deposits />
        </Suspense>
      </MobileBody>
    </>
  );
}

async function Deposits() {
  // Tanpa limit: backend mengembalikan semua setoran, dipakai juga untuk total.
  const { data } = await getMyDeposits();
  const totalKg = data.reduce((s, d) => s + d.total_weight_kg, 0);
  const totalRp = data.reduce((s, d) => s + d.total_amount, 0);

  return (
    <>
      <div className="grid grid-cols-3 gap-2">
        <Stat label="Setoran" value={String(data.length)} />
        <Stat label="Total berat" value={formatKg(totalKg)} />
        <Stat label="Total nilai" value={formatRupiah(totalRp)} />
      </div>

      {data.length === 0 ? (
        <EmptyState>Belum ada setoran. Bawa sampah terpilah ke pos untuk ditimbang petugas.</EmptyState>
      ) : (
        <ul className="flex flex-col gap-3">
          {data.map((d) => (
            <li key={d._id}>
              <Link href={`/nasabah/setoran/${d._id}`} className="block rounded-(--radius-card) border border-line bg-surface px-4 py-3 hover:bg-neutral-50">
                <span className="flex justify-between gap-3">
                  <span className="font-medium break-all">{d.transaction_code}</span>
                  <span className="shrink-0 text-sm text-muted">{formatDayMonth(d.createdAt)}</span>
                </span>
                <span className="mt-1.5 flex items-center justify-between gap-3">
                  <span className="text-sm text-muted">
                    {formatKg(d.total_weight_kg)} · {refName(d.petugas_id)}
                  </span>
                  <span className="font-bold tabular-nums">+ {formatRupiah(d.total_amount)}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card className="px-3 py-2.5">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-0.5 truncate text-sm font-bold tabular-nums">{value}</p>
    </Card>
  );
}
