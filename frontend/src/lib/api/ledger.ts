import "server-only";

import type { LedgerEntry, LedgerResponse, PageQuery, Paginated } from "@/types/api";
import { authedFetch } from "./client";

export const getMyLedger = (query: PageQuery = {}) =>
  authedFetch<LedgerResponse>("/ledger/my-history", { query: { ...query } });

export const getUserLedger = (userId: string, query: PageQuery = {}) =>
  authedFetch<Paginated<LedgerEntry>>(`/ledger/user/${userId}`, { query: { ...query } });
