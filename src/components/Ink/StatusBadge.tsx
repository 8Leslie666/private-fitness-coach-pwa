type StatusBadgeTone = 'neutral' | 'good' | 'warn' | 'danger' | 'seal';

interface StatusBadgeProps {
  children: React.ReactNode;
  tone?: StatusBadgeTone;
}

const tones: Record<StatusBadgeTone, string> = {
  neutral: 'bg-ink900/6 text-ink500',
  good: 'bg-jade/10 text-jade',
  warn: 'bg-gold/15 text-amber-800',
  danger: 'bg-red-50 text-red-700',
  seal: 'bg-seal/10 text-seal',
};

export function StatusBadge({ children, tone = 'neutral' }: StatusBadgeProps) {
  return (
    <span className={`inline-flex min-h-[30px] items-center rounded-full px-3 text-xs font-semibold ${tones[tone]}`}>
      {children}
    </span>
  );
}
