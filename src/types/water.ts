export interface WaterGoal {
  date: string;
  baseWaterMl: number;
  activityExtraMl: number;
  totalGoalMl: number;
  reason: string;
}

export interface WaterLog {
  id: string;
  date: string;
  time: string;
  amountMl: number;
  source: 'quick' | 'custom' | 'reminder';
  createdAt: string;
}

export interface WaterReminderSettings {
  enabled: boolean;
  reminderTimes: string[];
  intervalHours: number;
  trainingPreReminder: boolean;
  trainingPostReminder: boolean;
  defaultCupMl: number;
  lastNotified: Record<string, string>;
}

export interface WaterSummary {
  date: string;
  goalMl: number;
  consumedMl: number;
  remainingMl: number;
  completionRate: number;
  lastDrinkAt?: string;
  status: 'behind' | 'steady' | 'complete';
}
