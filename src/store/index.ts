import { configureStore } from '@reduxjs/toolkit';
import dashboard from './dashboardSlice';
import ui from './uiSlice';
import { getBrowserStorage, loadPersisted, savePersisted } from './persistence';

/**
 * Builds the app store. Dashboard state is hydrated from, and saved to, `storage`
 * (localStorage by default). Pass `storage: null` to opt out, e.g. in tests.
 */
export function createAppStore(options: { storage?: Storage | null } = {}) {
  const storage = options.storage === undefined ? getBrowserStorage() : options.storage;
  const persisted = storage ? loadPersisted(storage) : null;

  const store = configureStore({
    reducer: { dashboard, ui },
    preloadedState: persisted ? { dashboard: persisted } : undefined,
  });

  if (storage) {
    let last = store.getState().dashboard;
    store.subscribe(() => {
      const current = store.getState().dashboard;
      if (current !== last) {
        last = current;
        savePersisted(storage, current);
      }
    });
  }
  return store;
}

export type AppStore = ReturnType<typeof createAppStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
