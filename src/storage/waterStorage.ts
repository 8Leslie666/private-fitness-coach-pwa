import type { AppState } from '../types';
import type { WaterLog, WaterReminderSettings } from '../types/water';

export const defaultWaterReminderSettings: WaterReminderSettings = {
  enabled: false,
  reminderTimes: ['10:30', '13:30', '16:00', '19:00', '21:30'],
  intervalHours: 2,
  trainingPreReminder: true,
  trainingPostReminder: true,
  defaultCupMl: 300,
  lastNotified: {},
};

export function addWaterLog(state: AppState, log: WaterLog): AppState {
  const logs = state.waterLogs[log.date] ?? [];
  return {
    ...state,
    waterLogs: {
      ...state.waterLogs,
      [log.date]: [...logs, log],
    },
  };
}

export function undoLatestWaterLog(state: AppState, date: string): AppState {
  const logs = state.waterLogs[date] ?? [];
  return {
    ...state,
    waterLogs: {
      ...state.waterLogs,
      [date]: logs.slice(0, -1),
    },
  };
}

export function updateWaterReminderSettings(state: AppState, settings: WaterReminderSettings): AppState {
  return {
    ...state,
    waterReminderSettings: settings,
  };
}
