import type { Metadata } from "next";
import { Suspense } from "react";
import { StaffPageHeader } from "@/components/layout/staff-shell";
import { Skeleton } from "@/components/ui/feedback";
import { getActiveWasteCategories } from "@/lib/api/waste";
import { getUser } from "@/lib/api/users";
import { param } from "@/lib/utils";
import { DepositFormContainer } from "@/features/deposits/deposit-form";

export const metadata: Metadata = { title: "Catat Setoran" };

export default function CatatSetoranPage({ searchParams }: PageProps<"/kelola/setoran/baru">) {
  return (
    <>
      <StaffPageHeader title="Catat Setoran" description="Timbang, masukkan berat, saldo nasabah bertambah otomatis." />
      <Suspense fallback={<Skeleton className="h-[30rem]" />}>
        <Form searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function Form({ searchParams }: { searchParams: PageProps<"/kelola/setoran/baru">["searchParams"] }) {
  // ?nasabah=<id> dipakai tombol "Catat setoran" dari halaman Nasabah.
  const nasabahId = param((await searchParams).nasabah);
  const [categories, preset] = await Promise.all([
    getActiveWasteCategories(),
    nasabahId ? getUser(nasabahId).catch(() => null) : null,
  ]);
  const user = preset?.data;

  return (
    <DepositFormContainer
      categories={categories.data}
      initialNasabah={
        user && user.role === "nasabah"
          ? { _id: user._id, name: user.name, phone: user.phone, address: user.address, balance: user.balance }
          : undefined
      }
    />
  );
}
