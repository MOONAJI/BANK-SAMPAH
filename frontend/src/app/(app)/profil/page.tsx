import type { Metadata } from "next";
import { Suspense } from "react";
import { MobileBody, MobileHeader } from "@/components/layout/nasabah-shell";
import { StaffPageHeader } from "@/components/layout/staff-shell";
import { Skeleton } from "@/components/ui/feedback";
import { getCurrentUser } from "@/lib/api/profile";
import { ProfileForm } from "@/features/profile/profile-form";

export const metadata: Metadata = { title: "Profil" };

export default function ProfilPage() {
  return (
    <Suspense fallback={<Skeleton className="m-4 h-96" />}>
      <Profile />
    </Suspense>
  );
}

async function Profile() {
  const user = await getCurrentUser();

  if (user.role === "nasabah") {
    return (
      <>
        <MobileHeader title="Profil" />
        <MobileBody>
          <ProfileForm user={user} compact />
        </MobileBody>
      </>
    );
  }

  return (
    <div className="max-w-2xl">
      <StaffPageHeader title="Profil" description="Data diri akunmu." />
      <ProfileForm user={user} />
    </div>
  );
}
