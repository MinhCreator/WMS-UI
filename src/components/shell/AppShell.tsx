import { Drawer, DrawerContent, DrawerOverlay, useMediaQuery } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import type { Warehouse } from "../../types";
import { warehouses } from "../../data/meta";
import { CommandSearch } from "./CommandSearch";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

export function AppShell() {
  const [isLg] = useMediaQuery("(min-width: 1024px)");
  const [isXl] = useMediaQuery("(min-width: 1280px)");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [warehouse, setWarehouse] = useState<Warehouse>(warehouses[0]);
  const location = useLocation();

  useEffect(() => {
    const el = document.getElementById("main-scroll");
    el?.scrollTo({ top: 0 });
  }, [location.pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const inField =
        !!target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((v) => !v);
        return;
      }
      if (e.key === "/" && !inField && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const showSidebar = isLg;
  const collapsed = showSidebar && !isXl;

  const sidebar = (onNavigate?: () => void) => (
    <Sidebar
      collapsed={collapsed}
      warehouse={warehouse}
      onWarehouseChange={setWarehouse}
      onNavigate={onNavigate}
    />
  );

  return (
    <div className="flex h-screen overflow-hidden bg-app">
      {showSidebar && sidebar()}

      {!showSidebar && (
        <Drawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} placement="left" size="xs">
          <DrawerOverlay bg="rgba(16,24,40,0.45)" />
          <DrawerContent maxW="240px" bg="transparent">
            <div className="h-full">
              {sidebar(() => setDrawerOpen(false))}
            </div>
          </DrawerContent>
        </Drawer>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          showMenu={!showSidebar}
          onOpenMenu={() => setDrawerOpen(true)}
          onOpenSearch={() => setSearchOpen(true)}
          warehouse={warehouse}
          onWarehouseChange={setWarehouse}
        />
        <main
          id="main-scroll"
          className="min-h-0 flex-1 overflow-y-auto px-4 py-4 xl:px-5 xl:py-4.5"
        >
          <Outlet />
        </main>
      </div>

      <CommandSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
