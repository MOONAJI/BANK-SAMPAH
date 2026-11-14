"use server";

import { refresh } from "next/cache";
import type { EwalletProvider } from "@/types/api";
import { errorMessage } from "@/lib/api/client";
import { updateProfile, type ProfileInput } from "@/lib/api/profile";
import { compactErrors, validateName, validatePhone, type FormState } from "@/lib/validation";

const PROVIDERS: EwalletProvider[] = ["GOPAY", "OVO", "DANA", "SHOPEEPAY", "BANK_TRANSFER", "TUNAI", "LAINNYA"];

export async function updateProfileAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const text = (key: string) => String(formData.get(key) ?? "").trim();
  const name = text("name");
  const phone = text("phone");

  const errors = compactErrors({ name: validateName(name), phone: validatePhone(phone) });
  if (errors) return { errors };

  const body: ProfileInput = { name, phone, address: text("address") };

  // Bagian tujuan pencairan hanya ada di form nasabah.
  if (formData.has("provider")) {
    const provider = text("provider") as EwalletProvider;
    if (!PROVIDERS.includes(provider)) return { errors: { provider: "Pilih provider." } };
    body.ewallet_info = { provider, account_number: text("account_number"), account_name: text("account_name") };
  }

  try {
    await updateProfile(body);
  } catch (error) {
    return { message: errorMessage(error) };
  }
  refresh();
  return { ok: true, message: "Profil berhasil disimpan." };
}
