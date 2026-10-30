import reducer, {
  addWidget, commitSelection, createInitialDashboardState, deleteWidget, removeWidget, resetDashboard,
  restoreWidget, type DashboardState,
} from './dashboardSlice';

const find = (state: DashboardState, categoryId: string, widgetId: string) =>
  state.config.categories.find((c) => c.id === categoryId)?.widgets.find((w) => w.id === widgetId);
const visibleIds = (state: DashboardState, categoryId: string) =>
  state.config.categories.find((c) => c.id === categoryId)!.widgets.filter((w) => w.visible).map((w) => w.id);

describe('dashboardSlice', () => {
  it('starts from the bundled JSON with every sample widget visible', () => {
    const state = createInitialDashboardState();
    expect(state.config.categories.map((c) => c.id)).toEqual(['cspm', 'cwpp', 'image', 'ticket']);
    expect(visibleIds(state, 'cspm')).toEqual([
      'cspm-cloud-accounts',
      'cspm-risk-assessment',
      'cspm-compliance-score',
      'cspm-top-misconfigurations',
    ]);
    expect(visibleIds(state, 'cwpp')).toEqual([
      'cwpp-namespace-alerts',
      'cwpp-workload-alerts',
      'cwpp-runtime-violations',
      'cwpp-node-posture',
    ]);
    expect(visibleIds(state, 'image')).toEqual([
      'image-risk-assessment',
      'image-security-issues',
      'image-registry-coverage',
    ]);
    expect(visibleIds(state, 'ticket')).toEqual(['ticket-by-status', 'ticket-mttr']);
  });

  it('addWidget appends a trimmed, visible custom text widget to the right category', () => {
    const next = reducer(createInitialDashboardState(),
      addWidget({ categoryId: 'cwpp', name: '  Patch status ', text: ' All nodes patched ', id: 'custom-1' }));
    expect(find(next, 'cwpp', 'custom-1')).toEqual({
      id: 'custom-1', name: 'Patch status', text: 'All nodes patched', type: 'text', visible: true, custom: true,
    });
  });

  it('addWidget generates a unique id when none is given and ignores unknown categories', () => {
    let state = createInitialDashboardState();
    state = reducer(state, addWidget({ categoryId: 'cspm', name: 'Same name', text: 'a' }));
    state = reducer(state, addWidget({ categoryId: 'cspm', name: 'Same name', text: 'b' }));
    const ids = state.config.categories[0].widgets.map((w) => w.id);
    expect(new Set(ids).size).toBe(ids.length);
    const untouched = reducer(state, addWidget({ categoryId: 'nope', name: 'x', text: 'y' }));
    expect(untouched).toEqual(state);
  });

  it('removeWidget hides a widget without deleting it, and restoreWidget brings it back', () => {
    const ref = { categoryId: 'cspm', widgetId: 'cspm-cloud-accounts' };
    const removed = reducer(createInitialDashboardState(), removeWidget(ref));
    expect(find(removed, 'cspm', 'cspm-cloud-accounts')?.visible).toBe(false);
    expect(visibleIds(removed, 'cspm')).toEqual([
      'cspm-risk-assessment',
      'cspm-compliance-score',
      'cspm-top-misconfigurations',
    ]);
    const restored = reducer(removed, restoreWidget(ref));
    expect(find(restored, 'cspm', 'cspm-cloud-accounts')?.visible).toBe(true);
  });

  it('deleteWidget only deletes user-created widgets', () => {
    let state = reducer(createInitialDashboardState(), addWidget({ categoryId: 'cspm', name: 'Mine', text: 't', id: 'custom-x' }));
    state = reducer(state, deleteWidget({ categoryId: 'cspm', widgetId: 'cspm-cloud-accounts' }));
    expect(find(state, 'cspm', 'cspm-cloud-accounts')).toBeDefined();
    state = reducer(state, deleteWidget({ categoryId: 'cspm', widgetId: 'custom-x' }));
    expect(find(state, 'cspm', 'custom-x')).toBeUndefined();
  });

  it('commitSelection applies visibility changes, creations and deletions together', () => {
    let state = reducer(createInitialDashboardState(), addWidget({ categoryId: 'ticket', name: 'Old', text: 't', id: 'custom-old' }));
    state = reducer(state, commitSelection({
      visibility: { 'cspm-compliance-score': true, 'cspm-cloud-accounts': false },
      created: [{ id: 'custom-new', categoryId: 'image', name: 'Fresh', text: 'hello', visible: true }],
      deleted: ['custom-old'],
    }));
    expect(find(state, 'cspm', 'cspm-compliance-score')?.visible).toBe(true);
    expect(find(state, 'cspm', 'cspm-cloud-accounts')?.visible).toBe(false);
    expect(find(state, 'image', 'custom-new')?.name).toBe('Fresh');
    expect(find(state, 'ticket', 'custom-old')).toBeUndefined();
  });

  it('resetDashboard restores the defaults', () => {
    const changed = reducer(createInitialDashboardState(), removeWidget({ categoryId: 'cspm', widgetId: 'cspm-cloud-accounts' }));
    expect(reducer(changed, resetDashboard())).toEqual(createInitialDashboardState());
  });
});
