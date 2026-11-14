"use client";

import type { EwalletProvider, User } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormAlert } from "@/components/ui/feedback";
import { Input, Select, Textarea } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { PROVIDER_LABEL } from "@/lib/constants";
import { useFormAction } from "@/lib/use-form-action";
import { cn } from "@/lib/utils";
import { updateProfileAction } from "./actions";

const PROVIDERS = Object.keys(PROVIDER_LABEL) as EwalletProvider[];

export function ProfileForm({ user, compact }: { user: User; compact?: boolean }) {
  const [state, formProps, pending] = useFormAction(updateProfileAction, undefined);
  const e = state?.errors;
  const isNasabah = user.role === "nasabah";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <span aria-hidden className="size-14 shrink-0 rounded-full bg-neutral-200" />
        <div className="min-w-0">
          <p className="text-lg font-semibold">{user.name}</p>
          <p className="truncate text-sm text-muted">{user.email} · tidak bisa diubah</p>
        </div>
      </div>

      <form {...formProps} className="flex flex-col gap-4">
        <FormAlert message={state?.message} tone={state?.ok ? "success" : "danger"} />

        <Card className="flex flex-col gap-4 p-4">
          <h2 className="font-semibold">Data diri</h2>
          <Input label="Nama lengkap" name="name" defaultValue={user.name} required minLength={3} autoComplete="name" error={e?.name} />
          <Input
            label="Nomor HP"
            name="phone"
            type="tel"
            inputMode="tel"
            defaultValue={user.phone}
            placeholder="08123456789"
            autoComplete="tel"
            error={e?.phone}
          />
          {compact ? (
            <Input label="Alamat" name="address" defaultValue={user.address} autoComplete="street-address" />
          ) : (
            <Textarea label="Alamat" name="address" defaultValue={user.address} rows={2} autoComplete="street-address" />
          )}
        </Card>

        {isNasabah && (
          <Card className="flex flex-col gap-4 p-4">
            <h2 className="font-semibold">Tujuan pencairan</h2>
            <Select label="Provider" name="provider" defaultValue={user.ewallet_info?.provider ?? "TUNAI"} error={e?.provider}>
              {PROVIDERS.map((p) => (
                <option key={p} value={p}>
                  {PROVIDER_LABEL[p]}
                </option>
              ))}
            </Select>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Nomor akun"
                name="account_number"
                inputMode="numeric"
                defaultValue={user.ewallet_info?.account_number}
              />
              <Input label="Atas nama" name="account_name" defaultValue={user.ewallet_info?.account_name} />
            </div>
          </Card>
        )}

        <SubmitButton size="lg" pending={pending} className={cn(compact ? "w-full" : "self-start")}>
          Simpan perubahan
        </SubmitButton>
      </form>

      <form action="/keluar" method="post">
        <Button type="submit" variant="outline" size="lg" className={cn(compact ? "w-full" : "")}>
          Keluar
        </Button>
      </form>
    </div>
  );
}
