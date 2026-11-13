export function Logo() {
  return (
    <div className="flex h-11 items-center">
      <svg
        width="44"
        height="36"
        viewBox="516 62 88 80"
        aria-hidden="true"
        className="shrink-0"
      >
        <rect x="548" y="62" width="24" height="8" rx="3" fill="#166534" />
        <rect x="516" y="70" width="88" height="10" rx="4" fill="#166534" />
        <path
          d="M522 84 H598 L592 138 Q591 142 587 142 H533 Q529 142 528 138 Z"
          fill="#16A34A"
        />
        <path
          d="M560 130 C540 126 538 104 546 94 C562 98 568 114 560 130 Z"
          fill="#FFFFFF"
        />
      </svg>
      <div className="ml-[11px]">
        <p className="text-[22px] leading-[26px] text-[#111827]">Bank Sampah</p>
        <p className="text-[13px] leading-4 text-[#6b7280]">RW 05</p>
      </div>
    </div>
  );
}