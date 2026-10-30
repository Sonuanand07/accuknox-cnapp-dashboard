import type { Segment } from '../../types';

interface DonutChartProps {
  segments: Segment[];
  centerLabel?: string;
}

const RADIUS = 15.9155; // circumference = 100, so each segment's length equals its percentage
const STROKE = 5;

export function DonutChart({ segments, centerLabel = 'Total' }: DonutChartProps) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  const summary = segments.map((s) => `${s.label} ${s.value}`).join(', ');
  let offset = 0;

  return (
    <div className="donut-layout">
      <svg className="donut" viewBox="0 0 42 42" role="img" aria-label={`${centerLabel} ${total}. ${summary}`}>
        <circle cx="21" cy="21" r={RADIUS} fill="none" stroke="#EEF1F6" strokeWidth={STROKE} />
        {segments.map((segment) => {
          if (segment.value <= 0) return null;
          const pct = (segment.value / total) * 100;
          const circle = (
            <circle
              key={segment.label} cx="21" cy="21" r={RADIUS} fill="none" stroke={segment.color} strokeWidth={STROKE}
              strokeDasharray={`${pct} ${100 - pct}`} strokeDashoffset={-offset} transform="rotate(-90 21 21)"
            />
          );
          offset += pct;
          return circle;
        })}
        <text x="21" y="22.6" textAnchor="middle" className="donut__total" fontSize="6.6" fontWeight="600" fill="#1a1f36">{total}</text>
        <text x="21" y="27.4" textAnchor="middle" className="donut__label" fontSize="2.8" fill="#6b7390">{centerLabel}</text>
      </svg>
      <ul className="legend">
        {segments.map((segment) => (
          <li key={segment.label}>
            <i className="legend__dot" style={{ background: segment.color }} />
            {segment.label} ({segment.value})
          </li>
        ))}
      </ul>
    </div>
  );
}
