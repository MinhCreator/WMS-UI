import {
  createSelector,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { currentOperator, warehouses } from "../../data/meta";
import type { RootState } from "../store";

interface SessionState {
  warehouseCode: string;
  operator: typeof currentOperator;
}

const initialState: SessionState = {
  warehouseCode: warehouses[0].code,
  operator: currentOperator,
};

const sessionSlice = createSlice({
  name: "session",
  initialState,
  reducers: {
    setWarehouse(state, action: PayloadAction<string>) {
      if (warehouses.some((w) => w.code === action.payload)) {
        state.warehouseCode = action.payload;
      }
    },
    setOperatorName(state, action: PayloadAction<string>) {
      state.operator.name = action.payload;
    },
  },
});

export const { setWarehouse, setOperatorName } = sessionSlice.actions;
export default sessionSlice.reducer;

// Selectors
export const selectWarehouseCode = (selector: RootState) =>
  selector.session.warehouseCode;
export const selectOperator = (selector: RootState) =>
  selector.session.operator;
export const selectWarehouses = warehouses;

export const selectWarehouse = createSelector(
  [selectWarehouseCode],
  (code) => warehouses.find((w) => w.code === code) ?? warehouses[0],
);
