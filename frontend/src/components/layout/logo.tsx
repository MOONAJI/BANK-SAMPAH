import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

/** Logo tempat sampah + "Bank Sampah / RW 05". */
export function Logo({ href = "/", size = "md", className }: { href?: string; size?: "sm" | "md"; className?: string }) {
  const small = size === "sm";
  return (
    <Link href={href} className={cn("flex items-center gap-2.5 text-ink", className)} aria-label="Bank Sampah RW 05">
      <Image
        src="/images/logo.webp"
        alt=""
        width={44}
        height={36}
        priority
        className={small ? "h-7 w-auto" : "h-9 w-auto"}
      />
      <span className="flex flex-col leading-none">
        <span className={cn("whitespace-nowrap", small ? "text-lg" : "text-xl")}>Bank Sampah</span>
        <span className="mt-1 text-[0.7rem] text-muted">RW 05</span>
      </span>
    </Link>
  );
}
