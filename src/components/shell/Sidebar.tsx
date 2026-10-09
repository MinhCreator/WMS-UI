import { Tooltip } from "@chakra-ui/react";
import { NavLink } from "react-router-dom";
import type { Warehouse } from "../../types";
import { navSections } from "./nav";
import {
  HelpButton,
  LogoMark,
  NotificationsButton,
  UserMenu,
  WarehouseMenu,
} from "./ShellWidgets";

interface SidebarProps {
  collapsed: boolean;
  warehouse: Warehouse;
  onWarehouseChange: (w: Warehouse) => void;
  onNavigate?: () => void;
}

function itemClasses(isActive: boolean, collapsed: boolean): string {
  const base =
    "relative flex items-center transition-colors duration-100 " +
    (collapsed ? "h-9 w-9 justify-center rounded-[6px]" : "h-8 w-full gap-2.5 rounded-[6px] px-2");
  const state = isActive
    ? " bg-surface-3 font-semibold text-ink shadow-[inset_2px_0_0_#0369a1]"
    : " text-ink-2 hover:bg-surface-2 hover:text-ink";
  return base + state + " text-tn";
}

export function Sidebar({ collapsed, warehouse, onWarehouseChange, onNavigate }: SidebarProps) {
  return (
    <div className="flex h-full flex-col bg-surface" style={{ width: collapsed ? 64 : 240 }}>
      <div
        className={`flex h-12 shrink-0 items-center border-b border-line ${
          collapsed ? "justify-center px-0" : "gap-2 px-3"
        }`}
      >
        <LogoMark size={26} />
        {!collapsed && (
          <>
            <span className="text-[14.5px] font-bold tracking-[-0.01em] text-ink">
              WarehouseOS
            </span>
            <span className="rounded-[4px] bg-surface-3 px-1 py-px text-[9.5px] font-bold tracking-[0.08em] text-ink-3">
              WMS
            </span>
          </>
        )}
      </div>

      {!collapsed && <WarehouseMenu warehouse={warehouse} onChange={onWarehouseChange} variant="sidebar" />}

      <nav className="min-h-0 flex-1 overflow-y-auto px-2 pb-2">
        <div className="flex flex-col gap-4 pt-1">
          {navSections.map((section) => (
            <div key={section.section} className="flex flex-col gap-0.5">
              {collapsed ? (
                <div className="mx-auto my-1 h-px w-6 bg-line" aria-hidden />
              ) : (
                <div className="px-2 pb-1 text-[10.5px] font-semibold tracking-[0.09em] text-ink-4 uppercase">
                  {section.section}
                </div>
              )}
              {section.items.map((item) => {
                const Icon = item.icon;
                const link = (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    onClick={onNavigate}
                    className={({ isActive }) => itemClasses(isActive, collapsed)}
                  >
                    <Icon size={16} className="shrink-0" strokeWidth={1.9} />
                    {!collapsed && (
                      <>
                        <span className="truncate">{item.label}</span>
                        {item.badge !== undefined && (
                          <span className="tnum ml-auto rounded-[4px] bg-line px-1 text-[10.5px] font-semibold text-ink-3">
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                    {collapsed && item.badge !== undefined && (
                      <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-danger" />
                    )}
                  </NavLink>
                );
                return collapsed ? (
                  <Tooltip key={item.to} label={item.label} placement="right" openDelay={250}>
                    {link}
                  </Tooltip>
                ) : (
                  link
                );
              })}
            </div>
          ))}
        </div>
      </nav>

      {collapsed ? (
        <div className="flex flex-col items-center gap-1 border-t border-line py-2">
          <HelpButton variant="icon" />
          <NotificationsButton variant="icon" />
          <NavLink
            to="/settings"
            aria-label="Settings"
            className={({ isActive }) =>
              `flex h-8 w-8 items-center justify-center rounded-[6px] ${
                isActive ? "bg-surface-3 text-ink" : "text-ink-3 hover:bg-surface-2 hover:text-ink"
              }`
            }
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </NavLink>
          <UserMenu variant="icon" />
        </div>
      ) : (
        <div className="shrink-0 border-t border-line p-2">
          <HelpButton variant="row" />
          <NotificationsButton variant="row" />
        </div>
      )}

      {!collapsed && (
        <div className="shrink-0 border-t border-line p-2">
          <UserMenu variant="row" />
        </div>
      )}
    </div>
  );
}
