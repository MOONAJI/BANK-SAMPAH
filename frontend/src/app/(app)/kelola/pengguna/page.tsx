import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import type { Role } from "@/types/api";
import { StaffPageHeader } from "@/components/layout/staff-shell";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/feedback";
import { controlClass } from "@/components/ui/field";
import { FilterForm } from "@/components/ui/filter-form";
import { SegmentedLinks } from "@/components/ui/nav-tabs";
import { CELL_LINK, EmptyRow, TableBox, Td, Th } from "@/components/ui/table";
import { requireSession } from "@/lib/auth/session";
import { getUsers } from "@/lib/api/users";
import { ROLE_LABEL } from "@/lib/constants";
import { formatRupiah } from "@/lib/format";
import { cn, param, qs } from "@/lib/utils";
import { DeleteUserConfirm, UserEditor } from "@/features/users/user-panels";

export const metadata: Metadata = { title: "Pengguna" };

const ROLES = Object.keys(ROLE_LABEL) as Role[];

export default function PenggunaPage({ searchParams }: PageProps<"/kelola/pengguna">) {
  return (
    <Suspense fallback={<Skeleton className="h-[30rem]" />}>
      <Users searchParams={searchParams} />
    </Suspense>
  );
}

async function Users({ searchParams }: { searchParams: PageProps<"/kelola/pengguna">["searchParams"] }) {
  const sp = await searchParams;
  const rawRole = param(sp.role) as Role | undefined;
  const role = rawRole && ROLES.includes(rawRole) ? rawRole : undefined;
  const search = param(sp.search);
  const edit = param(sp.edit);
  const hapus = param(sp.hapus);

  const [session, { data: users }] = await Promise.all([requireSession(), getUsers({ role, search })]);
  const editing = edit && edit !== "baru" ? users.find((u) => u._id === edit) : undefined;
  const deleting = hapus ? users.find((u) => u._id === hapus && u._id !== session.id) : undefined;

  const listHref = (extra: Record<string, string | undefined> = {}) => `/kelola/pengguna${qs({ role, search, ...extra })}`;
  const panel =
    edit === "baru" || editing ? (
      <UserEditor key={edit} user={editing} closeHref={listHref()} />
    ) : deleting ? (
      <DeleteUserConfirm key={hapus} user={deleting} closeHref={listHref()} />
    ) : null;

  return (
    <>
      <StaffPageHeader title="Pengguna" />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <SegmentedLinks
          label="Filter peran"
          className="max-w-sm"
          tabs={[
            { href: `/kelola/pengguna${qs({ search })}`, label: "Semua", active: !role },
            ...ROLES.map((r) => ({ href: `/kelola/pengguna${qs({ role: r, search })}`, label: ROLE_LABEL[r], active: role === r })),
          ]}
        />
        <FilterForm label="Cari pengguna" keep={{ role }} className="min-w-56 flex-1">
          <label htmlFor="search" className="sr-only">
            Cari pengguna
          </label>
          <input
            id="search"
            name="search"
            type="search"
            defaultValue={search}
            placeholder="Cari nama / email / HP"
            className={cn(controlClass(), "h-11")}
          />
        </FilterForm>
        <ButtonLink href={listHref({ edit: "baru" })} scroll={false}>
          + Tambah pengguna
        </ButtonLink>
      </div>

      <div className={cn("grid grid-cols-1 items-start gap-5", panel && "xl:grid-cols-[minmax(0,1fr)_20rem]")}>
        <TableBox minWidth={560}>
          <thead>
            <tr>
              <Th>Nama</Th>
              <Th>Email</Th>
              <Th>Peran</Th>
              <Th align="right">Saldo</Th>
              <Th align="right">Aksi</Th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <EmptyRow colSpan={5}>Tidak ada pengguna yang cocok.</EmptyRow>
            ) : (
              users.map((u) => (
                <tr key={u._id} className={u._id === edit || u._id === hapus ? "bg-emerald-50" : "hover:bg-neutral-50"}>
                  <Td full className="text-base font-semibold">
                    {u.name}
                    {u._id === session.id && <span className="ml-2 text-xs font-normal text-muted">(kamu)</span>}
                  </Td>
                  <Td label="Email" full className="[overflow-wrap:anywhere]">{u.email}</Td>
                  <Td label="Peran">
                    <Badge tone="outline">{ROLE_LABEL[u.role]}</Badge>
                  </Td>
                  <Td label="Saldo" align="right" className="whitespace-nowrap tabular-nums">
                    {u.role === "nasabah" ? formatRupiah(u.balance) : "—"}
                  </Td>
                  <Td full align="right" className="whitespace-nowrap">
                    <Link href={listHref({ edit: u._id })} scroll={false} className={cn(CELL_LINK, "font-medium underline underline-offset-4")}>
                      Ubah
                    </Link>
                    {u._id !== session.id && (
                      <Link href={listHref({ hapus: u._id })} scroll={false} className={cn(CELL_LINK, "ml-4 font-medium text-danger underline underline-offset-4")}>
                        Hapus
                      </Link>
                    )}
                  </Td>
                </tr>
              ))
            )}
          </tbody>
        </TableBox>
        {/* Di bawah xl panel tampil di atas tabel, supaya tidak perlu menggulir melewati daftar. */}
        {panel && <div className="max-xl:order-first">{panel}</div>}
      </div>
    </>
  );
}
