import type { DailyLog } from '../types';
import { addDays } from '../utils/date';
import { getAverageWeight, getRecentLogs, round } from '../utils/calculations';

export function getWeightTrendAdvice(logs: Record<string, DailyLog>, dateKey: string): string {
  const recent7 = getAverageWeight(logs, dateKey, 7);
  const previous7 = getAverageWeight(logs, addDays(dateKey, -7), 7);
  const recordedDays = getRecentLogs(logs, dateKey, 7).filter((log) => typeof log.weight === 'number').length;

  if (recordedDays < 7 || recent7 === undefined) {
    return '体重数据不足 7 天，暂不判断趋势。继续每天起床后记录。';
  }

  if (previous7 === undefined) {
    return `当前 7 天平均体重 ${round(recent7, 1)}kg，先积累下一周数据再判断下降速度。`;
  }

  const change = round(recent7 - previous7, 1);
  if (change <= -0.3 && change >= -0.7) {
    return `7 天平均体重下降 ${Math.abs(change)}kg，速度正常，热量和步数先不调整。`;
  }
  if (change < -1) {
    return `7 天平均体重下降 ${Math.abs(change)}kg，速度过快，可能吃太少。训练日前后增加 100-200 kcal 碳水。`;
  }
  if (change >= -0.1) {
    return '体重趋势停滞，优先每天增加 3000 步；如果连续两周不下降，再减少 150-200 kcal。';
  }

  return `7 天平均体重下降 ${Math.abs(change)}kg，继续观察，不做大调整。`;
}

export function hasTwoWeekWeightStall(logs: Record<string, DailyLog>, dateKey: string): boolean {
  const recent7 = getAverageWeight(logs, dateKey, 7);
  const previous7 = getAverageWeight(logs, addDays(dateKey, -7), 7);
  const recentLogs = getRecentLogs(logs, dateKey, 14).filter((log) => typeof log.weight === 'number');
  if (recentLogs.length < 12 || recent7 === undefined || previous7 === undefined) return false;
  return recent7 >= previous7 - 0.1;
}
