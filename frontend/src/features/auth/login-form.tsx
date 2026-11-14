"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Field } from "@/components/ui/field";
import { FormAlert } from "@/components/ui/form-alert";
import { SubmitButton } from "@/components/ui/submit-button";
import { useFormAction } from "@/lib/use-form-action";
import { loginAction } from "./actions";

/** Halaman tujuan dari ?next= (diisi proxy saat membuka halaman terproteksi tanpa login). */
function NextField() {
  const next = useSearchParams().get("next");
  return next ? <input type="hidden" name="next" value={next} /> : null;
}

const ALASAN_KELUAR: Record<string, string> = {
  sesi: "Sesi kamu sudah berakhir. Silakan masuk lagi.",
  peran: "Peran akunmu baru diubah admin. Silakan masuk lagi.",
};

/** Penjelasan kenapa diminta masuk lagi (?alasan= dari /keluar). */
function ReasonNotice() {
  const text = ALASAN_KELUAR[useSearchParams().get("alasan") ?? ""];
  return text ? (
    <p role="status" className="rounded-[6px] bg-emerald-50 px-3.5 py-3 text-[13px] text-emerald-800">
      {text}
    </p>
  ) : null;
}

export function LoginForm() {
  const [state, formProps, pending] = useFormAction(loginAction, undefined);
  const e = state?.errors;

  return (
    <>
      {state?.message ? (
        <FormAlert>{state.message}</FormAlert>
      ) : (
        <Suspense fallback={null}>
          <ReasonNotice />
        </Suspense>
      )}

      <form {...formProps} noValidate className="flex flex-col gap-[14px] pb-4">
        <Suspense fallback={null}>
          <NextField />
        </Suspense>
        <Field
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          defaultValue={state?.values?.email}
          error={e?.email}
          required
        />
        <Field
          id="password"
          label="Kata sandi"
          type="password"
          autoComplete="current-password"
          error={e?.password}
          required
        />
        <SubmitButton pending={pending} pendingLabel="Memproses…" size="lg" className="w-full">
          Masuk
        </SubmitButton>
      </form>
    </>
  );
}
