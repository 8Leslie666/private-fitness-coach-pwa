import { defaultTrainingPlan } from '../data/defaultTrainingPlan';
import { dietTargets } from '../data/dietOptions';
import type { AppState, CoachAdvice, DailyLog, RiskFlag, WeeklyReport } from '../types';
import {
  averageField,
  averageSleep,
  calculateSleepHours,
  getAverageWeight,
  getRecentLogs,
  getTrainingCompletionRate,
  getWeekLogs,
  hasTrainingCompleted,
  round,
} from '../utils/calculations';
import { addDays, dateKeysBetween, getDayKey, getWeekRange } from '../utils/date';
import { generateDietAdvice, sanitizeDietAdvice } from './dietRules';
import { getRecoveryAdvice, getSleepAdvice, hasConsecutiveLowSleep, hasTwoHighFatigueDays } from './recoveryRules';
import { getLatestMainLiftProgress, getWeightAdjustmentAdvice } from './trainingRules';
import { getWeightTrendAdvice, hasTwoWeekWeightStall } from './weightRules';

function isMeaningfulLog(log?: DailyLog): boolean {
  if (!log) return false;
  return Boolean(log.weight || log.sleepStart || log.steps || log.dietScore || log.fatigueScore || log.notes);
}

export function getRiskFlags(state: AppState, dateKey: string): RiskFlag[] {
  const flags: RiskFlag[] = [];
  const todayLog = state.dailyLogs[dateKey];
  const todayPlan = defaultTrainingPlan[getDayKey(dateKey)];
  const todaySession = state.trainingSessions[dateKey];
  const recent3 = getRecentLogs(state.dailyLogs, dateKey, 3);

  if (!isMeaningfulLog(todayLog)) {
    flags.push({
      level: 'warning',
      title: '今日未打卡',
      message: '先完成体重、睡眠、步数和饮食记录，系统才能判断趋势。',
    });
  }

  const yesterday = state.dailyLogs[addDays(dateKey, -1)];
  const beforeYesterday = state.dailyLogs[addDays(dateKey, -2)];
  if (!isMeaningfulLog(yesterday) && !isMeaningfulLog(beforeYesterday)) {
    flags.push({
      level: 'danger',
      title: '执行中断风险',
      message: '你已经连续 2 天没有记录，先恢复打卡，不要追求完美。',
    });
  }

  if (todayPlan.exercises.length > 2 && !hasTrainingCompleted(todaySession)) {
    flags.push({
      level: 'warning',
      title: '今日训练未完成',
      message: '今天有训练任务。状态差也要改成快走和核心训练，不要直接空掉。',
    });
  }

  if (recent3.length >= 3 && recent3.every((log) => (log.dietScore ?? 10) < 6)) {
    flags.push({
      level: 'danger',
      title: '饮食失控风险',
      message: '连续 3 天饮食完成度低于 6，优先固定外卖选择。',
    });
  }

  if (hasConsecutiveLowSleep(state.dailyLogs, dateKey)) {
    flags.push({
      level: 'danger',
      title: '恢复不足风险',
      message: '连续 3 天睡眠低于 7 小时，训练重量建议下调。',
    });
  }

  if (hasTwoWeekWeightStall(state.dailyLogs, dateKey)) {
    flags.push({
      level: 'warning',
      title: '减脂停滞风险',
      message: '连续两周平均体重未下降，建议提高步数或调整热量。',
    });
  }

  if ((todayLog?.fatigueScore ?? 0) >= 8 || hasTwoHighFatigueDays(state.dailyLogs, dateKey)) {
    flags.push({
      level: 'warning',
      title: '疲劳偏高',
      message: '下一次训练以维持为主，必要时改主动恢复。',
    });
  }

  if ((todayLog?.painScore ?? 0) >= 4) {
    flags.push({
      level: (todayLog?.painScore ?? 0) >= 7 ? 'danger' : 'warning',
      title: '疼痛风险',
      message: '暂停诱发疼痛的动作，先观察恢复。',
    });
  }

  return flags;
}

