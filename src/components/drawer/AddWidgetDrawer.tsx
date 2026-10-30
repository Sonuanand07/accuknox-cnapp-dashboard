import { useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { commitSelection } from '../../store/dashboardSlice';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { selectCategories } from '../../store/selectors';
import { closeDrawer, showToast } from '../../store/uiSlice';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { createWidgetId } from '../../utils/id';
import { widgetMatches } from '../../utils/search';
import { Icon } from '../ui/Icon';
import { CreateWidgetForm } from './CreateWidgetForm';
import { buildDraft, type DraftWidget } from './draft';
import { WidgetChecklist } from './WidgetChecklist';

/** Mounted only while open, so every opening starts from a fresh draft of the store. */
export function AddWidgetDrawer() {
  const { open, categoryId } = useAppSelector((s) => s.ui.drawer);
  return open ? <DrawerPanel initialCategoryId={categoryId} /> : null;
}

function DrawerPanel({ initialCategoryId }: { initialCategoryId: string | null }) {
  const dispatch = useAppDispatch();
  const categories = useAppSelector(selectCategories);
  const panelRef = useRef<HTMLElement>(null);
  const [items, setItems] = useState<DraftWidget[]>(() => buildDraft(categories));
  const [deleted, setDeleted] = useState<string[]>([]);
  const [activeId, setActiveId] = useState(() =>
    categories.some((c) => c.id === initialCategoryId) ? (initialCategoryId as string) : categories[0].id);
  const [query, setQuery] = useState('');

  const cancel = () => dispatch(closeDrawer());
  useFocusTrap(panelRef, cancel);

  const searching = query.trim().length > 0;
  const activeCategory = categories.find((c) => c.id === activeId) ?? categories[0];

  const changes = useMemo(() => {
    const visibilityChanges = items.filter((i) => !i.isNew && i.visible !== i.originalVisible).length;
    return visibilityChanges + items.filter((i) => i.isNew).length + deleted.length;
  }, [items, deleted]);

  const results = useMemo(() => {
    if (!searching) return [];
    return categories
      .map((category) => ({
        category,
        items: items.filter((i) => i.categoryId === category.id && widgetMatches({ ...i, type: 'text' }, category, query)),
      }))
      .filter((group) => group.items.length > 0);
  }, [searching, categories, items, query]);
  const resultCount = results.reduce((n, g) => n + g.items.length, 0);

  const toggle = (id: string) => setItems((prev) => prev.map((i) => (i.id === id ? { ...i, visible: !i.visible } : i)));
  const remove = (id: string) => {
    const target = items.find((i) => i.id === id);
    if (!target) return;
    setItems((prev) => prev.filter((i) => i.id !== id));
    if (!target.isNew) setDeleted((prev) => [...prev, id]);
  };
  const addNew = (name: string, text: string) => {
    const id = createWidgetId(name, new Set(items.map((i) => i.id)));
    setItems((prev) => [...prev, { id, categoryId: activeCategory.id, name, text, visible: true, custom: true, isNew: true, originalVisible: true }]);
  };

  const confirm = () => {
    const visibility: Record<string, boolean> = {};
    items.filter((i) => !i.isNew && i.visible !== i.originalVisible).forEach((i) => { visibility[i.id] = i.visible; });
    const created = items.filter((i) => i.isNew).map((i) => ({ id: i.id, categoryId: i.categoryId, name: i.name, text: i.text, visible: i.visible }));
    if (changes > 0) {
      dispatch(commitSelection({ visibility, created, deleted }));
      dispatch(showToast({ message: `Dashboard updated (${changes} change${changes === 1 ? '' : 's'})` }));
    }
    dispatch(closeDrawer());
  };

  const selectTab = (id: string) => {
    setActiveId(id);
    setQuery('');
  };
  const onTabKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const index = categories.findIndex((c) => c.id === activeId);
    let next = -1;
    if (event.key === 'ArrowRight') next = (index + 1) % categories.length;
    else if (event.key === 'ArrowLeft') next = (index - 1 + categories.length) % categories.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = categories.length - 1;
    if (next < 0) return;
    event.preventDefault();
    selectTab(categories[next].id);
    window.requestAnimationFrame(() => document.getElementById(`tab-${categories[next].id}`)?.focus());
  };

  const activeItems = items.filter((i) => i.categoryId === activeCategory.id);

  return (
    <div className="drawer-root">
      <div className="drawer-backdrop" onClick={cancel} aria-hidden="true" />
      <aside ref={panelRef} className="drawer" role="dialog" aria-modal="true" aria-labelledby="drawer-title" tabIndex={-1}>
        <header className="drawer__header">
          <h2 id="drawer-title">Add Widget</h2>
          <button type="button" className="icon-btn icon-btn--light" aria-label="Close" onClick={cancel}><Icon name="close" size={16} /></button>
        </header>

        <div className="drawer__body">
          <p className="drawer__lead">Personalise your dashboard by adding the following widget</p>
          <div className="drawer-search">
            <Icon name="search" size={15} />
            <input type="search" aria-label="Search all widgets" placeholder="Search all widgets..." value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>

          <div role="tablist" aria-label="Widget categories" className="tabs" onKeyDown={onTabKeyDown}>
            {categories.map((category) => {
              const selected = !searching && category.id === activeId;
              const checked = items.filter((i) => i.categoryId === category.id && i.visible).length;
              return (
                <button
                  key={category.id} id={`tab-${category.id}`} type="button" role="tab" aria-selected={selected}
                  aria-controls="widget-panel" tabIndex={selected || (searching && category.id === activeId) ? 0 : -1}
                  className={`tab${selected ? ' is-active' : ''}`} onClick={() => selectTab(category.id)}
                >
                  {category.tabLabel}
                  <span className="tab__count" aria-label={`${checked} selected`}>{checked}</span>
                </button>
              );
            })}
          </div>

          <div id="widget-panel" role="tabpanel" className="drawer__panel"
               {...(searching ? { 'aria-label': 'Search results' } : { 'aria-labelledby': `tab-${activeCategory.id}` })}>
            {searching ? (
              <>
                <p className="drawer__hint" role="status">
                  {resultCount === 0 ? `No widgets match “${query}”.` : `${resultCount} result${resultCount === 1 ? '' : 's'} across all categories`}
                </p>
                {results.map(({ category, items: groupItems }) => (
                  <div key={category.id} className="result-group">
                    <h3 className="result-group__title">{category.title}</h3>
                    <WidgetChecklist items={groupItems} onToggle={toggle} onDelete={remove} />
                  </div>
                ))}
              </>
            ) : (
              <>
                <WidgetChecklist items={activeItems} onToggle={toggle} onDelete={remove} />
                <CreateWidgetForm
                  key={activeCategory.id} categoryTitle={activeCategory.title} tabLabel={activeCategory.tabLabel}
                  existingNames={activeItems.map((i) => i.name.toLowerCase())} onAdd={addNew}
                />
              </>
            )}
          </div>
        </div>

        <footer className="drawer__footer">
          <span className="drawer__summary" aria-live="polite">
            {changes === 0 ? 'No changes yet' : `${changes} pending change${changes === 1 ? '' : 's'}`}
          </span>
          <button type="button" className="btn btn--outline" onClick={cancel}>Cancel</button>
          <button type="button" className="btn btn--primary" onClick={confirm}>Confirm</button>
        </footer>
      </aside>
    </div>
  );
}
