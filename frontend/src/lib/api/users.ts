import "server-only";

import type { ApiResponse, Role, User } from "@/types/api";
import { authedFetch } from "./client";

export interface UserInput {
  name: string;
  email: string;
  password: string;
  role: Role;
  phone?: string;
  address?: string;
}

export const getUsers = (query: { role?: Role; search?: string } = {}) =>
  authedFetch<ApiResponse<User[]> & { count: number }>("/users", { query: { ...query } });

export const getUser = (id: string) => authedFetch<ApiResponse<User>>(`/users/${id}`);

export const createUser = (body: UserInput) => authedFetch<ApiResponse<User>>("/users", { method: "POST", body });

export const updateUser = (id: string, body: Partial<Pick<UserInput, "name" | "role" | "phone" | "address">>) =>
  authedFetch<ApiResponse<User>>(`/users/${id}`, { method: "PUT", body });

export const deleteUser = (id: string) => authedFetch<ApiResponse<unknown>>(`/users/${id}`, { method: "DELETE" });
