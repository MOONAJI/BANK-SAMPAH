"use client";

import { usePathname, useRouter } from "next/navigation";
import { useRef, useTransition, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Form filter GET yang langsung menerapkan perubahan ke URL (tanpa tombol "Cari").
 * Input teks di-debounce 400 ms; select/tanggal langsung. Parameter `keep` ikut dipertahankan.
 */
export function FilterForm({
  children,
  className,
  keep = {},
  label,
}: {
  children: ReactNode;
  className?: string;
  keep?: Record<string, string | undefined>;
  label: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function apply() {
    const form = formRef.current;
    if (!form) return;
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(keep)) if (v) params.set(k, v);
    for (const [k, v] of new FormData(form).entries()) if (typeof v === "string" && v.trim()) params.set(k, v.trim());
    const query = params.toString();
    startTransition(() => router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false }));
  }

  return (
    <form
      ref={formRef}
      role="search"
      aria-label={label}
      aria-busy={pending}
      className={cn(className, pending && "opacity-80")}
      onSubmit={(e) => {
        e.preventDefault();
        apply();
      }}
      onChange={(e) => {
        const target = e.target as unknown as { type?: string };
        if (timer.current) clearTimeout(timer.current);
        if (target.type === "text" || target.type === "search") timer.current = setTimeout(apply, 400);
        else apply();
      }}
    >
      {children}
    </form>
  );
}
