import { Bell, Droplets, Dumbbell, TrendingUp, Utensils } from 'lucide-react';
import type { ReactNode } from 'react';
import { GlassPanel } from '../components/ui/GlassPanel';
import { getPlanSessionTitle, useAppStore } from '../store/appStore';

export function CultivationPage() {
  const navigate = useAppStore((state) => state.navigate);
  const openDrawer = useAppStore((state) => state.openDrawer);
  const plans = useAppStore((state) => state.plans);
  const trainingProgram = useAppStore((state) => state.trainingProgram);
  const hydration = useAppStore((state) => state.hydration);
  const vitals = useAppStore((state) => state.vitals);
  const waterRate = Math.round((hydration.currentMl / hydration.targetMl) * 100);
  const today = plans.find((plan) => plan.sequenceIndex === trainingProgram.currentSequenceIndex) ?? plans[0];
  const strengthPlans = plans.filter((plan) => plan.type === 'strength');
  const totalTraining = strengthPlans.length || trainingProgram.weeklyFrequency;
  const completedTraining = strengthPlans.filter((plan) => plan.completed).length;
  const remainingTraining = Math.max(totalTraining - completedTraining, 0);
  const completionRate = totalTraining ? Math.round((completedTraining / totalTraining) * 100) : 0;

  return (
    <section className="page">
      <header className="top-row">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="page-title">修炼</h1>
            <span className="blue-dot" />
          </div>
          <p className="page-subtitle mt-2">专注当下，持续精进</p>
        </div>
        <button
          className="icon-button pressable"
          type="button"
          aria-label="提醒节律"
          onClick={() => openDrawer({ kind: 'profile-edit', payload: { group: '提醒节律' } })}
        >
          <Bell size={18} />
        </button>
      </header>

      <GlassPanel className="p-5" onClick={() => navigate('training')} ariaLabel="查看今日流程概要">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="text-xs text-[color:var(--text-muted)]">今日修行</div>
            <div className="mt-4 text-2xl font-bold">{today ? getPlanSessionTitle(today) : '配置今日行练'}</div>
            <div className="mt-1 text-sm text-[color:var(--text-muted)]">
              {today ? `${today.weight}kg × ${today.reps} × ${today.sets} · 预计 ${today.durationMin ?? 55} 分钟` : '主项 / 辅助 / 核心收尾'}
            </div>
          </div>
          <ProgressCircle value={completionRate} />
        </div>
        <div className="mt-5 text-xs text-[color:var(--text-muted)]">计划完成度</div>
        <div className="progress-track mt-2">
          <div className="progress-fill" style={{ width: `${completionRate}%` }} />
        </div>
        <div className="mt-4 flex items-center gap-3 text-sm text-[color:var(--text-muted)]">
          <span>本周训练 {completedTraining} / {totalTraining} 次</span>
          <span className="h-4 w-px bg-slate-300/70" />
          <span>剩余 {remainingTraining} 次</span>
        </div>
      </GlassPanel>

      <div className="grid grid-cols-4 gap-3">
        <QuickItem icon={<Dumbbell size={24} />} label="行练" onClick={() => navigate('training')} />
        <QuickItem icon={<Utensils size={23} />} label="膳食" onClick={() => navigate('diet')} />
        <QuickItem icon={<Droplets size={23} />} label="喝水" onClick={() => navigate('hydration')} />
        <QuickItem icon={<TrendingUp size={23} />} label="进度" onClick={() => navigate('progress')} />
      </div>

      <GlassPanel className="p-4" onClick={() => navigate('hydration')} ariaLabel="打开喝水计划">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-sm font-semibold">喝水计划</div>
            <div className="mt-2 text-xs text-[color:var(--text-muted)]">今日目标 {(hydration.targetMl / 1000).toFixed(1)}L</div>
            <div className="mt-3 flex gap-2">
              {Array.from({ length: 7 }).map((_, index) => (
                <Droplets
                  key={index}
                  size={18}
                  fill={index < Math.round((waterRate / 100) * 7) ? 'var(--blue-main)' : 'transparent'}
                  color={index < Math.round((waterRate / 100) * 7) ? 'var(--blue-main)' : 'var(--blue-soft)'}
                  opacity={index < Math.round((waterRate / 100) * 7) ? 0.95 : 0.55}
                />
              ))}
            </div>
          </div>
          <div className="pt-5 text-right">
            <div className="text-2xl font-semibold tabular-nums">{(hydration.currentMl / 1000).toFixed(1)} L</div>
            <div className="mt-1 text-sm text-[color:var(--text-muted)]">{waterRate}%</div>
          </div>
        </div>
      </GlassPanel>

      <GlassPanel className="min-h-0 flex-1 p-4" onClick={() => navigate('status')} ariaLabel="打开今日状态">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-sm font-semibold">今日状态</div>
            <div className="mt-1 text-xs text-[color:var(--text-muted)]">恢复正常 · 训练状态佳</div>
          </div>
          <span className="rounded-full bg-emerald-100/80 px-3 py-1 text-xs font-semibold text-emerald-700">良好</span>
        </div>
        <div className="mt-4 grid grid-cols-4 gap-2">
          <Metric label="睡眠" value={`${vitals.sleepHours} h`} />
          <Metric label="心率" value={`${vitals.heartRate} bpm`} />
          <Metric label="HRV" value={`${vitals.hrv} ms`} />
          <Metric label="压力" value={`${vitals.stress} 轻度`} />
        </div>
        <div className="mt-4 rounded-[24px] bg-white/45 p-3">
          <div className="text-xs text-[color:var(--text-muted)]">恢复判断</div>
          <div className="mt-1 text-lg font-semibold">可以按计划训练</div>
        </div>
      </GlassPanel>
    </section>
  );
}

function ProgressCircle({ value }: { value: number }) {
  const circumference = 2 * Math.PI * 40;
  return (
    <div className="relative grid h-[94px] w-[94px] place-items-center">
      <svg className="absolute h-full w-full -rotate-90" viewBox="0 0 94 94">
        <circle cx="47" cy="47" r="40" fill="none" stroke="rgba(122,133,148,.15)" strokeWidth="7" />
        <circle
          cx="47"
          cy="47"
          r="40"
          fill="none"
          stroke="url(#home-progress)"
          strokeLinecap="round"
          strokeWidth="7"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - value / 100)}
        />
        <defs>
          <linearGradient id="home-progress" x1="0" x2="1">
            <stop stopColor="#8FB9FF" />
            <stop offset="1" stopColor="#235ABD" />
          </linearGradient>
        </defs>
      </svg>
      <span className="text-2xl font-semibold tabular-nums">{value}%</span>
    </div>
  );
}

function QuickItem({ icon, label, onClick }: { icon: ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="glass-panel pressable grid h-[82px] place-items-center rounded-[20px] text-[color:var(--text-main)]"
    >
      <span className="text-[color:var(--blue-main)]">{icon}</span>
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <div className="truncate text-xs text-[color:var(--text-muted)]">{label}</div>
      <div className="mt-1 truncate text-sm font-semibold">{value}</div>
    </div>
  );
}
