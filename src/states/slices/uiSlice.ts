import {
  createSelector,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { notifications as seedNotifications } from "../../data/ops";
import type { NotificationItem } from "../../types";
import type { RootState } from "../store";

interface UiState {
  drawerOpen: boolean;
  searchOpen: boolean;
  notifications: NotificationItem[];
}

const initialState: UiState = {
  drawerOpen: false,
  searchOpen: false,
  notifications: seedNotifications,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setDrawerOpen(state, action: PayloadAction<boolean>) {
      state.drawerOpen = action.payload;
    },
    setSearchOpen(state, action: PayloadAction<boolean>) {
      state.searchOpen = action.payload;
    },
    toggleSearch(state) {
      state.searchOpen = !state.searchOpen;
    },
    markNotificationRead(state, action: PayloadAction<string>) {
      const n = state.notifications.find((x) => x.id === action.payload);
      if (n) n.read = true;
    },
    markAllNotificationsRead(state) {
      for (const n of state.notifications) n.read = true;
    },
  },
});

export const {
  setDrawerOpen,
  setSearchOpen,
  toggleSearch,
  markNotificationRead,
  markAllNotificationsRead,
} = uiSlice.actions;
export default uiSlice.reducer;

export const selectDrawerOpen = (s: RootState) => s.ui.drawerOpen;
export const selectSearchOpen = (s: RootState) => s.ui.searchOpen;
export const selectNotifications = (s: RootState) => s.ui.notifications;
export const selectUnreadCount = createSelector(
  [selectNotifications],
  (list) => list.filter((n) => !n.read).length,
);
