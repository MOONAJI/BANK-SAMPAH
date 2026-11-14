"use client";

import Link from "next/link";
import { useState } from "react";
import type { EwalletInfo, WithdrawalMethod } from "@/types/api";
import { SubmitButton } from "@/components/ui/submit-button";
import { FormAlert } from "@/components/ui/feedback";
import { MIN_WITHDRAWAL, PROVIDER_LABEL } from "@/lib/constants";
import { formatNumber, formatRupiah } from "@/lib/format";
import { useFormAction } from "@/lib/use-form-action";
import { cn } from "@/lib/utils";
import { parseRupiah } from "@/lib/validation";
import { createWithdrawalAction } from "./actions";

const METHODS: { value: WithdrawalMethod; label: string; hint: (w?: EwalletInfo) => string }[] = [
  { value: "TUNAI", label: "Tunai di pos", hint: () => "Ambil saat jam layanan" },
  {
    value: "E_WALLET",
    label: "E-wallet",
    hint: (w) => (w?.account_number ? `${PROVIDER_LABEL[w.provider]} · dari profil kamu` : "Isi nomor e-wallet di profil"),
  },
  { value: "BANK_TRANSFER", label: "Transfer bank", hint: () => "Rekening dari profil kamu" },
];

const QUICK = [10_000, 25_000, 50_000];

export function WithdrawForm({ balance, name, ewallet }: { balance: number; name: string; ewallet?: EwalletInfo }) {
  const [state, formProps, pending] = useFormAction(createWithdrawalAction, undefined);
  const [amountText, setAmountText] = useState("");
  const [method, setMethod] = useState<WithdrawalMethod>(ewallet?.account_number ? "E_WALLET" : "TUNAI");

  const amount = parseRupiah(amountText);
  const valid = Number.isFinite(amount) ? amount : 0;
  const remaining = balance - valid;
  const needsDestination = method !== "TUNAI" && !ewallet?.account_number;
  const tooMuch = valid > balance;

  const setAmount = (n: number) => setAmountText(formatNumber(n));

  return (
    <form {...formProps} className="flex min-h-[calc(100dvh-3.5rem-6rem)] flex-col gap-5">
      <input type="hidden" name="balance" value={balance} />
      <FormAlert message={state?.message} />

      <div className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between">
          <label htmlFor="amount" className="font-semibold">
            Nominal
          </label>
          <span className="text-sm text-muted">
            Saldo <b className="font-semibold text-ink tabular-nums">{formatRupiah(balance)}</b>
          </span>
        </div>
        <div
          className={cn(
            "flex h-16 items-center gap-3 rounded-xl border-2 bg-surface px-4 focus-within:ring-4",
            state?.errors?.amount || tooMuch ? "border-red-500 focus-within:ring-red-100" : "border-emerald-700 focus-within:ring-emerald-100",
          )}
        >
          <span className="text-xl font-semibold text-muted">Rp</span>
          <input
            id="amount"
            name="amount"
            inputMode="numeric"
            autoComplete="off"
            placeholder="0"
            value={amountText}
            onChange={(e) => {
              const n = parseRupiah(e.target.value);
              setAmountText(Number.isFinite(n) ? formatNumber(n) : "");
            }}
            aria-invalid={state?.errors?.amount || tooMuch ? true : undefined}
            aria-describedby="amount-msg"
            className="min-w-0 flex-1 bg-transparent text-3xl font-bold tracking-tight tabular-nums outline-none"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {QUICK.map((n) => (
            <QuickChip key={n} active={valid === n} onClick={() => setAmount(n)} disabled={n > balance}>
              {n / 1000}rb
            </QuickChip>
          ))}
          <QuickChip active={valid === balance && balance > 0} onClick={() => setAmount(balance)} disabled={balance < MIN_WITHDRAWAL}>
            Semua
          </QuickChip>
        </div>
        <p id="amount-msg" className={cn("text-sm", state?.errors?.amount || tooMuch ? "text-danger" : "text-muted")}>
          {state?.errors?.amount ??
            (tooMuch
              ? `Nominal melebihi saldo (${formatRupiah(balance)}).`
              : `Minimal ${formatRupiah(MIN_WITHDRAWAL)}. Saldo dipotong setelah disetujui petugas.`)}
        </p>
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 font-semibold">Metode pencairan</legend>
        {METHODS.map((m) => (
          <label
            key={m.value}
            className={cn(
              "flex min-h-16 cursor-pointer items-center gap-3 rounded-xl bg-surface px-4 py-3",
              method === m.value ? "border-2 border-emerald-800" : "border border-line",
            )}
          >
            <input
              type="radio"
              name="method"
              value={m.value}
              checked={method === m.value}
              onChange={() => setMethod(m.value)}
              className="size-5 accent-emerald-800"
            />
            <span>
              <span className="block font-semibold">{m.label}</span>
              <span className="block text-xs text-muted">{m.hint(ewallet)}</span>
            </span>
          </label>
        ))}
        {state?.errors?.method && <p className="text-sm text-danger">{state.errors.method}</p>}
      </fieldset>

      <div className="flex flex-col gap-2 rounded-xl border border-line bg-surface p-4 text-sm">
        <SummaryRow
          label="Tujuan"
          value={
            method === "TUNAI"
              ? "Tunai di pos"
              : ewallet?.account_number
                ? `${PROVIDER_LABEL[ewallet.provider]} · ${ewallet.account_number}`
                : "Belum diatur"
          }
        />
        <SummaryRow label="Atas nama" value={method === "TUNAI" ? name : ewallet?.account_name || name} />
        <SummaryRow label="Sisa saldo setelah cair" value={formatRupiah(Math.max(remaining, 0))} />
        {needsDestination && (
          <p className="mt-1 rounded-lg bg-warning-soft px-3 py-2 text-warning">
            Lengkapi nomor tujuan pencairan di{" "}
            <Link href="/profil" className="font-semibold underline">
              profil
            </Link>{" "}
            dulu, atau pilih tunai.
          </p>
        )}
      </div>

      <SubmitButton
        size="lg"
        className="mt-auto w-full"
        pending={pending}
        pendingLabel="Mengajukan…"
        disabled={needsDestination || tooMuch}
      >
        Ajukan penarikan{valid >= MIN_WITHDRAWAL && !tooMuch ? ` ${formatRupiah(valid)}` : ""}
      </SubmitButton>
    </form>
  );
}

function QuickChip({
  active,
  children,
  ...props
}: { active: boolean; children: React.ReactNode } & React.ComponentProps<"button">) {
  return (
    <button
      type="button"
      className={cn(
        "h-9 rounded-full border px-4 text-sm font-medium disabled:opacity-40",
        active ? "border-emerald-700 bg-emerald-50 text-brand" : "border-neutral-300 bg-surface",
      )}
      {...props}
    >
      {children}
    </button>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-muted">{label}</span>
      <span className="text-right font-semibold">{value}</span>
    </div>
  );
}
