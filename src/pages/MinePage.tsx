import { Bell, Database, Dumbbell, FileText, GlassWater, HeartPulse, Library, Settings, UserRound, Utensils } from 'lucide-react';
import type { AppPage, AppState } from '../types';

interface MinePageProps {
  state: AppState;
  onPageChange: (page: AppPage) => void;
}

const entries: Array<{ label: string; page: AppPage; Icon: typeof UserRound }> = [
  { label: '个人资料', page: 'profile', Icon: UserRound },
  { label: '训练设置', page: 'training-settings', Icon: Settings },
  { label: '饮食禁忌', page: 'diet-restrictions', Icon: Utensils },
  { label: '饮水设置', page: 'water-settings', Icon: GlassWater },
  { label: '提醒设置', page: 'reminder-settings', Icon: Bell },
  { label: '动作库', page: 'exercise-library', Icon: Dumbbell },
  { label: '外卖库', page: 'takeout-library', Icon: Library },
  { label: '周报', page: 'weekly', Icon: FileText },
  { label: '数据导出', page: 'data-export', Icon: Database },
];

export function MinePage({ state, onPageChange }: MinePageProps) {
  return (
    <div className="page-slide space-y-4">
      <header className="pt-2">
        <div className="mb-4 h-1.5 w-20 rounded-full brush-stroke" />
        <p className="text-sm text-muted">{state.profile.height}cm · {state.profile.currentWeight}kg</p>
        <h1 className="mt-2 text-2xl font-bold">我的</h1>
      </header>

      <section className="rounded-[30px] border border-white/80 bg-white/95 p-5 shadow-card">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-blue-50 p-3 text-coach">
            <HeartPulse size={22} />
          </div>
          <div>
            <p className="text-lg font-bold text-ink">恢复减脂期</p>
            <p className="mt-1 text-sm text-muted">减脂第一，恢复力量第二。</p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-3 gap-3">
        {entries.map(({ label, page, Icon }) => (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            className="flex min-h-[88px] flex-col items-center justify-center gap-2 rounded-[24px] border border-white/80 bg-white/95 p-3 text-center text-sm font-semibold text-ink shadow-soft active:scale-[0.99]"
          >
            <Icon size={20} className="text-coach" />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
