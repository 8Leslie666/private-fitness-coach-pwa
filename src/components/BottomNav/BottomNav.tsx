import { CalendarDays, ClipboardCheck, Dumbbell, Home, MessageSquareText } from 'lucide-react';
import type { AppPage } from '../../types';

interface BottomNavProps {
  page: AppPage;
  onChange: (page: AppPage) => void;
}

const items: Array<{ page: AppPage; label: string; Icon: typeof Home }> = [
  { page: 'today', label: '今日', Icon: Home },
  { page: 'checkin', label: '打卡', Icon: ClipboardCheck },
  { page: 'training', label: '训练', Icon: Dumbbell },
  { page: 'advice', label: '建议', Icon: MessageSquareText },
  { page: 'weekly', label: '周报', Icon: CalendarDays },
];

export function BottomNav({ page, onChange }: BottomNavProps) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-white/80 bg-white/90 px-2 pb-[calc(env(safe-area-inset-bottom)+8px)] pt-2 shadow-[0_-18px_45px_rgba(24,35,73,0.08)] backdrop-blur-xl">
      <div className="mx-auto grid max-w-md grid-cols-5 gap-1">
        {items.map(({ page: itemPage, label, Icon }) => {
          const active = page === itemPage;
          return (
            <button
              key={itemPage}
              type="button"
              onClick={() => onChange(itemPage)}
              className={`flex min-h-[54px] flex-col items-center justify-center gap-1 rounded-2xl text-xs font-medium transition ${
                active ? 'bg-blue-50 text-coach shadow-soft' : 'text-muted active:bg-surface'
              }`}
              aria-current={active ? 'page' : undefined}
            >
              <Icon size={20} strokeWidth={active ? 2.5 : 2} />
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
