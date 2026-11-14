// Tipe data yang mengikuti model & response backend (backend/src/models, backend/src/controllers).

export type Role = "admin" | "petugas" | "nasabah";

export type EwalletProvider = "GOPAY" | "OVO" | "DANA" | "SHOPEEPAY" | "BANK_TRANSFER" | "TUNAI" | "LAINNYA";

export interface EwalletInfo {
  provider: EwalletProvider;
  account_number: string;
  account_name: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: Role;
  balance: number;
  phone: string;
  address: string;
  ewallet_info?: EwalletInfo;
  createdAt?: string;
}

/** User hasil `populate()` di backend (hanya field yang dipilih). */
export type UserRef = Pick<User, "_id" | "name"> & Partial<Pick<User, "email" | "phone" | "address" | "balance">>;

export type WasteGroup = "Plastik" | "Kertas" | "Logam" | "Kaca" | "Lainnya";

export interface WasteCategory {
  _id: string;
  name: string;
  category_group: WasteGroup;
  price_per_kg: number;
  unit: string;
  description: string;
  isActive: boolean;
}

export interface DepositItem {
  waste_id: string;
  waste_name: string;
  price_per_kg: number;
  weight_kg: number;
  subtotal: number;
}

export interface Deposit {
  _id: string;
  transaction_code: string;
  nasabah_id: UserRef | null;
  petugas_id: UserRef | null;
  items: DepositItem[];
  total_weight_kg: number;
  total_amount: number;
  notes: string;
  createdAt: string;
}

export type WithdrawalMethod = "TUNAI" | "E_WALLET" | "BANK_TRANSFER";
export type WithdrawalStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface Withdrawal {
  _id: string;
  transaction_code: string;
  nasabah_id: UserRef | string | null;
  amount: number;
  method: WithdrawalMethod;
  destination: { provider: string; account_number: string; account_name: string };
  status: WithdrawalStatus;
  processed_by: UserRef | string | null;
  rejection_reason: string;
  notes: string;
  processed_at: string | null;
  createdAt: string;
}

export interface LedgerEntry {
  _id: string;
  user_id: string;
  type: "CREDIT" | "DEBIT";
  reference_type: "DEPOSIT" | "WITHDRAWAL";
  reference_id: string;
  amount: number;
  balance_before: number;
  balance_after: number;
  description: string;
  createdAt: string;
}

export interface DashboardStats {
  users: { total_nasabah: number; total_petugas: number };
  deposits: { total_weight_kg: number; total_amount_rp: number; total_transactions: number };
  withdrawals: { total_amount_rp: number; total_transactions: number; pending_count: number };
  financials: { total_nasabah_balance_rp: number };
}

export interface WasteSummaryItem {
  waste_id: string;
  waste_name: string;
  total_weight_kg: number;
  total_amount_rp: number;
  transaction_count: number;
}

// ---- Pembungkus response ----

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface Paginated<T> extends ApiResponse<T[]> {
  count: number;
  total: number;
  page: number;
  totalPages: number;
}

export interface LedgerResponse extends Paginated<LedgerEntry> {
  current_balance: number;
}

export interface PageQuery {
  page?: number;
  limit?: number;
}
