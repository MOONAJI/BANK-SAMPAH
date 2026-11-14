import type { LedgerEntry, UserRef, Withdrawal } from "@/types/api";
import { PROVIDER_LABEL, WITHDRAWAL_METHOD_LABEL } from "@/lib/constants";
import type { EwalletProvider } from "@/types/api";

/** Ambil kode DEP-… / WD-… dari keterangan buku tabungan backend. */
export function ledgerCode(entry: LedgerEntry) {
  return entry.description.match(/(DEP|WD)-\d{8}-\d{4}/)?.[0] ?? "";
}

/** Ambil berat dari keterangan setoran: "… - 7.5 kg" → 7.5 */
export function ledgerWeight(entry: LedgerEntry) {
  const m = entry.description.match(/([\d.]+)\s*kg/);
  return m ? Number(m[1]) : null;
}

export const ledgerTitle = (entry: LedgerEntry) => (entry.reference_type === "DEPOSIT" ? "Setoran" : "Penarikan");

export const isCredit = (entry: LedgerEntry) => entry.type === "CREDIT";

/** Tautan detail untuk satu baris buku tabungan. */
export function ledgerHref(entry: LedgerEntry, base: "nasabah" | "kelola") {
  if (entry.reference_type === "DEPOSIT") return `/${base}/setoran/${entry.reference_id}`;
  return base === "nasabah" ? "/nasabah/penarikan" : "/kelola/penarikan";
}

/** Nama dari field hasil populate (bisa objek, id string, atau null). */
export function refName(ref: UserRef | string | null | undefined, fallback = "—") {
  return ref && typeof ref === "object" ? ref.name : fallback;
}

/** "DANA · 0812…" / "Transfer bank · 0123…" / "Tunai di pos" */
export function withdrawalDestination(w: Withdrawal) {
  if (w.method === "TUNAI") return WITHDRAWAL_METHOD_LABEL.TUNAI;
  const provider =
    w.destination.provider === "BANK_TRANSFER"
      ? WITHDRAWAL_METHOD_LABEL.BANK_TRANSFER
      : (PROVIDER_LABEL[w.destination.provider as EwalletProvider] ?? w.destination.provider);
  return [provider, w.destination.account_number].filter(Boolean).join(" · ");
}
