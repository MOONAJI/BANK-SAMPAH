"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { User } from "@/types/api";
import { ApiError, apiFetch, errorMessage } from "@/lib/api/client";
import { setToken } from "@/lib/auth/session";
import { homeFor } from "@/lib/auth/token";
import {
  compactErrors,
  validateEmail,
  validateName,
  validatePassword,
  validatePhone,
  type FieldErrors,
} from "@/lib/validation";

/** Isian yang dikembalikan supaya form tidak kosong lagi bila gagal (kata sandi tidak pernah dikembalikan). */
export type AuthFormState =
  | {
      message?: string;
      errors?: FieldErrors;
      values?: Record<string, string>;
    }
  | undefined;

type AuthResponse = { token: string; user: User };

const text = (formData: FormData, key: string) => String(formData.get(key) ?? "").trim();

const NEXT_ALLOWED = /^\/(nasabah|kelola|profil)(\/|$)/;

/**
 * Tujuan setelah login, hanya halaman terproteksi di situs ini.
 * Diurai dengan URL (seperti browser), karena cek string biasa bisa dikelabui:
 * "/\t/situs-lain.com" lolos startsWith("/") tetapi browser membacanya sebagai "//situs-lain.com".
 */
function safeNext(value: string) {
  if (!value) return null;
  const base = "http://internal.invalid";
  try {
    const url = new URL(value, base);
    if (url.origin !== base || !NEXT_ALLOWED.test(url.pathname)) return null;
    return url.pathname + url.search;
  } catch {
    return null;
  }
}

function nextFromReferer(referer: string | null) {
  if (!referer) return "";
  try {
    return new URL(referer).searchParams.get("next") ?? "";
  } catch {
    return "";
  }
}

export async function loginAction(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const email = text(formData, "email").toLowerCase();
  const password = String(formData.get("password") ?? "");
  // /login dibuat statis, jadi input "next" baru ada setelah JavaScript aktif.
  // Form yang terkirim sebelum itu tetap membawa tujuan lewat Referer (/login?next=…).
  const next = safeNext(text(formData, "next") || nextFromReferer((await headers()).get("referer")));
  const values = { email };

  const errors = compactErrors({
    email: validateEmail(email),
    password: password ? undefined : "Kata sandi wajib diisi.",
  });
  if (errors) return { errors, values };

  let res: AuthResponse;
  try {
    res = await apiFetch<AuthResponse>("/auth/login", { method: "POST", body: { email, password } });
  } catch (error) {
    return { message: errorMessage(error), values };
  }

  await setToken(res.token);
  // Proxy tetap memeriksa peran, jadi "next" ke halaman yang tidak sesuai peran akan dialihkan lagi.
  redirect(next ?? homeFor(res.user.role));
}

export async function registerAction(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const name = text(formData, "name");
  const email = text(formData, "email").toLowerCase();
  const phone = text(formData, "phone").replace(/\s|-/g, "");
  const address = text(formData, "address");
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  const values = { name, email, phone, address };

  const errors = compactErrors({
    name: validateName(name),
    email: validateEmail(email),
    phone: validatePhone(phone),
    address: address ? undefined : "Alamat wajib diisi.",
    password: validatePassword(password),
    confirmPassword: confirmPassword === password ? undefined : "Kata sandi tidak sama.",
  });
  if (errors) return { errors, values };

  let res: AuthResponse;
  try {
    res = await apiFetch<AuthResponse>("/auth/register", {
      method: "POST",
      body: { name, email, password, phone: phone || undefined, address },
    });
  } catch (error) {
    // Email ganda dari backend (400) ditampilkan di bawah kolom email.
    if (error instanceof ApiError && error.status === 400 && /email/i.test(error.message)) {
      return { errors: { email: error.message }, values };
    }
    return { message: errorMessage(error), values };
  }

  await setToken(res.token);
  redirect(homeFor(res.user.role));
}
