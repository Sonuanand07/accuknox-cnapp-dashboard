import { WIDGET_TYPES, type DashboardConfig } from '../types';

export type ValidationResult =
  | { ok: true; config: DashboardConfig }
  | { ok: false; errors: string[] };

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

const isNonEmptyString = (v: unknown): v is string => typeof v === 'string' && v.trim().length > 0;

/**
 * Validates an unknown value (imported file, localStorage, bundled JSON) against the
 * DashboardConfig shape. Collecting every problem lets the UI show a useful message
 * instead of crashing deep inside a component.
 */
export function validateConfig(value: unknown): ValidationResult {
  const errors: string[] = [];
  if (!isRecord(value)) return { ok: false, errors: ['Config must be a JSON object.'] };
  if (typeof value.version !== 'number') errors.push('"version" must be a number.');
  if (!isNonEmptyString(value.title)) errors.push('"title" must be a non-empty string.');
  if (!Array.isArray(value.categories) || value.categories.length === 0) {
    errors.push('"categories" must be a non-empty array.');
    return { ok: false, errors };
  }

  const categoryIds = new Set<string>();
  const widgetIds = new Set<string>();

  value.categories.forEach((cat: unknown, ci) => {
    const at = `categories[${ci}]`;
    if (!isRecord(cat)) return errors.push(`${at} must be an object.`);
    if (!isNonEmptyString(cat.id)) errors.push(`${at}.id must be a non-empty string.`);
    else if (categoryIds.has(cat.id)) errors.push(`${at}.id "${cat.id}" is duplicated.`);
    else categoryIds.add(cat.id);
    if (!isNonEmptyString(cat.title)) errors.push(`${at}.title must be a non-empty string.`);
    if (!isNonEmptyString(cat.tabLabel)) errors.push(`${at}.tabLabel must be a non-empty string.`);
    if (!Array.isArray(cat.widgets)) return errors.push(`${at}.widgets must be an array.`);

    cat.widgets.forEach((w: unknown, wi) => {
      const wat = `${at}.widgets[${wi}]`;
      if (!isRecord(w)) return errors.push(`${wat} must be an object.`);
      if (!isNonEmptyString(w.id)) errors.push(`${wat}.id must be a non-empty string.`);
      else if (widgetIds.has(w.id)) errors.push(`${wat}.id "${w.id}" is duplicated.`);
      else widgetIds.add(w.id);
      if (!isNonEmptyString(w.name)) errors.push(`${wat}.name must be a non-empty string.`);
      if (typeof w.text !== 'string') errors.push(`${wat}.text must be a string.`);
      if (typeof w.visible !== 'boolean') errors.push(`${wat}.visible must be true or false.`);
      if (typeof w.type !== 'string' || !(WIDGET_TYPES as readonly string[]).includes(w.type)) {
        errors.push(`${wat}.type must be one of ${WIDGET_TYPES.join(', ')}.`);
      }
      if (w.type === 'donut' || w.type === 'stackedBar') {
        const segs = w.segments;
        if (!Array.isArray(segs) || segs.length === 0) errors.push(`${wat}.segments must be a non-empty array.`);
        else
          segs.forEach((s: unknown, si) => {
            if (!isRecord(s) || !isNonEmptyString(s.label) || !isNonEmptyString(s.color) ||
                typeof s.value !== 'number' || !Number.isFinite(s.value) || s.value < 0) {
              errors.push(`${wat}.segments[${si}] needs a label, a colour and a non-negative numeric value.`);
            }
          });
      }
    });
  });

  return errors.length ? { ok: false, errors } : { ok: true, config: value as unknown as DashboardConfig };
}
