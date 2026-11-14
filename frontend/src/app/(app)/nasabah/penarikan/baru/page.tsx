import type { Metadata } from "next";
import { Suspense } from "react";
import { MobileBody, MobileHeader } from "@/components/layout/nasabah-shell";
import { Skeleton } from "@/components/ui/feedback";
import { getCurrentUser } from "@/lib/api/profile";
import { WithdrawForm } from "@/features/withdrawals/withdraw-form";

export const metadata: Metadata = { title: "Ajukan Penarikan" };

export default function AjukanPenarikanPage() {
  return (
    <>
      <MobileHeader title="Ajukan Penarikan" backHref="/nasabah/penarikan" />
      <MobileBody>
        <Suspense fallback={<Skeleton className="h-[32rem]" />}>
          <Form />
        </Suspense>
      </MobileBody>
    </>
  );
}

async function Form() {
  const user = await getCurrentUser();
  return <WithdrawForm balance={user.balance} name={user.name} ewallet={user.ewallet_info} />;
}
