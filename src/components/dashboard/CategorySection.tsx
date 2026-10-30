import type { Category } from '../../types';
import { AddWidgetCard } from './AddWidgetCard';
import { WidgetCard } from './WidgetCard';

interface CategorySectionProps {
  category: Category;
  refreshTick: number;
  /** While searching we hide the "+ Add Widget" placeholder to keep results focused. */
  showAddCard: boolean;
}

export function CategorySection({ category, refreshTick, showAddCard }: CategorySectionProps) {
  const headingId = `category-${category.id}`;
  return (
    <section className="category" aria-labelledby={headingId}>
      <h2 id={headingId} className="category__title">{category.title}</h2>
      <div className="grid">
        {category.widgets.map((widget) => (
          <WidgetCard key={widget.id} widget={widget} categoryId={category.id} categoryTitle={category.title} refreshTick={refreshTick} />
        ))}
        {showAddCard && <AddWidgetCard categoryId={category.id} categoryTitle={category.title} />}
      </div>
    </section>
  );
}
