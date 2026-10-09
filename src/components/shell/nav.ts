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
}

export interface NavSection {
  section: string;
  items: NavItem[];
}

export const navSections: NavSection[] = [
  {
    section: "Operations",
    items: [
      { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
      { to: "/receiving", label: "Receiving", icon: ArrowDownToLine, badge: 4 },
      { to: "/putaway", label: "Putaway", icon: Boxes, badge: 5 },
      { to: "/picking", label: "Picking", icon: PackageSearch, badge: 3 },
      { to: "/packing", label: "Packing", icon: PackageCheck, badge: 2 },
      { to: "/shipping", label: "Shipping", icon: Truck },
      { to: "/transfers", label: "Transfers", icon: ArrowLeftRight },
    ],
  },
  {
    section: "Inventory",
    items: [
      { to: "/inventory", label: "Inventory", icon: Layers },
      { to: "/locations", label: "Locations", icon: MapPin },
      { to: "/products", label: "Products", icon: Tag },
      { to: "/adjustments", label: "Stock Adjustments", icon: PencilLine, badge: 2 },
      { to: "/cycle-counts", label: "Cycle Counts", icon: ListChecks },
    ],
  },
  {
    section: "Management",
    items: [
      { to: "/purchase-orders", label: "Purchase Orders", icon: ClipboardList },
      { to: "/sales-orders", label: "Sales Orders", icon: FileText },
      { to: "/suppliers", label: "Suppliers", icon: Factory },
      { to: "/customers", label: "Customers", icon: Store },
      { to: "/users", label: "Users & Roles", icon: Users },
    ],
  },
  {
    section: "Analytics",
    items: [
      { to: "/reports", label: "Reports", icon: BarChart3 },
      { to: "/performance", label: "Warehouse Performance", icon: Activity },
    ],
  },
];

export const flatNav = navSections.flatMap((s) => s.items);

export function findNav(pathname: string): NavItem | undefined {
  let best: NavItem | undefined;
  for (const item of flatNav) {
    const match = item.end ? pathname === item.to : pathname === item.to || pathname.startsWith(item.to + "/");
    if (match && (!best || item.to.length > best.to.length)) best = item;
  }
  return best;
}
