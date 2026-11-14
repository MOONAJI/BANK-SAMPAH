"use client";

import { useState } from "react";
import { WithdrawalBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/feedback";
import { controlClass } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { formatRupiah } from "@/lib/format";
import { useFormAction } from "@/lib/use-form-action";
import { cn } from "@/lib/utils";
import { processWithdrawalAction } from "./actions";

export interface ReviewItem {
  id: string;
  code: string;
  amount: number;
  nasabahName: string;
  nasabahBalance: number | null;
  submittedAt: string;
  destination: string;
}

/** Kartu pengajuan berstatus Menunggu dengan aksi Setujui / Tolak. */
export function ReviewCard({ item }: { item: ReviewItem }) {
  const insufficient = item.nasabahBalance !== null && item.nasabahBalance < item.amount;
  const [mode, setMode] = useState<"idle" | "approve" | "reject">(insufficient ? "reject" : "idle");
  const [state, formProps, pending] = useFormAction(processWithdrawalAction, undefined);

  return (
    <article className="rounded-(--radius-card) border border-line bg-surface p-5">
      <div className="flex flex-wrap items-center gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold">{item.nasabahName}</h2>
            <WithdrawalBadge status="PENDING" />
          </div>
          <p className="mt-0.5 text-sm text-muted">
            {item.code} · diajukan {item.submittedAt}
            {item.nasabahBalance !== null && ` · saldo ${formatRupiah(item.nasabahBalance)}`}
          </p>
          <p className="mt-1.5">{item.destination}</p>
        </div>
        <p className="text-2xl font-bold tracking-tight tabular-nums">{formatRupiah(item.amount)}</p>
        {mode === "idle" && (
          <div className="flex gap-2">
            <Button variant="danger-outline" onClick={() => setMode("reject")}>
              Tolak
            </Button>
            <Button onClick={() => setMode("approve")}>Setujui</Button>
          </div>
        )}
      </div>

      {insufficient && (
        <p role="alert" className="mt-4 rounded-lg bg-danger-soft px-4 py-3 text-sm font-medium text-danger">
          Saldo nasabah ({formatRupiah(item.nasabahBalance ?? 0)}) kurang dari nominal. Pengajuan ini tidak bisa disetujui.
        </p>
      )}

      {mode === "approve" && (
        <form {...formProps} className="mt-4 flex flex-wrap items-center justify-end gap-3 rounded-lg bg-emerald-50 px-4 py-3">
          <input type="hidden" name="id" value={item.id} />
          <input type="hidden" name="status" value="APPROVED" />
          <p className="mr-auto text-sm">
            Setujui pencairan <b>{formatRupiah(item.amount)}</b> ke {item.destination}? Saldo nasabah akan dipotong.
          </p>
          <Button variant="outline" onClick={() => setMode("idle")}>
            Batal
          </Button>
          <SubmitButton pending={pending} pendingLabel="Memproses…">
            Ya, setujui
          </SubmitButton>
        </form>
      )}

      {mode === "reject" && (
        <form {...formProps} className="mt-4 flex flex-col gap-3">
          <input type="hidden" name="id" value={item.id} />
          <input type="hidden" name="status" value="REJECTED" />
          <label htmlFor={`alasan-${item.id}`} className="text-sm font-medium">
            Alasan penolakan
          </label>
          <textarea
            id={`alasan-${item.id}`}
            name="rejection_reason"
            rows={2}
            required
            defaultValue={
              insufficient
                ? `Saldo tidak mencukupi. Silakan ajukan ulang maksimal ${formatRupiah(item.nasabahBalance ?? 0)}.`
                : ""
            }
            aria-invalid={state?.errors?.rejection_reason ? true : undefined}
            className={cn(controlClass(state?.errors?.rejection_reason), "py-2.5")}
          />
          {state?.errors?.rejection_reason && <p className="text-sm text-danger">{state.errors.rejection_reason}</p>}
          <div className="flex justify-end gap-2">
            {!insufficient && (
              <Button variant="outline" onClick={() => setMode("idle")}>
                Batal
              </Button>
            )}
            <SubmitButton variant="danger" pending={pending} pendingLabel="Memproses…">
              Tolak pengajuan
            </SubmitButton>
          </div>
        </form>
      )}

      {state?.message && (
        <div className="mt-3">
          <FormAlert message={state.message} />
        </div>
      )}
    </article>
  );
}
