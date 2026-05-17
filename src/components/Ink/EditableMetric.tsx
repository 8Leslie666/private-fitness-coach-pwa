interface EditableMetricProps {
  label: string;
  value: string;
  hint?: string;
  onClick?: () => void;
  dark?: boolean;
}

export function EditableMetric({ label, value, hint, onClick, dark = false }: EditableMetricProps) {
  const Wrapper = onClick ? 'button' : 'div';
  return (
    <Wrapper
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`rounded-card p-3 text-left transition active:scale-[0.98] ${
        dark ? 'bg-trainCard text-white ring-1 ring-white/10' : 'bg-white/68 text-ink900 shadow-soft'
      }`}
    >
      <p className={`text-xs ${dark ? 'text-white/55' : 'text-ink500'}`}>{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-normal">{value}</p>
      {hint && <p className={`mt-1 text-xs ${dark ? 'text-white/55' : 'text-ink500'}`}>{hint}</p>}
    </Wrapper>
  );
}
