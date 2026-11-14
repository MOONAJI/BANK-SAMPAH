import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { StaffPageHeader } from "@/components/layout/staff-shell";
import { ButtonLink } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/feedback";
import { controlClass } from "@/components/ui/field";
import { FilterForm } from "@/components/ui/filter-form";
import { CELL_LINK, EmptyRow, TableBox, Td, Th } from "@/components/ui/table";
import { getUsers } from "@/lib/api/users";
import { formatRupiah } from "@/lib/format";
import { cn, param } from "@/lib/utils";

export const metadata: Metadata = { title: "Nasabah" };

export default function NasabahListPage({ searchParams }: PageProps<"/kelola/nasabah">) {
  return (
    <>
      <StaffPageHeader title="Nasabah" />
      <Suspense fallback={<Skeleton className="h-96" />}>
        <List searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function List({ searchParams }: { searchParams: PageProps<"/kelola/nasabah">["searchParams"] }) {
  const search = param((await searchParams).search);
  const { data } = await getUsers({ role: "nasabah", search });

  return (
    <>
      <FilterForm label="Cari nasabah" className="mb-4 max-w-md">
        <label htmlFor="search" className="sr-only">
          Cari nasabah
        </label>
        <input
          id="search"
          name="search"
          type="search"
          defaultValue={search}
          placeholder="Cari nama, email, atau nomor HP"
          className={cn(controlClass(), "h-11")}
        />
      </FilterForm>

      <TableBox>
        <thead>
          <tr>
            <Th>Nama</Th>
            <Th>Kontak</Th>
            <Th>Alamat</Th>
            <Th align="right">Saldo</Th>
            <Th align="right">Aksi</Th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <EmptyRow colSpan={5}>{search ? `Tidak ada nasabah yang cocok dengan “${search}”.` : "Belum ada nasabah."}</EmptyRow>
          ) : (
            data.map((n) => (
              <tr key={n._id} className="hover:bg-neutral-50">
                <Td full className="text-base font-semibold">{n.name}</Td>
                <Td label="Kontak" full>
                  <span className="block">{n.phone || "—"}</span>
                  <span className="block text-xs [overflow-wrap:anywhere] text-muted">{n.email}</span>
                </Td>
                <Td label="Alamat" className="text-muted">{n.address || "—"}</Td>
                <Td label="Saldo" align="right" className="font-semibold tabular-nums">{formatRupiah(n.balance)}</Td>
                <Td full align="right" className="whitespace-nowrap">
                  <ButtonLink href={`/kelola/setoran/baru?nasabah=${n._id}`} variant="outline" size="sm">
                    Catat setoran
                  </ButtonLink>
                  <Link href={`/kelola/nasabah/${n._id}`} className={cn(CELL_LINK, "ml-3 font-medium underline underline-offset-4")}>
                    Detail
                  </Link>
                </Td>
              </tr>
            ))
          )}
        </tbody>
      </TableBox>
      <p className="mt-3 text-sm text-muted">{data.length} nasabah</p>
    </>
  );
}
