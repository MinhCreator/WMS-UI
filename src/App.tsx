import type { ReactNode } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import {
  RedirectIfAuthenticated,
  RequireAuth,
  RequirePermission,
} from "./components/auth";
import { AppShell } from "./components/shell";
import AcceptInviteForm from "./feature/auth/acceptInviteForm";
import ForgotPasswordForm from "./feature/auth/forgotPasswordForm";
import LoginForm from "./feature/auth/loginForm";
import ResetPasswordForm from "./feature/auth/resetPasswordForm";
import SignupForm from "./feature/auth/signupForm";
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

/** Page-level RBAC gate: the route renders only with the required read permission. */
function Page({ permission, children }: { permission: string | string[]; children: ReactNode }) {
  return <RequirePermission permission={permission}>{children}</RequirePermission>;
}

export default function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <RedirectIfAuthenticated>
            <LoginForm />
          </RedirectIfAuthenticated>
        }
      />
      <Route
        path="/signup"
        element={
          <RedirectIfAuthenticated>
            <SignupForm />
          </RedirectIfAuthenticated>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <RedirectIfAuthenticated>
            <ForgotPasswordForm />
          </RedirectIfAuthenticated>
        }
      />
      <Route
        path="/reset-password"
        element={
          <RedirectIfAuthenticated>
            <ResetPasswordForm />
          </RedirectIfAuthenticated>
        }
      />
      <Route
        path="/invite"
        element={
          <RedirectIfAuthenticated>
            <AcceptInviteForm />
          </RedirectIfAuthenticated>
        }
      />

      <Route element={<RequireAuth />}>
        <Route element={<AppShell />}>
          <Route index element={<Dashboard />} />

          <Route
            path="receiving"
            element={
              <Page permission="receipt:read">
                <Receiving />
              </Page>
            }
          />
          <Route
            path="putaway"
            element={
              <Page permission="putaway:read">
                <Putaway />
              </Page>
            }
          />
          <Route
            path="picking"
            element={
              <Page permission="pick:read">
                <Picking />
              </Page>
            }
          />
          <Route
            path="picking/workspace/:orderId"
            element={
              <Page permission="pick:read">
                <PickerWorkspace />
              </Page>
            }
          />
          <Route
            path="packing"
            element={
              <Page permission="pack:read">
                <Packing />
              </Page>
            }
          />
          <Route
            path="shipping"
            element={
              <Page permission="shipment:read">
                <Shipping />
              </Page>
            }
          />
          <Route
            path="transfers"
            element={
              <Page permission="transfer:read">
                <Transfers />
              </Page>
            }
          />

          <Route
            path="inventory"
            element={
              <Page permission="inventory:read">
                <Inventory />
              </Page>
            }
          />
          <Route
            path="products"
            element={
              <Page permission="catalog:read">
                <Products />
              </Page>
            }
          />
          <Route
            path="products/:sku"
            element={
              <Page permission="catalog:read">
                <ProductDetail />
              </Page>
            }
          />
          <Route
            path="locations"
            element={
              <Page permission="facility:read">
                <Locations />
              </Page>
            }
          />
          <Route
            path="locations/:zone"
            element={
              <Page permission="facility:read">
                <LocationsZone />
              </Page>
            }
          />

          <Route
            path="adjustments"
            element={
              <Page permission="adjustment:read">
                <Adjustments />
              </Page>
            }
          />
          <Route
            path="cycle-counts"
            element={
              <Page permission="cycle_count:read">
                <CycleCounts />
              </Page>
            }
          />
          <Route
            path="cycle-counts/:id"
            element={
              <Page permission="cycle_count:read">
                <CycleCountDetail />
              </Page>
            }
          />

          <Route
            path="purchase-orders"
            element={
              <Page permission="purchase_order:read">
                <PurchaseOrders />
              </Page>
            }
          />
          <Route
            path="purchase-orders/:id"
            element={
              <Page permission="purchase_order:read">
                <PurchaseOrderDetail />
              </Page>
            }
          />
          <Route
            path="sales-orders"
            element={
              <Page permission="sales_order:read">
                <SalesOrders />
              </Page>
            }
          />
          <Route
            path="suppliers"
            element={
              <Page permission="catalog:read">
                <Suppliers />
              </Page>
            }
          />
          <Route
            path="customers"
            element={
              <Page permission="customer:read">
                <Customers />
              </Page>
            }
          />
          <Route
            path="users"
            element={
              <Page permission="user:read">
                <Users />
              </Page>
            }
          />

          <Route
            path="reports"
            element={
              <Page permission="report:read">
                <Reports />
              </Page>
            }
          />
          <Route
            path="performance"
            element={
              <Page permission="report:read">
                <Performance />
              </Page>
            }
          />
          <Route
            path="settings"
            element={
              <Page permission="settings:read">
                <Settings />
              </Page>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Route>
      </Route>
    </Routes>
  );
}
