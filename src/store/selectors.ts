import { createSelector } from '@reduxjs/toolkit';
import type { Category } from '../types';
import { widgetMatches } from '../utils/search';
import type { RootState } from './index';

export const selectCategories = (s: RootState) => s.dashboard.config.categories;
export const selectQuery = (s: RootState) => s.ui.query;
export const selectRange = (s: RootState) => s.dashboard.range;

/** Categories reduced to the widgets that are visible AND match the top search box. */
export const selectVisibleCategories = createSelector([selectCategories, selectQuery], (categories, query) =>
  categories.map((category): Category => ({
    ...category,
    widgets: category.widgets.filter((w) => w.visible && widgetMatches(w, category, query)),
  })),
);

export const selectVisibleWidgetCount = createSelector([selectVisibleCategories], (cats) =>
  cats.reduce((n, c) => n + c.widgets.length, 0),
);
