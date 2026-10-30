import {
  createSelector,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import {
  inventory as seedRows,
  stockBySku as seedSplits,
} from "../../data/inventory";
import { products } from "../../data/products";
import type { InventoryRow, StockByLocation } from "../../types";
import type { RootState } from "../store";

function statusFor(
  onHand: number,
  reorder: number,
  safety: number,
): InventoryRow["status"] {
  if (onHand === 0) return "Out";
  if (onHand < safety) return "Critical";
  if (onHand < reorder) return "Low";
  return "Healthy";
}

interface InventoryFilters {
  search: string;
  category: string; // "all" | category name
  status: string; // "all" | InventoryRow["status"]
}

interface InventoryState {
  rows: InventoryRow[];
  splits: Record<string, StockByLocation[]>;
  filters: InventoryFilters;
}

const initialState: InventoryState = {
  rows: seedRows,
  splits: seedSplits,
  filters: { search: "", category: "all", status: "all" },
};

const inventorySlice = createSlice({
  name: "inventory",
  initialState,
  reducers: {
    setSearch(state, action: PayloadAction<string>) {
      state.filters.search = action.payload;
    },
    setCategory(state, action: PayloadAction<string>) {
      state.filters.category = action.payload;
    },
    setStatusFilter(state, action: PayloadAction<string>) {
      state.filters.status = action.payload;
    },
    resetFilters(state) {
      state.filters = { search: "", category: "all", status: "all" };
    },
    applyAdjustment(
      state,
      action: PayloadAction<{ sku: string; location: string; qty: number }>,
    ) {
      const { sku, qty } = action.payload;
      const row = state.rows.find((r) => r.sku === sku);
      if (!row) return;
      const product = products.find((p) => p.sku === sku);
      const reorder = row.reorderPoint;
      const safety = product?.safetyStock ?? Math.round(reorder * 0.6);
      row.onHand = Math.max(0, row.onHand + qty);
      row.available = Math.max(0, row.onHand - row.reserved);
      row.status = statusFor(row.onHand, reorder, safety);
      // Keep first split in sync (summary location); full multi-bin editing comes later
      const split = state.splits[sku]?.[0];
      if (split) {
        split.onHand = Math.max(0, split.onHand + qty);
        split.available = Math.max(0, split.onHand - split.reserved);
        split.status = statusFor(split.onHand, reorder, safety);
      }
    },
    receiveStock(state, action: PayloadAction<{ sku: string; qty: number }>) {
      const row = state.rows.find((r) => r.sku === action.payload.sku);
      if (!row) return;
      row.onHand += action.payload.qty;
      row.available += action.payload.qty;
      row.incoming = Math.max(0, row.incoming - action.payload.qty);
    },
  },
});

export const {
  setSearch,
  setCategory,
  setStatusFilter,
  resetFilters,
  applyAdjustment,
  receiveStock,
} = inventorySlice.actions;
export default inventorySlice.reducer;

// Base selectors
export const selectInventoryRows = (s: RootState) => s.inventory.rows;
export const selectInventoryFilters = (s: RootState) => s.inventory.filters;
export const selectSplits = (s: RootState) => s.inventory.splits;
export const selectStockBySku = (s: RootState, sku: string) =>
  s.inventory.splits[sku] ?? [];

// Replaces inventorySummary() in data/inventory.ts:101-110
export const selectInventorySummary = createSelector(
  [selectInventoryRows],
  (rows) => ({
    skus: rows.length,
    totalUnits: rows.reduce((sum, r) => sum + r.onHand, 0),
    reserved: rows.reduce((sum, r) => sum + r.reserved, 0),
    incoming: rows.reduce((sum, r) => sum + r.incoming, 0),
    lowStock: rows.filter((r) => r.status !== "Healthy").length,
    value: rows.reduce(
      (sum, r) =>
        sum + r.onHand * (products.find((p) => p.sku === r.sku)?.unitCost ?? 0),
      0,
    ),
  }),
);

// Replaces Inventory.tsx:26-34 local useMemo filter
export const selectFilteredInventory = createSelector(
  [selectInventoryRows, selectInventoryFilters],
  (rows, f) => {
    const q = f.search.trim().toLowerCase();
    return rows.filter(
      (r) =>
        (f.category === "all" || r.category === f.category) &&
        (f.status === "all" || r.status === f.status) &&
        (!q ||
          `${r.sku} ${r.product} ${r.supplier} ${r.location}`
            .toLowerCase()
            .includes(q)),
    );
  },
);

export const selectCategories = createSelector([selectInventoryRows], (rows) =>
  Array.from(new Set(rows.map((r) => r.category))).sort(),
);
