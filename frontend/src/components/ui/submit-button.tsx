"use client";

import { useFormStatus } from "react-dom";
import type { ComponentProps } from "react";
import { Button } from "./button";

/**
 * Tombol submit yang nonaktif + berganti label saat form diproses.
 * Kirim `pending` dari useFormAction; tanpa itu dipakai status form bawaan (useFormStatus).
 */
export function SubmitButton({
  pending,
  pendingLabel = "Menyimpan…",
  children,
  disabled,
  ...props
}: ComponentProps<typeof Button> & { pending?: boolean; pendingLabel?: string }) {
  const status = useFormStatus();
  const busy = pending ?? status.pending;
  return (
    <Button type="submit" disabled={busy || disabled} aria-busy={busy} {...props}>
      {busy ? pendingLabel : children}
    </Button>
  );
}
