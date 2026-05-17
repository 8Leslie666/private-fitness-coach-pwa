import type { ReactNode } from 'react';

interface InkCardProps {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function InkCard({ title, subtitle, action, children, className = '' }: InkCardProps) {
  return (
    <section className={`ink-card rounded-pageCard p-4 ${className}`}>
      {(title || subtitle || action) && (
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            {title && <h2 className="text-[17px] font-semibold tracking-normal text-ink900">{title}</h2>}
            {subtitle && <p className="mt-1 text-sm leading-5 text-ink500">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
