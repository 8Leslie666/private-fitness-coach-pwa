import type { ReactNode } from 'react';

interface TrainingFocusViewProps {
  label: string;
  title: string;
  cue?: string;
  metrics: ReactNode;
  timer: ReactNode;
  primaryAction: ReactNode;
  secondaryActions: ReactNode;
}

export function TrainingFocusView({ label, title, cue, metrics, timer, primaryAction, secondaryActions }: TrainingFocusViewProps) {
  return (
    <div className="flex h-full flex-col justify-between text-trainText">
      <div>
        <p className="text-sm font-semibold text-white/60">{label}</p>
        <h2 className="mt-2 truncate text-[46px] font-semibold leading-tight tracking-normal text-white">{title}</h2>
        {cue && <p className="mt-2 text-sm leading-6 text-white/55">{cue}</p>}
        <div className="mt-5">{metrics}</div>
        <div className="mt-5">{timer}</div>
      </div>
      <div className="grid gap-2">
        {primaryAction}
        {secondaryActions}
      </div>
    </div>
  );
}
