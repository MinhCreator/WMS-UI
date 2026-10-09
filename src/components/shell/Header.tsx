import { IconButton } from "@chakra-ui/react";
import { Menu, Search } from "lucide-react";
import type { Warehouse } from "../../types";
import { Breadcrumbs } from "./Breadcrumbs";
import {
  HelpButton,
  NotificationsButton,
  UserMenu,
  WarehouseMenu,
} from "./ShellWidgets";

interface HeaderProps {
  showMenu: boolean;
  onOpenMenu: () => void;
  onOpenSearch: () => void;
  warehouse: Warehouse;
  onWarehouseChange: (w: Warehouse) => void;
}

export function Header({
  showMenu,
  onOpenMenu,
  onOpenSearch,
  warehouse,
  onWarehouseChange,
}: HeaderProps) {
  return (
    <header className="flex h-12 shrink-0 items-center gap-2 border-b border-line bg-surface px-3">
      {showMenu && (
        <IconButton
          aria-label="Open navigation"
          variant="ghost"
          size="sm"
          onClick={onOpenMenu}
          color="ink.700"
        >
          <Menu size={17} />
        </IconButton>
      )}

      <Breadcrumbs />

      <div className="ml-auto flex items-center gap-1">
        <button
          type="button"
          onClick={onOpenSearch}
          className="hidden h-8 w-52 items-center gap-2 rounded-[6px] border border-line bg-surface-2 px-2.5 text-tn text-ink-4 transition-colors hover:border-[#d0d5dd] hover:text-ink-3 sm:flex xl:w-72"
        >
          <Search size={13} className="shrink-0" />
          <span className="flex-1 truncate text-left">Search SKU, order, location, barcode…</span>
          <kbd className="tnum shrink-0 rounded-[4px] border border-line bg-white px-1 py-px font-mono text-[10px] font-semibold text-ink-3">
            ⌘K
          </kbd>
        </button>

        <IconButton
          aria-label="Search"
          variant="ghost"
          size="sm"
          onClick={onOpenSearch}
          className="sm:hidden"
          color="ink.700"
        >
          <Search size={16} />
        </IconButton>

        <span className="mx-1 hidden h-5 w-px bg-line xl:block" aria-hidden />

        <span className="hidden xl:block">
          <WarehouseMenu warehouse={warehouse} onChange={onWarehouseChange} variant="header" />
        </span>

        <span className="mx-1 h-5 w-px bg-line" aria-hidden />

        <NotificationsButton variant="icon" />
        <HelpButton variant="icon" />
        <UserMenu variant="icon" />
      </div>
    </header>
  );
}
