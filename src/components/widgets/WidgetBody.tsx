import { Icon } from '../ui/Icon';
import type { Widget } from '../../types';
import { DonutChart } from './DonutChart';
import { StackedBar } from './StackedBar';

function NoData() {
  return (
    <div className="nodata">
      <Icon name="chart" size={44} />
      <p>No Graph data available!</p>
    </div>
  );
}

/** Chooses the right renderer for a widget's `type`. Unknown/empty data falls back to the empty state. */
export function WidgetBody({ widget }: { widget: Widget }) {
  const hasData = !!widget.segments && widget.segments.some((s) => s.value > 0);
  switch (widget.type) {
    case 'donut':
      return hasData ? <DonutChart segments={widget.segments!} /> : <NoData />;
    case 'stackedBar':
      return hasData ? <StackedBar segments={widget.segments!} headline={widget.headline} /> : <NoData />;
    case 'empty':
      return <NoData />;
    case 'text':
      return <p className="widget__text">{widget.text}</p>;
  }
}
