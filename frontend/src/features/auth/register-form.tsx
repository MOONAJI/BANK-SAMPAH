"use client";

import { Field } from "@/components/ui/field";
import { FormAlert } from "@/components/ui/form-alert";
import { SubmitButton } from "@/components/ui/submit-button";
import { useFormAction } from "@/lib/use-form-action";
import { registerAction } from "./actions";

export function RegisterForm() {
  const [state, formProps, pending] = useFormAction(registerAction, undefined);
  const e = state?.errors;
  const v = state?.values;

  return (
    <>
      {state?.message && <FormAlert>{state.message}</FormAlert>}

      <form {...formProps} noValidate className="flex flex-col gap-[14px] pb-4">
        <Field
          id="name"
          label="Nama lengkap"
          autoComplete="name"
          defaultValue={v?.name}
          error={e?.name}
          required
          minLength={3}
        />
        <Field
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          defaultValue={v?.email}
          error={e?.email}
          required
        />
        <Field
          id="phone"
          label="Nomor HP"
          hint="opsional"
          type="tel"
          autoComplete="tel"
          placeholder="08123456789"
          defaultValue={v?.phone}
          error={e?.phone}
        />
        <Field
          id="address"
          label="Alamat"
          autoComplete="street-address"
          placeholder="RT / blok / nomor rumah"
          defaultValue={v?.address}
          error={e?.address}
          required
        />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field
            id="password"
            label="Kata sandi"
            type="password"
            autoComplete="new-password"
            error={e?.password}
            required
            minLength={6}
          />
          <Field
            id="confirmPassword"
            label="Ulangi kata sandi"
            type="password"
            autoComplete="new-password"
            error={e?.confirmPassword}
            required
          />
        </div>

        <SubmitButton pending={pending} pendingLabel="Mendaftarkan…" size="lg" className="w-full">
          Daftar sebagai nasabah
        </SubmitButton>
      </form>
    </>
  );
}
