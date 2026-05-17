import type { ReactNode } from 'react';

export type ActionMenuItem = {
  label: string;
  icon?: ReactNode;
  danger?: boolean;
  onClick: () => void;
};

export function ActionMenu({ items, className = '' }: { items: ActionMenuItem[]; className?: string }) {
  return (
    <div className={`action-menu ${className}`} data-action-menu-surface="true">
      {items.map((item) => (
        <button
          key={item.label}
          type="button"
          onClick={item.onClick}
          className={item.danger ? '!text-rose-500' : ''}
        >
          {item.icon}
          <span>{item.label}</span>
        </button>
      ))}
    </div>
  );
}
