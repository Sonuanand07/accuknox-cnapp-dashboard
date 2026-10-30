import type { Headline, Segment } from '../../types';

interface StackedBarProps {
  segments: Segment[];
  headline?: Headline;
}

export function StackedBar({ segments, headline }: StackedBarProps) {
  const summary = segments.map((s) => `${s.label} ${s.value}`).join(', ');
  return (
    <div className="stacked">
      {headline && (
        <p className="headline">
          <strong>{headline.value}</strong> {headline.label}
        </p>
      )}
      <div className="sbar" role="img" aria-label={summary}>
        {segments.filter((s) => s.value > 0).map((s) => (
          <span key={s.label} className="sbar__seg" style={{ flexGrow: s.value, background: s.color }} title={`${s.label}: ${s.value}`} />
        ))}
      </div>
      <ul className="legend legend--grid">
        {segments.map((s) => (
          <li key={s.label}>
            <i className="legend__dot" style={{ background: s.color }} />
            {s.label} ({s.value})
          </li>
        ))}
      </ul>
    </div>
  );
}
