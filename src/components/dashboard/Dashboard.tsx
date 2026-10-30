import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { selectQuery, selectVisibleCategories, selectVisibleWidgetCount } from '../../store/selectors';
import { setQuery } from '../../store/uiSlice';
import { CategorySection } from './CategorySection';

export function Dashboard() {
  const dispatch = useAppDispatch();
  const categories = useAppSelector(selectVisibleCategories);
  const count = useAppSelector(selectVisibleWidgetCount);
  const query = useAppSelector(selectQuery);
  const refreshTick = useAppSelector((s) => s.ui.refreshTick);
  const searching = query.trim().length > 0;
  const shown = searching ? categories.filter((c) => c.widgets.length > 0) : categories;

  return (
    <div>
      <p className="sr-only" aria-live="polite">
        {searching ? `${count} widget${count === 1 ? '' : 's'} match “${query}”` : ''}
      </p>
      {searching && shown.length === 0 ? (
        <div className="no-results">
          <p className="no-results__title">No widgets match “{query}”</p>
          <p>Try a different word, or clear the search.</p>
          <button type="button" className="btn btn--outline" onClick={() => dispatch(setQuery(''))}>Clear search</button>
        </div>
      ) : (
        shown.map((category) => (
          <CategorySection key={category.id} category={category} refreshTick={refreshTick} showAddCard={!searching} />
        ))
      )}
    </div>
  );
}
