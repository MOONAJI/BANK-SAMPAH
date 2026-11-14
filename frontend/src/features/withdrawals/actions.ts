"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import type { WithdrawalMethod } from "@/types/api";
import { errorMessage } from "@/lib/api/client";
import { createWithdrawal, processWithdrawal } from "@/lib/api/withdrawals";
import { MIN_WITHDRAWAL } from "@/lib/constants";
import { formatRupiah } from "@/lib/format";
import { parseRupiah, type FormState } from "@/lib/validation";

const METHODS: WithdrawalMethod[] = ["TUNAI", "E_WALLET", "BANK_TRANSFER"];

/** Nasabah mengajukan penarikan. */
export async function createWithdrawalAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const amount = parseRupiah(String(formData.get("amount") ?? ""));
  const method = String(formData.get("method") ?? "") as WithdrawalMethod;
  const balance = Number(formData.get("balance") ?? 0);

  const errors: Record<string, string> = {};
  if (!Number.isFinite(amount) || amount < MIN_WITHDRAWAL) errors.amount = `Nominal minimal ${formatRupiah(MIN_WITHDRAWAL)}.`;
  else if (amount > balance) errors.amount = `Nominal melebihi saldo (${formatRupiah(balance)}).`;
  if (!METHODS.includes(method)) errors.method = "Pilih metode pencairan.";
  if (Object.keys(errors).length) return { errors };

  try {
    // Tujuan non-tunai otomatis diambil backend dari profil (ewallet_info).
    await createWithdrawal({ amount, method });
  } catch (error) {
    return { message: errorMessage(error) };
  }
  redirect("/nasabah/penarikan?status=PENDING");
}

/** Petugas/admin menyetujui atau menolak penarikan. */
export async function processWithdrawalAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  const reason = String(formData.get("rejection_reason") ?? "").trim();

  if (status !== "APPROVED" && status !== "REJECTED") return { message: "Aksi tidak dikenal." };
  if (status === "REJECTED" && !reason) return { errors: { rejection_reason: "Alasan penolakan wajib diisi." } };

  try {
    await processWithdrawal(id, { status, rejection_reason: reason || undefined });
  } catch (error) {
    return { message: errorMessage(error) };
  }
  refresh();
  return { ok: true };
}
