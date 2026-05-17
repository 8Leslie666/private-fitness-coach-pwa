import { Activity, BarChart3, Droplets, Dumbbell, Scale, Utensils } from 'lucide-react';
import { GlassPanel } from '../components/ui/GlassPanel';
import { useAppStore } from '../store/appStore';

const cards = [
  { title: '本周行练', value: '3 / 4', sub: '剩余 1 次', icon: Dumbbell },
  { title: '体重趋势', value: '-0.5kg', sub: '最近一周', icon: Scale },
  { title: '三大项恢复', value: '稳定', sub: '可继续推进', icon: Activity },
  { title: '膳食执行', value: '良好', sub: '两餐制保持', icon: Utensils },
  { title: '喝水执行', value: '64%', sub: '今日 1.6L', icon: Droplets, hydration: true },
];

export function ProgressPage() {
  const openDrawer = useAppStore((state) => state.openDrawer);
  const navigate = useAppStore((state) => state.navigate);

  return (
    <section className="page">
      <header className="top-row">
        <div>
          <h1 className="page-title">进度</h1>
          <p className="page-subtitle mt-2">最近状态判断，不是后台报表</p>
        </div>
        <div className="grid h-11 w-11 place-items-center rounded-full bg-white/55 text-[color:var(--blue-main)] shadow-inner">
          <BarChart3 size={20} />
        </div>
      </header>

      <GlassPanel className="p-4">
        <div className="text-sm font-semibold">记录不足</div>
        <div className="mt-2 text-xs leading-5 text-[color:var(--text-muted)]">
          当前样本还少，先看趋势判断。连续 7 天后再展示更细的变化。
        </div>
      </GlassPanel>

      <div className="grid min-h-0 flex-1 grid-cols-2 gap-3">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <GlassPanel
              key={card.title}
              className={`${index === 0 ? 'col-span-2' : ''} p-4`}
              onClick={() =>
                card.hydration
                  ? navigate('hydration')
                  : openDrawer({ kind: 'progress-record', payload: { title: card.title, value: card.value } })
              }
            >
              <div className="flex items-center justify-between">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-white/55 text-[color:var(--blue-main)]">
                  <Icon size={19} />
                </div>
                <div className="text-xs text-[color:var(--text-muted)]">{card.sub}</div>
              </div>
              <div className="mt-4 text-sm font-semibold">{card.title}</div>
              <div className="mt-1 text-3xl font-semibold tabular-nums">{card.value}</div>
            </GlassPanel>
          );
        })}
      </div>
    </section>
  );
}

