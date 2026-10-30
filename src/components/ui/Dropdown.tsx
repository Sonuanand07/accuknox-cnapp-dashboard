import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { Icon, type IconName } from './Icon';

export interface DropdownItem {
  id: string;
  label: string;
  icon?: IconName;
  selected?: boolean;
  danger?: boolean;
  onSelect: () => void;
}

interface DropdownProps {
  /** Accessible name of the trigger button. */
  label: string;
  trigger: ReactNode;
  items: DropdownItem[];
  /** "menu" = list of actions, "select" = pick one value (the item marked `selected` is current). */
  variant?: 'menu' | 'select';
  triggerClassName?: string;
}

/** Small accessible popover: click, arrow keys, Home/End, Escape and outside-click all work. */
export function Dropdown({ label, trigger, items, variant = 'menu', triggerClassName = 'icon-btn' }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    const root = rootRef.current;
    (root?.querySelector<HTMLElement>('[data-item][aria-selected="true"]') ?? root?.querySelector<HTMLElement>('[data-item]'))?.focus();
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [open]);

  const close = (returnFocus: boolean) => {
    setOpen(false);
    if (returnFocus) triggerRef.current?.focus();
  };

  const onListKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const nodes = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('[data-item]'));
    const index = nodes.indexOf(document.activeElement as HTMLElement);
    const move = (next: number) => {
      event.preventDefault();
      nodes[(next + nodes.length) % nodes.length]?.focus();
    };
    switch (event.key) {
      case 'ArrowDown': return move(index + 1);
      case 'ArrowUp': return move(index - 1);
      case 'Home': return move(0);
      case 'End': return move(nodes.length - 1);
      case 'Escape': event.preventDefault(); return close(true);
      case 'Tab': return close(false);
    }
  };

  return (
    <div className="dropdown" ref={rootRef}>
      <button
        type="button" ref={triggerRef} className={triggerClassName} aria-label={label}
        aria-haspopup={variant === 'select' ? 'listbox' : 'menu'} aria-expanded={open}
        aria-controls={open ? listId : undefined} onClick={() => setOpen((o) => !o)}
      >
        {trigger}
      </button>
      {open && (
        <div id={listId} className="dropdown__menu" role={variant === 'select' ? 'listbox' : 'menu'}
             aria-label={label} onKeyDown={onListKeyDown}>
          {items.map((item) => (
            <button
              key={item.id} type="button" data-item
              role={variant === 'select' ? 'option' : 'menuitem'}
              aria-selected={variant === 'select' ? !!item.selected : undefined}
              className={`dropdown__item${item.selected ? ' is-selected' : ''}${item.danger ? ' is-danger' : ''}`}
              onClick={() => { item.onSelect(); close(true); }}
            >
              {item.icon && <Icon name={item.icon} size={15} />}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
