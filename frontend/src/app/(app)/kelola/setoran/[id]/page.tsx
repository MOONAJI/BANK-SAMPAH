import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { StaffPageHeader } from "@/components/layout/staff-shell";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/feedback";
import { TableBox, Td, Th } from "@/components/ui/table";
import { ApiError } from "@/lib/api/client";
import { getDeposit } from "@/lib/api/deposits";
import { formatDateTime, formatKg, formatRupiah } from "@/lib/format";
import { refName } from "@/features/ledger/ledger-utils";
import { PrintButton } from "@/features/deposits/receipt-buttons";

export const metadata: Metadata = { title: "Detail Setoran" };

export default function KelolaSetoranDetailPage({ params }: PageProps<"/kelola/setoran/[id]">) {
  return (
    <Suspense fallback={<Skeleton className="h-96" />}>
      <Detail params={params} />
    </Suspense>
  );
}

async function Detail({ params }: { params: PageProps<"/kelola/setoran/[id]">["params"] }) {
  const { id } = await params;
  const d = await getDeposit(id)
    .then((r) => r.data)
    .catch((e) => {
      if (e instanceof ApiError && e.status === 404) notFound();
      throw e;
    });

  return (
    <>
      <StaffPageHeader
        back={
          <Link href="/kelola/setoran" className="no-print inline-block py-2.5 text-sm underline underline-offset-4">
            ‹ Riwayat setoran
          </Link>
        }
        title={`Setoran ${d.transaction_code}`}
        description={formatDateTime(d.createdAt)}
      />

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <TableBox>
          <thead>
            <tr>
              <Th>Jenis sampah</Th>
              <Th align="right">Berat</Th>
              <Th align="right">Harga/kg</Th>
              <Th align="right">Subtotal</Th>
            </tr>
          </thead>
          <tbody>
            {d.items.map((i) => (
              <tr key={i.waste_id}>
                <Td full className="font-medium">{i.waste_name}</Td>
                <Td label="Berat" align="right" className="tabular-nums max-md:text-left">{formatKg(i.weight_kg)}</Td>
                <Td label="Harga/kg" align="right" className="tabular-nums">{formatRupiah(i.price_per_kg)}</Td>
                <Td label="Subtotal" align="right" full className="font-semibold tabular-nums max-md:text-right">{formatRupiah(i.subtotal)}</Td>
              </tr>
            ))}
            <tr className="font-bold">
              <td className="px-4 py-3.5 max-md:p-0">
                Total<span className="font-normal text-muted md:hidden"> · {formatKg(d.total_weight_kg)}</span>
              </td>
              <td className="px-4 py-3.5 text-right tabular-nums max-md:hidden">{formatKg(d.total_weight_kg)}</td>
              <td className="max-md:hidden" />
              <td className="px-4 py-3.5 text-right text-lg tabular-nums max-md:p-0">{formatRupiah(d.total_amount)}</td>
            </tr>
          </tbody>
        </TableBox>

        <div className="flex flex-col gap-4">
          <Card className="p-4">
            <p className="text-xs font-semibold tracking-wider text-neutral-600 uppercase">Nasabah</p>
            {d.nasabah_id ? (
              <>
                <Link href={`/kelola/nasabah/${d.nasabah_id._id}`} className="mt-1 inline-block text-lg font-medium underline underline-offset-2">
                  {d.nasabah_id.name} ›
                </Link>
                <p className="mt-1 text-sm text-muted">{[d.nasabah_id.phone, d.nasabah_id.address].filter(Boolean).join(" · ") || "—"}</p>
              </>
            ) : (
              <p className="mt-1">—</p>
            )}
          </Card>
          <Card className="flex flex-col gap-2 p-4 text-sm">
            <Info label="Petugas" value={refName(d.petugas_id)} />
            <Info label="Waktu" value={formatDateTime(d.createdAt)} />
            <div>
              <p className="text-muted">Catatan</p>
              <p className="mt-0.5">{d.notes || "—"}</p>
            </div>
          </Card>
          <PrintButton />
        </div>
      </div>
    </>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-muted">{label}</span>
      <span className="text-right">{value}</span>
    </div>
  );
}
