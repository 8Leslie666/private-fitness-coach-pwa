import type { DailyLog } from '../types';
import { calculateSleepHours, getRecentLogs } from '../utils/calculations';

export function getSleepAdvice(logs: Record<string, DailyLog>, dateKey: string): string {
  const today = logs[dateKey];
  const sleepHours = calculateSleepHours(today?.sleepStart, today?.sleepEnd);
  const recent = getRecentLogs(logs, dateKey, 3);
  const lowSleepDays = recent.filter((log) => {
    const hours = calculateSleepHours(log.sleepStart, log.sleepEnd);
    return typeof hours === 'number' && hours < 7;
  }).length;

  if (sleepHours !== undefined && sleepHours < 6) {
    return '睡眠低于 6 小时，主项重量下调 10%，辅助动作减少 1-2 个，不做高强度燃脂。';
  }

  if (lowSleepDays >= 3) {
    return '连续 3 天睡眠不足，恢复已经影响训练。今晚按目标时间上床，明天训练强度保守处理。';
  }

  if ((today?.sleepQuality ?? 10) < 6) {
    return '睡眠质量低于 6 分，明天不要追求加重量，训练以动作稳定为主。';
  }

  return '睡眠按 7 小时以上执行；第 1 周目标是 00:30 睡、08:30 起。';
}

export function hasConsecutiveLowSleep(logs: Record<string, DailyLog>, dateKey: string): boolean {
  const recent = getRecentLogs(logs, dateKey, 3);
  return (
    recent.length >= 3 &&
    recent.every((log) => {
      const hours = calculateSleepHours(log.sleepStart, log.sleepEnd);
      return typeof hours === 'number' && hours < 7;
    })
  );
}

export function hasTwoHighFatigueDays(logs: Record<string, DailyLog>, dateKey: string): boolean {
  const recent = getRecentLogs(logs, dateKey, 2);
  return recent.length >= 2 && recent.every((log) => (log.fatigueScore ?? 0) >= 8);
}

export function getRecoveryAdvice(logs: Record<string, DailyLog>, dateKey: string): string {
  const today = logs[dateKey];

  if ((today?.painScore ?? 0) >= 7) {
    return '疼痛评分达到高风险，停止相关动作，休息并考虑就医评估。';
  }

  if ((today?.painScore ?? 0) >= 4) {
    return '疼痛评分偏高，暂停相关动作，改快走、拉伸和不诱发疼痛的训练。';
  }

  if (hasTwoHighFatigueDays(logs, dateKey)) {
    return '连续两天疲劳评分偏高，下一天安排主动恢复，不做大重量。';
  }

  if ((today?.fatigueScore ?? 0) >= 8) {
    return '疲劳偏高，今天保留步数和拉伸，力量训练不要加量。';
  }

  return '恢复状态可控。力量恢复期优先动作质量，不用急着回到旧重量。';
}
