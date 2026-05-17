import { ChevronRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface InkSectionEntryProps {
  title: string;
  subtitle?: string;
  Icon: LucideIcon;
  onClick: () => void;
}

export function InkSectionEntry({ title, subtitle, Icon, onClick }: InkSectionEntryProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-[74px] w-full items-center gap-3 rounded-card border border-white/70 bg-white/62 px-4 text-left shadow-soft backdrop-blur transition active:scale-[0.99]"
    >
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-smallCard bg-jade/10 text-jade">
        <Icon size={19} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-semibold text-ink900">{title}</span>
        {subtitle && <span className="mt-0.5 block truncate text-xs text-ink500">{subtitle}</span>}
      </span>
      <ChevronRight size={18} className="text-ink300" />
    </button>
  );
}
