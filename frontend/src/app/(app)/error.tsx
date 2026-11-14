"use client";

import { Button } from "@/components/ui/button";

export default function AppError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto my-10 max-w-md rounded-(--radius-card) border border-line bg-surface p-6 text-center">
      <h1 className="text-lg font-semibold">Data gagal dimuat</h1>
      <p className="mt-2 text-sm text-muted">{error.message || "Terjadi kesalahan. Coba lagi sebentar."}</p>
      <Button variant="outline" className="mt-5" onClick={reset}>
        Coba lagi
      </Button>
    </div>
  );
}
