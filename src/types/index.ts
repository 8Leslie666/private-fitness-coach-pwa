import type { WaterLog, WaterReminderSettings } from './water';

export type { WaterGoal, WaterLog, WaterReminderSettings, WaterSummary } from './water';

export type DayKey =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

export type AppPage = 'today' | 'checkin' | 'training' | 'advice' | 'weekly';

export type MainLift = '深蹲' | '卧推' | '硬拉';

export interface UserProfile {
  height: number;
  currentWeight: number;
  targetWeight: number;
  trainingExperience: string;
  goal: string;
  sleepTarget: {
    week1: { sleep: string; wake: string };
    week2: { sleep: string; wake: string };
    week3Plus: { sleep: string; wake: string };
  };
  dietRestrictions: string[];
  baselineLifts: Record<MainLift, string>;
}

export interface DailyLog {
  date: string;
  weight?: number;
  sleepStart?: string;
  sleepEnd?: string;
  sleepQuality?: number;
  steps?: number;
  dietScore?: number;
  hungerScore?: number;
  energyScore?: number;
  fatigueScore?: number;
  painLocation?: string;
  painScore?: number;
  notes?: string;
}

export interface ExercisePlan {
  name: string;
  plannedWeight: number | null;
  weightDisplay: string;
  plannedSets: number;
  plannedReps: string;
  isMainLift: boolean;
  notes?: string;
}

export interface TrainingPlanDay {
  dayKey: DayKey;
  weekdayName: string;
  dayType: string;
  location: string;
  summary: string;
  estimatedMinutes: number;
  stepTarget: number;
  exercises: ExercisePlan[];
  alternative: string;
}

export interface ExerciseRecord {
  name: string;
  plannedWeight: number | null;
  actualWeight?: number;
  plannedSets: number;
  actualSets?: number;
  plannedReps: string;
  actualReps?: string;
  rpe?: number;
  completed: boolean;
  pain: boolean;
  notes?: string;
}

export interface TrainingSession {
  date: string;
  dayType: string;
  exercises: ExerciseRecord[];
  notes?: string;
}

export interface RiskFlag {
  level: 'info' | 'warning' | 'danger';
  title: string;
  message: string;
}

export interface CoachAdvice {
  date: string;
  nextTrainingPlan: string;
  weightAdjustments: string[];
  dietAdvice: string;
  sleepAdvice: string;
  recoveryAdvice: string;
  stepAdvice: string;
  riskFlags: RiskFlag[];
  coachNote: string;
}

export interface WeeklyReport {
  weekStart: string;
  weekEnd: string;
  averageWeight?: number;
  weightTrend: string;
  trainingCompletionRate: number;
  squatProgress: string;
  benchProgress: string;
  deadliftProgress: string;
  averageSleep?: number;
  averageSteps?: number;
  averageDietScore?: number;
  mainProblem: string;
  nextWeekFocus: string;
  enoughData: boolean;
}

export interface ReminderSettings {
  enabled: boolean;
  checkInTime: string;
  trainingTime: string;
  summaryTime: string;
  lastNotified: Record<string, string>;
}

export interface AppState {
  profile: UserProfile;
  dailyLogs: Record<string, DailyLog>;
  trainingSessions: Record<string, TrainingSession>;
  waterLogs: Record<string, WaterLog[]>;
  waterReminderSettings: WaterReminderSettings;
  reminders: ReminderSettings;
  createdAt: string;
  updatedAt: string;
}
