import type { InputHTMLAttributes } from "react";

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