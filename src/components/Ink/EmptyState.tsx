import type { LucideIcon } from 'lucide-react';
import { CircleDashed } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  message: string;
  Icon?: LucideIcon;
  action?: React.ReactNode;
}

export function EmptyState({ title, message, Icon = CircleDashed, action }: EmptyStateProps) {
  return (
    <div className="rounded-pageCard border border-white/70 bg-white/58 p-5 text-center shadow-soft backdrop-blur">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-smallCard bg-inkwash text-ink500">
        <Icon size={22} />
      </div>
      <h2 className="mt-3 text-base font-semibold text-ink900">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-ink500">{message}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
