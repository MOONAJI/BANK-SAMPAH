import "server-only";

import type { ApiResponse, PageQuery, Paginated, Withdrawal, WithdrawalMethod, WithdrawalStatus } from "@/types/api";
import { authedFetch } from "./client";

export const createWithdrawal = (body: { amount: number; method: WithdrawalMethod; notes?: string }) =>
  authedFetch<ApiResponse<Withdrawal>>("/withdrawals", { method: "POST", body });

export const getWithdrawals = (query: PageQuery & { status?: WithdrawalStatus; nasabah_id?: string } = {}) =>
  authedFetch<Paginated<Withdrawal>>("/withdrawals", { query: { ...query } });

export const getMyWithdrawals = (query: PageQuery = {}) =>
  authedFetch<Paginated<Withdrawal>>("/withdrawals/my-withdrawals", { query: { ...query } });

export const processWithdrawal = (
  id: string,
  body: { status: "APPROVED" | "REJECTED"; rejection_reason?: string; notes?: string },
) => authedFetch<ApiResponse<Withdrawal>>(`/withdrawals/${id}/status`, { method: "PATCH", body });
