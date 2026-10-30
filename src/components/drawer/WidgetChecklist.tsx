import type { DraftWidget } from './draft';
import { Icon } from '../ui/Icon';

interface WidgetChecklistProps {
  items: DraftWidget[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export function WidgetChecklist({ items, onToggle, onDelete }: WidgetChecklistProps) {
  if (items.length === 0) return <p className="drawer__empty">No widgets in this category yet. Create one below.</p>;
  return (
    <ul className="checklist">
      {items.map((item) => (
        <li key={item.id} className="check-row">
          <label className="check-row__label">
            <input type="checkbox" checked={item.visible} onChange={() => onToggle(item.id)} />
            <span className="check-row__text">
              <span className="check-row__name">
                {item.name}
                {item.custom && <span className="badge">Custom</span>}
              </span>
              <span className="check-row__desc">{item.text}</span>
            </span>
          </label>
          {item.custom && (
            <button type="button" className="icon-btn" aria-label={`Delete ${item.name} permanently`} onClick={() => onDelete(item.id)}>
              <Icon name="trash" size={15} />
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}
