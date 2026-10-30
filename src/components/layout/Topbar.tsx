import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { selectQuery } from '../../store/selectors';
import { setQuery } from '../../store/uiSlice';
import { Icon } from '../ui/Icon';

export function Topbar() {
  const dispatch = useAppDispatch();
  const query = useAppSelector(selectQuery);
  const drawerOpen = useAppSelector((s) => s.ui.drawer.open);
  const inputRef = useRef<HTMLInputElement>(null);

  // Press "/" anywhere to jump to the search box (like GitHub, Gmail, ...).
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typing = !!target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);
      if (e.key === '/' && !typing && !drawerOpen) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [drawerOpen]);

  return (
    <header className="topbar">
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <span>Home</span>
        <span aria-hidden="true">›</span>
        <strong aria-current="page">Dashboard V2</strong>
      </nav>
      <div className="search">
        <Icon name="search" size={15} />
        <input
          ref={inputRef} type="search" placeholder="Search anything..." aria-label="Search widgets on the dashboard"
          value={query} onChange={(e) => dispatch(setQuery(e.target.value))}
          onKeyDown={(e) => { if (e.key === 'Escape') dispatch(setQuery('')); }}
        />
        {!query && <kbd className="kbd" aria-hidden="true">/</kbd>}
      </div>
      <div className="topbar__actions">
        <button type="button" className="icon-btn" aria-label="Notifications"><Icon name="bell" size={17} /></button>
        <span className="avatar" role="img" aria-label="Signed-in user">AK</span>
      </div>
    </header>
  );
}
