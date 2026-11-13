export function FormAlert({ children }: { children: React.ReactNode }) {
  return (
    <div
      role="alert"
      className="w-full rounded-[6px] border border-[#9a9a9a] bg-[#fdecea] px-3.5 py-3 text-[13px] text-[#b42318]"
    >
      {children}
    </div>
  );
}