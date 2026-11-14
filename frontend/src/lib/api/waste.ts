import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import type { ApiResponse, WasteCategory, WasteGroup } from "@/types/api";
import { apiFetch, authedFetch } from "./client";

export const WASTE_TAG = "waste-categories";

/**
 * Katalog harga publik (landing & /harga). Di-cache beberapa menit dan diperbarui
 * lewat updateTag(WASTE_TAG) setelah admin mengubah harga. null bila backend mati.
 */
export async function getPublicWasteCategories(): Promise<WasteCategory[] | null> {
  "use cache";
  cacheLife("minutes");
  cacheTag(WASTE_TAG);
  try {
    return (await apiFetch<ApiResponse<WasteCategory[]>>("/waste-categories")).data;
  } catch {
    return null;
  }
}

/** Kategori aktif untuk form setoran (selalu terbaru). */
export const getActiveWasteCategories = () => authedFetch<ApiResponse<WasteCategory[]>>("/waste-categories");

/** Untuk admin: termasuk yang nonaktif. */
export const getAllWasteCategories = (group?: WasteGroup) =>
  authedFetch<ApiResponse<WasteCategory[]>>("/waste-categories", { query: { all: true, group } });

export type WasteCategoryInput = Pick<WasteCategory, "name" | "category_group" | "price_per_kg"> &
  Partial<Pick<WasteCategory, "unit" | "description" | "isActive">>;

export const createWasteCategory = (body: WasteCategoryInput) =>
  authedFetch<ApiResponse<WasteCategory>>("/waste-categories", { method: "POST", body });

export const updateWasteCategory = (id: string, body: Partial<WasteCategoryInput>) =>
  authedFetch<ApiResponse<WasteCategory>>(`/waste-categories/${id}`, { method: "PUT", body });

/** Nonaktifkan (soft delete). */
export const deactivateWasteCategory = (id: string) =>
  authedFetch<ApiResponse<unknown>>(`/waste-categories/${id}`, { method: "DELETE" });
