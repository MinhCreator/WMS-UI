import { createAsyncThunk, createSelector, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { authApi, type LoginInput } from "../../api/auth";
import {
  activeWarehouseId,
  errorMessage,
  setAccessToken,
  setActiveWarehouseId,
} from "../../api/client";
import type { AuthSession, AuthWarehouse, SessionUser } from "../../api/types";
import type { RootState } from "../store";

export type AuthStatus = "booting" | "anonymous" | "authenticated";

interface AuthState {
  status: AuthStatus;
  user: SessionUser | null;
  permissions: string[];
  warehouses: AuthWarehouse[];
  activeWarehouseId: string | null;
  error: string | null;
}

const initialState: AuthState = {
  status: "booting",
  user: null,
  permissions: [],
  warehouses: [],
  activeWarehouseId: null,
  error: null,
};

function applySession(state: AuthState, session: AuthSession) {
  state.status = "authenticated";
  state.user = session.user;
  state.permissions = session.permissions;
  state.warehouses = session.warehouses;

  const allowed = session.warehouses.map((warehouse) => warehouse.id);
  const stored = activeWarehouseId();
  const preferred = [stored, session.user.warehouseId, allowed[0]].find(
    (id): id is string => !!id && allowed.includes(id),
  );
  state.activeWarehouseId = preferred ?? null;
  setActiveWarehouseId(state.activeWarehouseId);
}

function clearSession(state: AuthState) {
  state.status = "anonymous";
  state.user = null;
  state.permissions = [];
  state.warehouses = [];
  state.activeWarehouseId = null;
  setAccessToken(null);
}

/** Reload bootstrap and any explicit "retry session" action. */
export const restoreSession = createAsyncThunk("auth/restore", async () => {
  try {
    const session = await authApi.refresh();
    setAccessToken(session.accessToken ?? null);
    return session;
  } catch {
    setAccessToken(null);
    return null;
  }
});

/** Used by the API client to recover from a 401; rejects when refresh fails. */
export const refreshSession = createAsyncThunk<AuthSession, void, { rejectValue: string }>(
  "auth/refresh",
  async (_, { rejectWithValue }) => {
    try {
      const session = await authApi.refresh();
      setAccessToken(session.accessToken ?? null);
      return session;
    } catch (error) {
      setAccessToken(null);
      return rejectWithValue(errorMessage(error));
    }
  },
);

export const login = createAsyncThunk<AuthSession, LoginInput, { rejectValue: string }>(
  "auth/login",
  async (input, { rejectWithValue }) => {
    try {
      const session = await authApi.login(input);
      setAccessToken(session.accessToken ?? null);
      return session;
    } catch (error) {
      return rejectWithValue(errorMessage(error));
    }
  },
);

export const logout = createAsyncThunk("auth/logout", async () => {
  try {
    await authApi.logout();
  } catch {
    // Logout is idempotent; the local session is cleared regardless.
  }
  setAccessToken(null);
});

export const logoutEverywhere = createAsyncThunk("auth/logout-everywhere", async () => {
  try {
    await authApi.logoutAll();
  } catch {
    // Fall through: clearing local state is still correct.
  }
  setAccessToken(null);
});

export const acceptInvite = createAsyncThunk<
  AuthSession,
  Parameters<typeof authApi.acceptInvite>[0],
  { rejectValue: string }
>("auth/accept-invite", async (input, { rejectWithValue }) => {
  try {
    const session = await authApi.acceptInvite(input);
    setAccessToken(session.accessToken ?? null);
    return session;
  } catch (error) {
    return rejectWithValue(errorMessage(error));
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    sessionExpired(state) {
      clearSession(state);
    },
    clearAuthError(state) {
      state.error = null;
    },
    setActiveWarehouse(state, action: PayloadAction<string | null>) {
      const id = action.payload;
      if (id && state.warehouses.some((warehouse) => warehouse.id === id)) {
        state.activeWarehouseId = id;
        setActiveWarehouseId(id);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(restoreSession.fulfilled, (state, action) => {
        if (action.payload) applySession(state, action.payload);
        else clearSession(state);
      })
      .addCase(restoreSession.rejected, (state) => clearSession(state))
      .addCase(refreshSession.fulfilled, (state, action) => applySession(state, action.payload))
      .addCase(refreshSession.rejected, (state) => clearSession(state))
      .addCase(login.pending, (state) => {
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => applySession(state, action.payload))
      .addCase(login.rejected, (state, action) => {
        state.status = "anonymous";
        state.error = action.payload ?? "Sign in failed";
      })
      .addCase(acceptInvite.fulfilled, (state, action) => applySession(state, action.payload))
      .addCase(acceptInvite.rejected, (state, action) => {
        state.error = action.payload ?? "Invite could not be accepted";
      })
      .addCase(logout.fulfilled, (state) => {
        clearSession(state);
        setActiveWarehouseId(null);
      })
      .addCase(logoutEverywhere.fulfilled, (state) => {
        clearSession(state);
        setActiveWarehouseId(null);
      });
  },
});

export const { sessionExpired, clearAuthError, setActiveWarehouse } = authSlice.actions;
export default authSlice.reducer;

// Selectors
export const selectAuthStatus = (state: RootState) => state.auth.status;
export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectPermissions = (state: RootState) => state.auth.permissions;
export const selectAuthError = (state: RootState) => state.auth.error;
export const selectWarehouses = (state: RootState) => state.auth.warehouses;
export const selectActiveWarehouseId = (state: RootState) => state.auth.activeWarehouseId;

export const selectIsAuthenticated = (state: RootState) => state.auth.status === "authenticated";

export const selectActiveWarehouse = createSelector(
  [selectWarehouses, selectActiveWarehouseId],
  (warehouses, id) => warehouses.find((warehouse) => warehouse.id === id) ?? warehouses[0] ?? null,
);

export const selectCan = (permission: string | string[]) => (state: RootState) => {
  const required = Array.isArray(permission) ? permission : [permission];
  return required.some((item) => state.auth.permissions.includes(item));
};

export const selectDisplayName = createSelector([selectCurrentUser], (user) => {
  if (!user) return "";
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  return name || user.email || "Account";
});

export const selectInitials = createSelector([selectDisplayName], (name) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "?",
);
