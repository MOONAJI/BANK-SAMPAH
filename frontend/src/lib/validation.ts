// Aturan validasi yang sama dengan backend/src/middleware/validateMiddleware.js.

export type FieldErrors = Partial<Record<string, string>>;

export type FormState =
  | {
      ok?: boolean;
      message?: string;
      errors?: FieldErrors;
    }
  | undefined;

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PHONE_REGEX = /^(\+62|62|0)[0-9]{8,14}$/;

export function validateName(name: string) {
  if (name.trim().length < 3) return "Nama minimal 3 karakter.";
}

export function validateEmail(email: string) {
  if (!EMAIL_REGEX.test(email.trim())) return "Format email tidak valid.";
}

export function validatePassword(password: string) {
  if (password.length < 6) return "Kata sandi minimal 6 karakter.";
}

export function validatePhone(phone: string) {
  if (phone && !PHONE_REGEX.test(phone.replace(/\s|-/g, ""))) {
    return "Gunakan format nomor Indonesia, contoh 08123456789.";
  }
}

/** Buang field tanpa error; undefined bila tidak ada error sama sekali. */
export function compactErrors(errors: FieldErrors): FieldErrors | undefined {
  const entries = Object.entries(errors).filter(([, v]) => Boolean(v));
  return entries.length ? Object.fromEntries(entries) : undefined;
}

/** "15.000" / "15000" / "Rp 15.000" → 15000 */
export function parseRupiah(value: string) {
  const digits = value.replace(/[^\d]/g, "");
  return digits ? Number(digits) : NaN;
}

/** "3,5" / "3.5" → 3.5 */
export function parseDecimal(value: string) {
  const n = Number(value.trim().replace(",", "."));
  return Number.isFinite(n) ? n : NaN;
}
