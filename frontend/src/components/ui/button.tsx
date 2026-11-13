import type { ButtonHTMLAttributes } from "react";

export function Button({
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`h-[46px] w-full rounded-[6px] bg-[#00bc7d] text-[15px] font-semibold text-white hover:bg-[#00a86f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00bc7d]/40 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      {...props}
    />
  );
}