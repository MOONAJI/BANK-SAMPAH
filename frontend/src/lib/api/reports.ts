import "server-only";

import type { ApiResponse, DashboardStats, WasteSummaryItem } from "@/types/api";
import { authedFetch } from "./client";

export const getDashboardStats = () => authedFetch<ApiResponse<DashboardStats>>("/reports/dashboard");

export const getWasteSummary = () => authedFetch<ApiResponse<WasteSummaryItem[]>>("/reports/waste-summary");

// Ekspor CSV diunduh browser lewat route handler src/app/api/export/[type]/route.ts.
