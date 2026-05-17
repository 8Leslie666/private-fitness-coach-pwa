import type { WaterLog, WaterReminderSettings } from './water';
import type { WorkoutSession } from './workout';

export type { WaterGoal, WaterLog, WaterReminderSettings, WaterSummary } from './water';
export type {
  TimerMode,
  TimerState,
  WorkoutExercise,
  WorkoutSession,
  WorkoutSet,
  WorkoutState,
  WorkoutStatus,
} from './workout';

export type DayKey =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

export type AppPage =
  | 'today'
  | 'training'
  | 'workout'
  | 'diet'
  | 'mine'
  | 'checkin'
  | 'advice'
  | 'weekly'
  | 'water'
  | 'diet-detail'
  | 'takeout-scan'
  | 'frequent-orders'
  | 'mcdonalds'
  | 'profile'
  | 'training-plan'
  | 'training-history'
  | 'training-settings'
  | 'diet-restrictions'
  | 'water-settings'
  | 'reminder-settings'
  | 'exercise-library'
  | 'takeout-library'
  | 'data-export';

export type MainLift = '深蹲' | '卧推' | '硬拉';
export type MealType = 'firstMeal' | 'preWorkout' | 'secondMeal' | 'lateSnack';

export interface UserProfile {
  nickname: string;
  avatar: string;
  height: number;
  currentWeight: number;
  targetWeight: number;
  phase: string;
  trainingGoal: string;
  trainingExperience: string;
  goal: string;
  weeklyTrainingDays: number;
  weekdayTrainingAfter: string;
  weekendTrainingAfter: string;
  sessionTimeLimit: number;
  strengthPriority: string;
  strictReminder: boolean;
  sleepTarget: {
    week1: { sleep: string; wake: string };
    week2: { sleep: string; wake: string };
    week3Plus: { sleep: string; wake: string };
  };
  dietRestrictions: string[];
  mealsPerDay: number;
  eatsBreakfast: boolean;
  mealBudget: number;
  deliveryPlatforms: string[];
  locationArea: string;
  acceptedFoods: string[];
  dislikedFoods: string[];
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
  plannedTrainingTime?: string;
  willTrain?: boolean;
  dietStatus?: '未安排' | '已安排' | '已完成' | '失控';
  bodyStatus?: '正常' | '疲劳' | '疼痛' | '没空';
  notes?: string;
}

export interface MealItem {
  id: string;
  name: string;
  storeName: string;
  mealType: MealType;
  price: number;
  caloriesEstimate: number;
  proteinEstimate: number;
  carbEstimate: number;
  fatEstimate: number;
  containsEgg: boolean;
  containsSeafood: boolean;
  containsOffal: boolean;
  dietScore: number;
  orderNote: string;
  completed: boolean;
}

export interface MealPlan {
  date: string;
  firstMeal: MealItem | null;
  preWorkout: MealItem | null;
  secondMeal: MealItem | null;
  lateSnack: MealItem | null;
  waterTarget: number;
  accepted: boolean;
  completed: boolean;
  budget: number;
  note?: string;
}

export interface FrequentStore {
  id: string;
  storeName: string;
  platform: string;
  location: string;
  dishes: MealItem[];
  enabled: boolean;
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
  trainingReminderEnabled: boolean;
  trainingReminderTime: string;
  missedTrainingReminderEnabled: boolean;
  eveningSummaryEnabled: boolean;
  eveningSummaryTime: string;
  twoDayBreakReminderEnabled: boolean;
  minimumTaskReminderEnabled: boolean;
}

export interface AppState {
  profile: UserProfile;
  dailyLogs: Record<string, DailyLog>;
  trainingSessions: Record<string, TrainingSession>;
  workoutSessions: Record<string, WorkoutSession>;
  mealPlans: Record<string, MealPlan>;
  frequentStores: FrequentStore[];
  waterLogs: Record<string, WaterLog[]>;
  waterReminderSettings: WaterReminderSettings;
  reminders: ReminderSettings;
  createdAt: string;
  updatedAt: string;
}
