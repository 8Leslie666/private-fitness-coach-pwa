import type { ReactNode } from 'react';

interface InkPageProps {
  eyebrow?: ReactNode;
  title: string;
  subtitle?: string;
  children: ReactNode;
  compact?: boolean;
}

export function InkPage({ eyebrow, title, subtitle, children, compact = false }: InkPageProps) {
  return (
    <div className={`page-slide ${compact ? 'space-y-3' : 'space-y-4'}`}>
      <header className="pt-1">
        {eyebrow && <div className="mb-3 flex items-center justify-between gap-3 text-sm text-ink500">{eyebrow}</div>}
        <h1 className="ink-title text-[32px] font-semibold leading-tight text-ink900">{title}</h1>
        {subtitle && <p className="mt-2 max-w-[28rem] text-sm leading-6 text-ink500">{subtitle}</p>}
      </header>
      {children}
    </div>
  );
}
