import type { TrainingPlanDay, UserProfile } from '../types';
import type { WaterGoal, WaterLog, WaterReminderSettings, WaterSummary } from '../types/water';
import { toDateKey } from '../utils/date';

const DAY_START_MINUTES = 8 * 60;
const DAY_END_MINUTES = 22 * 60;

function roundToNearest(value: number, step: number): number {
  return Math.round(value / step) * step;
}

function getMinutes(time: string): number {
  const [hour, minute] = time.split(':').map(Number);
  return hour * 60 + minute;
}

function getNowTime(date = new Date()): string {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function isStrengthTrainingDay(todayPlan: TrainingPlanDay): boolean {
  return todayPlan.location.includes('健身房') && todayPlan.exercises.length >= 5;
}

function isLightActivityDay(todayPlan: TrainingPlanDay): boolean {
  return todayPlan.dayType.includes('居家') || todayPlan.dayType.includes('快走') || todayPlan.dayType.includes('拉伸');
}

export function calculateWaterGoal(profile: UserProfile, todayPlan: TrainingPlanDay, date = toDateKey()): WaterGoal {
  const baseWaterMl = Math.round(profile.currentWeight * 35);
  let activityExtraMl = 0;
  let activityLabel = '休息日';

  if (isStrengthTrainingDay(todayPlan)) {
    activityExtraMl = 500;
    activityLabel = '力量训练日';
  } else if (isLightActivityDay(todayPlan)) {
    activityExtraMl = 300;
    activityLabel = '轻活动日';
  }

  const totalGoalMl = roundToNearest(baseWaterMl + activityExtraMl, 100);
  const reason = `今天是${activityLabel}。你的基础饮水目标约 ${baseWaterMl}ml，${activityExtraMl ? `活动额外增加 ${activityExtraMl}ml` : '不需要额外增加'}，今日建议饮水目标为 ${totalGoalMl}ml。分散喝，不要短时间大量灌水。`;

  return {
    date,
    baseWaterMl,
    activityExtraMl,
    totalGoalMl,
    reason,
  };
}

export function getWaterSummary(date: string, goal: WaterGoal, logs: WaterLog[]): WaterSummary {
  const todayLogs = logs.filter((log) => log.date === date);
  const consumedMl = todayLogs.reduce((sum, log) => sum + log.amountMl, 0);
  const remainingMl = Math.max(goal.totalGoalMl - consumedMl, 0);
  const completionRate = Math.min(Math.round((consumedMl / goal.totalGoalMl) * 100), 100);
  const lastDrinkAt = todayLogs[todayLogs.length - 1]?.time;
  const status: WaterSummary['status'] = completionRate >= 100 ? 'complete' : completionRate < getTimeProgressPercent() * 0.7 ? 'behind' : 'steady';

  return {
    date,
    goalMl: goal.totalGoalMl,
    consumedMl,
    remainingMl,
    completionRate,
    lastDrinkAt,
    status,
  };
}

export function getTimeProgressPercent(date = new Date()): number {
  const nowMinutes = date.getHours() * 60 + date.getMinutes();
  if (nowMinutes <= DAY_START_MINUTES) return 0;
  if (nowMinutes >= DAY_END_MINUTES) return 100;
  return Math.round(((nowMinutes - DAY_START_MINUTES) / (DAY_END_MINUTES - DAY_START_MINUTES)) * 100);
}

export function getPlannedTrainingStart(date = new Date()): string {
  const day = date.getDay();
  return day === 0 || day === 6 ? '14:30' : '17:30';
}

export function getWaterAdvice(summary: WaterSummary, goal: WaterGoal, now = new Date()): string {
  const hour = now.getHours();
  const currentTime = getNowTime(now);
  const trainingStart = getPlannedTrainingStart(now);
  const minutesToTraining = getMinutes(trainingStart) - getMinutes(currentTime);

  if (summary.completionRate >= 100) return '今日补水达标。训练恢复条件更稳了，后面小口维持即可。';
  if (hour < 12) return '上午先完成 700-900ml，不要把喝水都拖到晚上。';
  if (minutesToTraining >= 60 && minutesToTraining <= 90 && goal.activityExtraMl >= 500) return '训练前 1 小时补 300-500ml，别空着进健身房。';
  if (hour >= 18 && goal.activityExtraMl >= 500) return '训练后补 500ml 左右，配合第二餐恢复。';
  if (hour >= 22 && summary.remainingMl > 1000) return '今天还差不少，但别睡前猛灌。少量补一点就行。';
  return '组间小口喝水，不要一次灌太多。今天按进度分散补水。';
}

export function getWaterReminderMessage(
  summary: WaterSummary,
  goal: WaterGoal,
  logs: WaterLog[],
  settings: WaterReminderSettings,
  now = new Date(),
): string | undefined {
  const hour = now.getHours();
  const currentTime = getNowTime(now);
  const progressTarget = getTimeProgressPercent(now);
  const trainingStart = getPlannedTrainingStart(now);
  const minutesToTraining = getMinutes(trainingStart) - getMinutes(currentTime);
  const latest = logs[logs.length - 1];

  if (hour >= 22 && summary.remainingMl > 1000) {
    return '今天饮水差距较大，但不要睡前猛灌，少量补充即可。';
  }

  if (settings.trainingPreReminder && goal.activityExtraMl >= 500 && minutesToTraining >= 60 && minutesToTraining <= 90) {
    return '训练前补 300-500ml，训练状态会更稳定。';
  }

  if (settings.trainingPostReminder && goal.activityExtraMl >= 500 && hour >= 18 && summary.remainingMl > 0) {
    return '训练后补 500ml 左右，别只补咖啡或饮料。';
  }

  if (progressTarget > 0 && summary.completionRate < progressTarget * 0.7) {
    return '今天喝水进度偏慢，先补 300ml。';
  }

  if (latest) {
    const lastMinutes = getMinutes(latest.time);
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    if (nowMinutes - lastMinutes >= settings.intervalHours * 60) {
      return '超过 2 小时没有记录饮水，补 200-300ml。';
    }
  } else if (hour >= 10) {
    return '今天还没有记录饮水，先补 200-300ml。';
  }

  return undefined;
}

export function createWaterLog(amountMl: number, source: WaterLog['source'], date = new Date()): WaterLog {
  const dateKey = toDateKey(date);
  return {
    id: `${dateKey}-${date.getTime()}-${Math.random().toString(16).slice(2)}`,
    date: dateKey,
    time: getNowTime(date),
    amountMl,
    source,
    createdAt: date.toISOString(),
  };
}
