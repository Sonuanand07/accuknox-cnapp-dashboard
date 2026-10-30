import raw from './dashboard.json';
import { validateConfig } from './schema';

const clone = () => JSON.parse(JSON.stringify(raw));

describe('validateConfig', () => {
  it('accepts the bundled dashboard.json', () => {
    expect(validateConfig(clone()).ok).toBe(true);
  });

  it('starts with sample data visible for every widget and no empty placeholders', () => {
    const config = clone();
    type SampleWidget = { visible: boolean; type: string; segments?: Array<{ value: number }> };
    const categories = config.categories as Array<{ widgets: SampleWidget[] }>;
    const widgets = categories.flatMap((category) => category.widgets);
    expect(widgets.length).toBe(13);
    expect(widgets.every((widget) => widget.visible)).toBe(true);
    expect(widgets.every((widget) => widget.type !== 'empty')).toBe(true);
    expect(widgets.filter((widget) => widget.type === 'donut' || widget.type === 'stackedBar')
      .every((widget) => widget.segments?.some((segment) => segment.value > 0))).toBe(true);
  });

  it('rejects non-objects and empty category lists', () => {
    expect(validateConfig(null).ok).toBe(false);
    expect(validateConfig([]).ok).toBe(false);
    const empty = clone();
    empty.categories = [];
    expect(validateConfig(empty).ok).toBe(false);
  });

  it('rejects duplicated widget ids across categories', () => {
    const cfg = clone();
    cfg.categories[1].widgets[0].id = cfg.categories[0].widgets[0].id;
    const result = validateConfig(cfg);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.join(' ')).toMatch(/duplicated/);
  });

  it('requires segments for chart widgets and non-negative numbers', () => {
    const noSegments = clone();
    delete noSegments.categories[0].widgets[0].segments;
    expect(validateConfig(noSegments).ok).toBe(false);
    const negative = clone();
    negative.categories[0].widgets[0].segments[0].value = -1;
    expect(validateConfig(negative).ok).toBe(false);
  });

  it('rejects unknown widget types and a missing visible flag', () => {
    const badType = clone();
    badType.categories[0].widgets[0].type = 'pie3d';
    expect(validateConfig(badType).ok).toBe(false);
    const noVisible = clone();
    delete noVisible.categories[0].widgets[0].visible;
    expect(validateConfig(noVisible).ok).toBe(false);
  });
});
