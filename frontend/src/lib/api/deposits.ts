import "server-only";

import type { ApiResponse, Deposit, PageQuery, Paginated } from "@/types/api";
import { authedFetch } from "./client";

export interface DepositInput {
  nasabah_id: string;
  items: { waste_id: string; weight_kg: number }[];
  notes?: string;
}

export const createDeposit = (body: DepositInput) =>
  authedFetch<ApiResponse<Deposit> & { nasabah_balance: number }>("/deposits", { method: "POST", body });

export const getDeposits = (query: PageQuery & { nasabah_id?: string; startDate?: string; endDate?: string } = {}) =>
  authedFetch<Paginated<Deposit>>("/deposits", { query: { ...query } });

export const getMyDeposits = (query: PageQuery = {}) =>
  authedFetch<Paginated<Deposit>>("/deposits/my-deposits", { query: { ...query } });

export const getDeposit = (id: string) => authedFetch<ApiResponse<Deposit>>(`/deposits/${id}`);
