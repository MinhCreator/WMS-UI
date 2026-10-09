import { Link, useLocation } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { findNav } from "./nav";

interface Crumb {
  label: string;
  to?: string;
}

function crumbsFor(pathname: string): Crumb[] {
  if (pathname === "/") return [{ label: "Dashboard" }];

  const segs = pathname.split("/").filter(Boolean);
  const crumbs: Crumb[] = [];

  const parentByChild: Record<string, string> = {
    "/receiving": "Operations",
    "/putaway": "Operations",
    "/picking": "Operations",
    "/packing": "Operations",
    "/shipping": "Operations",
    "/transfers": "Operations",
    "/inventory": "Inventory",
    "/locations": "Inventory",
    "/products": "Inventory",
    "/adjustments": "Inventory",
    "/cycle-counts": "Inventory",
    "/purchase-orders": "Management",
    "/sales-orders": "Management",
    "/suppliers": "Management",
    "/customers": "Management",
    "/users": "Management",
    "/reports": "Analytics",
    "/performance": "Analytics",
    "/settings": "Account",
  };

  const root = `/${segs[0] ?? ""}`;
  const sectionLabel = parentByChild[root];
  if (sectionLabel) crumbs.push({ label: sectionLabel });

  const nav = findNav(pathname);
  if (nav) {
    crumbs.push({ label: nav.label, to: nav.to });
    if (segs.length > 1) {
      const rest = segs.slice(1);
      rest.forEach((s, i) => {
        const isLast = i === rest.length - 1;
        const pretty =
          s.startsWith("SKU-") || s.startsWith("SO-") || s.startsWith("PO-") || s.startsWith("CC-")
            ? s
            : decodeURIComponent(s).replace(/-/g, " ");
        crumbs.push({ label: isLast ? pretty : pretty, to: isLast ? undefined : pathname });
      });
    }
  } else {
    crumbs.push({ label: segs.join(" / ") });
  }

  return crumbs;
}

export function Breadcrumbs() {
  const { pathname } = useLocation();
  const crumbs = crumbsFor(pathname);

  return (
    <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1 text-2xs">
      <ol className="flex min-w-0 items-center gap-1">
        {crumbs.map((c, i) => {
          const last = i === crumbs.length - 1;
          return (
            <li key={i} className="flex min-w-0 items-center gap-1">
              {i > 0 && <ChevronRight size={11} className="shrink-0 text-ink-4" aria-hidden />}
              {c.to && !last ? (
                <Link
                  to={c.to}
                  className="truncate text-ink-3 hover:text-accent hover:underline"
                >
                  {c.label}
                </Link>
              ) : (
                <span
                  className={`truncate ${last ? "font-semibold text-ink" : "text-ink-3"}`}
                  aria-current={last ? "page" : undefined}
                >
                  {c.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export function usePageTitle(): string {
  const { pathname } = useLocation();
  const crumbs = crumbsFor(pathname);
  return crumbs[crumbs.length - 1]?.label ?? "WarehouseOS";
}
