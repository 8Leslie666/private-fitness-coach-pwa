interface MetricCardProps {
  label: string;
  value: string;
  hint?: string;
}

export function MetricCard({ label, value, hint }: MetricCardProps) {
  return (
    <div className="rounded-[22px] border border-white/80 bg-white/90 p-3 shadow-soft backdrop-blur">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 text-lg font-semibold text-ink">{value}</p>
      {hint && <p className="mt-1 text-xs leading-4 text-muted">{hint}</p>}
    </div>
  );
}
