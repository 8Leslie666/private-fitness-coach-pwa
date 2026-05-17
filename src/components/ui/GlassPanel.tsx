import type { PropsWithChildren } from 'react';

type GlassPanelProps = PropsWithChildren<{
  className?: string;
  dark?: boolean;
  onClick?: () => void;
  ariaLabel?: string;
}>;

export function GlassPanel({ children, className = '', dark = false, onClick, ariaLabel }: GlassPanelProps) {
  return (
    <div
      className={`glass-panel ${dark ? 'glass-dark' : ''} ${onClick ? 'pressable cursor-pointer' : ''} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={ariaLabel}
    >
      {children}
    </div>
  );
}

