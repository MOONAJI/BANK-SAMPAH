"use server";

import { refresh, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import type { WasteGroup } from "@/types/api";
import { errorMessage } from "@/lib/api/client";
import { createWasteCategory, deactivateWasteCategory, updateWasteCategory, WASTE_TAG } from "@/lib/api/waste";
import { WASTE_GROUPS } from "@/lib/constants";
import { compactErrors, parseRupiah, type FormState } from "@/lib/validation";

/** Tambah atau ubah jenis sampah (admin). */
export async function saveWasteAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const group = String(formData.get("category_group") ?? "") as WasteGroup;
  const price = parseRupiah(String(formData.get("price_per_kg") ?? ""));
  const description = String(formData.get("description") ?? "").trim();

  const errors = compactErrors({
    name: name ? undefined : "Nama jenis sampah wajib diisi.",
    category_group: WASTE_GROUPS.includes(group) ? undefined : "Pilih golongan.",
    price_per_kg: Number.isFinite(price) && price >= 0 ? undefined : "Harga per kg harus berupa angka.",
  });
  if (errors) return { errors };

  const body = { name, category_group: group, price_per_kg: price, description };
  try {
    if (id) await updateWasteCategory(id, body);
    else await createWasteCategory(body);
  } catch (error) {
    return { message: errorMessage(error) };
  }

  updateTag(WASTE_TAG); // halaman harga publik ikut berubah
  if (!id) redirect("/kelola/jenis-sampah");
  refresh();
  return { ok: true, message: "Perubahan tersimpan. Harga baru berlaku untuk setoran berikutnya." };
}

/** Nonaktifkan (soft delete) atau aktifkan kembali jenis sampah. */
export async function toggleWasteAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const id = String(formData.get("id") ?? "");
  const activate = formData.get("activate") === "1";
  try {
    if (activate) await updateWasteCategory(id, { isActive: true });
    else await deactivateWasteCategory(id);
  } catch (error) {
    return { message: errorMessage(error) };
  }
  updateTag(WASTE_TAG);
  refresh();
  return { ok: true, message: activate ? "Jenis sampah diaktifkan kembali." : "Jenis sampah dinonaktifkan." };
}
