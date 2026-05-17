import { BookOpen, ChevronRight, Dumbbell, History, Settings } from 'lucide-react';
import { InkCard } from '../components/Ink/InkCard';
import { InkPage } from '../components/Ink/InkPage';
import { InkTimeline } from '../components/Ink/InkTimeline';
import { StatusBadge } from '../components/Ink/StatusBadge';
import { defaultTrainingPlan } from '../data/defaultTrainingPlan';
import type { AppPage, AppState, TrainingSession, WaterLog } from '../types';
import { getDayKey, getPhaseLabel, toDateKey } from '../utils/date';

interface TrainingPageProps {
  state: AppState;
  onPageChange: (page: AppPage) => void;
  onSave?: (session: TrainingSession) => void;
  onAddWater?: (log: WaterLog) => void;
  onUndoWater?: (date: string) => void;
}

function trainingStatus(state: AppState, date: string): { label: string; action: string } {
  const workout = state.workoutSessions[date];
  if (workout?.status === 'completed') return { label: '已完成', action: '查看总结' };
  if (workout?.status === 'in_progress') return { label: '进行中', action: '继续训练' };
  return { label: '未开始', action: '开始训练' };
}

export function TrainingPage({ state, onPageChange }: TrainingPageProps) {
  const today = toDateKey();
  const plan = defaultTrainingPlan[getDayKey(today)];
  const status = trainingStatus(state, today);
  const main = plan.exercises[0];

  return (
    <InkPage
      title="行练"
      subtitle="从起势到收势，一屏一件事。训练中只看当前动作、重量、次数和计时。"
      eyebrow={<><span className="seal-dot">练</span><span>{getPhaseLabel(state.createdAt, today)}</span></>}
    >

      <InkCard
        title="今日行练"
        subtitle={`${plan.weekdayName} · ${plan.estimatedMinutes} 分钟`}
        action={<StatusBadge tone={status.label === '已完成' ? 'good' : status.label === '进行中' ? 'warn' : 'neutral'}>{status.label}</StatusBadge>}
      >
        <div className="space-y-4">
          <div className="rounded-[26px] bg-white/68 p-4 shadow-soft">
            <p className="text-sm text-muted">今日目标</p>
            <p className="mt-2 text-xl font-bold text-ink">{plan.dayType}</p>
            <p className="mt-2 text-sm leading-6 text-muted">
              核心：{main.name} {main.plannedWeight ? `${main.plannedWeight}kg` : main.weightDisplay} {main.plannedSets}×{main.plannedReps}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onPageChange('workout')}
            className="flex min-h-[58px] w-full items-center justify-center gap-2 rounded-[22px] bg-ink px-4 text-base font-semibold text-white shadow-card active:scale-[0.99]"
          >
            {status.action}
            <ChevronRight size={18} />
          </button>
        </div>
      </InkCard>

      <InkCard title="行练流程" subtitle="进入训练后隐藏底部导航。">
        <InkTimeline
          activeIndex={status.label === '未开始' ? 0 : status.label === '进行中' ? 2 : 4}
          items={[
            { title: '起势', detail: '确认身体状态和装备。', minutes: '1 分钟' },
            { title: '行练次第', detail: '查看今日流程。', minutes: '1 分钟' },
            { title: '正式行练', detail: '当前动作、重量、次数、组数。', minutes: '主流程' },
            { title: '调息', detail: '组间休息倒计时。', minutes: '组间' },
            { title: '收势', detail: '保存记录和复盘。', minutes: '3 分钟' },
          ]}
        />
      </InkCard>

      <div className="grid grid-cols-2 gap-3">
        {[
          ['今日计划详情', 'training-plan', BookOpen],
          ['历史训练', 'training-history', History],
          ['动作库', 'exercise-library', Dumbbell],
          ['训练设置', 'training-settings', Settings],
        ].map(([label, page, Icon]) => {
          const EntryIcon = Icon as typeof BookOpen;
          return (
            <button
              key={label as string}
              type="button"
              onClick={() => onPageChange(page as AppPage)}
              className="flex min-h-[86px] flex-col items-start justify-between rounded-[24px] border border-white/80 bg-white/82 p-4 text-left shadow-soft active:scale-[0.99]"
            >
              <EntryIcon size={20} className="text-mountain" />
              <span className="text-sm font-semibold text-ink">{label as string}</span>
            </button>
          );
        })}
      </div>
    </InkPage>
  );
}
