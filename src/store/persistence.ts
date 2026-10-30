import { validateConfig } from '../data/schema';
import type { DashboardState } from './dashboardSlice';
import { TIME_RANGES } from '../data/timeRanges';

export const STORAGE_KEY = 'accuknox.cnapp.dashboard.v1';

/** localStorage can throw (private mode, quota, disabled); never let that break the app. */
export function getBrowserStorage(): Storage | null {
  try {
    return typeof window !== 'undefined' ? window.localStorage : null;
  } catch {
    return null;
  }
}

export function loadPersisted(storage: Storage): DashboardState | null {
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return null;
    const { config, range } = parsed as { config?: unknown; range?: unknown };
    const result = validateConfig(config);
    if (!result.ok) return null; // corrupted or from an incompatible version: start fresh
    const validRange = TIME_RANGES.some((r) => r.id === range);
    return { config: result.config, range: validRange ? (range as string) : TIME_RANGES[0].id };
  } catch {
    return null;
  }
}

export function savePersisted(storage: Storage, state: DashboardState): void {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* quota exceeded or storage unavailable: the dashboard still works for this session */
  }
}
