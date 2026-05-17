import { Dumbbell, Home, UserRound, Utensils } from 'lucide-react';
import type { AppPage } from '../../types';

interface BottomNavProps {
  page: AppPage;
  onChange: (page: AppPage) => void;
}

const items: Array<{ page: AppPage; label: string; Icon: typeof Home }> = [
  { page: 'today', label: '今日', Icon: Home },
  { page: 'training', label: '训练', Icon: Dumbbell },
  { page: 'diet', label: '饮食', Icon: Utensils },
  { page: 'mine', label: '我的', Icon: UserRound },
];

function normalizedActivePage(page: AppPage): AppPage {
  if (['workout', 'training-plan', 'training-history', 'training-settings', 'exercise-library'].includes(page)) return 'training';
  if (['diet-detail', 'takeout-scan', 'frequent-orders', 'mcdonalds', 'water', 'takeout-library'].includes(page)) return 'diet';
  if (['profile', 'diet-restrictions', 'water-settings', 'reminder-settings', 'weekly', 'data-export', 'advice', 'checkin'].includes(page)) return 'mine';
  return page;
}

export function BottomNav({ page, onChange }: BottomNavProps) {
  const activePage = normalizedActivePage(page);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-white/80 bg-white/90 px-2 pb-[calc(env(safe-area-inset-bottom)+8px)] pt-2 shadow-[0_-18px_45px_rgba(24,35,73,0.08)] backdrop-blur-xl">
      <div className="mx-auto grid max-w-md grid-cols-4 gap-1">
        {items.map(({ page: itemPage, label, Icon }) => {
          const active = activePage === itemPage;
          return (
            <button
              key={itemPage}
              type="button"
              onClick={() => onChange(itemPage)}
              className={`flex min-h-[54px] flex-col items-center justify-center gap-1 rounded-2xl text-xs font-medium transition active:scale-[0.98] ${
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
