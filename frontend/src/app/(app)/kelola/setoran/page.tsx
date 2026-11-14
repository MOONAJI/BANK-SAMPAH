import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { StaffPageHeader } from "@/components/layout/staff-shell";
import { buttonClass, ButtonLink } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/feedback";
import { controlClass } from "@/components/ui/field";
import { FilterForm } from "@/components/ui/filter-form";
import { CELL_LINK, EmptyRow, Pagination, TableBox, Td, Th } from "@/components/ui/table";
import { getDeposits } from "@/lib/api/deposits";
import { getUsers } from "@/lib/api/users";
import { PAGE_SIZE } from "@/lib/constants";
import { formatDayMonth, formatKg, formatRupiah, wibDateRange } from "@/lib/format";
import { cn, param, qs } from "@/lib/utils";
import { refName } from "@/features/ledger/ledger-utils";

export const metadata: Metadata = { title: "Riwayat Setoran" };

type SP = PageProps<"/kelola/setoran">["searchParams"];

export default function RiwayatSetoranPage({ searchParams }: PageProps<"/kelola/setoran">) {
  return (
    <Suspense fallback={<Skeleton className="h-[34rem]" />}>
      <History searchParams={searchParams} />
    </Suspense>
  );
}

async function History({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const dari = param(sp.dari);
  const sampai = param(sp.sampai);
  const nasabah = param(sp.nasabah);
  const page = Math.max(1, Number(param(sp.page)) || 1);

  // Backend butuh startDate & endDate sekaligus; tanggal dibaca sebagai hari WIB (lihat wibDateRange).
  const range = wibDateRange(dari, sampai);

  const [deposits, nasabahList] = await Promise.all([
    getDeposits({ page, limit: PAGE_SIZE, nasabah_id: nasabah, ...range }),
    getUsers({ role: "nasabah" }),
  ]);
  const filters = { dari, sampai, nasabah };

  return (
    <>
      <StaffPageHeader
        title="Riwayat Setoran"
        actions={
          <>
            <a href={`/api/export/deposits${qs(range)}`} className={buttonClass({ variant: "outline" })}>
              Unduh CSV
            </a>
            <ButtonLink href="/kelola/setoran/baru">+ Catat setoran</ButtonLink>
          </>
        }
      />

      <FilterForm
        label="Filter setoran"
        className="mb-4 flex flex-wrap items-end gap-3 rounded-(--radius-card) border border-line bg-surface p-4"
      >
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Dari tanggal
          <input type="date" name="dari" defaultValue={dari} className={cn(controlClass(), "h-11")} />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Sampai
          <input type="date" name="sampai" defaultValue={sampai} min={dari} className={cn(controlClass(), "h-11")} />
        </label>
        <label className="flex min-w-56 flex-1 flex-col gap-1.5 text-sm font-medium">
          Nasabah
          <select name="nasabah" defaultValue={nasabah ?? ""} className={cn(controlClass(), "h-11")}>
            <option value="">Semua nasabah</option>
            {nasabahList.data.map((n) => (
              <option key={n._id} value={n._id}>
                {n.name}
              </option>
            ))}
          </select>
        </label>
        <Link href="/kelola/setoran" className="flex h-11 items-center px-2 text-sm underline underline-offset-4">
          Reset
        </Link>
      </FilterForm>
      {(dari || sampai) && !(dari && sampai) && (
        <p className="-mt-2 mb-4 text-sm text-muted">Isi tanggal “dari” dan “sampai” untuk memfilter rentang tanggal.</p>
      )}

      <TableBox>
        <thead>
          <tr>
            <Th>Kode</Th>
            <Th>Tanggal</Th>
            <Th>Nasabah</Th>
            <Th>Petugas</Th>
            <Th align="right">Berat</Th>
            <Th align="right">Nilai</Th>
          </tr>
        </thead>
        <tbody>
          {deposits.data.length === 0 ? (
            <EmptyRow colSpan={6}>Tidak ada setoran untuk filter ini.</EmptyRow>
          ) : (
            deposits.data.map((d) => (
              <tr key={d._id} className="hover:bg-neutral-50">
                <Td full>
                  <Link href={`/kelola/setoran/${d._id}`} className={cn(CELL_LINK, "font-medium underline underline-offset-2")}>
                    {d.transaction_code}
                  </Link>
                </Td>
                <Td label="Tanggal" className="text-muted">{formatDayMonth(d.createdAt)}</Td>
                <Td label="Nasabah">
                  {d.nasabah_id ? (
                    <Link href={`/kelola/nasabah/${d.nasabah_id._id}`} className={cn(CELL_LINK, "font-semibold underline underline-offset-2")}>
                      {d.nasabah_id.name}
                    </Link>
                  ) : (
                    "—"
                  )}
                </Td>
                <Td label="Petugas" full>{refName(d.petugas_id)}</Td>
                <Td label="Berat" align="right" className="tabular-nums max-md:text-left">{formatKg(d.total_weight_kg)}</Td>
                <Td label="Nilai" align="right" className="font-semibold tabular-nums">{formatRupiah(d.total_amount)}</Td>
              </tr>
            ))
          )}
        </tbody>
      </TableBox>

      <div className="mt-4">
        <Pagination
          page={deposits.page}
          totalPages={deposits.totalPages}
          total={deposits.total}
          pageSize={PAGE_SIZE}
          hrefFor={(p) => `/kelola/setoran${qs({ ...filters, page: p })}`}
        />
      </div>
    </>
  );
}
