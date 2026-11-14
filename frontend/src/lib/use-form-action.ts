"use client";

import { startTransition, useActionState, type FormEvent } from "react";

/**
 * Seperti useActionState, tapi form TIDAK di-reset otomatis setelah submit.
 * (Form dengan prop `action` di React 19 selalu dikosongkan setelah aksi selesai,
 * sehingga isian hilang saat ada error validasi.)
 *
 *   const [state, formProps, pending] = useFormAction(saveAction, undefined);
 *   <form {...formProps}> … <SubmitButton pending={pending}>Simpan</SubmitButton>
 *
 * `formProps` berisi dua jalur:
 * - `action`: dipakai sebelum JavaScript selesai dimuat (form tetap terkirim ke Server Action,
 *   bukan GET bawaan browser yang menaruh isian di URL).
 * - `onSubmit`: setelah JavaScript siap, kirim manual (preventDefault) supaya form tidak di-reset.
 */
export function useFormAction<State>(
  action: (prev: Awaited<State>, formData: FormData) => State | Promise<State>,
  initial: Awaited<State>,
) {
  const [state, dispatch, pending] = useActionState<State, FormData>(action, initial);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const submitter = (event.nativeEvent as SubmitEvent).submitter;
    const formData = new FormData(event.currentTarget, submitter);
    startTransition(() => dispatch(formData));
  }

  const formProps = { action: dispatch, onSubmit };
  return [state, formProps, pending] as const;
}
