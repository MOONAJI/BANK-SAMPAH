import type { ComponentProps, InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export const controlClass = (error?: string) =>
  cn(
    "w-full rounded-lg border bg-surface px-3.5 text-base text-ink outline-none transition-colors",
    "placeholder:text-neutral-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100",
    "disabled:bg-neutral-50 disabled:text-muted",
    error ? "border-red-500" : "border-neutral-300",
  );

interface FieldShellProps {
  label: string;
  id: string;
  error?: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}

/** Label + kontrol + pesan error/hint yang terhubung lewat aria-describedby. */
function FieldShell({ label, id, error, hint, children, className }: FieldShellProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      {children}
      {(error || hint) && (
        <p id={`${id}-msg`} className={cn("text-sm", error ? "text-danger" : "text-muted")}>
          {error ?? hint}
        </p>
      )}
    </div>
  );
}

type Common = { label: string; name: string; error?: string; hint?: string; wrapperClassName?: string };

export function Input({ label, name, error, hint, id, className, wrapperClassName, ...props }: Common & ComponentProps<"input">) {
  const inputId = id ?? name;
  return (
    <FieldShell label={label} id={inputId} error={error} hint={hint} className={wrapperClassName}>
      <input
        id={inputId}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={error || hint ? `${inputId}-msg` : undefined}
        className={cn(controlClass(error), "h-11", className)}
        {...props}
      />
    </FieldShell>
  );
}

export function Select({
  label,
  name,
  error,
  hint,
  id,
  className,
  wrapperClassName,
  children,
  ...props
}: Common & ComponentProps<"select">) {
  const inputId = id ?? name;
  return (
    <FieldShell label={label} id={inputId} error={error} hint={hint} className={wrapperClassName}>
      <select
        id={inputId}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={error || hint ? `${inputId}-msg` : undefined}
        className={cn(controlClass(error), "h-11", className)}
        {...props}
      >
        {children}
      </select>
    </FieldShell>
  );
}

export function Textarea({ label, name, error, hint, id, className, wrapperClassName, ...props }: Common & ComponentProps<"textarea">) {
  const inputId = id ?? name;
  return (
    <FieldShell label={label} id={inputId} error={error} hint={hint} className={wrapperClassName}>
      <textarea
        id={inputId}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={error || hint ? `${inputId}-msg` : undefined}
        className={cn(controlClass(error), "min-h-20 py-2.5", className)}
        {...props}
      />
    </FieldShell>
  );
}

// ---------------------------------------------------------------------------
// Field: dipakai form login & daftar (dibuat bersama halaman auth).
// ---------------------------------------------------------------------------

type FieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "id" | "name"> & {
  id: string;
  label: string;
  hint?: string;
  error?: string;
};

export function Field({
  id,
  label,
  hint,
  error,
  className = "",
  ...props
}: FieldProps) {
  const errorId = `${id}-error`;

  return (
    <div className={`flex w-full flex-col gap-1.5 ${className}`}>
      <label htmlFor={id} className="text-[14px] font-medium text-[#1f1f1f]">
        {label}
        {hint && <span className="font-normal text-[#555]"> ({hint})</span>}
      </label>
      <input
        id={id}
        name={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={`h-11 w-full rounded-[6px] bg-white px-3 text-base text-[#1f1f1f] placeholder:text-[#757575] focus:outline-none focus:ring-2 ${
          error
            ? "border-2 border-[#b42318] focus:ring-[#b42318]/20"
            : "border border-[#9a9a9a] focus:border-[#00bc7d] focus:ring-[#00bc7d]/25"
        }`}
        {...props}
      />
      {error && (
        <p id={errorId} className="text-[13px] text-[#b42318]">
          {error}
        </p>
      )}
    </div>
  );
}
