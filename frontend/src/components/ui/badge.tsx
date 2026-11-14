import type { ReactNode } from "react";
import type { WithdrawalStatus } from "@/types/api";
import { WITHDRAWAL_STATUS_LABEL } from "@/lib/constants";
import { cn } from "@/lib/utils";

type Tone = "neutral" | "brand" | "warning" | "danger" | "outline";

const TONE: Record<Tone, string> = {
  neutral: "bg-neutral-100 text-muted",
  brand: "bg-brand-soft text-brand",
  warning: "bg-warning-soft text-warning",
  danger: "bg-danger-soft text-danger",
  outline: "border border-ink text-ink",
};

export function Badge({ tone = "neutral", children, className }: { tone?: Tone; children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap",
        TONE[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

const STATUS_TONE: Record<WithdrawalStatus, Tone> = { PENDING: "warning", APPROVED: "brand", REJECTED: "danger" };

export function WithdrawalBadge({ status }: { status: WithdrawalStatus }) {
  return <Badge tone={STATUS_TONE[status]}>{WITHDRAWAL_STATUS_LABEL[status]}</Badge>;
}
