import { Activity, BarChart3, Droplets, Dumbbell, Scale, Utensils } from 'lucide-react';
import { GlassPanel } from '../components/ui/GlassPanel';
import { useAppStore } from '../store/appStore';

export function ProgressPage() {
  const openDrawer = useAppStore((state) => state.openDrawer);
  const navigate = useAppStore((state) => state.navigate);
  const plans = useAppStore((state) => state.plans);
  const hydration = useAppStore((state) => state.hydration);
  const meals = useAppStore((state) => state.meals);
  const profile = useAppStore((state) => state.profile);
  const workoutLogs = useAppStore((state) => state.workoutLogs);
  const weightLogs = useAppStore((state) => state.weightLogs);
  const strengthPlans = plans.filter((plan) => plan.type === 'strength');
  const totalTraining = strengthPlans.length || 4;
  const completedTraining = workoutLogs.filter((log) => log.completionState === 'completed').length || strengthPlans.filter((plan) => plan.completed).length;
  const waterRate = Math.round((hydration.currentMl / hydration.targetMl) * 100);
  const mealRate = meals.length ? Math.round((meals.filter((meal) => meal.done).length / meals.length) * 100) : 0;
  const latestWeight = weightLogs[0]?.weightKg ?? profile.currentWeightKg;
  const previousWeight = weightLogs[1]?.weightKg;
  const weightSub =
    previousWeight === undefined
      ? `目标 ${profile.targetWeightKg}kg`
      : `${latestWeight - previousWeight > 0 ? '+' : ''}${(latestWeight - previousWeight).toFixed(1)}kg / 上次`;
  const lastWorkout = workoutLogs[0];
  const recoveryValue = lastWorkout
    ? lastWorkout.completionState === 'completed'
      ? '稳定'
      : '需调整'
    : '待判断';
  const recoverySub = lastWorkout?.lastFeedback ? `最近反馈：${lastWorkout.lastFeedback}` : '完成训练后更新';
  const cards = [
    {
      title: '本周行练',
      value: `${completedTraining} / ${totalTraining}`,
      sub: `剩余 ${Math.max(totalTraining - completedTraining, 0)} 次`,
      icon: Dumbbell,
    },
    { title: '体重趋势', value: `${latestWeight}kg`, sub: weightSub, icon: Scale },
    { title: '三大项恢复', value: recoveryValue, sub: recoverySub, icon: Activity },
    { title: '膳食执行', value: `${mealRate}%`, sub: `${meals.filter((meal) => meal.done).length} / ${meals.length} 餐`, icon: Utensils },
    {
      title: '喝水执行',
      value: `${waterRate}%`,
      sub: `今日 ${(hydration.currentMl / 1000).toFixed(1)}L`,
      icon: Droplets,
      hydration: true,
    },
  ];

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
        <div className="text-sm font-semibold">{workoutLogs.length >= 7 ? '趋势已建立' : '记录不足'}</div>
        <div className="mt-2 text-xs leading-5 text-[color:var(--text-muted)]">
          {workoutLogs.length >= 7
            ? '训练、膳食和喝水已形成基础样本，可以开始观察趋势。'
            : `当前有 ${workoutLogs.length} 条训练记录，先看即时执行；连续 7 天后再展示更细变化。`}
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
                <div className="min-w-0 truncate text-xs text-[color:var(--text-muted)]">{card.sub}</div>
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
