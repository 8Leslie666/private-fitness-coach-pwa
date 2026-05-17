import { defaultUserProfile } from '../data/defaultUserProfile';
import type { AppState, DailyLog, ReminderSettings, TrainingSession } from '../types';
import { toDateKey } from '../utils/date';

const STORAGE_KEY = 'private-fitness-coach-state-v1';

const defaultReminders: ReminderSettings = {
  enabled: false,
  checkInTime: '09:00',
  trainingTime: '17:30',
  summaryTime: '22:30',
  lastNotified: {},
};

export function createInitialState(): AppState {
  const now = toDateKey();
  return {
    profile: defaultUserProfile,
    dailyLogs: {},
    trainingSessions: {},
    reminders: defaultReminders,
    createdAt: now,
    updatedAt: now,
  };
}

export function loadAppState(): AppState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialState();
    const parsed = JSON.parse(raw) as AppState;
    return {
      ...createInitialState(),
      ...parsed,
      profile: {
        ...defaultUserProfile,
        ...parsed.profile,
        dietRestrictions: ['不吃海鲜', '不吃鸡蛋', '全外卖为主'],
      },
      reminders: {
        ...defaultReminders,
        ...parsed.reminders,
        lastNotified: parsed.reminders?.lastNotified ?? {},
      },
    };
  } catch {
    return createInitialState();
  }
}

export function saveAppState(state: AppState): void {
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      ...state,
      updatedAt: toDateKey(),
    }),
  );
}

export function upsertDailyLog(state: AppState, log: DailyLog): AppState {
  return {
    ...state,
    dailyLogs: {
      ...state.dailyLogs,
      [log.date]: log,
    },
  };
}

export function upsertTrainingSession(state: AppState, session: TrainingSession): AppState {
  return {
    ...state,
    trainingSessions: {
      ...state.trainingSessions,
      [session.date]: session,
    },
  };
}

export function updateReminders(state: AppState, reminders: ReminderSettings): AppState {
  return {
    ...state,
    reminders,
  };
}

export function resetAppState(): AppState {
  const initial = createInitialState();
  saveAppState(initial);
  return initial;
}

export function exportState(state: AppState): void {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `fitness-coach-data-${toDateKey()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
