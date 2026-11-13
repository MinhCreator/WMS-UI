import type { ApiErrorDetail } from "./types";

export const API_BASE = (import.meta.env.VITE_API_URL ?? "").replace(/\/+$/, "");

/**
 * The access token lives in memory only. The refresh token is an httpOnly
 * cookie scoped to /api/auth, so a page reload restores the session through
 * `POST /api/auth/refresh` (see authBridge).
 */
let accessToken: string | null = null;

/** Called by the auth layer when a 401 is worth one refresh-and-retry. */
type RefreshHandler = () => Promise<string | null>;
let refreshHandler: RefreshHandler | null = null;
let inFlightRefresh: Promise<string | null> | null = null;

/** Called when a request fails after a refresh attempt. */
type UnauthorizedHandler = () => void;
let unauthorizedHandler: UnauthorizedHandler | null = null;

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: ApiErrorDetail[];

  constructor(status: number, code: string, message: string, details?: ApiErrorDetail[]) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

export function setRefreshHandler(handler: RefreshHandler | null) {
  refreshHandler = handler;
  inFlightRefresh = null;
}

export function setUnauthorizedHandler(handler: UnauthorizedHandler | null) {
  unauthorizedHandler = handler;
}

export function activeWarehouseId(): string | null {
  try {
    return window.localStorage.getItem("wms.activeWarehouseId");
  } catch {
    return null;
  }
}

export function setActiveWarehouseId(warehouseId: string | null) {
  try {
    if (warehouseId) window.localStorage.setItem("wms.activeWarehouseId", warehouseId);
    else window.localStorage.removeItem("wms.activeWarehouseId");
  } catch {
    // Storage can be unavailable (private mode); the header just goes missing.
  }
}

export function isAbortError(error: unknown) {
  return error instanceof DOMException && error.name === "AbortError";
}

export interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  /** Skip attaching the bearer token (login, refresh, request-access). */
  skipAuth?: boolean;
  /** Do not attempt a refresh-and-retry (used by the refresh call itself). */
  skipRefresh?: boolean;
  /** Send X-Warehouse-Id for the active site. Defaults to true when known. */
  warehouseScoped?: boolean;
}

interface RawResponse {
  status: number;
  ok: boolean;
  body: unknown;
}

async function rawRequest(path: string, options: RequestOptions): Promise<RawResponse> {
  const headers: Record<string, string> = { Accept: "application/json", ...options.headers };

  if (options.body !== undefined) headers["Content-Type"] = "application/json";

  if (!options.skipAuth && accessToken) headers.Authorization = `Bearer ${accessToken}`;

  if (options.warehouseScoped !== false) {
    const warehouseId = activeWarehouseId();
    if (warehouseId) headers["X-Warehouse-Id"] = warehouseId;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    method: options.method ?? "GET",
    headers,
    credentials: "include",
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    signal: options.signal,
  });

  let body: unknown = null;
  if (response.status !== 204) {
    const text = await response.text();
    if (text) {
      try {
        body = JSON.parse(text);
      } catch {
        body = text;
      }
    }
  }

  return { status: response.status, ok: response.ok, body };
}

function toApiError(response: RawResponse): ApiError {
  const payload = response.body as
    | { error?: { code?: string; message?: string; details?: ApiErrorDetail[] } }
    | undefined;
  const error = payload?.error;
  return new ApiError(
    response.status,
    error?.code ?? "REQUEST_FAILED",
    error?.message ?? `Request failed with status ${response.status}`,
    error?.details,
  );
}

async function tryRefresh(): Promise<string | null> {
  if (!refreshHandler) return null;
  if (!inFlightRefresh) {
    inFlightRefresh = refreshHandler()
      .catch(() => null)
      .finally(() => {
        inFlightRefresh = null;
      });
  }
  return inFlightRefresh;
}

/**
 * Fetch JSON from the API. On 401 it performs a single refresh-and-retry, so
 * callers never have to think about token expiry.
 */
export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await rawRequest(path, options);

  if (response.status === 401 && !options.skipRefresh && !options.skipAuth) {
    const token = await tryRefresh();
    if (token) {
      const retry = await rawRequest(path, { ...options, skipRefresh: true });
      if (retry.ok) return (retry.body ?? null) as T;
      throw toApiError(retry);
    }
    unauthorizedHandler?.();
    throw toApiError(response);
  }

  if (!response.ok) throw toApiError(response);
  return (response.body ?? null) as T;
}

export function queryString(
  params: Record<string, string | number | boolean | undefined | null>,
): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    search.set(key, String(value));
  }
  const encoded = search.toString();
  return encoded ? `?${encoded}` : "";
}

export function errorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return "Something went wrong";
}

export function fieldErrors(error: unknown): Record<string, string> {
  if (!(error instanceof ApiError) || !error.details) return {};
  const result: Record<string, string> = {};
  for (const detail of error.details) {
    if (detail.field && !result[detail.field]) result[detail.field] = detail.message;
  }
  return result;
}
