interface RatingButtonsProps {
  label: string;
  value?: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
}

export function RatingButtons({ label, value, min = 1, max = 10, onChange }: RatingButtonsProps) {
  const values = Array.from({ length: max - min + 1 }, (_, index) => index + min);
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label className="text-sm font-medium text-ink">{label}</label>
        <span className="text-sm text-muted">{value ?? '未选'} 分</span>
      </div>
      <div className="grid grid-cols-5 gap-2">
        {values.map((score) => (
          <button
            key={score}
            type="button"
            onClick={() => onChange(score)}
            className={`min-h-[42px] rounded-xl border text-sm font-semibold ${
              value === score ? 'border-coach bg-blue-50 text-coach' : 'border-line bg-white text-ink'
            }`}
          >
            {score}
          </button>
        ))}
      </div>
    </div>
  );
}
