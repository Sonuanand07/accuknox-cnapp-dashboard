import type { Category, Widget } from '../types';
import { widgetMatches } from './search';

const category: Category = { id: 'cwpp', title: 'CWPP Dashboard', tabLabel: 'CWPP', widgets: [] };
const widget: Widget = { id: 'w', name: 'Workload Alerts', text: 'Runtime alerts raised by workloads', type: 'text', visible: true };

describe('widgetMatches', () => {
  it('matches everything for an empty query', () => {
    expect(widgetMatches(widget, category, '   ')).toBe(true);
  });
  it('is case-insensitive and searches name, text and category', () => {
    expect(widgetMatches(widget, category, 'WORKLOAD')).toBe(true);
    expect(widgetMatches(widget, category, 'raised')).toBe(true);
    expect(widgetMatches(widget, category, 'cwpp')).toBe(true);
  });
  it('requires every word to match', () => {
    expect(widgetMatches(widget, category, 'runtime alerts')).toBe(true);
    expect(widgetMatches(widget, category, 'runtime ticket')).toBe(false);
  });
});
