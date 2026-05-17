import type { ReactNode } from 'react';

interface RitualCardProps {
  eyebrow?: string;
  title: string;
  body: string;
  score?: string;
  action?: ReactNode;
  children?: ReactNode;
}

export function RitualCard({ eyebrow, title, body, score, action, children }: RitualCardProps) {
  return (
    <section className="ritual-card brush-panel rounded-[30px] border border-white/80 bg-white/95 p-5 shadow-card backdrop-blur">
      <div className="relative z-10">
        {eyebrow && <p className="text-xs font-semibold uppercase tracking-[0.18em] text-coach">{eyebrow}</p>}
        <div className="mt-3 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-normal text-ink">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted">{body}</p>
          </div>
          {score && (
            <div className="shrink-0 rounded-[24px] border border-amber-100 bg-amber-50/80 px-4 py-3 text-center">
              <p className="text-3xl font-bold text-ink">{score}</p>
              <p className="text-xs text-muted">完成分</p>
            </div>
          )}
        </div>
        {children && <div className="mt-4">{children}</div>}
        {action && <div className="mt-4">{action}</div>}
      </div>
    </section>
  );
}
