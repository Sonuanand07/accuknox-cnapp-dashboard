const slugify = (s: string): string =>
  s.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 32) || 'widget';

/** Unique, readable id for a user-created widget, e.g. "custom-patch-status-m3k9x2". */
export function createWidgetId(name: string, taken: ReadonlySet<string> = new Set()): string {
  for (;;) {
    const id = `custom-${slugify(name)}-${Math.random().toString(36).slice(2, 8)}`;
    if (!taken.has(id)) return id;
  }
}
