"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import type { Role } from "@/types/api";
import { errorMessage } from "@/lib/api/client";
import { createUser, deleteUser, updateUser } from "@/lib/api/users";
import {
  compactErrors,
  validateEmail,
  validateName,
  validatePassword,
  validatePhone,
  type FormState,
} from "@/lib/validation";

const ROLES: Role[] = ["admin", "petugas", "nasabah"];

/** Tambah pengguna baru atau ubah pengguna (admin). */
export async function saveUserAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const text = (k: string) => String(formData.get(k) ?? "").trim();
  const id = text("id");
  const name = text("name");
  const role = text("role") as Role;
  const phone = text("phone");
  const address = text("address");

  if (id) {
    const errors = compactErrors({
      name: validateName(name),
      role: ROLES.includes(role) ? undefined : "Pilih peran.",
      phone: validatePhone(phone),
    });
    if (errors) return { errors };
    try {
      await updateUser(id, { name, role, phone, address });
    } catch (error) {
      return { message: errorMessage(error) };
    }
    refresh();
    return { ok: true, message: "Data pengguna tersimpan." };
  }

  const email = text("email");
  const password = String(formData.get("password") ?? "");
  const errors = compactErrors({
    name: validateName(name),
    email: validateEmail(email),
    password: validatePassword(password),
    role: ROLES.includes(role) ? undefined : "Pilih peran.",
    phone: validatePhone(phone),
  });
  if (errors) return { errors };

  try {
    await createUser({ name, email, password, role, phone, address });
  } catch (error) {
    return { message: errorMessage(error) };
  }
  redirect("/kelola/pengguna");
}

export async function deleteUserAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const id = String(formData.get("id") ?? "");
  try {
    await deleteUser(id);
  } catch (error) {
    return { message: errorMessage(error) };
  }
  redirect("/kelola/pengguna");
}
