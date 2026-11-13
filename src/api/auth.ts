import { apiRequest } from "./client";
import type { AuthSession } from "./types";

export interface LoginInput {
  email: string;
  password: string;
}

export interface RequestAccessInput {
  email: string;
  firstName?: string;
  lastName?: string;
  reason?: string;
}

export interface AcceptInviteInput {
  token: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export const authApi = {
  /** Signs in and returns the session; the refresh cookie is set by the API. */
  login: (input: LoginInput) =>
    apiRequest<AuthSession>("/api/auth/login", {
      method: "POST",
      body: input,
      skipAuth: true,
      skipRefresh: true,
    }),

  /** Rotates the refresh cookie and returns a fresh access token. */
  refresh: () =>
    apiRequest<AuthSession>("/api/auth/refresh", {
      method: "POST",
      body: {},
      skipAuth: true,
      skipRefresh: true,
    }),

  logout: () =>
    apiRequest<null>("/api/auth/logout", {
      method: "POST",
      body: {},
      skipRefresh: true,
    }),

  logoutAll: () =>
    apiRequest<{ status: string; tokenVersion: number }>("/api/auth/logout-all", {
      method: "POST",
      body: {},
    }),

  me: () => apiRequest<AuthSession>("/api/auth/me"),

  requestAccess: (input: RequestAccessInput) =>
    apiRequest<{ status: string }>("/api/auth/request-access", {
      method: "POST",
      body: input,
      skipAuth: true,
      skipRefresh: true,
    }),

  acceptInvite: (input: AcceptInviteInput) =>
    apiRequest<AuthSession>("/api/auth/accept-invite", {
      method: "POST",
      body: input,
      skipAuth: true,
      skipRefresh: true,
    }),

  forgotPassword: (email: string) =>
    apiRequest<{ status: string; message: string }>("/api/auth/forgot-password", {
      method: "POST",
      body: { email },
      skipAuth: true,
      skipRefresh: true,
    }),

  resetPassword: (token: string, password: string) =>
    apiRequest<{ status: string }>("/api/auth/reset-password", {
      method: "POST",
      body: { token, password },
      skipAuth: true,
      skipRefresh: true,
    }),

  staffLogin: (badgeNumber: string, pin: string) =>
    apiRequest<{ staff: { id: string; firstName: string; lastName: string }; warehouseId: string | null }>(
      "/api/auth/staff-login",
      {
        method: "POST",
        body: { badgeNumber, pin },
        skipAuth: true,
        skipRefresh: true,
      },
    ),
};
