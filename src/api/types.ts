export type SecurityRole = "ADMIN" | "MANAGER" | "OFFICE" | "OPERATOR" | "VIEWER" | "STAFF";

export interface SessionUser {
  id: string;
  kind?: "user" | "staff";
  email?: string | null;
  firstName: string | null;
  lastName: string | null;
  role: SecurityRole | string;
  isActive?: boolean;
  warehouseId: string | null;
  allWarehouses: boolean;
  jobRoleId?: string | null;
  jobRole?: string | null;
  lastLoginAt?: string | null;
  createdAt?: string;
}

export interface AuthWarehouse {
  id: string;
  name: string;
  isActive?: boolean;
}

export interface AuthSession {
  user: SessionUser;
  /** Present on login/refresh responses; `/me` returns only the session view. */
  accessToken?: string;
  permissions: string[];
  warehouses: AuthWarehouse[];
}

export interface UserRecord extends SessionUser {
  warehouse: AuthWarehouse | null;
}

export interface Paged<T> {
  data: T[];
  meta: { total: number; page: number; limit: number; pages: number };
}

export interface AccessRequestRecord {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  reason: string | null;
  status: string;
  createdAt: string;
  warehouseId?: string | null;
  user?: UserRecord | null;
}

export interface InviteResult {
  invite: {
    id: string;
    email: string;
    role: SecurityRole;
    warehouseId: string | null;
    token: string;
    expiresAt: string;
  };
  /** Present when the environment cannot deliver email (local/demo). */
  inviteUrl?: string;
}

export interface ApiErrorDetail {
  field?: string;
  message: string;
}