export function generateCoachAdvice(state: AppState, dateKey: string): CoachAdvice {
  const tomorrow = addDays(dateKey, 1);
  const tomorrowPlan = defaultTrainingPlan[getDayKey(tomorrow)];
  const todayLog = state.dailyLogs[dateKey];
  const todaySession = state.trainingSessions[dateKey];
  const risks = getRiskFlags(state, dateKey);
  const sleepHours = calculateSleepHours(todayLog?.sleepStart, todayLog?.sleepEnd);
  const weightAdvice = getWeightAdjustmentAdvice(todaySession, todayLog);
  const dietAdvice = sanitizeDietAdvice(`${generateDietAdvice(state.dailyLogs, dateKey)} ${getWeightTrendAdvice(state.dailyLogs, dateKey)}`);
  const sleepAdvice = getSleepAdvice(state.dailyLogs, dateKey);
  const recoveryAdvice = getRecoveryAdvice(state.dailyLogs, dateKey);

  let nextTrainingPlan = `明天：${tomorrowPlan.weekdayName}，${tomorrowPlan.dayType}。预计 ${tomorrowPlan.estimatedMinutes} 分钟。`;
  if ((todayLog?.painScore ?? 0) >= 4) {
    nextTrainingPlan = `明天先按恢复日处理：快走、拉伸和不诱发疼痛的动作。原计划是 ${tomorrowPlan.dayType}。`;
  } else if (hasTwoHighFatigueDays(state.dailyLogs, dateKey)) {
    nextTrainingPlan = `明天安排主动恢复，不做大重量。原计划是 ${tomorrowPlan.dayType}。`;
  } else if (sleepHours !== undefined && sleepHours < 6) {
    nextTrainingPlan = `明天按 ${tomorrowPlan.dayType} 执行，但主项重量下调 10%，辅助动作少做 1-2 个。`;
  }

  let coachNote = '今天先把记录补齐。没有数据，就没有可靠调整。';
  if (risks.length) {
    coachNote = risks[0].message;
  } else if (todaySession && hasTrainingCompleted(todaySession)) {
    coachNote = '训练已完成，下一步看 RPE 和疼痛反馈决定是否加重量。';
  } else if (isMeaningfulLog(todayLog)) {
    coachNote = '今天记录有效。减脂期先把步数、蛋白质和睡眠稳定住。';
  }

  return {
    date: dateKey,
    nextTrainingPlan,
    weightAdjustments: weightAdvice,
    dietAdvice,
    sleepAdvice,
    recoveryAdvice,
    stepAdvice: `今日步数目标 ${defaultTrainingPlan[getDayKey(dateKey)].stepTarget}+。减脂停滞时优先增加 3000 步，而不是乱减饭。`,
    riskFlags: risks,
    coachNote,
  };
}

export function generateWeeklyReport(state: AppState, dateKey: string): WeeklyReport {
  const { start, end } = getWeekRange(dateKey);
  const weekLogs = getWeekLogs(state.dailyLogs, dateKey);
  const enoughData = weekLogs.length >= 5;
  const averageWeight = averageField(weekLogs, 'weight');
  const previousAverage = getAverageWeight(state.dailyLogs, addDays(start, -1), 7);
  const averageSleepHours = averageSleep(weekLogs);
  const averageSteps = averageField(weekLogs, 'steps');
  const averageDietScore = averageField(weekLogs, 'dietScore');
  const completionRate = getTrainingCompletionRate(state.trainingSessions, dateKey);

  let weightTrend = '本周记录不足，建议至少完成 5 天打卡后再判断趋势。';
  if (enoughData && averageWeight !== undefined) {
    if (previousAverage !== undefined) {
      const change = round(averageWeight - previousAverage, 1);
      weightTrend = change < 0 ? `较上周下降 ${Math.abs(change)}kg` : `较上周上升 ${change}kg`;
    } else {
      weightTrend = `本周平均体重 ${round(averageWeight, 1)}kg，继续积累下一周对比。`;
    }
  }

  const riskFlags = getRiskFlags(state, dateKey);
  const mainProblem = !enoughData
    ? '记录不足，趋势判断不可靠。'
    : riskFlags[0]?.message ?? '本周主要指标可控，继续稳定执行。';

  let nextWeekFocus = '下周继续保持 4 天训练框架，主项按 RPE 和疼痛反馈调整。';
  if ((averageDietScore ?? 10) < 6) nextWeekFocus = '下周优先固定外卖选择，把饮食完成度拉回 7 分以上。';
  if ((averageSleepHours ?? 8) < 7) nextWeekFocus = '下周优先把睡眠稳定到 7 小时以上，否则训练加重没有意义。';

  return {
    weekStart: start,
    weekEnd: end,
    averageWeight: averageWeight ? round(averageWeight, 1) : undefined,
    weightTrend,
    trainingCompletionRate: Math.min(100, completionRate),
    squatProgress: getLatestMainLiftProgress(state.trainingSessions, '深蹲', start, end),
    benchProgress: getLatestMainLiftProgress(state.trainingSessions, '卧推', start, end),
    deadliftProgress: getLatestMainLiftProgress(state.trainingSessions, '硬拉', start, end),
    averageSleep: averageSleepHours ? round(averageSleepHours, 1) : undefined,
    averageSteps: averageSteps ? Math.round(averageSteps) : undefined,
    averageDietScore: averageDietScore ? round(averageDietScore, 1) : undefined,
    mainProblem,
    nextWeekFocus,
    enoughData,
  };
}

export function getTodayTargets(dateKey: string) {
  const plan = defaultTrainingPlan[getDayKey(dateKey)];
  return {
    steps: `${plan.stepTarget}+`,
    protein: dietTargets.protein,
    water: dietTargets.water,
    sleep: '7小时以上',
  };
}

export function getMissingCheckInItems(log?: DailyLog): string[] {
  const missing: string[] = [];
  if (!log?.weight) missing.push('体重');
  if (!log?.sleepStart || !log?.sleepEnd) missing.push('睡眠');
  if (!log?.dietScore) missing.push('饮食');
  if (!log?.steps) missing.push('步数');
  return missing;
}

export function getRecentDateKeys(dateKey: string, days: number): string[] {
  return dateKeysBetween(addDays(dateKey, -(days - 1)), dateKey);
}
