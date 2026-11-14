import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { MobileBody, MobileHeader } from "@/components/layout/nasabah-shell";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/feedback";
import { ApiError } from "@/lib/api/client";
import { getDeposit } from "@/lib/api/deposits";
import { formatDateTime, formatKg, formatRupiah } from "@/lib/format";
import { refName } from "@/features/ledger/ledger-utils";
import { ShareReceiptButton } from "@/features/deposits/receipt-buttons";
import { receiptText } from "@/features/deposits/receipt-text";

export const metadata: Metadata = { title: "Detail Setoran" };

export default function NasabahSetoranDetailPage({ params }: PageProps<"/nasabah/setoran/[id]">) {
  return (
    <>
      <MobileHeader title="Detail Setoran" backHref="/nasabah/setoran" />
      <MobileBody>
        <Suspense fallback={<Skeleton className="h-96" />}>
          <Detail params={params} />
        </Suspense>
      </MobileBody>
    </>
  );
}

async function Detail({ params }: { params: PageProps<"/nasabah/setoran/[id]">["params"] }) {
  const { id } = await params;
  const deposit = await getDeposit(id)
    .then((r) => r.data)
    .catch((e) => {
      if (e instanceof ApiError && (e.status === 404 || e.status === 403)) notFound();
      throw e;
    });

  return (
    <>
      <Card className="flex flex-col gap-2 p-4">
        <p className="font-semibold break-all">{deposit.transaction_code}</p>
        <Row label="Tanggal" value={formatDateTime(deposit.createdAt)} />
        <Row label="Petugas" value={refName(deposit.petugas_id)} />
      </Card>

      <Card className="px-4">
        <ul className="divide-y divide-line">
          {deposit.items.map((item) => (
            <li key={item.waste_id} className="flex items-center justify-between gap-3 py-3">
              <span>
                <span className="block">{item.waste_name}</span>
                <span className="block text-xs text-muted">
                  {formatKg(item.weight_kg)} × {formatRupiah(item.price_per_kg)}/kg
                </span>
              </span>
              <span className="font-semibold tabular-nums">{formatRupiah(item.subtotal)}</span>
            </li>
          ))}
          <li className="flex items-center justify-between py-3.5">
            <span className="font-bold">Total · {formatKg(deposit.total_weight_kg)}</span>
            <span className="text-lg font-bold tabular-nums">{formatRupiah(deposit.total_amount)}</span>
          </li>
        </ul>
      </Card>

      <Card className="p-4">
        <p className="text-sm font-semibold">Catatan petugas</p>
        <p className="mt-1 text-sm text-muted">{deposit.notes || "Tidak ada catatan."}</p>
      </Card>

      <ShareReceiptButton title={`Struk ${deposit.transaction_code}`} text={receiptText(deposit)} />
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 text-sm">
      <span className="text-muted">{label}</span>
      <span>{value}</span>
    </div>
  );
}
