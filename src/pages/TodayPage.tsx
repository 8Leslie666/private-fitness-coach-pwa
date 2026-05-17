import { ChevronRight, Clock3, Dumbbell, NotebookPen, ShieldAlert, Utensils } from 'lucide-react';
import { useMemo, useState } from 'react';
import { InkButton } from '../components/Ink/InkButton';
import { InkCard } from '../components/Ink/InkCard';
import { InkDrawer } from '../components/Ink/InkDrawer';
import { StatusBadge } from '../components/Ink/StatusBadge';
import { defaultTrainingPlan } from '../data/defaultTrainingPlan';
import { generateCoachAdvice } from '../rules/coachRules';
import { createDefaultMealPlan } from '../rules/mealRules';
import { calculateWaterGoal } from '../rules/waterRules';
import type { AppPage, AppState, DailyLog, MealPlan, WaterLog } from '../types';
import { dateKeysBetween, formatChineseDate, getDayKey, getPhaseLabel, getWeekRange, toDateKey } from '../utils/date';

interface TodayPageProps {
  state: AppState;
  onPageChange: (page: AppPage) => void;
  onAddWater: (log: WaterLog) => void;
  onSaveLog: (log: DailyLog) => void;
  onMealPlanChange: (mealPlan: MealPlan) => void;
}

type DrawerType = 'body' | 'time' | 'diet' | null;

function formatCoreExercise(plan: (typeof defaultTrainingPlan)[keyof typeof defaultTrainingPlan]): string {
  const main = plan.exercises[0];
  const weight = main.plannedWeight ? `${main.plannedWeight}kg` : main.weightDisplay;
  return `${main.name} ${weight} × ${main.plannedSets}×${main.plannedReps}`;
}

function getWorkoutStatusLabel(state: AppState, date: string): string {
  const workout = state.workoutSessions[date];
  const recorded = state.trainingSessions[date]?.exercises.some((exercise) => exercise.completed);
  if (workout?.status === 'completed' || recorded) return '已完成';
  if (workout?.status === 'in_progress') return '进行中';
  return '未开始';
}

function weekCompletionRate(state: AppState, today: string): number {
  const { start, end } = getWeekRange(today);
  const weekDays = dateKeysBetween(start, end);
  const trainingDays = weekDays.filter((date) => defaultTrainingPlan[getDayKey(date)].exercises.length > 2);
  const completed = trainingDays.filter((date) => {
    const workout = state.workoutSessions[date];
    const recorded = state.trainingSessions[date]?.exercises.some((exercise) => exercise.completed);
    return workout?.status === 'completed' || recorded;
  }).length;
  return trainingDays.length ? Math.round((completed / trainingDays.length) * 100) : 0;
}

