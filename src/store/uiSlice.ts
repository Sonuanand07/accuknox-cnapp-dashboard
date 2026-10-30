import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { WidgetRef } from './dashboardSlice';

export interface Toast {
  id: number;
  message: string;
  tone: 'info' | 'error';
  /** When present the toast shows an Undo button that restores this widget. */
  undo?: WidgetRef;
}

export interface UiState {
  /** Text typed in the top search box; filters widgets on the dashboard. */
  query: string;
  toast: Toast | null;
  refreshTick: number;
  drawer: { open: boolean; categoryId: string | null };
}

const initialState: UiState = {
  query: '',
  toast: null,
  refreshTick: 0,
  drawer: { open: false, categoryId: null },
};

let toastCounter = 0;

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setQuery(state, action: PayloadAction<string>) {
      state.query = action.payload;
    },
    openDrawer(state, action: PayloadAction<string | null>) {
      state.drawer = { open: true, categoryId: action.payload };
    },
    closeDrawer(state) {
      state.drawer.open = false;
    },
    showToast: {
      reducer(state, action: PayloadAction<Toast>) {
        state.toast = action.payload;
      },
      prepare(input: { message: string; tone?: Toast['tone']; undo?: WidgetRef }) {
        return { payload: { id: ++toastCounter, message: input.message, tone: input.tone ?? 'info', undo: input.undo } };
      },
    },
    dismissToast(state) {
      state.toast = null;
    },
    bumpRefresh(state) {
      state.refreshTick += 1;
    },
  },
});

export const { setQuery, openDrawer, closeDrawer, showToast, dismissToast, bumpRefresh } = uiSlice.actions;
export default uiSlice.reducer;
