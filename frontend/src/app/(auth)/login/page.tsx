import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/features/auth/login-form";

export const metadata: Metadata = { title: "Masuk" };

export default function LoginPage() {
  return (
    <div className="flex w-full max-w-[420px] flex-col gap-4 rounded-lg border border-[#cfcfcf] bg-white p-8">
      <div>
        <h1 className="text-[24px] font-bold text-[#1f1f1f]">Masuk</h1>
        <p className="pt-1.5 text-[14px] text-[#555]">
          Untuk nasabah, petugas, dan admin.
        </p>
      </div>

      <LoginForm />

      <p className="pt-1 text-center text-[14px] text-[#555]">
        Belum punya akun?{" "}
        <Link
          href="/daftar"
          className="font-semibold text-[#1f1f1f] underline"
        >
          Daftar jadi nasabah
        </Link>
      </p>
    </div>
  );
}