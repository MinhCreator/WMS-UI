import { setRefreshHandler, setUnauthorizedHandler } from "../api/client";
import { store } from "./store";
import { refreshSession, sessionExpired } from "./slices/authSlice";

/**
 * Connects the API client's 401 handling to the auth slice without creating an
 * import cycle: the client stays store-agnostic, the store owns the token.
 */
export function installAuthBridge() {
  setRefreshHandler(async () => {
    try {
      const session = await store.dispatch(refreshSession()).unwrap();
      return session.accessToken ?? null;
    } catch {
      return null;
    }
  });

  setUnauthorizedHandler(() => {
    store.dispatch(sessionExpired());
  });
}
