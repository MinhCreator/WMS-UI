import { Route, Routes, useLocation } from "react-router-dom";
import { AppShell } from "./components/shell";
import Adjustments from "./pages/Adjustments";
import Customers from "./pages/Customers";
import CycleCountDetail from "./pages/CycleCountDetail";
import CycleCounts from "./pages/CycleCounts";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import Locations from "./pages/Locations";
import LocationsZone from "./pages/LocationsZone";
import Packing from "./pages/Packing";
import Performance from "./pages/Performance";
import PickerWorkspace from "./pages/PickerWorkspace";
import Picking from "./pages/Picking";
import ProductDetail from "./pages/ProductDetail";
import Products from "./pages/Products";
import PurchaseOrderDetail from "./pages/PurchaseOrderDetail";
import PurchaseOrders from "./pages/PurchaseOrders";
import Putaway from "./pages/Putaway";
import Receiving from "./pages/Receiving";
import Reports from "./pages/Reports";
import SalesOrders from "./pages/SalesOrders";
import Settings from "./pages/Settings";
import Shipping from "./pages/Shipping";
import Suppliers from "./pages/Suppliers";
import Transfers from "./pages/Transfers";
import Users from "./pages/Users";

function NotFound() {
  const { pathname } = useLocation();
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-2 text-center">
      <p className="font-mono text-4xl font-bold text-ink-4">404</p>
      <h1 className="text-tn font-semibold text-ink">Page not found</h1>
      <p className="max-w-sm text-2xs text-ink-3">{pathname} does not resolve to a route in warehouseos-ui.</p>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Dashboard />} />

        <Route path="receiving" element={<Receiving />} />
        <Route path="putaway" element={<Putaway />} />
        <Route path="picking" element={<Picking />} />
        <Route path="picking/workspace/:orderId" element={<PickerWorkspace />} />
        <Route path="packing" element={<Packing />} />
        <Route path="shipping" element={<Shipping />} />
        <Route path="transfers" element={<Transfers />} />

        <Route path="inventory" element={<Inventory />} />
        <Route path="products" element={<Products />} />
        <Route path="products/:sku" element={<ProductDetail />} />
        <Route path="locations" element={<Locations />} />
        <Route path="locations/:zone" element={<LocationsZone />} />

        <Route path="adjustments" element={<Adjustments />} />
        <Route path="cycle-counts" element={<CycleCounts />} />
        <Route path="cycle-counts/:id" element={<CycleCountDetail />} />

        <Route path="purchase-orders" element={<PurchaseOrders />} />
        <Route path="purchase-orders/:id" element={<PurchaseOrderDetail />} />
        <Route path="sales-orders" element={<SalesOrders />} />
        <Route path="suppliers" element={<Suppliers />} />
        <Route path="customers" element={<Customers />} />
        <Route path="users" element={<Users />} />

        <Route path="reports" element={<Reports />} />
        <Route path="performance" element={<Performance />} />
        <Route path="settings" element={<Settings />} />

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}