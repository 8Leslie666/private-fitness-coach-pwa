import type { DayKey } from '../types';

export function toDateKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseDateKey(dateKey: string): Date {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function addDays(dateKey: string, days: number): string {
  const date = parseDateKey(dateKey);
  date.setDate(date.getDate() + days);
  return toDateKey(date);
}

export function getDayKey(dateKey = toDateKey()): DayKey {
  const day = parseDateKey(dateKey).getDay();
  const map: Record<number, DayKey> = {
    0: 'sunday',
    1: 'monday',
    2: 'tuesday',
    3: 'wednesday',
    4: 'thursday',
    5: 'friday',
    6: 'saturday',
  };
  return map[day];
}

export function formatChineseDate(dateKey: string): string {
  const date = parseDateKey(dateKey);
  const weekday = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][date.getDay()];
  return `${date.getMonth() + 1}月${date.getDate()}日 ${weekday}`;
}

export function getWeekStart(dateKey: string): string {
  const date = parseDateKey(dateKey);
  const day = date.getDay() || 7;
  date.setDate(date.getDate() - day + 1);
  return toDateKey(date);
}

export function getWeekRange(dateKey: string): { start: string; end: string } {
  const start = getWeekStart(dateKey);
  return { start, end: addDays(start, 6) };
}

export function dateKeysBetween(start: string, end: string): string[] {
  const keys: string[] = [];
  let current = start;
  while (current <= end) {
    keys.push(current);
    current = addDays(current, 1);
  }
  return keys;
}

export function daysSince(startDateKey: string, endDateKey = toDateKey()): number {
  const start = parseDateKey(startDateKey).getTime();
  const end = parseDateKey(endDateKey).getTime();
  return Math.max(0, Math.floor((end - start) / 86400000));
}

export function getPhaseLabel(createdAt: string, dateKey = toDateKey()): string {
  const weekNumber = Math.floor(daysSince(createdAt, dateKey) / 7) + 1;
  return `第 ${weekNumber} 周 / 恢复减脂期`;
}
