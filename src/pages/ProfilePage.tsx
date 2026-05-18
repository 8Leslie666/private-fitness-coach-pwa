import { Bell, Database, Droplets, Scale, Settings2, Shield, Utensils } from 'lucide-react';
import { GlassPanel } from '../components/ui/GlassPanel';
import { useAppStore } from '../store/appStore';

const settingGroups = [
  { title: '身体数据', icon: Scale },
  { title: '训练偏好', icon: Settings2 },
  { title: '膳食偏好', icon: Utensils },
  { title: '喝水目标', icon: Droplets },
  { title: '提醒节律', icon: Bell },
  { title: '数据管理', icon: Database },
];

export function ProfilePage() {
  const profile = useAppStore((state) => state.profile);
  const hydration = useAppStore((state) => state.hydration);
  const dietPreferences = useAppStore((state) => state.dietPreferences);
  const reminderRhythm = useAppStore((state) => state.reminderRhythm);
  const openDrawer = useAppStore((state) => state.openDrawer);

  return (
    <section className="page">
      <header className="top-row">
        <div>
          <h1 className="page-title">吾身</h1>
          <p className="page-subtitle mt-2">个人状态与设置</p>
        </div>
        <div className="grid h-11 w-11 place-items-center rounded-full bg-white/55 text-[color:var(--blue-main)] shadow-inner">
          <Shield size={20} />
        </div>
      </header>

      <GlassPanel className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-sm text-[color:var(--text-muted)]">{profile.phase} · 第 {profile.week} 周</div>
            <div className="mt-3 text-3xl font-semibold">{profile.currentWeightKg}kg</div>
            <div className="mt-1 text-sm text-[color:var(--text-muted)]">目标 {profile.targetWeightKg}kg</div>
          </div>
          <div className="rounded-3xl bg-white/50 px-4 py-3 text-right">
            <div className="text-xs text-[color:var(--text-muted)]">身高</div>
            <div className="mt-1 text-xl font-semibold">{profile.heightCm}cm</div>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <SmallStat label="每周训练" value={`${profile.trainingDays} 天`} />
          <SmallStat label="单次限制" value={`${profile.sessionLimitMin} 分钟`} />
        </div>
      </GlassPanel>

      <div className="grid gap-2">
        {settingGroups.map((group) => {
          const Icon = group.icon;
          return (
            <button
              key={group.title}
              type="button"
              className="glass-panel pressable flex h-[58px] items-center justify-between rounded-[22px] px-4"
              onClick={() => {
                if (group.title === '喝水目标') {
                  openDrawer({ kind: 'water-target', payload: { targetMl: hydration.targetMl } });
                  return;
                }
                if (group.title === '膳食偏好') {
                  openDrawer({ kind: 'diet-preferences' });
                  return;
                }
                if (group.title === '数据管理') {
                  openDrawer({ kind: 'data-management' });
                  return;
                }
                openDrawer({ kind: 'profile-edit', payload: { group: group.title } });
              }}
            >
              <span className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-white/55 text-[color:var(--blue-main)]">
                  <Icon size={17} />
                </span>
                <span className="text-sm font-semibold">{group.title}</span>
              </span>
              <span className="text-xs text-[color:var(--text-muted)]">
                {group.title === '喝水目标'
                  ? `${(hydration.targetMl / 1000).toFixed(1)}L`
                  : group.title === '膳食偏好'
                    ? `${dietPreferences.mealsPerDay}餐 / ${dietPreferences.budgetYuan}元`
                  : group.title === '身体数据'
                    ? `${profile.currentWeightKg}kg`
                  : group.title === '提醒节律'
                    ? reminderRhythm.dailyEnabled
                      ? '已开启'
                      : '已关闭'
                    : '编辑'}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function SmallStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl bg-white/50 p-3">
      <div className="text-xs text-[color:var(--text-muted)]">{label}</div>
      <div className="mt-1 text-lg font-semibold">{value}</div>
    </div>
  );
}
