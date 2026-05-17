interface TextFieldProps {
  label: string;
  value: string | number | undefined;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  suffix?: string;
}

export function TextField({ label, value, onChange, type = 'text', placeholder, suffix }: TextFieldProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-ink">{label}</span>
      <div className="flex items-center gap-2 rounded-2xl border border-line bg-white px-3">
        <input
          type={type}
          value={value ?? ''}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className="h-12 min-w-0 flex-1 bg-transparent text-base outline-none"
        />
        {suffix && <span className="text-sm text-muted">{suffix}</span>}
      </div>
    </label>
  );
}
