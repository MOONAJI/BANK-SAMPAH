import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import type { WasteGroup } from "@/types/api";
import { StaffPageHeader } from "@/components/layout/staff-shell";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/feedback";
import { FilterForm } from "@/components/ui/filter-form";
import { ChipLinks } from "@/components/ui/nav-tabs";
import { CELL_LINK, EmptyRow, TableBox, Td, Th } from "@/components/ui/table";
import { getAllWasteCategories } from "@/lib/api/waste";
import { WASTE_GROUPS } from "@/lib/constants";
import { formatRupiah } from "@/lib/format";
import { cn, param, qs } from "@/lib/utils";
import { WasteEditor } from "@/features/waste/waste-editor";

export const metadata: Metadata = { title: "Jenis & Harga Sampah" };

export default function JenisSampahPage({ searchParams }: PageProps<"/kelola/jenis-sampah">) {
  return (
    <Suspense fallback={<Skeleton className="h-[30rem]" />}>
      <Manager searchParams={searchParams} />
    </Suspense>
  );
}

async function Manager({ searchParams }: { searchParams: PageProps<"/kelola/jenis-sampah">["searchParams"] }) {
  const sp = await searchParams;
  const rawGroup = param(sp.group) as WasteGroup | undefined;
  const group = rawGroup && WASTE_GROUPS.includes(rawGroup) ? rawGroup : undefined;
  const showInactive = param(sp.all) === "1";
  const edit = param(sp.edit);

  const { data: all } = await getAllWasteCategories();
  const rows = all.filter((c) => (!group || c.category_group === group) && (showInactive || c.isActive));
  const editing = edit && edit !== "baru" ? all.find((c) => c._id === edit) : undefined;
  const panelOpen = edit === "baru" || Boolean(editing);

  const listHref = (extra: Record<string, string | undefined> = {}) =>
    `/kelola/jenis-sampah${qs({ group, all: showInactive ? "1" : undefined, ...extra })}`;

  return (
    <>
      <StaffPageHeader
        title="Jenis & Harga Sampah"
        description="Perubahan harga hanya berlaku untuk setoran berikutnya."
        actions={
          <ButtonLink href={listHref({ edit: "baru" })} scroll={false}>
            + Tambah jenis
          </ButtonLink>
        }
      />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <ChipLinks
          label="Filter golongan"
          accent="brand"
          tabs={[
            { href: `/kelola/jenis-sampah${qs({ all: showInactive ? "1" : undefined })}`, label: "Semua", active: !group },
            ...WASTE_GROUPS.map((g) => ({
              href: `/kelola/jenis-sampah${qs({ group: g, all: showInactive ? "1" : undefined })}`,
              label: g,
              active: group === g,
            })),
          ]}
        />
        <FilterForm label="Tampilkan nonaktif" keep={{ group, edit }}>
          <label className="flex min-h-10 items-center gap-2 text-sm">
            <input type="checkbox" name="all" value="1" defaultChecked={showInactive} className="size-5 accent-emerald-700" />
            Tampilkan nonaktif
          </label>
        </FilterForm>
      </div>

      <div className={cn("grid grid-cols-1 items-start gap-5", panelOpen && "xl:grid-cols-[minmax(0,1fr)_22rem]")}>
        <TableBox minWidth={520}>
          <thead>
            <tr>
              <Th>Nama</Th>
              <Th>Golongan</Th>
              <Th align="right">Harga/kg</Th>
              <Th>Status</Th>
              <Th>
                <span className="sr-only">Aksi</span>
              </Th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <EmptyRow colSpan={5}>Belum ada jenis sampah di filter ini.</EmptyRow>
            ) : (
              rows.map((c) => (
                <tr key={c._id} className={cn(c._id === editing?._id ? "bg-emerald-50" : "hover:bg-neutral-50", !c.isActive && "text-muted")}>
                  <Td full className="font-medium">{c.name}</Td>
                  <Td label="Golongan" className="text-neutral-600">{c.category_group}</Td>
                  <Td label="Harga/kg" align="right" className="font-semibold whitespace-nowrap tabular-nums">{formatRupiah(c.price_per_kg)}</Td>
                  <Td label="Status">{c.isActive ? <Badge tone="brand">Aktif</Badge> : <Badge>Nonaktif</Badge>}</Td>
                  <Td align="right" className="max-md:self-end">
                    <Link href={listHref({ edit: c._id })} scroll={false} className={cn(CELL_LINK, "font-medium text-brand hover:underline")}>
                      Ubah
                    </Link>
                  </Td>
                </tr>
              ))
            )}
          </tbody>
        </TableBox>

        {/* Di bawah xl panel tampil di atas tabel, supaya tidak perlu menggulir melewati daftar. */}
        {panelOpen && (
          <div className="max-xl:order-first">
            <WasteEditor key={edit} category={editing} closeHref={listHref()} />
          </div>
        )}
      </div>
    </>
  );
}
