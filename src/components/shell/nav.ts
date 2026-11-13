import {
  Activity,
  ArrowDownToLine,
  ArrowLeftRight,
  BarChart3,
  Boxes,
  ClipboardList,
  Factory,
  FileText,
  Layers,
  LayoutDashboard,
  ListChecks,
  MapPin,
  PackageCheck,
  PackageSearch,
  PencilLine,
  Store,
  Tag,
  Truck,
  Users,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
  badge?: number;
  /** Any-of permission list; omitted for pages every signed-in user may open. */
  permission?: string | string[];
  /** Screen still renders sample data (see VITE_DEMO_DATA). */
  demo?: boolean;
}

export interface NavSection {
  section: string;
  items: NavItem[];
}

export const navSections: NavSection[] = [
  {
    section: "Operations",
    items: [
      { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true, demo: true },
      { to: "/receiving", label: "Receiving", icon: ArrowDownToLine, badge: 4, permission: "receipt:read", demo: true },
      { to: "/putaway", label: "Putaway", icon: Boxes, badge: 5, permission: "putaway:read", demo: true },
      { to: "/picking", label: "Picking", icon: PackageSearch, badge: 3, permission: "pick:read", demo: true },
      { to: "/packing", label: "Packing", icon: PackageCheck, badge: 2, permission: "pack:read", demo: true },
      { to: "/shipping", label: "Shipping", icon: Truck, permission: "shipment:read", demo: true },
      { to: "/transfers", label: "Transfers", icon: ArrowLeftRight, permission: "transfer:read", demo: true },
    ],
  },
  {
    section: "Inventory",
    items: [
      { to: "/inventory", label: "Inventory", icon: Layers, permission: "inventory:read", demo: true },
      { to: "/locations", label: "Locations", icon: MapPin, permission: "facility:read", demo: true },
      { to: "/products", label: "Products", icon: Tag, permission: "catalog:read", demo: true },
      { to: "/adjustments", label: "Stock Adjustments", icon: PencilLine, badge: 2, permission: "adjustment:read", demo: true },
      { to: "/cycle-counts", label: "Cycle Counts", icon: ListChecks, permission: "cycle_count:read", demo: true },
    ],
  },
  {
    section: "Management",
    items: [
      { to: "/purchase-orders", label: "Purchase Orders", icon: ClipboardList, permission: "purchase_order:read", demo: true },
      { to: "/sales-orders", label: "Sales Orders", icon: FileText, permission: "sales_order:read", demo: true },
      { to: "/suppliers", label: "Suppliers", icon: Factory, permission: "catalog:read", demo: true },
      { to: "/customers", label: "Customers", icon: Store, permission: "customer:read", demo: true },
      { to: "/users", label: "Users & Roles", icon: Users, permission: "user:read" },
    ],
  },
  {
    section: "Analytics",
    items: [
      { to: "/reports", label: "Reports", icon: BarChart3, permission: "report:read", demo: true },
      { to: "/performance", label: "Warehouse Performance", icon: Activity, permission: "report:read", demo: true },
    ],
  },
];

export const flatNav = navSections.flatMap((section) => section.items);

export function canSeeItem(item: NavItem, permissions: string[]): boolean {
  if (!item.permission) return true;
  const required = Array.isArray(item.permission) ? item.permission : [item.permission];
  return required.some((permission) => permissions.includes(permission));
}

/** Nav sections reduced to the items the signed-in principal may open. */
export function filterNavSections(permissions: string[]): NavSection[] {
  return navSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => canSeeItem(item, permissions)),
    }))
    .filter((section) => section.items.length > 0);
}

export function findNav(pathname: string): NavItem | undefined {
  let best: NavItem | undefined;
  for (const item of flatNav) {
    const match = item.end ? pathname === item.to : pathname === item.to || pathname.startsWith(item.to + "/");
    if (match && (!best || item.to.length > best.to.length)) best = item;
  }
  return best;
}
