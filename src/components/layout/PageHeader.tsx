import { useRef, useState, type ChangeEvent } from 'react';
import { validateConfig } from '../../data/schema';
import { TIME_RANGES } from '../../data/timeRanges';
import { importConfig, resetDashboard, setRange } from '../../store/dashboardSlice';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { selectRange } from '../../store/selectors';
import { bumpRefresh, openDrawer, showToast } from '../../store/uiSlice';
import { Dropdown } from '../ui/Dropdown';
import { Icon } from '../ui/Icon';

export function PageHeader() {
  const dispatch = useAppDispatch();
  const config = useAppSelector((s) => s.dashboard.config);
  const rangeId = useAppSelector(selectRange);
  const [spinning, setSpinning] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const range = TIME_RANGES.find((r) => r.id === rangeId) ?? TIME_RANGES[0];

  const handleRefresh = () => {
    dispatch(bumpRefresh());
    dispatch(showToast({ message: 'Dashboard refreshed' }));
    setSpinning(true);
    window.setTimeout(() => setSpinning(false), 700);
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'cnapp-dashboard.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = ''; // allow importing the same file twice
    if (!file) return;
    try {
      const result = validateConfig(JSON.parse(await file.text()));
      if (result.ok) {
        dispatch(importConfig(result.config));
        dispatch(showToast({ message: `Imported “${file.name}”` }));
      } else {
        dispatch(showToast({ tone: 'error', message: `Import failed: ${result.errors[0]}` }));
      }
    } catch {
      dispatch(showToast({ tone: 'error', message: 'Import failed: the file is not valid JSON.' }));
    }
  };

  const handleReset = () => {
    if (window.confirm('Reset the dashboard to its default widgets? Your changes will be lost.')) {
      dispatch(resetDashboard());
      dispatch(showToast({ message: 'Dashboard reset to defaults' }));
    }
  };

  return (
    <div className="page-header">
      <h1 className="page-title">{config.title}</h1>
      <div className="page-header__actions">
        <button type="button" className="btn btn--outline" onClick={() => dispatch(openDrawer(null))}>
          Add Widget <Icon name="plus" size={14} />
        </button>
        <button type="button" className="icon-btn icon-btn--bordered" aria-label="Refresh dashboard" onClick={handleRefresh}>
          <Icon name="refresh" size={15} className={spinning ? 'spin' : undefined} />
        </button>
        <Dropdown
          label="More actions" trigger={<Icon name="more" size={16} />} triggerClassName="icon-btn icon-btn--bordered"
          items={[
            { id: 'export', label: 'Export layout (JSON)', icon: 'download', onSelect: handleExport },
            { id: 'import', label: 'Import layout (JSON)', icon: 'upload', onSelect: () => fileRef.current?.click() },
            { id: 'reset', label: 'Reset to default', icon: 'reset', danger: true, onSelect: handleReset },
          ]}
        />
        <Dropdown
          variant="select" label={`Time range: ${range.label}`} triggerClassName="time-btn"
          trigger={<><span className="time-btn__clock"><Icon name="clock" size={12} /></span>{range.label}<Icon name="chevron" size={14} /></>}
          items={TIME_RANGES.map((r) => ({ id: r.id, label: r.label, selected: r.id === range.id, onSelect: () => dispatch(setRange(r.id)) }))}
        />
        <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={handleImport} data-testid="import-input" />
      </div>
    </div>
  );
}