export function TodayPage({ state, onPageChange, onAddWater, onSaveLog, onMealPlanChange }: TodayPageProps) {
  const today = toDateKey();
  const plan = defaultTrainingPlan[getDayKey(today)];
  const todayLog = state.dailyLogs[today] ?? { date: today };
  const advice = generateCoachAdvice(state, today);
  const waterGoal = calculateWaterGoal(state.profile, plan, today);
  const mealPlan = state.mealPlans[today] ?? createDefaultMealPlan(today, state.profile, waterGoal.totalGoalMl);
  const statusLabel = getWorkoutStatusLabel(state, today);
  const progress = useMemo(() => weekCompletionRate(state, today), [state, today]);
  const [drawer, setDrawer] = useState<DrawerType>(null);
  const [trainingTime, setTrainingTime] = useState(todayLog.plannedTrainingTime ?? state.profile.weekdayTrainingAfter);
  const [notes, setNotes] = useState(todayLog.notes ?? '');

  function saveLog(patch: Partial<DailyLog>) {
    onSaveLog({ ...todayLog, date: today, ...patch });
  }

  function generateMeal() {
    const next = createDefaultMealPlan(today, state.profile, waterGoal.totalGoalMl);
    onMealPlanChange(next);
    onPageChange('diet');
  }

  return (
    <div className="page-slide space-y-4">
      <header className="ink-card relative min-h-[300px] rounded-pageCard p-5">
        <div className="relative z-10 flex h-full flex-col justify-between">
          <div>
            <div className="mb-5 flex items-center justify-between">
              <span className="seal-dot">修</span>
              <p className="text-sm text-ink500">{formatChineseDate(today)}</p>
            </div>
            <p className="text-sm text-ink500">早安，{state.profile.nickname}</p>
            <h1 className="ink-title mt-2 text-[38px] font-semibold leading-tight text-ink900">今日修行</h1>
            <p className="mt-3 text-sm leading-6 text-ink500">今日之功，不在疾，在恒。</p>
          </div>
          <div className="mt-6 rounded-card bg-white/62 p-4 shadow-soft">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold text-jade">{getPhaseLabel(state.createdAt, today)}</p>
              <StatusBadge tone={statusLabel === '已完成' ? 'good' : statusLabel === '进行中' ? 'warn' : 'neutral'}>{statusLabel}</StatusBadge>
            </div>
            <h2 className="mt-3 text-xl font-semibold leading-7 text-ink900">{plan.dayType}</h2>
            <p className="mt-1 text-sm text-ink500">{formatCoreExercise(plan)} · 预计 {plan.estimatedMinutes} 分钟</p>
            <InkButton onClick={() => onPageChange('workout')} className="mt-4 flex w-full items-center justify-center gap-2 text-base">
              进入训练
              <ChevronRight size={18} />
            </InkButton>
          </div>
        </div>
      </header>

      <InkCard
        title="今日训练"
        subtitle={`${plan.location} · 预计 ${plan.estimatedMinutes} 分钟 · ${statusLabel}`}
        action={<Dumbbell size={20} className="text-jade" />}
      >
        <p className="text-sm leading-6 text-ink500">{advice.coachNote || '完成计划，不追极限。'}</p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <InkButton variant="secondary" onClick={() => setDrawer('body')} className="flex items-center justify-center gap-2">
            <ShieldAlert size={16} />
            今天很累
          </InkButton>
          <InkButton variant="secondary" onClick={() => saveLog({ willTrain: false, bodyStatus: '没空' })} className="flex items-center justify-center gap-2">
            <NotebookPen size={16} />
            今天没空
          </InkButton>
          <InkButton variant="secondary" onClick={() => setDrawer('time')} className="flex items-center justify-center gap-2">
            <Clock3 size={16} />
            改时间
          </InkButton>
          <InkButton variant="secondary" onClick={generateMeal} className="flex items-center justify-center gap-2">
            <Utensils size={16} />
            生成膳食
          </InkButton>
        </div>
      </InkCard>

      <div className="grid grid-cols-2 gap-3">
        <InkCard title="今日膳食" subtitle={mealPlan.completed ? '已完成' : `${state.profile.mealsPerDay} 餐制 · ${state.profile.mealBudget} 元内`}>
          <p className="min-h-[44px] text-sm leading-5 text-ink500">
            {mealPlan.firstMeal?.name ?? '第一餐未安排'}；{mealPlan.secondMeal?.name ?? '第二餐未安排'}
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <InkButton variant="ghost" onClick={() => onPageChange('diet')} className="w-full">
              编辑膳食
            </InkButton>
            <InkButton
              variant="secondary"
              onClick={() => {
                onMealPlanChange({
                  ...mealPlan,
                  accepted: true,
                  completed: true,
                  firstMeal: mealPlan.firstMeal ? { ...mealPlan.firstMeal, completed: true } : mealPlan.firstMeal,
                  preWorkout: mealPlan.preWorkout ? { ...mealPlan.preWorkout, completed: true } : mealPlan.preWorkout,
                  secondMeal: mealPlan.secondMeal ? { ...mealPlan.secondMeal, completed: true } : mealPlan.secondMeal,
                  lateSnack: mealPlan.lateSnack ? { ...mealPlan.lateSnack, completed: true } : mealPlan.lateSnack,
                });
                saveLog({ dietStatus: '已完成', dietScore: 8 });
              }}
              className="w-full"
            >
              已完成
            </InkButton>
          </div>
        </InkCard>

        <InkCard title="今日风险" subtitle={advice.riskFlags[0]?.title ?? '暂无高风险'}>
          <p className="min-h-[44px] text-sm leading-5 text-ink500">
            {advice.riskFlags[0]?.message ?? '继续记录睡眠、饮食和训练，不做额外加码。'}
          </p>
          <InkButton variant="ghost" onClick={() => setDrawer('body')} className="mt-3 w-full">
            修改状态
          </InkButton>
        </InkCard>
      </div>

      <InkCard title="本周进展" subtitle={`训练完成率 ${progress}%`}>
        <div className="h-2 overflow-hidden rounded-full bg-inkwash">
          <div className="h-full rounded-full bg-jade" style={{ width: `${progress}%` }} />
        </div>
        <InkButton variant="ghost" onClick={() => onPageChange('weekly')} className="mt-3 w-full">
          查看数据
        </InkButton>
      </InkCard>

      <InkDrawer title="今日身体状态" open={drawer === 'body'} onClose={() => setDrawer(null)}>
        <div className="grid gap-3">
          <div className="grid grid-cols-2 gap-2">
            {[
              ['正常', 4],
              ['疲劳', 8],
              ['疼痛', todayLog.fatigueScore ?? 6],
              ['没空', todayLog.fatigueScore ?? 5],
            ].map(([label, fatigue]) => (
              <button
                key={label}
                type="button"
                onClick={() => saveLog({ bodyStatus: label as DailyLog['bodyStatus'], fatigueScore: Number(fatigue), willTrain: label !== '没空' })}
                className="min-h-[54px] rounded-2xl bg-white/80 font-semibold text-ink shadow-soft"
              >
                {label}
              </button>
            ))}
          </div>
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            className="min-h-28 rounded-2xl border border-line bg-white/80 p-3 outline-none"
            placeholder="今日备注，例如腰有点紧、晚上有事、训练改短版"
          />
          <InkButton onClick={() => { saveLog({ notes }); setDrawer(null); }} className="w-full">保存状态</InkButton>
        </div>
      </InkDrawer>

      <InkDrawer title="修改今日训练时间" open={drawer === 'time'} onClose={() => setDrawer(null)}>
        <div className="grid gap-3">
          <input
            type="time"
            value={trainingTime}
            onChange={(event) => setTrainingTime(event.target.value)}
            className="h-14 rounded-2xl border border-line bg-white/80 px-3 text-lg outline-none"
          />
          <InkButton onClick={() => { saveLog({ plannedTrainingTime: trainingTime, willTrain: true }); setDrawer(null); }} className="w-full">
            保存训练时间
          </InkButton>
        </div>
      </InkDrawer>
    </div>
  );
}
