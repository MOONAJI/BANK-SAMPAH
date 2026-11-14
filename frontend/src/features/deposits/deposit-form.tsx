"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { CircleCheck, Search, X } from "lucide-react";
import type { WasteCategory } from "@/types/api";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormAlert } from "@/components/ui/feedback";
import { controlClass } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { formatKg, formatRupiah } from "@/lib/format";
import { useFormAction } from "@/lib/use-form-action";
import { cn, initials } from "@/lib/utils";
import { parseDecimal } from "@/lib/validation";
import { createDepositAction, searchNasabahAction, type NasabahOption } from "./actions";

interface Row {
  key: number;
  wasteId: string;
  weight: string;
}

/** Pembungkus: "Catat setoran berikutnya" me-remount form supaya semua isian kosong lagi. */
export function DepositFormContainer(props: { categories: WasteCategory[]; initialNasabah?: NasabahOption }) {
  const [round, setRound] = useState(0);
  return <DepositForm key={round} {...props} initialNasabah={round === 0 ? props.initialNasabah : undefined} onNext={() => setRound((r) => r + 1)} />;
}

function DepositForm({
  categories,
  initialNasabah,
  onNext,
}: {
  categories: WasteCategory[];
  initialNasabah?: NasabahOption;
  onNext: () => void;
}) {
  const [state, formProps, pending] = useFormAction(createDepositAction, undefined);
  const [nasabah, setNasabah] = useState<NasabahOption | undefined>(initialNasabah);
  const [rows, setRows] = useState<Row[]>([{ key: 1, wasteId: "", weight: "" }]);
  const byId = new Map(categories.map((c) => [c._id, c]));

  const lines = rows.map((r) => {
    const cat = byId.get(r.wasteId);
    const kg = parseDecimal(r.weight);
    const weight = Number.isFinite(kg) && kg > 0 ? Math.round(kg * 100) / 100 : 0;
    return { ...r, cat, weight, subtotal: cat ? Math.round(weight * cat.price_per_kg) : 0 };
  });
  const valid = lines.filter((l) => l.cat && l.weight > 0);
  const totalKg = valid.reduce((s, l) => s + l.weight, 0);
  const totalRp = valid.reduce((s, l) => s + l.subtotal, 0);
  const done = state?.receipt;

  const update = (key: number, patch: Partial<Row>) => setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  const addRow = () => setRows((rs) => [...rs, { key: Math.max(...rs.map((r) => r.key)) + 1, wasteId: "", weight: "" }]);
  const removeRow = (key: number) => setRows((rs) => (rs.length > 1 ? rs.filter((r) => r.key !== key) : rs));

  return (
    <form {...formProps} className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_20rem]">
      <input type="hidden" name="nasabah_id" value={nasabah?._id ?? ""} />
      <input type="hidden" name="items" value={JSON.stringify(valid.map((l) => ({ waste_id: l.wasteId, weight_kg: l.weight })))} />

      <fieldset disabled={Boolean(done)} className="flex min-w-0 flex-col gap-4">
        <Card className="p-5">
          <h2 className="mb-3 font-semibold">
            <span className="text-brand">1</span> · Nasabah
          </h2>
          {nasabah ? (
            <div className="flex flex-wrap items-center gap-4 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3">
              <span aria-hidden className="grid size-10 place-items-center rounded-full bg-brand font-bold text-white">
                {initials(nasabah.name)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold">{nasabah.name}</span>
                <span className="block text-sm text-muted">{[nasabah.phone, nasabah.address].filter(Boolean).join(" · ") || "—"}</span>
              </span>
              <span className="text-right">
                <span className="block text-xs text-muted">Saldo saat ini</span>
                <span className="block font-semibold tabular-nums">{formatRupiah(nasabah.balance)}</span>
              </span>
              <button type="button" onClick={() => setNasabah(undefined)} className="h-9 rounded-lg px-2 text-sm font-medium text-brand hover:bg-emerald-100">
                Ganti
              </button>
            </div>
          ) : (
            <NasabahSearch onPick={setNasabah} error={state?.errors?.nasabah} />
          )}
        </Card>

        <Card className="p-5">
          <h2 className="mb-3 font-semibold">
            <span className="text-brand">2</span> · Rincian timbangan
          </h2>
          {/* HP: tiap baris jadi kartu (jenis → berat → harga & subtotal). Tablet/laptop: 5 kolom sesuai desain. */}
          <div>
            <div>
              <div className="hidden grid-cols-[minmax(0,1fr)_8.5rem_6rem_6.5rem_2.5rem] gap-3 px-1 pb-2 text-xs font-semibold tracking-wider text-neutral-600 uppercase md:grid">
                <span>Jenis sampah</span>
                <span>Berat</span>
                <span className="text-right">Harga/kg</span>
                <span className="text-right">Subtotal</span>
                <span />
              </div>
              <ul className="flex flex-col gap-3">
                {lines.map((l, i) => {
                  const taken = new Set(lines.filter((o) => o.key !== l.key).map((o) => o.wasteId));
                  return (
                    <li key={l.key} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_2.5rem] items-center gap-x-3 gap-y-2 rounded-lg border border-line p-3 md:grid-cols-[minmax(0,1fr)_8.5rem_6rem_6.5rem_2.5rem] md:gap-y-0 md:border-0 md:p-0">
                      <select
                        aria-label={`Jenis sampah baris ${i + 1}`}
                        value={l.wasteId}
                        onChange={(e) => update(l.key, { wasteId: e.target.value })}
                        className={cn(controlClass(), "col-span-3 h-12 md:col-span-1")}
                      >
                        <option value="">Pilih jenis…</option>
                        {categories.map((c) => (
                          <option key={c._id} value={c._id} disabled={taken.has(c._id)}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                      <div className="col-span-3 flex h-12 items-center gap-1.5 rounded-lg border border-neutral-300 bg-surface px-3 focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-100 md:col-span-1">
                        <input
                          aria-label={`Berat baris ${i + 1} dalam kg`}
                          inputMode="decimal"
                          placeholder="0,0"
                          value={l.weight}
                          onChange={(e) => update(l.key, { weight: e.target.value.replace(/[^\d.,]/g, "") })}
                          className="w-full min-w-0 bg-transparent text-right text-xl font-semibold tabular-nums outline-none"
                        />
                        <span className="text-sm text-muted">kg</span>
                      </div>
                      <span className="text-sm text-muted tabular-nums md:text-right">
                        {l.cat ? formatRupiah(l.cat.price_per_kg) : "—"}
                        {l.cat && <span className="md:hidden">/kg</span>}
                      </span>
                      <span className="text-right font-semibold tabular-nums">{l.subtotal ? formatRupiah(l.subtotal) : "—"}</span>
                      <button
                        type="button"
                        onClick={() => removeRow(l.key)}
                        disabled={rows.length === 1}
                        aria-label={`Hapus baris ${i + 1}`}
                        className="grid size-10 place-items-center rounded-lg text-neutral-600 hover:bg-neutral-100 disabled:opacity-30"
                      >
                        <X className="size-4" aria-hidden />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
          {state?.errors?.items && <p className="mt-2 text-sm text-danger">{state.errors.items}</p>}
          <button
            type="button"
            onClick={addRow}
            disabled={rows.length >= categories.length}
            className="mt-4 h-11 rounded-lg border border-dashed border-emerald-300 px-4 text-sm font-medium text-brand hover:bg-emerald-50 disabled:opacity-40"
          >
            + Tambah jenis sampah
          </button>
        </Card>

        <Card className="flex flex-col gap-2 p-5">
          <label htmlFor="notes" className="font-semibold">
            Catatan <span className="font-normal text-muted">(opsional)</span>
          </label>
          <textarea id="notes" name="notes" rows={2} placeholder="Mis. kardus agak basah" className={cn(controlClass(), "py-2.5")} />
        </Card>
      </fieldset>

      <div className="flex flex-col gap-4 xl:sticky xl:top-6">
        {done ? (
          <Card tone="success" className="flex flex-col gap-3 p-5">
            <p className="flex items-center gap-2 font-semibold text-brand">
              <CircleCheck className="size-5" aria-hidden />
              Setoran tersimpan
            </p>
            <p className="font-semibold break-all">{done.code}</p>
            <SummaryLine label="Total berat" value={formatKg(done.totalKg)} />
            <SummaryLine label="Total nilai" value={formatRupiah(done.totalRp)} />
            <SummaryLine label="Saldo baru" value={formatRupiah(done.balance)} strong />
            <Button size="lg" onClick={onNext}>
              Catat setoran berikutnya
            </Button>
            <ButtonLink href={`/kelola/setoran/${done.id}`} variant="outline">
              Lihat struk
            </ButtonLink>
          </Card>
        ) : (
          <Card tone="strong" className="flex flex-col gap-3 p-5">
            <h2 className="font-semibold">Ringkasan</h2>
            <SummaryLine label="Total berat" value={formatKg(totalKg)} />
            <div>
              <p className="text-sm text-muted">Total nilai</p>
              <p className="text-4xl font-bold tracking-tight text-brand tabular-nums">{formatRupiah(totalRp)}</p>
            </div>
            <div className="flex flex-col gap-1.5 rounded-lg bg-neutral-100 p-3">
              <SummaryLine label="Saldo sebelum" value={nasabah ? formatRupiah(nasabah.balance) : "—"} />
              <SummaryLine label="Saldo sesudah" value={nasabah ? formatRupiah(nasabah.balance + totalRp) : "—"} strong />
            </div>
            <FormAlert message={state?.message} />
            <SubmitButton size="lg" pending={pending} disabled={!nasabah || valid.length === 0}>
              Simpan setoran
            </SubmitButton>
            <p className="text-xs text-muted">Harga dikunci saat disimpan. Perubahan harga nanti tidak mengubah setoran ini.</p>
          </Card>
        )}
      </div>
    </form>
  );
}

function NasabahSearch({ onPick, error }: { onPick: (n: NasabahOption) => void; error?: string }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<NasabahOption[]>([]);
  const [searched, setSearched] = useState(false);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    const q = query.trim();
    const t = setTimeout(() => {
      if (q.length < 2) {
        setResults([]);
        setSearched(false);
        return;
      }
      startTransition(async () => {
        setResults(await searchNasabahAction(q));
        setSearched(true);
      });
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  return (
    <div className="relative max-w-2xl">
      <label htmlFor="cari-nasabah" className="sr-only">
        Cari nasabah
      </label>
      <div
        className={cn(
          "flex h-12 items-center gap-2 rounded-lg border bg-surface px-3.5 focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-100",
          error ? "border-red-500" : "border-neutral-300",
        )}
      >
        <Search className="size-4 text-muted" aria-hidden />
        <input
          id="cari-nasabah"
          type="search"
          autoComplete="off"
          placeholder="Cari nama, email, atau nomor HP"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="h-full flex-1 bg-transparent outline-none"
          aria-describedby={error ? "cari-nasabah-msg" : undefined}
        />
        {pending && <span className="text-xs text-muted">Mencari…</span>}
      </div>
      {error && (
        <p id="cari-nasabah-msg" className="mt-1.5 text-sm text-danger">
          {error}
        </p>
      )}
      {(results.length > 0 || (searched && !pending)) && query.trim().length >= 2 && (
        <ul className="absolute z-10 mt-1 max-h-72 w-full overflow-y-auto rounded-lg border border-line bg-surface shadow-lg">
          {results.length === 0 ? (
            <li className="px-4 py-3 text-sm text-muted">
              Nasabah tidak ditemukan. Pendaftaran nasabah baru dilakukan admin di menu{" "}
              <Link href="/kelola/pengguna" className="font-medium underline">
                Pengguna
              </Link>
              .
            </li>
          ) : (
            results.map((n) => (
              <li key={n._id}>
                <button
                  type="button"
                  onClick={() => onPick(n)}
                  className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left hover:bg-emerald-50"
                >
                  <span>
                    <span className="block font-medium">{n.name}</span>
                    <span className="block text-xs text-muted">{[n.phone, n.address].filter(Boolean).join(" · ") || "—"}</span>
                  </span>
                  <span className="text-sm tabular-nums">{formatRupiah(n.balance)}</span>
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}

function SummaryLine({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex justify-between gap-3 text-sm">
      <span className="text-muted">{label}</span>
      <span className={cn("tabular-nums", strong ? "font-semibold text-brand" : "font-medium")}>{value}</span>
    </div>
  );
}
