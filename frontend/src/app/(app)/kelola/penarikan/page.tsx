import type { Metadata } from "next";
import { Suspense } from "react";
import type { Withdrawal, WithdrawalStatus } from "@/types/api";
import { StaffPageHeader } from "@/components/layout/staff-shell";
import { WithdrawalBadge } from "@/components/ui/badge";
import { EmptyState, Skeleton } from "@/components/ui/feedback";
import { SegmentedLinks } from "@/components/ui/nav-tabs";
import { Pagination } from "@/components/ui/table";
import { getWithdrawals } from "@/lib/api/withdrawals";
import { PAGE_SIZE } from "@/lib/constants";
import { formatDateTime, formatRupiah } from "@/lib/format";
import { param, qs } from "@/lib/utils";
import { refName, withdrawalDestination } from "@/features/ledger/ledger-utils";
import { ReviewCard } from "@/features/withdrawals/review-card";

export const metadata: Metadata = { title: "Verifikasi Penarikan" };

type Tab = WithdrawalStatus | "ALL";
const TABS: { value: Tab; label: string }[] = [
  { value: "PENDING", label: "Menunggu" },
  { value: "APPROVED", label: "Disetujui" },
  { value: "REJECTED", label: "Ditolak" },
  { value: "ALL", label: "Semua" },
];

export default function VerifikasiPenarikanPage({ searchParams }: PageProps<"/kelola/penarikan">) {
  return (
    <div className="max-w-5xl">
      <StaffPageHeader title="Verifikasi Penarikan" />
      <Suspense fallback={<Skeleton className="h-96" />}>
        <Queue searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function Queue({ searchParams }: { searchParams: PageProps<"/kelola/penarikan">["searchParams"] }) {
  const sp = await searchParams;
  const raw = param(sp.status) as Tab | undefined;
  const tab: Tab = raw && TABS.some((t) => t.value === raw) ? raw : "PENDING";
  const page = Math.max(1, Number(param(sp.page)) || 1);

  const [list, pendingCount] = await Promise.all([
    getWithdrawals({ status: tab === "ALL" ? undefined : tab, page, limit: PAGE_SIZE }),
    getWithdrawals({ status: "PENDING", limit: 1 }).then((r) => r.total),
  ]);

  return (
    <>
      <SegmentedLinks
        label="Status pengajuan"
        className="mb-4 inline-flex w-full max-w-md"
        tabs={TABS.map((t) => ({
          href: `/kelola/penarikan${qs({ status: t.value === "PENDING" ? undefined : t.value })}`,
          active: t.value === tab,
          label:
            t.value === "PENDING" ? (
              <>
                {t.label}
                {pendingCount > 0 && (
                  <span className="rounded-full bg-warning-soft px-1.5 text-xs font-semibold text-warning">{pendingCount}</span>
                )}
              </>
            ) : (
              t.label
            ),
        }))}
      />

      {list.data.length === 0 ? (
        <EmptyState>{tab === "PENDING" ? "Tidak ada pengajuan yang menunggu. Semua sudah diproses." : "Belum ada data."}</EmptyState>
      ) : (
        <div className="flex flex-col gap-3">
          {list.data.map((w) =>
            w.status === "PENDING" ? <ReviewCard key={w._id} item={toReviewItem(w)} /> : <ProcessedCard key={w._id} w={w} />,
          )}
        </div>
      )}

      {list.totalPages > 1 && (
        <div className="mt-4">
          <Pagination
            page={list.page}
            totalPages={list.totalPages}
            total={list.total}
            pageSize={PAGE_SIZE}
            hrefFor={(p) => `/kelola/penarikan${qs({ status: tab === "PENDING" ? undefined : tab, page: p })}`}
          />
        </div>
      )}
    </>
  );
}

function toReviewItem(w: Withdrawal) {
  const n = w.nasabah_id && typeof w.nasabah_id === "object" ? w.nasabah_id : null;
  return {
    id: w._id,
    code: w.transaction_code,
    amount: w.amount,
    nasabahName: n?.name ?? "—",
    nasabahBalance: typeof n?.balance === "number" ? n.balance : null,
    submittedAt: formatDateTime(w.createdAt),
    destination: `${w.method === "E_WALLET" && w.destination.provider !== "BANK_TRANSFER" ? "E-wallet " : ""}${withdrawalDestination(w)}${
      w.method !== "TUNAI" && w.destination.account_name ? ` · a.n. ${w.destination.account_name}` : ""
    }`,
  };
}

function ProcessedCard({ w }: { w: Withdrawal }) {
  return (
    <article className="rounded-(--radius-card) border border-line bg-surface p-5">
      <div className="flex flex-wrap items-center gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold">{refName(w.nasabah_id)}</h2>
            <WithdrawalBadge status={w.status} />
          </div>
          <p className="mt-0.5 text-sm text-muted">
            {w.transaction_code} · diajukan {formatDateTime(w.createdAt)}
          </p>
          <p className="mt-1.5">{withdrawalDestination(w)}</p>
          <p className="mt-1 text-sm text-muted">
            Diproses {refName(w.processed_by)}
            {w.processed_at ? ` · ${formatDateTime(w.processed_at)}` : ""}
          </p>
        </div>
        <p className="text-2xl font-bold tracking-tight tabular-nums">{formatRupiah(w.amount)}</p>
      </div>
      {w.status === "REJECTED" && w.rejection_reason && (
        <p className="mt-3 rounded-lg bg-neutral-100 px-4 py-2.5 text-sm">Alasan: {w.rejection_reason}</p>
      )}
    </article>
  );
}
