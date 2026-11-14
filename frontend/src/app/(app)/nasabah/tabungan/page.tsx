import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import type { LedgerEntry } from "@/types/api";
import { MobileBody, MobileHeader } from "@/components/layout/nasabah-shell";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/feedback";
import { SegmentedLinks } from "@/components/ui/nav-tabs";
import { getMyLedger } from "@/lib/api/ledger";
import { formatDayMonth, formatMonthYear, formatRupiah } from "@/lib/format";
import { cn, param, qs } from "@/lib/utils";
import { isCredit, ledgerCode, ledgerHref, ledgerTitle, ledgerWeight } from "@/features/ledger/ledger-utils";

export const metadata: Metadata = { title: "Buku Tabungan" };

const STEP = 20;

export default function TabunganPage({ searchParams }: PageProps<"/nasabah/tabungan">) {
  return (
    <>
      <MobileHeader title="Buku Tabungan" backHref="/nasabah" />
      <MobileBody>
        <Suspense fallback={<Skeleton className="h-96" />}>
          <Ledger searchParams={searchParams} />
        </Suspense>
      </MobileBody>
    </>
  );
}

async function Ledger({ searchParams }: { searchParams: PageProps<"/nasabah/tabungan">["searchParams"] }) {
  const sp = await searchParams;
  const type = param(sp.type) === "CREDIT" || param(sp.type) === "DEBIT" ? (param(sp.type) as LedgerEntry["type"]) : undefined;
  const limit = Math.max(STEP, Number(param(sp.limit)) || STEP);

  const ledger = await getMyLedger({ limit });
  // Endpoint my-history belum punya filter tipe, jadi filter dilakukan di sini.
  const entries = type ? ledger.data.filter((e) => e.type === type) : ledger.data;
  const months = groupByMonth(entries);

  return (
    <>
      <Card className="flex items-center justify-between p-4">
        <div>
          <p className="text-sm text-muted">Saldo saat ini</p>
          <p className="text-2xl font-bold tracking-tight tabular-nums">{formatRupiah(ledger.current_balance)}</p>
        </div>
        <ButtonLink href="/nasabah/penarikan/baru">Tarik</ButtonLink>
      </Card>

      <SegmentedLinks
        label="Filter mutasi"
        variant="filled"
        tabs={[
          { href: `/nasabah/tabungan${qs({ limit: sp.limit ? limit : undefined })}`, label: "Semua", active: !type },
          { href: `/nasabah/tabungan${qs({ type: "CREDIT" })}`, label: "Masuk", active: type === "CREDIT" },
          { href: `/nasabah/tabungan${qs({ type: "DEBIT" })}`, label: "Keluar", active: type === "DEBIT" },
        ]}
      />

      {months.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted">Belum ada mutasi.</p>
      ) : (
        <Card className="overflow-hidden">
          {months.map(({ label, items }) => (
            <section key={label}>
              <h2 className="border-y border-line bg-neutral-50 px-4 py-2.5 text-xs font-semibold tracking-wider text-neutral-600 uppercase first:border-t-0">
                {label}
              </h2>
              <ul className="divide-y divide-line">
                {items.map((entry) => (
                  <LedgerRow key={entry._id} entry={entry} />
                ))}
              </ul>
            </section>
          ))}
        </Card>
      )}

      {ledger.total > ledger.data.length && (
        <ButtonLink href={`/nasabah/tabungan${qs({ type, limit: limit + STEP })}`} variant="outline" scroll={false}>
          Muat lebih banyak
        </ButtonLink>
      )}
    </>
  );
}

function LedgerRow({ entry }: { entry: LedgerEntry }) {
  const credit = isCredit(entry);
  const kg = ledgerWeight(entry);
  return (
    <li>
      <Link href={ledgerHref(entry, "nasabah")} className="flex items-start gap-3 px-4 py-3.5 hover:bg-neutral-50">
        <span
          aria-hidden
          className={cn(
            "grid size-8 shrink-0 place-items-center rounded-lg text-sm font-bold",
            credit ? "bg-brand-soft text-success" : "bg-danger-soft text-danger",
          )}
        >
          {credit ? "+" : "−"}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-medium">{ledgerTitle(entry)}</span>
          <span className="block text-sm font-medium whitespace-nowrap">{ledgerCode(entry)}</span>
          <span className="block text-xs text-muted">
            {formatDayMonth(entry.createdAt)}
            {kg ? ` · ${kg.toLocaleString("id-ID")} kg` : ""}
          </span>
        </span>
        <span className="shrink-0 text-right">
          <span className={cn("block font-semibold tabular-nums", credit ? "text-success" : "text-danger")}>
            {credit ? "+" : "−"}
            {formatRupiah(entry.amount)}
          </span>
          <span className="block text-xs text-muted tabular-nums">Saldo {formatRupiah(entry.balance_after)}</span>
        </span>
      </Link>
    </li>
  );
}

function groupByMonth(entries: LedgerEntry[]) {
  const map = new Map<string, LedgerEntry[]>();
  for (const e of entries) {
    const key = formatMonthYear(e.createdAt);
    map.set(key, [...(map.get(key) ?? []), e]);
  }
  return [...map].map(([label, items]) => ({ label, items }));
}
