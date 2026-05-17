import { ChevronRight, Droplets, Dumbbell, Footprints, Moon, Utensils } from 'lucide-react';
import { Card } from '../components/Cards/Card';
import { defaultTrainingPlan } from '../data/defaultTrainingPlan';
import { generateCoachAdvice } from '../rules/coachRules';
import { calculateWaterGoal, createWaterLog, getWaterSummary } from '../rules/waterRules';
import type { AppPage, AppState, WaterLog } from '../types';
import { formatChineseDate, getDayKey, getPhaseLabel, toDateKey } from '../utils/date';

interface TodayPageProps {
  state: AppState;
  onPageChange: (page: AppPage) => void;
  onAddWater: (log: WaterLog) => void;
}

function formatCoreExercise(plan: (typeof defaultTrainingPlan)[keyof typeof defaultTrainingPlan]): string {
  const main = plan.exercises[0];
  const weight = main.plannedWeight ? `${main.plannedWeight}kg` : main.weightDisplay;
  return `${main.name} ${weight} ${main.plannedSets}×${main.plannedReps}`;
}

function getWorkoutStatusLabel(state: AppState, date: string): string {
  const workout = state.workoutSessions[date];
  const recorded = state.trainingSessions[date]?.exercises.some((exercise) => exercise.completed);
  if (workout?.status === 'completed' || recorded) return '已完成';
  if (workout?.status === 'in_progress') return '进行中';
  return '未开始';
}

export function TodayPage({ state, onPageChange, onAddWater }: TodayPageProps) {
  const today = toDateKey();
  const plan = defaultTrainingPlan[getDayKey(today)];
  const todayLog = state.dailyLogs[today];
  const advice = generateCoachAdvice(state, today);
  const waterLogs = state.waterLogs[today] ?? [];
  const waterGoal = calculateWaterGoal(state.profile, plan, today);
  const waterSummary = getWaterSummary(today, waterGoal, waterLogs);
  const statusLabel = getWorkoutStatusLabel(state, today);
  const interruptionRisk = advice.riskFlags.some((flag) => flag.title.includes('执行中断'));

  return (
    <div className="space-y-4">
      <header className="command-hero brush-panel rounded-[32px] border border-white/80 bg-white/95 p-5 shadow-card backdrop-blur">
        <div className="relative z-10">
          <div className="mb-5 h-1.5 w-24 rounded-full brush-stroke" />
          <p className="text-sm text-muted">{formatChineseDate(today)}｜{getPhaseLabel(state.createdAt, today)}</p>
          <h1 className="mt-3 text-3xl font-bold tracking-normal text-ink">今日指挥台</h1>
          <div className="mt-5 rounded-[26px] bg-white/80 p-4 shadow-soft">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-coach">今日主任务</p>
            <p className="mt-2 text-xl font-bold text-ink">{plan.dayType}</p>
            <p className="mt-2 text-sm leading-6 text-muted">{advice.coachNote || '完成计划，不追极限。'}</p>
          </div>
        </div>
      </header>

      <Card
        title="今日训练"
        subtitle={`${plan.weekdayName} · 预计 ${plan.estimatedMinutes} 分钟`}
        action={<span className="rounded-full bg-blue-50 px-3 py-2 text-sm font-semibold text-coach">{statusLabel}</span>}
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-blue-50 p-3 text-coach">
              <Dumbbell size={22} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-lg font-semibold text-ink">{plan.dayType}</p>
              <p className="mt-1 text-sm leading-6 text-muted">核心：{formatCoreExercise(plan)}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onPageChange('workout')}
            className="flex min-h-[58px] w-full items-center justify-center gap-2 rounded-[22px] bg-ink px-4 py-4 text-base font-semibold text-white shadow-card"
          >
            进入训练
            <ChevronRight size={18} />
          </button>
        </div>
      </Card>

      <Card
        title={interruptionRisk ? '今日最低任务：先恢复执行' : '今日最低任务'}
        subtitle={interruptionRisk ? '连续中断时，不追求完整训练，先把链条接回来。' : '没状态时只做最低版本。'}
        className={interruptionRisk ? 'border-amber-100 bg-amber-50/80' : ''}
      >
        <div className="grid grid-cols-2 gap-2">
          {[
            ['记录体重', Moon],
            ['快走 30 分钟', Footprints],
            ['晚餐少油', Utensils],
            ['睡前记录', ChevronRight],
          ].map(([label, Icon]) => {
            const ItemIcon = Icon as typeof Moon;
            return (
              <div key={label as string} className="flex items-center gap-2 rounded-2xl bg-white/70 p-3 text-sm font-medium text-ink">
                <ItemIcon size={16} className="text-coach" />
                {label as string}
              </div>
            );
          })}
        </div>
      </Card>

      <div className="grid gap-3">
        <Card title="体重 / 睡眠" subtitle={todayLog?.weight ? `${todayLog.weight}kg · ${todayLog.sleepStart ?? '--:--'}-${todayLog.sleepEnd ?? '--:--'}` : '今天还没记录'}>
          <button
            type="button"
            onClick={() => onPageChange('checkin')}
            className="min-h-[48px] w-full rounded-2xl bg-surface px-3 text-sm font-semibold text-ink"
          >
            记录体重和睡眠
          </button>
        </Card>

        <Card title="今日饮水" subtitle={`${waterSummary.consumedMl} / ${waterSummary.goalMl}ml`}>
          <div className="space-y-3">
            <div className="h-2 overflow-hidden rounded-full bg-blue-50">
              <div className="h-full rounded-full bg-coach transition-all" style={{ width: `${waterSummary.completionRate}%` }} />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onAddWater(createWaterLog(300, 'quick'))}
                className="flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-2xl bg-blue-50 px-3 font-semibold text-coach"
              >
                <Droplets size={17} />
                +300ml
              </button>
              <button
                type="button"
                onClick={() => onPageChange('water')}
                className="min-h-[48px] rounded-2xl bg-surface px-3 text-sm font-semibold text-ink"
              >
                详情
              </button>
            </div>
          </div>
        </Card>

        <Card title="今日饮食" subtitle="两餐外卖，先控蛋白和油脂。">
          <div className="space-y-2 text-sm leading-6 text-muted">
            <p><span className="font-semibold text-ink">第一餐：</span>牛肉饭或去皮鸡腿饭，饭半份，加青菜。</p>
            <p><span className="font-semibold text-ink">第二餐：</span>猪瘦肉套餐或鸡胸轻食，少酱少油。</p>
            <button
              type="button"
              onClick={() => onPageChange('advice')}
              className="mt-1 min-h-[48px] w-full rounded-2xl bg-surface px-3 text-sm font-semibold text-ink"
            >
              查看饮食建议
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
