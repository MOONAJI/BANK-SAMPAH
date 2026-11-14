"use client";

import { useState } from "react";
import { Printer, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Bagikan ringkasan struk lewat menu share HP; kalau tidak didukung, salin ke clipboard. */
export function ShareReceiptButton({ text, title }: { text: string; title: string }) {
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");

  async function share() {
    try {
      if (navigator.share) {
        await navigator.share({ title, text });
        return;
      }
      await navigator.clipboard.writeText(text);
      setStatus("copied");
    } catch (error) {
      if ((error as Error).name !== "AbortError") setStatus("failed");
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Button variant="outline" size="lg" onClick={share}>
        <Share2 className="size-4" aria-hidden />
        Bagikan struk
      </Button>
      <p role="status" className="text-center text-sm text-muted">
        {status === "copied" && "Ringkasan struk disalin. Tempel di WhatsApp atau catatan."}
        {status === "failed" && "Gagal membagikan struk."}
      </p>
    </div>
  );
}

export function PrintButton() {
  return (
    <Button variant="outline" size="lg" className="no-print w-full" onClick={() => window.print()}>
      <Printer className="size-4" aria-hidden />
      Cetak struk
    </Button>
  );
}
