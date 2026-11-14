import type { Metadata } from "next";
import { Suspense } from "react";
import type { WasteGroup } from "@/types/api";
import { ChipLinks } from "@/components/ui/nav-tabs";
import { Skeleton } from "@/components/ui/feedback";
import { getPublicWasteCategories } from "@/lib/api/waste";
import { WASTE_GROUPS } from "@/lib/constants";
import { param } from "@/lib/utils";
import { PriceCards, PriceUnavailable } from "@/features/waste/price-cards";

export const metadata: Metadata = { title: "Harga Sampah" };

export default function HargaPage({ searchParams }: PageProps<"/harga">) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight">Harga sampah per kilogram</h1>
      <p className="mt-3 text-neutral-600">Harga per kilogram dapat berubah sewaktu-waktu.</p>

      <Suspense fallback={<Skeleton className="mt-6 h-64" />}>
        <FilteredPrices searchParams={searchParams} />
      </Suspense>

      <p className="mt-10 rounded-lg border border-dashed border-neutral-400 px-5 py-3 text-sm text-neutral-600">
        Info: harga dicatat saat setoran ditimbang. Perubahan harga tidak mengubah setoran yang sudah tercatat.
      </p>
    </div>
  );
}

async function FilteredPrices({ searchParams }: { searchParams: PageProps<"/harga">["searchParams"] }) {
  const group = param((await searchParams).group) as WasteGroup | undefined;
  const active = group && WASTE_GROUPS.includes(group) ? group : undefined;
  const categories = await getPublicWasteCategories();

  return (
    <>
      <ChipLinks
        label="Filter golongan"
        className="mt-6"
        tabs={[
          { href: "/harga", label: "Semua", active: !active },
          ...WASTE_GROUPS.map((g) => ({ href: `/harga?group=${g}`, label: g, active: active === g })),
        ]}
      />
      <div className="mt-6">
        {categories ? (
          <PriceCards categories={categories} groups={active ? [active] : WASTE_GROUPS} showEmpty={Boolean(active)} />
        ) : (
          <PriceUnavailable />
        )}
      </div>
    </>
  );
}
