import { configureStore, combineReducers } from "@reduxjs/toolkit";
import auth from "./slices/authSlice";
import inventory from "./slices/inventorySlice";
import orders from "./slices/ordersSlice";
import ops from "./slices/opsSlice";
import ui from "./slices/uiSlice";

const rootReducer = combineReducers({ auth, inventory, orders, ops, ui });
export const store = configureStore({ reducer: rootReducer });
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
