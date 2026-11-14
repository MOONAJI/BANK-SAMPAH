"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PublicNavLink({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  const active = usePathname() === href;
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "inline-flex h-10 items-center rounded-lg px-3 text-sm text-ink hover:bg-neutral-100",
        active && "font-semibold underline underline-offset-4",
        className,
      )}
    >
      {children}
    </Link>
  );
}
