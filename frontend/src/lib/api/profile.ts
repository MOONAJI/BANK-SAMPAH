import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import type { ApiResponse, EwalletInfo, User } from "@/types/api";
import { getToken } from "@/lib/auth/session";
import { ApiError, apiFetch, authedFetch } from "./client";

export interface ProfileInput {
  name?: string;
  phone?: string;
  address?: string;
  ewallet_info?: Partial<EwalletInfo>;
}

// Yang di-cache hanya pemanggilan backend per token; cookie dibaca di luar cache.
const fetchMe = cache((token: string) => apiFetch<ApiResponse<User>>("/auth/me", { token }));

/** Profil lengkap user yang login (GET /auth/me), di-dedupe per request. */
export async function getCurrentUser() {
  const token = await getToken();
  if (!token) redirect("/login");
  try {
    return (await fetchMe(token)).data;
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) redirect("/keluar?alasan=sesi");
    throw error;
  }
}

export const updateProfile = (body: ProfileInput) =>
  authedFetch<ApiResponse<User>>("/auth/me", { method: "PUT", body });
