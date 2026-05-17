import type { DailyLog, TrainingSession } from '../types';
import { addDays, dateKeysBetween, getWeekRange } from './date';

export function round(value: number, digits = 1): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

export function calculateSleepHours(start?: string, end?: string): number | undefined {
  if (!start || !end) return undefined;
  const [startHour, startMinute] = start.split(':').map(Number);
  const [endHour, endMinute] = end.split(':').map(Number);
  let startMinutes = startHour * 60 + startMinute;
  let endMinutes = endHour * 60 + endMinute;
  if (endMinutes <= startMinutes) endMinutes += 24 * 60;
  const hours = (endMinutes - startMinutes) / 60;
  return round(hours, 1);
}

export function average(values: number[]): number | undefined {
  if (!values.length) return undefined;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function getRecentLogs(logs: Record<string, DailyLog>, endDate: string, days: number): DailyLog[] {
  const start = addDays(endDate, -(days - 1));
  return dateKeysBetween(start, endDate).map((key) => logs[key]).filter(Boolean);
}

export function getAverageWeight(logs: Record<string, DailyLog>, endDate: string, days = 7): number | undefined {
  const weights = getRecentLogs(logs, endDate, days)
    .map((log) => log.weight)
    .filter((value): value is number => typeof value === 'number' && value > 0);
  return average(weights);
}

export function getWeekLogs(logs: Record<string, DailyLog>, dateKey: string): DailyLog[] {
  const { start, end } = getWeekRange(dateKey);
  return dateKeysBetween(start, end).map((key) => logs[key]).filter(Boolean);
}

export function getTrainingCompletionRate(
  sessions: Record<string, TrainingSession>,
  dateKey: string,
): number {
  const { start, end } = getWeekRange(dateKey);
  const weekSessions = dateKeysBetween(start, end)
    .map((key) => sessions[key])
    .filter(Boolean);
  if (!weekSessions.length) return 0;
  const completed = weekSessions.filter((session) => session.exercises.some((exercise) => exercise.completed)).length;
  return Math.round((completed / 4) * 100);
}

export function hasTrainingCompleted(session?: TrainingSession): boolean {
  if (!session) return false;
  return session.exercises.some((exercise) => exercise.completed);
}

export function averageSleep(logs: DailyLog[]): number | undefined {
  const values = logs
    .map((log) => calculateSleepHours(log.sleepStart, log.sleepEnd))
    .filter((value): value is number => typeof value === 'number');
  return average(values);
}

export function averageField(logs: DailyLog[], field: keyof DailyLog): number | undefined {
  const values = logs
    .map((log) => log[field])
    .filter((value): value is number => typeof value === 'number');
  return average(values);
}
