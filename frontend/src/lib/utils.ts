import { twMerge } from "tailwind-merge";

/**
 * Gabungkan className, abaikan nilai falsy. Class yang bertabrakan diselesaikan oleh tailwind-merge:
 * yang ditulis belakangan menang, mis. cn("h-9 px-3", "h-10") → "px-3 h-10".
 * Jadi className dari luar komponen benar-benar bisa menimpa class bawaannya.
 */
export function cn(...classes: (string | false | null | undefined)[]) {
  return twMerge(classes.filter(Boolean).join(" "));
}

/** "Budi Santoso" → "BS" */
export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

/** Ambil string dari searchParams (abaikan bentuk array). */
export function param(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

/** Bangun query string dari objek, buang nilai kosong. */
export function qs(params: Record<string, string | number | undefined | null>) {
  const s = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") s.set(k, String(v));
  }
  const str = s.toString();
  return str ? `?${str}` : "";
}
