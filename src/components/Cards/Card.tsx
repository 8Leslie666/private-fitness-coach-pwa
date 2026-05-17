import type { ReactNode } from 'react';

interface CardProps {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function Card({ title, subtitle, action, children, className = '' }: CardProps) {
  return (
    <section className={`rounded-[24px] border border-white/80 bg-white/95 p-4 shadow-card backdrop-blur ${className}`}>
      {(title || subtitle || action) && (
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            {title && <h2 className="text-base font-semibold tracking-normal text-ink">{title}</h2>}
            {subtitle && <p className="mt-1 text-sm leading-5 text-muted">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
