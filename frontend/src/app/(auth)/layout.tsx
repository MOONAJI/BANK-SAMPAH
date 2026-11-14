import { Inter } from "next/font/google";
import { Logo } from "@/components/layout/logo";


const inter = Inter({ subsets: ["latin"] });

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main
      className={`${inter.className} flex min-h-screen flex-col items-center justify-center gap-6 px-4 py-10`}
      style={{
        backgroundImage: "linear-gradient(180deg, #ecfdf5 0%, #ffffff 100%)",
      }}
    >
      {/* Logo sudah berupa link ke beranda */}
      <Logo />
      {children}
    </main>
  );
}