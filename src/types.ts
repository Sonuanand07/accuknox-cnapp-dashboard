export type WidgetType = 'donut' | 'stackedBar' | 'empty' | 'text';

export interface Segment {
  label: string;
  value: number;
  color: string;
}

export interface Headline {
  value: string | number;
  label: string;
}

export interface Widget {
  id: string;
  name: string;
  text: string;
  type: WidgetType;
  /** true = shown on the dashboard; false = available in the "Add Widget" library only. */
  visible: boolean;
  /** true for widgets the user created through the drawer. */
  custom?: boolean;
  segments?: Segment[];
  headline?: Headline;
}

export interface Category {
  id: string;
  /** Section heading on the dashboard, e.g. "CSPM Executive Dashboard". */
  title: string;
  /** Short label used by the tabs in the Add Widget drawer, e.g. "CSPM". */
  tabLabel: string;
  widgets: Widget[];
}

export interface DashboardConfig {
  version: number;
  title: string;
  categories: Category[];
}

export interface TimeRange {
  id: string;
  label: string;
}

export const WIDGET_TYPES: readonly WidgetType[] = ['donut', 'stackedBar', 'empty', 'text'];
