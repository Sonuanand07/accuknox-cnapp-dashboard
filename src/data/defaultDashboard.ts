import raw from './dashboard.json';
import { validateConfig } from './schema';
import type { DashboardConfig } from '../types';

/** Returns a fresh deep copy of the bundled JSON so reducers can never mutate the import. */
export function getDefaultConfig(): DashboardConfig {
  const result = validateConfig(JSON.parse(JSON.stringify(raw)));
  if (!result.ok) throw new Error(`Bundled dashboard.json is invalid:\n${result.errors.join('\n')}`);
  return result.config;
}
