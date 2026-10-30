import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { getDefaultConfig } from '../data/defaultDashboard';
import type { DashboardConfig, Widget } from '../types';
import { createWidgetId } from '../utils/id';

export interface DashboardState {
  config: DashboardConfig;
  /** Selected time range id (see TIME_RANGES). */
  range: string;
}

export interface NewWidgetInput {
  categoryId: string;
  name: string;
  text: string;
  /** Optional: lets tests (and the drawer draft) supply a stable id. */
  id?: string;
  visible?: boolean;
}

export interface WidgetRef {
  categoryId: string;
  widgetId: string;
}

export interface CommitSelectionPayload {
  /** Visibility changes for widgets that already exist, keyed by widget id. */
  visibility: Record<string, boolean>;
  created: NewWidgetInput[];
  /** Ids of custom widgets to delete permanently. */
  deleted: string[];
}

export const DEFAULT_RANGE = '2d';

export const createInitialDashboardState = (): DashboardState => ({
  config: getDefaultConfig(),
  range: DEFAULT_RANGE,
});

const allWidgetIds = (config: DashboardConfig): Set<string> =>
  new Set(config.categories.flatMap((c) => c.widgets.map((w) => w.id)));

function buildCustomWidget(config: DashboardConfig, input: NewWidgetInput): Widget {
  return {
    id: input.id ?? createWidgetId(input.name, allWidgetIds(config)),
    name: input.name.trim(),
    text: input.text.trim(),
    type: 'text',
    visible: input.visible ?? true,
    custom: true,
  };
}

const findWidget = (state: DashboardState, { categoryId, widgetId }: WidgetRef) =>
  state.config.categories.find((c) => c.id === categoryId)?.widgets.find((w) => w.id === widgetId);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState: createInitialDashboardState,
  reducers: {
    /** Create a text widget with a name and text, add it to a category and show it. */
    addWidget(state, action: PayloadAction<NewWidgetInput>) {
      const category = state.config.categories.find((c) => c.id === action.payload.categoryId);
      if (!category) return;
      category.widgets.push(buildCustomWidget(state.config, action.payload));
    },
    /** Remove from the dashboard (cross icon). The widget stays in the library so it can be re-added. */
    removeWidget(state, action: PayloadAction<WidgetRef>) {
      const widget = findWidget(state, action.payload);
      if (widget) widget.visible = false;
    },
    restoreWidget(state, action: PayloadAction<WidgetRef>) {
      const widget = findWidget(state, action.payload);
      if (widget) widget.visible = true;
    },
    /** Permanently delete a user-created widget. Built-in widgets cannot be deleted. */
    deleteWidget(state, action: PayloadAction<WidgetRef>) {
      const category = state.config.categories.find((c) => c.id === action.payload.categoryId);
      if (!category) return;
      category.widgets = category.widgets.filter((w) => !(w.id === action.payload.widgetId && w.custom));
    },
    /** Apply everything chosen in the Add Widget drawer in a single, atomic update. */
    commitSelection(state, action: PayloadAction<CommitSelectionPayload>) {
      const { visibility, created, deleted } = action.payload;
      const deletedIds = new Set(deleted);
      for (const category of state.config.categories) {
        category.widgets = category.widgets.filter((w) => !(w.custom && deletedIds.has(w.id)));
        for (const widget of category.widgets) {
          if (widget.id in visibility) widget.visible = visibility[widget.id];
        }
      }
      for (const input of created) {
        const category = state.config.categories.find((c) => c.id === input.categoryId);
        if (category) category.widgets.push(buildCustomWidget(state.config, input));
      }
    },
    setRange(state, action: PayloadAction<string>) {
      state.range = action.payload;
    },
    importConfig(state, action: PayloadAction<DashboardConfig>) {
      state.config = action.payload;
    },
    resetDashboard() {
      return createInitialDashboardState();
    },
  },
});

export const {
  addWidget, removeWidget, restoreWidget, deleteWidget, commitSelection, setRange, importConfig, resetDashboard,
} = dashboardSlice.actions;
export default dashboardSlice.reducer;
