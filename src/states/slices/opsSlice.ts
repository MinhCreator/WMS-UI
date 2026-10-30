import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import {
  activity,
  adjustments,
  cycleCounts,
  exceptions,
  putawayTasks,
  transfers,
} from "../../data/ops";
import type {
  ActivityItem,
  Adjustment,
  CycleCount,
  ExceptionRow,
  PutawayTask,
  Transfer,
} from "../../types";
import { applyAdjustment } from "./inventorySlice";
import type { RootState } from "../store";

interface OpsState {
  exceptions: ExceptionRow[];
  activity: ActivityItem[];
  adjustments: Adjustment[];
  cycleCounts: CycleCount[];
  transfers: Transfer[];
  putawayTasks: PutawayTask[];
}

const initialState: OpsState = {
  exceptions,
  activity,
  adjustments,
  cycleCounts,
  transfers,
  putawayTasks,
};

/** Cross-slice thunk: approving an adjustment also posts it to inventory. */
export const approveAdjustment = createAsyncThunk(
  "ops/approveAdjustment",
  (id: string, { dispatch, getState }) => {
    const adj = (getState() as RootState).ops.adjustments.find(
      (a) => a.id === id,
    );
    if (!adj) return id;
    dispatch(
      applyAdjustment({ sku: adj.sku, location: adj.location, qty: adj.qty }),
    );
    return id;
  },
);

const opsSlice = createSlice({
  name: "ops",
  initialState,
  reducers: {
    acknowledgeException(state, action: PayloadAction<string>) {
      state.exceptions = state.exceptions.filter(
        (e) => e.id !== action.payload,
      );
    },
    rejectAdjustment(state, action: PayloadAction<string>) {
      const a = state.adjustments.find((x) => x.id === action.payload);
      if (a) a.status = "Rejected";
    },
    completePutaway(state, action: PayloadAction<string>) {
      const t = state.putawayTasks.find((x) => x.id === action.payload);
      if (t) t.status = "Completed";
    },
    receiveTransfer(state, action: PayloadAction<string>) {
      const t = state.transfers.find((x) => x.id === action.payload);
      if (t) t.status = "Received";
    },
    pushActivity(state, action: PayloadAction<ActivityItem>) {
      state.activity.unshift(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(approveAdjustment.fulfilled, (state, action) => {
      const a = state.adjustments.find((x) => x.id === action.payload);
      if (a) a.status = "Approved";
    });
  },
});

export const {
  acknowledgeException,
  rejectAdjustment,
  completePutaway,
  receiveTransfer,
  pushActivity,
} = opsSlice.actions;
export default opsSlice.reducer;

export const selectExceptions = (s: RootState) => s.ops.exceptions;
export const selectAdjustments = (s: RootState) => s.ops.adjustments;
export const selectCycleCounts = (s: RootState) => s.ops.cycleCounts;
export const selectTransfers = (s: RootState) => s.ops.transfers;
export const selectPutawayTasks = (s: RootState) => s.ops.putawayTasks;
export const selectActivity = (s: RootState) => s.ops.activity;
