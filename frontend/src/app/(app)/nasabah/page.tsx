import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Clock } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { MobileBody } from "@/components/layout/nasabah-shell";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/feedback";
import { getCurrentUser } from "@/lib/api/profile";
import { getMyLedger } from "@/lib/api/ledger";
import { getMyWithdrawals } from "@/lib/api/withdrawals";
import { formatDateTime, formatDayMonth, formatRupiah, greeting } from "@/lib/format";
import { cn, initials } from "@/lib/utils";
import { isCredit, ledgerCode, ledgerHref, ledgerTitle, ledgerWeight, withdrawalDestination } from "@/features/ledger/ledger-utils";

export const metadata: Metadata = { title: "Beranda" };

export default function NasabahHomePage() {
  return (
    <Suspense fallback={<HomeSkeleton />}>
      <Home />
    </Suspense>
  );
}

async function Home() {
  const [user, ledger, withdrawals] = await Promise.all([
    getCurrentUser(),
    getMyLedger({ limit: 4 }),
    getMyWithdrawals({ limit: 10 }),
  ]);
  const pending = withdrawals.data.find((w) => w.status === "PENDING");

  return (
    <>
      <header className="flex h-16 items-center justify-between border-b border-line bg-surface px-4">
        <Logo href="/nasabah" size="sm" />
        <Link
          href="/profil"
          aria-label="Profil"
          className="grid size-10 place-items-center rounded-full bg-avatar text-sm font-bold text-brand"
        >
          {initials(user.name)}
        </Link>
      </header>

      <MobileBody>
        <div>
          <p className="text-muted">{greeting(new Date())},</p>
          <h1 className="text-xl font-bold">{user.name}</h1>
        </div>

        <section className="rounded-(--radius-card) border-2 border-ink bg-surface p-5">
          <p className="text-sm text-muted">Saldo tabungan</p>
          <p className="mt-1 text-3xl font-bold tracking-tight tabular-nums">{formatRupiah(ledger.current_balance)}</p>
          <div className="mt-5 grid grid-cols-2 gap-2">
            <ButtonLink href="/nasabah/penarikan/baru">Tarik saldo</ButtonLink>
            <ButtonLink href="/nasabah/tabungan" variant="outline">
              Buku tabungan
            </ButtonLink>
          </div>
        </section>

        {pending && (
          <Link
            href="/nasabah/penarikan?status=PENDING"
            className="flex items-center gap-3 rounded-(--radius-card) bg-warning-soft px-4 py-3.5 text-warning"
          >
            <Clock className="size-5 shrink-0" aria-hidden />
            <span>
              <span className="block font-semibold">Penarikan {formatRupiah(pending.amount)} sedang diproses</span>
              <span className="block text-xs">
                {withdrawalDestination(pending)} · diajukan {formatDateTime(pending.createdAt)}
              </span>
            </span>
          </Link>
        )}

        <Card className="px-4 pt-4 pb-1">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Mutasi terakhir</h2>
            <Link href="/nasabah/tabungan" className="-my-2.5 inline-block py-2.5 text-sm font-medium text-brand">
              Lihat semua
            </Link>
          </div>
          {ledger.data.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted">
              Belum ada transaksi. Bawa sampah terpilah ke pos untuk setoran pertama.
            </p>
          ) : (
            <ul className="divide-y divide-line">
              {ledger.data.map((entry) => {
                const kg = ledgerWeight(entry);
                return (
                  <li key={entry._id}>
                    <Link href={ledgerHref(entry, "nasabah")} className="flex items-center justify-between gap-3 py-3">
                      <span className="min-w-0">
                        <span className="block font-medium">{ledgerTitle(entry)} {isCredit(entry) ? "sampah" : "saldo"}</span>
                        <span className="block truncate text-xs text-muted">
                          {[formatDayMonth(entry.createdAt), kg ? `${kg.toLocaleString("id-ID")} kg` : null, ledgerCode(entry)]
                            .filter(Boolean)
                            .join(" · ")}
                        </span>
                      </span>
                      <span
                        className={cn("shrink-0 font-semibold tabular-nums", isCredit(entry) ? "text-success" : "text-danger")}
                      >
                        {isCredit(entry) ? "+" : "−"}
                        {formatRupiah(entry.amount)}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </MobileBody>
    </>
  );
}

function HomeSkeleton() {
  return (
    <>
      <div className="h-16 border-b border-line bg-surface" />
      <MobileBody>
        <Skeleton className="h-12 w-40" />
        <Skeleton className="h-40" />
        <Skeleton className="h-64" />
      </MobileBody>
    </>
  );
}
