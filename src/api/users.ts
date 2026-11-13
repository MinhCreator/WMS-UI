import { apiRequest, queryString } from "./client";
import type {
  AccessRequestRecord,
  InviteResult,
  Paged,
  SecurityRole,
  UserRecord,
} from "./types";

export interface UserListParams {
  page?: number;
  limit?: number;
  role?: string;
  isActive?: boolean;
  search?: string;
}

export interface UserUpdateInput {
  firstName?: string | null;
  lastName?: string | null;
  role?: SecurityRole;
  warehouseId?: string | null;
  allWarehouses?: boolean;
  isActive?: boolean;
}

export interface InviteInput {
  email: string;
  role: SecurityRole;
  warehouseId?: string | null;
}

export const usersApi = {
  list: (params: UserListParams = {}) =>
    apiRequest<Paged<UserRecord>>(`/api/users${queryString({ ...params })}`),

  get: (id: string) => apiRequest<UserRecord>(`/api/users/${id}`),

  update: (id: string, input: UserUpdateInput) =>
    apiRequest<UserRecord>(`/api/users/${id}`, { method: "PATCH", body: input }),

  revokeSessions: (id: string) =>
    apiRequest<{ status: string; tokenVersion: number }>(`/api/users/${id}/revoke-sessions`, {
      method: "POST",
      body: {},
    }),

  listAccessRequests: () =>
    apiRequest<{ data: AccessRequestRecord[] }>("/api/auth/access-requests"),

  approveAccessRequest: (id: string, role: SecurityRole, warehouseId?: string | null) =>
    apiRequest<InviteResult>(`/api/auth/access-requests/${id}/approve`, {
      method: "POST",
      body: { role, warehouseId: warehouseId ?? null },
    }),

  rejectAccessRequest: (id: string) =>
    apiRequest<{ status: string }>(`/api/auth/access-requests/${id}/reject`, {
      method: "POST",
      body: {},
    }),

  createInvite: (input: InviteInput) =>
    apiRequest<InviteResult>("/api/auth/invites", { method: "POST", body: input }),
};
