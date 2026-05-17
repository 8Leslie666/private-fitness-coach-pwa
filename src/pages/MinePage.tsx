import { Bell, Database, Dumbbell, FileText, UserRound, Utensils } from 'lucide-react';
import { InkCard } from '../components/Ink/InkCard';
import { InkPage } from '../components/Ink/InkPage';
import { InkSectionEntry } from '../components/Ink/InkSectionEntry';
import { ProfileSummaryCard } from '../components/Ink/ProfileSummaryCard';
import type { AppPage, AppState, ReminderSettings, UserProfile } from '../types';
import { dateKeysBetween, getDayKey, getPhaseLabel, getWeekRange, toDateKey } from '../utils/date';
import { defaultTrainingPlan } from '../data/defaultTrainingPlan';

interface MinePageProps {
  state: AppState;
  onPageChange: (page: AppPage) => void;
  onProfileChange: (profile: UserProfile) => void;
  onReminderChange: (settings: ReminderSettings) => void;
  onExport: () => void;
  onReset: () => void;
}

function getTrainingSummary(state: AppState, today: string): string {
  const { start, end } = getWeekRange(today);
  const days = dateKeysBetween(start, end);
  const planned = days.filter((date) => defaultTrainingPlan[getDayKey(date)].exercises.length > 2);
  const done = planned.filter((date) => {
    const workout = state.workoutSessions[date];
    const recorded = state.trainingSessions[date]?.exercises.some((exercise) => exercise.completed);
    return workout?.status === 'completed' || recorded;
  });
  return `${done.length}/${planned.length}`;
}

function getRecordStreak(state: AppState, today: string): string {
  let streak = 0;
  let date = new Date(today);
  while (streak < 30) {
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    if (!state.dailyLogs[key]) break;
    streak += 1;
    date.setDate(date.getDate() - 1);
  }
  return `${streak} 天`;
}

function getDietExecution(state: AppState, today: string): string {
  const plan = state.mealPlans[today];
  if (!plan) return '未安排';
  const items = [plan.firstMeal, plan.preWorkout, plan.secondMeal, plan.lateSnack].filter(Boolean);
  const done = items.filter((item) => item?.completed).length;
  return `${done}/${items.length}`;
}

export function MinePage({ state, onPageChange }: MinePageProps) {
  const today = toDateKey();
  const entries = [
    { title: '个人资料', subtitle: '昵称、身高、体重、目标', page: 'profile' as AppPage, Icon: UserRound },
    { title: '训练偏好', subtitle: '训练时间、时长、强提醒', page: 'training-settings' as AppPage, Icon: Dumbbell },
    { title: '膳食偏好', subtitle: '预算、禁忌、外卖平台', page: 'diet-restrictions' as AppPage, Icon: Utensils },
    { title: '提醒节律', subtitle: '训练、晚间总结、断档提醒', page: 'reminder-settings' as AppPage, Icon: Bell },
    { title: '数据管理', subtitle: '导出、清空、重置默认计划', page: 'data-export' as AppPage, Icon: Database },
  ];

  return (
    <InkPage
      title="吾身"
      subtitle="个人状态总览和设置入口。复杂设置进入二级页，不在首页展开。"
      eyebrow={<><span className="seal-dot">身</span><span>{state.profile.currentWeight}kg · 目标 {state.profile.targetWeight}kg</span></>}
    >
      <ProfileSummaryCard
        profile={state.profile}
        phaseLabel={getPhaseLabel(state.createdAt, today)}
        onEdit={() => onPageChange('profile')}
      />

      <div className="grid gap-2">
        {entries.map((entry) => (
          <InkSectionEntry
            key={entry.page}
            title={entry.title}
            subtitle={entry.subtitle}
            Icon={entry.Icon}
            onClick={() => onPageChange(entry.page)}
          />
        ))}
      </div>

      <InkCard title="状态摘要" subtitle="只看本周执行，不做后台报表。">
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-smallCard bg-white/58 p-3">
            <p className="text-xs text-ink500">本周训练</p>
            <p className="mt-1 text-lg font-semibold text-ink900">{getTrainingSummary(state, today)}</p>
          </div>
          <div className="rounded-smallCard bg-white/58 p-3">
            <p className="text-xs text-ink500">连续记录</p>
            <p className="mt-1 text-lg font-semibold text-ink900">{getRecordStreak(state, today)}</p>
          </div>
          <div className="rounded-smallCard bg-white/58 p-3">
            <p className="text-xs text-ink500">饮食执行</p>
            <p className="mt-1 text-lg font-semibold text-ink900">{getDietExecution(state, today)}</p>
          </div>
        </div>
      </InkCard>

      <button
        type="button"
        onClick={() => onPageChange('weekly')}
        className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-button bg-inkwash px-4 text-sm font-semibold text-ink900"
      >
        <FileText size={16} />
        查看本周数据
      </button>
    </InkPage>
  );
}
