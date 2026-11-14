import "server-only";

import { redirect, unstable_rethrow } from "next/navigation";
import { API_URL } from "@/lib/config";
import type { ApiResponse, User } from "@/types/api";
import { getToken } from "@/lib/auth/session";
import { decodeToken } from "@/lib/auth/token";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type Query = Record<string, string | number | boolean | undefined | null>;

export interface ApiOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  query?: Query;
  token?: string | null;
}

/** Fetch ke backend. Melempar ApiError berisi pesan dari backend bila gagal. */
export async function apiFetch<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const { body, query, token, headers, ...init } = options;

  const url = new URL(API_URL + path);
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== null && value !== "") url.searchParams.set(key, String(value));
  }

  const h = new Headers(headers);
  h.set("Accept", "application/json");
  if (body !== undefined) h.set("Content-Type", "application/json");
  if (token) h.set("Authorization", `Bearer ${token}`);

  let res: Response;
  try {
    res = await fetch(url, { ...init, headers: h, body: body === undefined ? undefined : JSON.stringify(body) });
  } catch {
    throw new ApiError("Server tidak dapat dihubungi. Pastikan backend berjalan.", 503);
  }

  const payload = await res.json().catch(() => null);
  if (!res.ok) {
    // Error 5xx dari backend bisa berisi detail teknis (mis. "connect ECONNREFUSED 127.0.0.1:27017").
    // Itu dicatat di log server, bukan ditampilkan ke pengguna.
    if (res.status >= 500) {
      console.error(`[api] ${init.method ?? "GET"} ${path} → ${res.status}: ${payload?.message ?? "tanpa pesan"}`);
      throw new ApiError("Server sedang bermasalah. Coba lagi beberapa saat lagi.", res.status);
    }
    throw new ApiError(payload?.message ?? `Permintaan gagal (${res.status})`, res.status);
  }
  return payload as T;
}

/**
 * Fetch dengan token dari cookie.
 * - 401 (token ditolak/akun dihapus) → /keluar: cookie dibersihkan lalu ke /login.
 * - 403 karena admin mengubah peran akun ini: token masih menyimpan peran lama, sedangkan
 *   backend memeriksa peran di database. Tanpa ini pengguna terjebak di "Data gagal dimuat"
 *   (proxy terus mengarahkan ke area peran lama), jadi minta masuk ulang untuk token baru.
 */
export async function authedFetch<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const token = await getToken();
  if (!token) redirect("/login");

  try {
    return await apiFetch<T>(path, { ...options, token });
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) redirect("/keluar?alasan=sesi");
    if (error instanceof ApiError && error.status === 403 && (await roleChanged(token))) {
      redirect("/keluar?alasan=peran");
    }
    throw error;
  }
}

/** Peran di token berbeda dengan peran terbaru di database? (hanya dicek saat backend menolak 403) */
async function roleChanged(token: string) {
  const session = decodeToken(token);
  try {
    const me = await apiFetch<ApiResponse<User>>("/auth/me", { token });
    return Boolean(session && me.data.role !== session.role);
  } catch {
    return false;
  }
}

/**
 * Pesan error yang aman ditampilkan ke pengguna. Dipanggil di blok `catch` Server Action.
 * redirect() dari authedFetch (mis. 401 → /keluar) bekerja dengan MELEMPAR error khusus Next.js;
 * unstable_rethrow meneruskannya supaya redirect tetap terjadi, tidak tertelan jadi pesan error.
 */
export function errorMessage(error: unknown) {
  unstable_rethrow(error);
  return error instanceof ApiError ? error.message : "Terjadi kesalahan. Coba lagi sebentar.";
}
