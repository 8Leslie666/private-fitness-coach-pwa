import { AlertTriangle, CheckCircle2, ChevronRight, Dumbbell, Footprints, Moon, Scale, Utensils } from 'lucide-react';
import { PwaInstallGuide } from '../components/PwaInstallGuide';
import { ReminderSettings } from '../components/ReminderSettings';
import { UseGuide } from '../components/UseGuide';
import { Card } from '../components/Cards/Card';
import { MetricCard } from '../components/Cards/MetricCard';
import { defaultTrainingPlan } from '../data/defaultTrainingPlan';
import { getMissingCheckInItems, generateCoachAdvice, getTodayTargets } from '../rules/coachRules';
import type { AppPage, AppState, ReminderSettings as ReminderSettingsType } from '../types';
import { getAverageWeight, getTrainingCompletionRate, hasTrainingCompleted, round } from '../utils/calculations';
import { formatChineseDate, getDayKey, getPhaseLabel, toDateKey } from '../utils/date';

interface TodayPageProps {
  state: AppState;
  onPageChange: (page: AppPage) => void;
  onReminderChange: (settings: ReminderSettingsType) => void;
}

export function TodayPage({ state, onPageChange, onReminderChange }: TodayPageProps) {
  const today = toDateKey();
  const plan = defaultTrainingPlan[getDayKey(today)];
  const todayLog = state.dailyLogs[today];
  const session = state.trainingSessions[today];
  const advice = generateCoachAdvice(state, today);
  const missingItems = getMissingCheckInItems(todayLog);
  const targets = getTodayTargets(today);
  const sevenDayAverage = getAverageWeight(state.dailyLogs, today, 7);
  const completionRate = getTrainingCompletionRate(state.trainingSessions, today);
  const completedTraining = hasTrainingCompleted(session);

  return (
    <div className="space-y-4">
      <header className="brush-panel rounded-[28px] border border-white/80 bg-white/90 p-5 shadow-card backdrop-blur">
        <div className="relative z-10">
          <div className="mb-4 h-1.5 w-24 rounded-full brush-stroke" />
          <p className="text-sm text-muted">{formatChineseDate(today)}</p>
          <div className="mt-2 flex items-start justify-between gap-3">
            <div>
              <h1 className="text-3xl font-bold tracking-normal text-ink">私人健身监督</h1>
              <p className="mt-2 text-sm text-muted">{getPhaseLabel(state.createdAt, today)}</p>
            </div>
            <div className="rounded-[22px] border border-white bg-white/90 px-3 py-2 text-right shadow-soft">
              <p className="text-xs text-muted">当前体重</p>
              <p className="text-lg font-semibold">{todayLog?.weight ?? state.profile.currentWeight}kg</p>
            </div>
          </div>
        </div>
      </header>

      <Card className="border-blue-100 bg-blue-50" title="今日教练提醒">
        <p className="text-base font-semibold leading-7 text-blue-950">{advice.coachNote}</p>
      </Card>

      <Card
        title="今日训练"
        subtitle={`${plan.weekdayName} · ${plan.location} · 预计 ${plan.estimatedMinutes} 分钟`}
        action={
          <button
            type="button"
            onClick={() => onPageChange('training')}
            className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white"
          >
            开始
          </button>
        }
      >
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-surface p-3 text-coach">
              <Dumbbell size={22} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{plan.dayType}</p>
              <p className="mt-1 text-sm leading-5 text-muted">{plan.summary}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {plan.exercises.slice(0, 3).map((exercise) => (
              <span key={exercise.name} className="rounded-full bg-surface px-3 py-1 text-sm text-ink">
                {exercise.name}
              </span>
            ))}
          </div>
          <div className={`rounded-2xl p-3 text-sm ${completedTraining ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
            {completedTraining ? '今日训练已有记录。' : '今日训练还未记录。'}
          </div>
        </div>
      </Card>

      <Card
        title="今日打卡"
        subtitle={missingItems.length ? `待补：${missingItems.join('、')}` : '体重、睡眠、饮食、步数已记录'}
        action={
          <button
            type="button"
            onClick={() => onPageChange('checkin')}
            className="flex items-center gap-1 rounded-full bg-blue-50 px-3 py-2 text-sm font-semibold text-coach"
          >
            去打卡
            <ChevronRight size={16} />
          </button>
        }
      >
        <div className="grid grid-cols-2 gap-2">
          {[
            ['体重', todayLog?.weight ? `${todayLog.weight}kg` : '未记录', Scale],
            ['睡眠', todayLog?.sleepStart && todayLog.sleepEnd ? `${todayLog.sleepStart}-${todayLog.sleepEnd}` : '未记录', Moon],
            ['饮食', todayLog?.dietScore ? `${todayLog.dietScore}/10` : '未记录', Utensils],
            ['步数', todayLog?.steps ? `${todayLog.steps}` : '未记录', Footprints],
          ].map(([label, value, Icon]) => {
            const StatusIcon = Icon as typeof Scale;
            return (
              <div key={label as string} className="flex items-center gap-2 rounded-2xl bg-surface p-3">
                <StatusIcon size={18} className="text-muted" />
                <div>
                  <p className="text-xs text-muted">{label as string}</p>
                  <p className="text-sm font-semibold">{value as string}</p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card title="风险提醒">
        {advice.riskFlags.length ? (
          <div className="space-y-2">
            {advice.riskFlags.map((flag) => (
              <div
                key={`${flag.title}-${flag.message}`}
                className={`rounded-2xl p-3 ${
                  flag.level === 'danger'
                    ? 'bg-red-50 text-red-700'
                    : flag.level === 'warning'
                      ? 'bg-amber-50 text-amber-700'
                      : 'bg-blue-50 text-coach'
                }`}
              >
                <div className="flex items-center gap-2 font-semibold">
                  <AlertTriangle size={17} />
                  {flag.title}
                </div>
                <p className="mt-1 text-sm leading-5">{flag.message}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-2xl bg-green-50 p-3 text-green-700">
            <CheckCircle2 size={18} />
            <span className="text-sm font-medium">暂未发现高风险，按计划执行。</span>
          </div>
        )}
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <MetricCard label="步数目标" value={targets.steps} hint="减脂停滞时优先加步数" />
        <MetricCard label="蛋白质目标" value={targets.protein} hint="每餐必须有蛋白质" />
        <MetricCard label="饮水目标" value={targets.water} />
        <MetricCard label="睡眠目标" value={targets.sleep} hint="第 1 周 00:30 上床" />
        <MetricCard label="7天平均体重" value={sevenDayAverage ? `${round(sevenDayAverage, 1)}kg` : '数据不足'} />
        <MetricCard label="本周训练完成率" value={`${completionRate}%`} />
      </div>

      <UseGuide />
      <PwaInstallGuide />
      <ReminderSettings settings={state.reminders} onChange={onReminderChange} />
    </div>
  );
}
