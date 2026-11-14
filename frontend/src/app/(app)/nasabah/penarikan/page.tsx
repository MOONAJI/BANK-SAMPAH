import type { Metadata } from "next";
import { Suspense } from "react";
import type { WithdrawalStatus } from "@/types/api";
import { MobileBody, MobileHeader } from "@/components/layout/nasabah-shell";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState, Skeleton } from "@/components/ui/feedback";
import { ChipLinks } from "@/components/ui/nav-tabs";
import { getMyWithdrawals } from "@/lib/api/withdrawals";
import { WITHDRAWAL_METHOD_LABEL, WITHDRAWAL_STATUS_LABEL } from "@/lib/constants";
import { formatDate, formatRupiah } from "@/lib/format";
import { param } from "@/lib/utils";

export const metadata: Metadata = { title: "Penarikan" };

const STATUSES: WithdrawalStatus[] = ["PENDING", "APPROVED", "REJECTED"];

export default function NasabahPenarikanPage({ searchParams }: PageProps<"/nasabah/penarikan">) {
  return (
    <>
      <MobileHeader
        title="Penarikan"
        action={
          <ButtonLink href="/nasabah/penarikan/baru" size="sm">
            + Ajukan
          </ButtonLink>
        }
      />
      <MobileBody>
        <Suspense fallback={<Skeleton className="h-96" />}>
          <List searchParams={searchParams} />
        </Suspense>
      </MobileBody>
    </>
  );
}

async function List({ searchParams }: { searchParams: PageProps<"/nasabah/penarikan">["searchParams"] }) {
  const raw = param((await searchParams).status) as WithdrawalStatus | undefined;
  const status = raw && STATUSES.includes(raw) ? raw : undefined;

  const { data } = await getMyWithdrawals();
  // Endpoint my-withdrawals belum punya filter status, jadi filter dilakukan di sini.
  const items = status ? data.filter((w) => w.status === status) : data;

  return (
    <>
      <ChipLinks
        label="Filter status"
        tabs={[
          { href: "/nasabah/penarikan", label: "Semua", active: !status },
          ...STATUSES.map((s) => ({
            href: `/nasabah/penarikan?status=${s}`,
            label: WITHDRAWAL_STATUS_LABEL[s],
            active: status === s,
          })),
        ]}
      />

      {items.length === 0 ? (
        <EmptyState>{status ? "Tidak ada pengajuan dengan status ini." : "Belum ada pengajuan penarikan."}</EmptyState>
      ) : (
        <ul className="flex flex-col gap-3">
          {items.map((w) => (
            <li key={w._id} className="rounded-(--radius-card) border border-line bg-surface px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-lg font-bold tabular-nums">{formatRupiah(w.amount)}</span>
                <Badge tone="outline">{WITHDRAWAL_STATUS_LABEL[w.status]}</Badge>
              </div>
              <p className="mt-1 text-sm break-all text-muted">
                {w.transaction_code} · {WITHDRAWAL_METHOD_LABEL[w.method]} · {formatDate(w.createdAt)}
              </p>
              {w.status === "REJECTED" && (
                <p className="mt-2 rounded-lg bg-neutral-100 px-3 py-2 text-sm">Alasan: {w.rejection_reason || "—"}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
