import type { Category } from '../../types';

/** A widget as it exists inside the drawer, before the user presses Confirm. */
export interface DraftWidget {
  id: string;
  categoryId: string;
  name: string;
  text: string;
  visible: boolean;
  custom: boolean;
  /** Created in this drawer session; not yet in the store. */
  isNew: boolean;
  /** Visibility when the drawer opened (to work out what actually changed). */
  originalVisible: boolean;
}

export const buildDraft = (categories: Category[]): DraftWidget[] =>
  categories.flatMap((category) =>
    category.widgets.map((w) => ({
      id: w.id, categoryId: category.id, name: w.name, text: w.text, visible: w.visible,
      custom: !!w.custom, isNew: false, originalVisible: w.visible,
    })),
  );
