import type { TimeRange } from '../types';

export const TIME_RANGES: readonly TimeRange[] = [
  { id: '2d', label: 'Last 2 days' },
  { id: '7d', label: 'Last 7 days' },
  { id: '30d', label: 'Last 30 days' },
  { id: '90d', label: 'Last 90 days' },
];
