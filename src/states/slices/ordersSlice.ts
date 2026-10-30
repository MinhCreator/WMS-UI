import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import {
  pickWaves,
  poLines,
  purchaseOrders,
  readyOrders,
  receipts,
  salesOrders,
  shipments,
} from "../../data/orders";
import type {
  PickWave,
  PurchaseOrder,
  ReadyOrder,
  Receipt,
  SalesOrder,
  Shipment,
} from "../../types";
import type { RootState } from "../store";

interface OrdersState {
  purchaseOrders: PurchaseOrder[];
  salesOrders: SalesOrder[];
  receipts: Receipt[];
  shipments: Shipment[];
  pickWaves: PickWave[];
  readyOrders: ReadyOrder[];
}

const initialState: OrdersState = {
  purchaseOrders,
  salesOrders,
  receipts,
  shipments,
  pickWaves,
  readyOrders,
};

const ordersSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    updateSalesOrderStatus(
      state,
      action: PayloadAction<{ id: string; status: SalesOrder["status"] }>,
    ) {
      const o = state.salesOrders.find((x) => x.id === action.payload.id);
      if (o) o.status = action.payload.status;
    },
    updatePurchaseOrderStatus(
      state,
      action: PayloadAction<{ id: string; status: PurchaseOrder["status"] }>,
    ) {
      const o = state.purchaseOrders.find((x) => x.id === action.payload.id);
      if (o) o.status = action.payload.status;
    },
    updateShipmentStatus(
      state,
      action: PayloadAction<{ id: string; status: Shipment["status"] }>,
    ) {
      const s = state.shipments.find((x) => x.id === action.payload.id);
      if (s) s.status = action.payload.status;
    },
    advanceWave(
      state,
      action: PayloadAction<{ id: string; progress: number }>,
    ) {
      const w = state.pickWaves.find((x) => x.id === action.payload.id);
      if (!w) return;
      w.progress = action.payload.progress;
      w.status = action.payload.progress >= 100 ? "Completed" : "In Progress";
    },
    markReadyOrderDone(state, action: PayloadAction<string>) {
      const o = state.readyOrders.find((x) => x.id === action.payload);
      if (o) o.status = "Completed";
    },
  },
});

export const {
  updateSalesOrderStatus,
  updatePurchaseOrderStatus,
  updateShipmentStatus,
  advanceWave,
  markReadyOrderDone,
} = ordersSlice.actions;
export default ordersSlice.reducer;

export const selectPurchaseOrders = (s: RootState) => s.orders.purchaseOrders;
export const selectSalesOrders = (s: RootState) => s.orders.salesOrders;
export const selectReceipts = (s: RootState) => s.orders.receipts;
export const selectShipments = (s: RootState) => s.orders.shipments;
export const selectPickWaves = (s: RootState) => s.orders.pickWaves;
export const selectReadyOrders = (s: RootState) => s.orders.readyOrders;
// Static line lookups stay as module imports (no per-line edits yet):
export const selectPoLines = () => poLines;
