import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { WithdrawalBadge } from "@/components/ui/badge";
import { buttonClass, ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/feedback";
import { SegmentedLinks } from "@/components/ui/nav-tabs";
import { CELL_LINK, EmptyRow, Pagination, TableBox, Td, Th } from "@/components/ui/table";
import { ApiError } from "@/lib/api/client";
import { getDeposits } from "@/lib/api/deposits";
import { getUserLedger } from "@/lib/api/ledger";
import { getUser } from "@/lib/api/users";
import { getWithdrawals } from "@/lib/api/withdrawals";
import { PAGE_SIZE, WITHDRAWAL_METHOD_LABEL } from "@/lib/constants";
import { formatDate, formatKg, formatRupiah } from "@/lib/format";
import { cn, param, qs } from "@/lib/utils";
import { isCredit, ledgerCode, ledgerHref, ledgerTitle, refName } from "@/features/ledger/ledger-utils";

export const metadata: Metadata = { title: "Detail Nasabah" };

type Tab = "tabungan" | "setoran" | "penarikan";
type Props = PageProps<"/kelola/nasabah/[id]">;

export default function DetailNasabahPage({ params, searchParams }: Props) {
  return (
    <>
      <Link href="/kelola/nasabah" className="mb-1.5 inline-block py-2.5 text-sm underline underline-offset-4">
        ‹ Nasabah
      </Link>
      <Suspense fallback={<Skeleton className="h-96" />}>
        <Detail params={params} searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function Detail({ params, searchParams }: Pick<Props, "params" | "searchParams">) {
  const { id } = await params;
  const sp = await searchParams;
  const raw = param(sp.tab);
  const tab: Tab = raw === "setoran" || raw === "penarikan" ? raw : "tabungan";
  const page = Math.max(1, Number(param(sp.page)) || 1);

  const user = await getUser(id)
    .then((r) => r.data)
    .catch((e) => {
      if (e instanceof ApiError && e.status === 404) notFound();
      throw e;
    });

  const base = `/kelola/nasabah/${id}`;
  const href = (t: Tab, p?: number) => `${base}${qs({ tab: t === "tabungan" ? undefined : t, page: p && p > 1 ? p : undefined })}`;

  return (
    <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[20rem_minmax(0,1fr)]">
      <Card className="flex flex-col gap-3 p-5">
        <span aria-hidden className="size-14 rounded-full bg-neutral-200" />
        <h1 className="text-xl font-bold">{user.name}</h1>
        <dl className="flex flex-col gap-1 text-sm text-muted">
          <dt className="sr-only">Email</dt>
          <dd className="[overflow-wrap:anywhere]">{user.email}</dd>
          <dt className="sr-only">Nomor HP</dt>
          <dd>{user.phone || "Nomor HP belum diisi"}</dd>
          <dt className="sr-only">Alamat</dt>
          <dd>{user.address || "Alamat belum diisi"}</dd>
        </dl>
        <div className="rounded-lg bg-neutral-100 px-3 py-2.5">
          <p className="text-xs text-muted">Saldo</p>
          <p className="text-2xl font-bold tracking-tight tabular-nums">{formatRupiah(user.balance)}</p>
        </div>
        {user.role === "nasabah" && (
          <>
            <ButtonLink href={`/kelola/setoran/baru?nasabah=${user._id}`}>Catat setoran</ButtonLink>
            <a href={`/api/export/ledger?user_id=${user._id}`} className={buttonClass({ variant: "outline" })}>
              Unduh buku tabungan (CSV)
            </a>
          </>
        )}
      </Card>

      <div className="flex min-w-0 flex-col gap-4">
        <SegmentedLinks
          label="Riwayat nasabah"
          className="max-w-md"
          tabs={[
            { href: href("tabungan"), label: "Buku tabungan", active: tab === "tabungan" },
            { href: href("setoran"), label: "Setoran", active: tab === "setoran" },
            { href: href("penarikan"), label: "Penarikan", active: tab === "penarikan" },
          ]}
        />
        {tab === "tabungan" && <LedgerTab id={id} page={page} hrefFor={(p) => href("tabungan", p)} />}
        {tab === "setoran" && <DepositsTab id={id} page={page} hrefFor={(p) => href("setoran", p)} />}
        {tab === "penarikan" && <WithdrawalsTab id={id} page={page} hrefFor={(p) => href("penarikan", p)} />}
      </div>
    </div>
  );
}

interface TabProps {
  id: string;
  page: number;
  hrefFor: (p: number) => string;
}

async function LedgerTab({ id, page, hrefFor }: TabProps) {
  const res = await getUserLedger(id, { page, limit: PAGE_SIZE });
  return (
    <>
      <TableBox minWidth={520}>
        <thead>
          <tr>
            <Th>Tanggal</Th>
            <Th>Keterangan</Th>
            <Th align="right">Masuk / Keluar</Th>
            <Th align="right">Saldo</Th>
          </tr>
        </thead>
        <tbody>
          {res.data.length === 0 ? (
            <EmptyRow colSpan={4}>Belum ada mutasi.</EmptyRow>
          ) : (
            res.data.map((e) => (
              <tr key={e._id} className="hover:bg-neutral-50">
                <Td label="Tanggal" className="max-md:col-span-2 max-md:order-first max-md:text-xs max-md:text-muted max-md:before:hidden">{formatDate(e.createdAt)}</Td>
                <Td full>
                  <Link href={ledgerHref(e, "kelola")} className={cn(CELL_LINK, "hover:underline")}>
                    {ledgerTitle(e)} {ledgerCode(e)}
                  </Link>
                </Td>
                <Td label="Masuk / Keluar" align="right" className={cn("font-semibold tabular-nums max-md:text-left", isCredit(e) ? "text-success" : "text-danger")}>
                  {isCredit(e) ? "+ " : "− "}
                  {formatRupiah(e.amount)}
                </Td>
                <Td label="Saldo" align="right" className="tabular-nums">{formatRupiah(e.balance_after)}</Td>
              </tr>
            ))
          )}
        </tbody>
      </TableBox>
      <Pagination page={res.page} totalPages={res.totalPages} total={res.total} pageSize={PAGE_SIZE} hrefFor={hrefFor} />
    </>
  );
}

async function DepositsTab({ id, page, hrefFor }: TabProps) {
  const res = await getDeposits({ nasabah_id: id, page, limit: PAGE_SIZE });
  return (
    <>
      <TableBox minWidth={520}>
        <thead>
          <tr>
            <Th>Kode</Th>
            <Th>Tanggal</Th>
            <Th>Petugas</Th>
            <Th align="right">Berat</Th>
            <Th align="right">Nilai</Th>
          </tr>
        </thead>
        <tbody>
          {res.data.length === 0 ? (
            <EmptyRow colSpan={5}>Belum ada setoran.</EmptyRow>
          ) : (
            res.data.map((d) => (
              <tr key={d._id} className="hover:bg-neutral-50">
                <Td full>
                  <Link href={`/kelola/setoran/${d._id}`} className={cn(CELL_LINK, "font-medium underline underline-offset-2")}>
                    {d.transaction_code}
                  </Link>
                </Td>
                <Td label="Tanggal">{formatDate(d.createdAt)}</Td>
                <Td label="Petugas" align="right" className="max-md:text-right">{refName(d.petugas_id)}</Td>
                <Td label="Berat" align="right" className="tabular-nums max-md:text-left">{formatKg(d.total_weight_kg)}</Td>
                <Td label="Nilai" align="right" className="font-semibold tabular-nums">{formatRupiah(d.total_amount)}</Td>
              </tr>
            ))
          )}
        </tbody>
      </TableBox>
      <Pagination page={res.page} totalPages={res.totalPages} total={res.total} pageSize={PAGE_SIZE} hrefFor={hrefFor} />
    </>
  );
}

async function WithdrawalsTab({ id, page, hrefFor }: TabProps) {
  const res = await getWithdrawals({ nasabah_id: id, page, limit: PAGE_SIZE });
  return (
    <>
      <TableBox minWidth={520}>
        <thead>
          <tr>
            <Th>Kode</Th>
            <Th>Tanggal</Th>
            <Th>Metode</Th>
            <Th>Status</Th>
            <Th align="right">Nominal</Th>
          </tr>
        </thead>
        <tbody>
          {res.data.length === 0 ? (
            <EmptyRow colSpan={5}>Belum ada penarikan.</EmptyRow>
          ) : (
            res.data.map((w) => (
              <tr key={w._id}>
                <Td full className="font-medium">{w.transaction_code}</Td>
                <Td label="Tanggal">{formatDate(w.createdAt)}</Td>
                <Td label="Metode" className="max-md:text-right">{WITHDRAWAL_METHOD_LABEL[w.method]}</Td>
                <Td label="Status">
                  <WithdrawalBadge status={w.status} />
                </Td>
                <Td label="Nominal" align="right" className="font-semibold tabular-nums">{formatRupiah(w.amount)}</Td>
              </tr>
            ))
          )}
        </tbody>
      </TableBox>
      <Pagination page={res.page} totalPages={res.totalPages} total={res.total} pageSize={PAGE_SIZE} hrefFor={hrefFor} />
    </>
  );
}
