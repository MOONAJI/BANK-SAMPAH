import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "@/features/auth/register-form";

export const metadata: Metadata = { title: "Daftar jadi nasabah" };

export default function RegisterPage() {
  return (
    <div className="flex w-full max-w-[460px] flex-col gap-4 rounded-lg border border-[#cfcfcf] bg-white p-8">
      <div>
        <h1 className="text-[24px] font-bold text-[#1f1f1f]">
          Daftar jadi nasabah
        </h1>
        <p className="pt-1.5 text-[14px] text-[#555]">
          Setelah daftar, bawa sampah terpilah ke pos untuk ditimbang.
        </p>
      </div>

      <RegisterForm />

      <p className="pt-1 text-center text-[14px] text-[#555]">
        Sudah punya akun?{" "}
        <Link href="/login" className="font-semibold text-[#1f1f1f] underline">
          Masuk
        </Link>
      </p>
    </div>
  );
}