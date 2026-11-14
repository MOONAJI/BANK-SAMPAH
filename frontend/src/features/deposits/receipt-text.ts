import type { Deposit } from "@/types/api";
import { formatDateTime, formatKg, formatRupiah } from "@/lib/format";
import { refName } from "@/features/ledger/ledger-utils";

/** Ringkasan struk setoran dalam bentuk teks (untuk dibagikan). */
export function receiptText(d: Deposit) {
  return [
    `Struk Setoran Bank Sampah RW 05`,
    d.transaction_code,
    formatDateTime(d.createdAt),
    `Nasabah: ${refName(d.nasabah_id)}`,
    `Petugas: ${refName(d.petugas_id)}`,
    "",
    ...d.items.map((i) => `${i.waste_name}: ${formatKg(i.weight_kg)} × ${formatRupiah(i.price_per_kg)} = ${formatRupiah(i.subtotal)}`),
    "",
    `Total: ${formatKg(d.total_weight_kg)} · ${formatRupiah(d.total_amount)}`,
  ].join("\n");
}
