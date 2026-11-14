import type { Metadata } from "next";
import { Suspense } from "react";
import { StaffPageHeader } from "@/components/layout/staff-shell";
import { buttonClass } from "@/components/ui/button";
import { Card, CardTitle, StatCard } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/feedback";
import { controlClass } from "@/components/ui/field";
import { FilterForm } from "@/components/ui/filter-form";
import { EmptyRow, TableBox, Td, Th } from "@/components/ui/table";
import { getDashboardStats, getWasteSummary } from "@/lib/api/reports";
import { formatNumber, formatRupiah, wibDateRange } from "@/lib/format";
import { cn, param, qs } from "@/lib/utils";
import { HorizontalWeightBars, VerticalWeightBars } from "@/features/reports/weight-bars";

export const metadata: Metadata = { title: "Laporan" };

export default function LaporanPage({ searchParams }: PageProps<"/kelola/laporan">) {
  return (
    <Suspense fallback={<Skeleton className="h-[34rem]" />}>
      <Report searchParams={searchParams} />
    </Suspense>
  );
}

async function Report({ searchParams }: { searchParams: PageProps<"/kelola/laporan">["searchParams"] }) {
  const sp = await searchParams;
  const dari = param(sp.dari);
  const sampai = param(sp.sampai);
  const range = wibDateRange(dari, sampai);

  const [{ data: stats }, { data: summary }] = await Promise.all([getDashboardStats(), getWasteSummary()]);

  return (
    <>
      <StaffPageHeader
        title="Laporan"
        actions={
          <FilterForm label="Rentang tanggal ekspor" className="flex flex-wrap gap-3">
            <label className="flex flex-col gap-1.5 text-sm font-medium">
              Dari
              <input type="date" name="dari" defaultValue={dari} className={cn(controlClass(), "h-11")} />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-medium">
              Sampai
              <input type="date" name="sampai" defaultValue={sampai} min={dari} className={cn(controlClass(), "h-11")} />
            </label>
          </FilterForm>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Sampah terkumpul (kg)" value={formatNumber(stats.deposits.total_weight_kg)} />
        <StatCard label="Nilai setoran (Rp)" value={formatNumber(stats.deposits.total_amount_rp)} />
        <StatCard label="Sudah dicairkan (Rp)" value={formatNumber(stats.withdrawals.total_amount_rp)} />
        <StatCard label="Saldo nasabah (Rp)" value={formatNumber(stats.financials.total_nasabah_balance_rp)} />
      </div>

      <div className="mt-4 grid grid-cols-1 items-start gap-4 xl:grid-cols-2">
        <Card className="p-5">
          <CardTitle className="mb-5">Berat per jenis (kg)</CardTitle>
          {/* HP: batang mendatar (nama jenis terbaca utuh). Tablet/laptop: batang tegak sesuai desain. */}
          <div className="md:hidden">
            <HorizontalWeightBars items={summary} />
          </div>
          <div className="max-md:hidden">
            <VerticalWeightBars items={summary} />
          </div>
        </Card>
        <TableBox minWidth={420}>
          <thead>
            <tr>
              <Th>Jenis</Th>
              <Th align="right">Kg</Th>
              <Th align="right">Rp</Th>
              <Th align="right">Transaksi</Th>
            </tr>
          </thead>
          <tbody>
            {summary.length === 0 ? (
              <EmptyRow colSpan={4}>Belum ada data setoran.</EmptyRow>
            ) : (
              summary.map((s) => (
                <tr key={s.waste_name}>
                  <Td full className="font-medium">{s.waste_name}</Td>
                  <Td label="Kg" align="right" className="tabular-nums max-md:text-left">{formatNumber(s.total_weight_kg)}</Td>
                  <Td label="Rp" align="right" className="tabular-nums">{formatRupiah(s.total_amount_rp)}</Td>
                  <Td label="Transaksi" align="right" className="tabular-nums max-md:text-left">{formatNumber(s.transaction_count)}</Td>
                </tr>
              ))
            )}
          </tbody>
        </TableBox>
      </div>

      <Card className="mt-4 flex flex-col gap-4 p-5 lg:flex-row lg:items-center">
        <div className="flex-1">
          <h2 className="font-semibold">Ekspor data</h2>
          <p className="mt-0.5 text-sm text-muted">
            {dari && sampai
              ? "Ekspor setoran mengikuti rentang tanggal di atas."
              : "Ekspor setoran mencakup semua tanggal. Isi rentang tanggal di atas untuk membatasinya."}
          </p>
        </div>
        <a href={`/api/export/deposits${qs(range)}`} className={buttonClass({ variant: "outline" })}>
          Unduh setoran (CSV)
        </a>
        <form action="/api/export/ledger" method="get" className="flex flex-wrap gap-2">
          <label htmlFor="type" className="sr-only">
            Jenis mutasi
          </label>
          <div className="w-52">
            <select id="type" name="type" defaultValue="" className={cn(controlClass(), "h-11")}>
              <option value="">Semua mutasi</option>
              <option value="CREDIT">Masuk (setoran)</option>
              <option value="DEBIT">Keluar (penarikan)</option>
            </select>
          </div>
          <button type="submit" className={buttonClass({ variant: "outline" })}>
            Unduh buku besar (CSV)
          </button>
        </form>
      </Card>
    </>
  );
}
