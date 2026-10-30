import { memo } from 'react';
import { useAppDispatch } from '../../store/hooks';
import { removeWidget } from '../../store/dashboardSlice';
import { showToast } from '../../store/uiSlice';
import type { Widget } from '../../types';
import { Icon } from '../ui/Icon';
import { WidgetBody } from '../widgets/WidgetBody';

interface WidgetCardProps {
  widget: Widget;
  categoryId: string;
  categoryTitle: string;
  /** Changing this remounts the body so charts replay their entrance animation on refresh. */
  refreshTick: number;
}

export const WidgetCard = memo(function WidgetCard({ widget, categoryId, categoryTitle, refreshTick }: WidgetCardProps) {
  const dispatch = useAppDispatch();
  const titleId = `widget-${widget.id}`;

  const handleRemove = () => {
    dispatch(removeWidget({ categoryId, widgetId: widget.id }));
    dispatch(showToast({
      message: `Removed “${widget.name}” from ${categoryTitle}`,
      undo: { categoryId, widgetId: widget.id },
    }));
  };

  return (
    <article className="card widget" aria-labelledby={titleId}>
      <header className="widget__header">
        <h3 id={titleId} className="widget__title">{widget.name}</h3>
        {widget.custom && <span className="badge">Custom</span>}
        <button type="button" className="icon-btn widget__remove" aria-label={`Remove ${widget.name} from ${categoryTitle}`} onClick={handleRemove}>
          <Icon name="close" size={14} />
        </button>
      </header>
      <div className="widget__body" key={refreshTick}>
        <WidgetBody widget={widget} />
      </div>
    </article>
  );
});
