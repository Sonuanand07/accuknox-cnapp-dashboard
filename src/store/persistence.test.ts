import { createAppStore } from './index';
import { loadPersisted, savePersisted, STORAGE_KEY } from './persistence';
import { removeWidget, createInitialDashboardState } from './dashboardSlice';

function fakeStorage(initial: Record<string, string> = {}): Storage {
  const data = new Map(Object.entries(initial));
  return {
    get length() { return data.size; },
    clear: () => data.clear(),
    getItem: (k) => data.get(k) ?? null,
    key: (i) => Array.from(data.keys())[i] ?? null,
    removeItem: (k) => void data.delete(k),
    setItem: (k, v) => void data.set(k, String(v)),
  };
}

describe('persistence', () => {
  it('round-trips the dashboard state', () => {
    const storage = fakeStorage();
    const state = createInitialDashboardState();
    savePersisted(storage, state);
    expect(loadPersisted(storage)).toEqual(state);
  });

  it('returns null for missing, corrupted or invalid data instead of throwing', () => {
    expect(loadPersisted(fakeStorage())).toBeNull();
    expect(loadPersisted(fakeStorage({ [STORAGE_KEY]: '{not json' }))).toBeNull();
    expect(loadPersisted(fakeStorage({ [STORAGE_KEY]: JSON.stringify({ config: { categories: 5 } }) }))).toBeNull();
  });

  it('falls back to the default time range when the saved one is unknown', () => {
    const storage = fakeStorage();
    savePersisted(storage, { ...createInitialDashboardState(), range: 'forever' });
    expect(loadPersisted(storage)?.range).toBe('2d');
  });

  it('saves changes made through the store and restores them in a new store', () => {
    const storage = fakeStorage();
    const first = createAppStore({ storage });
    first.dispatch(removeWidget({ categoryId: 'cspm', widgetId: 'cspm-cloud-accounts' }));
    const second = createAppStore({ storage });
    const widget = second.getState().dashboard.config.categories[0].widgets.find((w) => w.id === 'cspm-cloud-accounts');
    expect(widget?.visible).toBe(false);
  });

  it('does not touch storage when persistence is disabled', () => {
    const storage = fakeStorage();
    createAppStore({ storage: null }).dispatch(removeWidget({ categoryId: 'cspm', widgetId: 'cspm-cloud-accounts' }));
    expect(storage.length).toBe(0);
  });
});
