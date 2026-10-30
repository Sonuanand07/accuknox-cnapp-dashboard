import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { restoreWidget } from '../../store/dashboardSlice';
import { dismissToast } from '../../store/uiSlice';

const AUTO_DISMISS_MS = 6000;

export function Toast() {
  const toast = useAppSelector((s) => s.ui.toast);
  const dispatch = useAppDispatch();
  const toastId = toast?.id;

  useEffect(() => {
    if (toastId === undefined) return;
    const timer = window.setTimeout(() => dispatch(dismissToast()), AUTO_DISMISS_MS);
    return () => window.clearTimeout(timer);
  }, [toastId, dispatch]);

  if (!toast) return null;
  const { undo } = toast;

  return (
    <div className={`toast toast--${toast.tone}`} role={toast.tone === 'error' ? 'alert' : 'status'}>
      <span>{toast.message}</span>
      {undo && (
        <button type="button" className="toast__action" onClick={() => { dispatch(restoreWidget(undo)); dispatch(dismissToast()); }}>
          Undo
        </button>
      )}
      <button type="button" className="toast__close" aria-label="Dismiss notification" onClick={() => dispatch(dismissToast())}>
        ×
      </button>
    </div>
  );
}
