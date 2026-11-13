import { Loader2, ShieldAlert } from "lucide-react";
import type { ReactNode } from "react";
import { Link, Navigate, Outlet, useLocation } from "react-router-dom";
import { useAppSelector } from "../../states/hooks";
import { selectAuthStatus, selectCan } from "../../states/slices/authSlice";

export function useCan(permission: string | string[]): boolean {
  return useAppSelector(selectCan(permission));
}

function Booting() {
  return (
    <div className="flex min-h-screen items-center justify-center gap-2 bg-app text-tn text-ink-3">
      <Loader2 size={16} className="animate-spin" />
      Restoring your session…
    </div>
  );
}

export function ForbiddenScreen({
  permission,
  title = "Access denied",
}: {
  permission?: string | string[];
  title?: string;
}) {
  const required = Array.isArray(permission) ? permission.join(", ") : permission;
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-2 text-center">
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-danger-bg text-danger">
        <ShieldAlert size={17} />
      </span>
      <h1 className="text-tn font-semibold text-ink">{title}</h1>
      <p className="max-w-sm text-2xs text-ink-3">
        Your role does not include {required ? <span className="font-mono">{required}</span> : "this page"}.
        Ask an administrator if you believe this is a mistake.
      </p>
      <Link
        to="/"
        className="mt-1 rounded-[6px] border border-line-strong bg-surface px-2.5 py-1.5 text-2xs font-semibold text-ink-2 transition-colors hover:border-ink-4 hover:text-ink"
      >
        Back to dashboard
      </Link>
    </div>
  );
}

/** Gate for the whole shell: unauthenticated visitors go to /login. */
export function RequireAuth() {
  const status = useAppSelector(selectAuthStatus);
  const location = useLocation();

  if (status === "booting") return <Booting />;
  if (status !== "authenticated") {
    const from = `${location.pathname}${location.search}`;
    return <Navigate to="/login" replace state={{ from: from === "/" ? undefined : from }} />;
  }
  return <Outlet />;
}

/** Keeps signed-in users away from the login/signup screens. */
export function RedirectIfAuthenticated({ children }: { children: ReactNode }) {
  const status = useAppSelector(selectAuthStatus);
  if (status === "booting") return <Booting />;
  if (status === "authenticated") return <Navigate to="/" replace />;
  return <>{children}</>;
}

/** Gate for a single page or action. Composes with RequireAuth. */
export function RequirePermission({
  permission,
  children,
}: {
  permission: string | string[];
  children: ReactNode;
}) {
  const allowed = useCan(permission);
  if (!allowed) return <ForbiddenScreen permission={permission} />;
  return <>{children}</>;
}

export function Can({
  permission,
  children,
  fallback = null,
}: {
  permission: string | string[];
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return useCan(permission) ? <>{children}</> : <>{fallback}</>;
}
