"use client";

import Link from "next/link";
import type { Role, User } from "@/types/api";
import { buttonClass } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/feedback";
import { Input, Select } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { ROLE_LABEL } from "@/lib/constants";
import { useFormAction } from "@/lib/use-form-action";
import { deleteUserAction, saveUserAction } from "./actions";

const ROLES = Object.keys(ROLE_LABEL) as Role[];

const panelClass = "flex flex-col gap-4 rounded-(--radius-card) border-2 border-ink bg-surface p-5";

/** Panel tambah / ubah pengguna. `user` kosong = tambah. */
export function UserEditor({ user, closeHref }: { user?: User; closeHref: string }) {
  const [state, formProps, pending] = useFormAction(saveUserAction, undefined);
  const e = state?.errors;

  return (
    <section aria-label={user ? `Ubah ${user.name}` : "Tambah pengguna"} className={panelClass}>
      <h2 className="text-lg font-semibold">{user ? `Ubah: ${user.name}` : "Tambah pengguna"}</h2>
      <form {...formProps} className="flex flex-col gap-3.5">
        {user && <input type="hidden" name="id" value={user._id} />}
        <FormAlert message={state?.message} tone={state?.ok ? "success" : "danger"} />
        <Input label="Nama lengkap" name="name" defaultValue={user?.name} required minLength={3} error={e?.name} />
        {user ? (
          <Input label="Email" name="email_readonly" defaultValue={user.email} disabled hint="Email tidak bisa diubah." />
        ) : (
          <>
            <Input label="Email" name="email" type="email" required autoComplete="off" error={e?.email} />
            <Input
              label="Kata sandi"
              name="password"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              hint="Minimal 6 karakter."
              error={e?.password}
            />
          </>
        )}
        <Select label="Peran" name="role" defaultValue={user?.role ?? "nasabah"} error={e?.role}>
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {ROLE_LABEL[r]}
            </option>
          ))}
        </Select>
        <Input label="Nomor HP" name="phone" type="tel" defaultValue={user?.phone} placeholder="08123456789" error={e?.phone} />
        <Input label="Alamat" name="address" defaultValue={user?.address} />
        <div className="grid grid-cols-2 gap-2">
          <Link href={closeHref} scroll={false} className={buttonClass({ variant: "outline" })}>
            Batal
          </Link>
          <SubmitButton pending={pending}>Simpan</SubmitButton>
        </div>
      </form>
    </section>
  );
}

export function DeleteUserConfirm({ user, closeHref }: { user: User; closeHref: string }) {
  const [state, formProps, pending] = useFormAction(deleteUserAction, undefined);
  return (
    <section aria-label={`Hapus ${user.name}`} className={panelClass}>
      <div>
        <h2 className="text-lg font-semibold">Hapus {user.name}?</h2>
        <p className="mt-1 text-sm text-muted">
          Tindakan ini tidak bisa dibatalkan.
          {user.role === "nasabah" && user.balance > 0 && " Nasabah ini masih punya saldo."}
        </p>
      </div>
      <FormAlert message={state?.message} />
      <form {...formProps} className="grid grid-cols-2 gap-2">
        <input type="hidden" name="id" value={user._id} />
        <Link href={closeHref} scroll={false} className={buttonClass({ variant: "outline" })}>
          Batal
        </Link>
        <SubmitButton variant="danger" pending={pending} pendingLabel="Menghapus…">
          Hapus
        </SubmitButton>
      </form>
    </section>
  );
}
