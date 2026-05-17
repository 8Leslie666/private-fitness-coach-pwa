import { BookOpen, ChevronRight, Dumbbell, History, Settings } from 'lucide-react';
import { Card } from '../components/Cards/Card';
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
    <div className="page-slide space-y-4">
      <header className="pt-2">
        <div className="mb-4 h-1.5 w-20 rounded-full brush-stroke" />
        <p className="text-sm text-muted">{getPhaseLabel(state.createdAt, today)}</p>
        <h1 className="mt-2 text-2xl font-bold">训练</h1>
      </header>

      <Card
        title="今日训练"
        subtitle={`${plan.weekdayName} · ${plan.estimatedMinutes} 分钟 · ${status.label}`}
      >
        <div className="space-y-4">
          <div className="rounded-[26px] bg-surface p-4">
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
      </Card>

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
              className="flex min-h-[86px] flex-col items-start justify-between rounded-[24px] border border-white/80 bg-white/95 p-4 text-left shadow-soft active:scale-[0.99]"
            >
              <EntryIcon size={20} className="text-coach" />
              <span className="text-sm font-semibold text-ink">{label as string}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
