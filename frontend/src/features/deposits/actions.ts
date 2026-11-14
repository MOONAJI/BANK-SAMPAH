"use server";

import { refresh } from "next/cache";
import { createDeposit } from "@/lib/api/deposits";
import { errorMessage } from "@/lib/api/client";
import { getUsers } from "@/lib/api/users";
import type { FieldErrors } from "@/lib/validation";

export interface NasabahOption {
  _id: string;
  name: string;
  phone: string;
  address: string;
  balance: number;
}

/** Cari nasabah untuk form setoran (nama, email, atau nomor HP). */
export async function searchNasabahAction(query: string): Promise<NasabahOption[]> {
  const q = query.trim();
  if (q.length < 2) return [];
  try {
    const { data } = await getUsers({ role: "nasabah", search: q });
    return data.slice(0, 8).map(({ _id, name, phone, address, balance }) => ({ _id, name, phone, address, balance }));
  } catch {
    return [];
  }
}

export type DepositFormState =
  | {
      message?: string;
      errors?: FieldErrors;
      receipt?: { id: string; code: string; totalKg: number; totalRp: number; balance: number };
    }
  | undefined;

export async function createDepositAction(_prev: DepositFormState, formData: FormData): Promise<DepositFormState> {
  const nasabahId = String(formData.get("nasabah_id") ?? "");
  const notes = String(formData.get("notes") ?? "").trim();

  let items: { waste_id: string; weight_kg: number }[] = [];
  try {
    items = JSON.parse(String(formData.get("items") ?? "[]"));
  } catch {
    items = [];
  }
  items = items.filter((i) => i.waste_id && Number(i.weight_kg) > 0);

  const errors: FieldErrors = {};
  if (!nasabahId) errors.nasabah = "Pilih nasabah terlebih dahulu.";
  if (items.length === 0) errors.items = "Isi minimal satu jenis sampah dengan berat lebih dari 0 kg.";
  if (Object.keys(errors).length) return { errors };

  try {
    const res = await createDeposit({ nasabah_id: nasabahId, items, notes: notes || undefined });
    refresh();
    return {
      receipt: {
        id: res.data._id,
        code: res.data.transaction_code,
        totalKg: res.data.total_weight_kg,
        totalRp: res.data.total_amount,
        balance: res.nasabah_balance,
      },
    };
  } catch (error) {
    return { message: errorMessage(error) };
  }
}
