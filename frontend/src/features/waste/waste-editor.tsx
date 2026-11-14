"use client";

import Link from "next/link";
import { useState } from "react";
import type { WasteCategory } from "@/types/api";
import { buttonClass } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/feedback";
import { Input, Select, Textarea } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { WASTE_GROUPS } from "@/lib/constants";
import { formatNumber, formatRupiah } from "@/lib/format";
import { useFormAction } from "@/lib/use-form-action";
import { cn } from "@/lib/utils";
import { parseRupiah } from "@/lib/validation";
import { saveWasteAction, toggleWasteAction } from "./actions";

/** Panel tambah / ubah jenis sampah. `category` kosong = tambah baru. */
export function WasteEditor({ category, closeHref }: { category?: WasteCategory; closeHref: string }) {
  const [state, saveProps, saving] = useFormAction(saveWasteAction, undefined);
  const [toggleState, toggleProps, toggling] = useFormAction(toggleWasteAction, undefined);
  const [priceText, setPriceText] = useState(category ? formatNumber(category.price_per_kg) : "");
  const e = state?.errors;

  const price = parseRupiah(priceText);
  const change =
    category && Number.isFinite(price) && price !== category.price_per_kg && category.price_per_kg > 0
      ? Math.round(((price - category.price_per_kg) / category.price_per_kg) * 100)
      : null;

  return (
    <aside
      aria-label={category ? `Ubah ${category.name}` : "Tambah jenis sampah"}
      className="flex flex-col gap-4 rounded-(--radius-card) border-2 border-emerald-800 bg-surface p-5"
    >
      <h2 className="text-lg font-semibold">{category ? `Ubah: ${category.name}` : "Tambah jenis sampah"}</h2>

      <form {...saveProps} className="flex flex-col gap-4">
        {category && <input type="hidden" name="id" value={category._id} />}
        <FormAlert message={state?.message} tone={state?.ok ? "success" : "danger"} />
        <Input label="Nama" name="name" defaultValue={category?.name} required error={e?.name} />
        <Select label="Golongan" name="category_group" defaultValue={category?.category_group ?? "Plastik"} error={e?.category_group}>
          {WASTE_GROUPS.map((g) => (
            <option key={g}>{g}</option>
          ))}
        </Select>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="price_per_kg" className="text-sm font-medium">
            Harga per kg
          </label>
          <div
            className={cn(
              "flex h-12 items-center gap-2 rounded-lg border-2 bg-surface px-3 focus-within:ring-4 focus-within:ring-emerald-100",
              e?.price_per_kg ? "border-red-500" : "border-emerald-800",
            )}
          >
            <span className="text-muted">Rp</span>
            <input
              id="price_per_kg"
              name="price_per_kg"
              inputMode="numeric"
              required
              value={priceText}
              onChange={(ev) => {
                const n = parseRupiah(ev.target.value);
                setPriceText(Number.isFinite(n) ? formatNumber(n) : "");
              }}
              aria-describedby="price-msg"
              className="min-w-0 flex-1 bg-transparent text-lg font-semibold tabular-nums outline-none"
            />
          </div>
          <p id="price-msg" className={cn("text-sm", e?.price_per_kg ? "text-danger" : "text-muted")}>
            {e?.price_per_kg ??
              (category
                ? `Sebelumnya ${formatRupiah(category.price_per_kg)}${change ? ` · ${change > 0 ? "naik" : "turun"} ${Math.abs(change)}%` : ""}`
                : "Harga per kilogram saat ditimbang.")}
          </p>
        </div>
        <Textarea label="Deskripsi (opsional)" name="description" defaultValue={category?.description} rows={2} />
        <div className="grid grid-cols-2 gap-2">
          <Link href={closeHref} scroll={false} className={buttonClass({ variant: "outline" })}>
            Batal
          </Link>
          <SubmitButton pending={saving}>{category ? "Simpan harga" : "Tambah"}</SubmitButton>
        </div>
      </form>

      {category && (
        <form {...toggleProps} className="flex flex-col items-center gap-2">
          <input type="hidden" name="id" value={category._id} />
          {!category.isActive && <input type="hidden" name="activate" value="1" />}
          <button
            type="submit"
            disabled={toggling}
            className={cn("h-10 rounded-lg px-3 text-sm font-medium hover:bg-neutral-100", category.isActive ? "text-danger" : "text-brand")}
          >
            {category.isActive ? "Nonaktifkan jenis ini" : "Aktifkan kembali"}
          </button>
          <FormAlert message={toggleState?.message} tone={toggleState?.ok ? "success" : "danger"} />
        </form>
      )}
    </aside>
  );
}
