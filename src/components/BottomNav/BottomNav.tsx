import { BarChart3, Dumbbell, Home, UserRound, Utensils } from 'lucide-react';
import type { AppPage } from '../../types';

interface BottomNavProps {
  page: AppPage;
  onChange: (page: AppPage) => void;
}

const items: Array<{ page: AppPage; label: string; Icon: typeof Home }> = [
  { page: 'today', label: '今日修行', Icon: Home },
  { page: 'training', label: '行练', Icon: Dumbbell },
  { page: 'diet', label: '膳食', Icon: Utensils },
  { page: 'weekly', label: '数据', Icon: BarChart3 },
  { page: 'mine', label: '吾身', Icon: UserRound },
];

function normalizedActivePage(page: AppPage): AppPage {
  if (['workout', 'training-plan', 'training-history', 'training-settings', 'exercise-library'].includes(page)) return 'training';
  if (['diet-detail', 'takeout-scan', 'frequent-orders', 'mcdonalds', 'water', 'takeout-library'].includes(page)) return 'diet';
  if (['weekly'].includes(page)) return 'weekly';
  if (['profile', 'diet-restrictions', 'water-settings', 'reminder-settings', 'data-export', 'advice', 'checkin'].includes(page)) return 'mine';
  return page;
}

export function BottomNav({ page, onChange }: BottomNavProps) {
  const activePage = normalizedActivePage(page);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-white/70 bg-paper/88 px-2 pb-[calc(env(safe-area-inset-bottom)+8px)] pt-2 shadow-[0_-10px_28px_rgba(26,26,26,0.07)] backdrop-blur-xl">
      <div className="mx-auto grid max-w-md grid-cols-5 gap-1">
        {items.map(({ page: itemPage, label, Icon }) => {
          const active = activePage === itemPage;
          return (
            <button
              key={itemPage}
              type="button"
              onClick={() => onChange(itemPage)}
              className={`flex min-h-[54px] flex-col items-center justify-center gap-1 rounded-2xl text-[11px] font-medium transition active:scale-[0.98] ${
                active ? 'bg-jade/10 text-jade shadow-soft' : 'text-ink500 active:bg-white/50'
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
