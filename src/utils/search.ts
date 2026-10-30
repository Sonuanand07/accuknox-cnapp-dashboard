import type { Category, Widget } from '../types';

export const normalize = (s: string): string => s.toLowerCase().replace(/\s+/g, ' ').trim();

/** Every whitespace-separated token of the query must appear in the widget name, text or category. */
export function widgetMatches(widget: Widget, category: Category, query: string): boolean {
  const q = normalize(query);
  if (!q) return true;
  const haystack = normalize(`${widget.name} ${widget.text} ${category.title} ${category.tabLabel}`);
  return q.split(' ').every((token) => haystack.includes(token));
}
