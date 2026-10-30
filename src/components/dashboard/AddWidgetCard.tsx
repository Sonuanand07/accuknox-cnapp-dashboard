import { useAppDispatch } from '../../store/hooks';
import { openDrawer } from '../../store/uiSlice';
import { Icon } from '../ui/Icon';

export function AddWidgetCard({ categoryId, categoryTitle }: { categoryId: string; categoryTitle: string }) {
  const dispatch = useAppDispatch();
  return (
    <button type="button" className="add-card" aria-label={`Add widget to ${categoryTitle}`} onClick={() => dispatch(openDrawer(categoryId))}>
      <span className="add-card__inner">
        <Icon name="plus" size={14} />
        Add Widget
      </span>
    </button>
  );
}
