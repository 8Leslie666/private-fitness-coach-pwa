import type { ReactNode } from 'react';

interface SettingRowProps {
  label: string;
  value?: ReactNode;
  children?: ReactNode;
}

export function SettingRow({ label, value, children }: SettingRowProps) {
  return (
    <label className="block rounded-2xl bg-white/72 p-3 shadow-soft">
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-ink">{label}</span>
        {value && <span className="text-sm text-muted">{value}</span>}
      </div>
      {children}
    </label>
  );
}
