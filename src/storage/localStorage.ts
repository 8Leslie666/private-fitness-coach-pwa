import { defaultUserProfile } from '../data/defaultUserProfile';
import type {
  AppState,
  DailyLog,
  FrequentStore,
  MealPlan,
  ReminderSettings,
  TrainingSession,
  UserProfile,
} from '../types';
import { toDateKey } from '../utils/date';
import { defaultWaterReminderSettings } from './waterStorage';

const STORAGE_KEY = 'private-fitness-coach-state-v1';

const defaultReminders: ReminderSettings = {
  enabled: false,
  checkInTime: '09:00',
  trainingTime: '17:30',
  summaryTime: '22:30',
  lastNotified: {},
  trainingReminderEnabled: true,
  trainingReminderTime: '16:30',
  missedTrainingReminderEnabled: true,
  eveningSummaryEnabled: true,
  eveningSummaryTime: '22:30',
  twoDayBreakReminderEnabled: true,
  minimumTaskReminderEnabled: true,
};

const defaultFrequentStores: FrequentStore[] = [
  {
    id: 'store-beef-rice',
    storeName: '常点盖饭',
    platform: '美团 / 淘宝闪购',
    location: '福建福州仓山区',
    dishes: [],
    enabled: true,
  },
  {
    id: 'store-mcdonalds',
    storeName: '麦当劳',
    platform: '美团 / 淘宝闪购',
    location: '福建福州仓山区',
    dishes: [],
    enabled: true,
  },
];

function mergeProfile(parsed?: Partial<UserProfile>): UserProfile {
  return {
    ...defaultUserProfile,
    ...parsed,
    dietRestrictions: ['不吃海鲜', '不吃鸡蛋', '不太爱内脏', '全外卖为主'],
    deliveryPlatforms: parsed?.deliveryPlatforms ?? defaultUserProfile.deliveryPlatforms,
    acceptedFoods: parsed?.acceptedFoods ?? defaultUserProfile.acceptedFoods,
    dislikedFoods: parsed?.dislikedFoods ?? defaultUserProfile.dislikedFoods,
    baselineLifts: {
      ...defaultUserProfile.baselineLifts,
      ...parsed?.baselineLifts,
    },
    sleepTarget: {
      ...defaultUserProfile.sleepTarget,
      ...parsed?.sleepTarget,
    },
  };
}

export function createInitialState(): AppState {
  const now = toDateKey();
  return {
    profile: defaultUserProfile,
    dailyLogs: {},
    trainingSessions: {},
    workoutSessions: {},
    mealPlans: {},
    frequentStores: defaultFrequentStores,
    waterLogs: {},
    waterReminderSettings: defaultWaterReminderSettings,
    reminders: defaultReminders,
    createdAt: now,
    updatedAt: now,
  };
}

export function loadAppState(): AppState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialState();
    const parsed = JSON.parse(raw) as Partial<AppState>;
    return {
      ...createInitialState(),
      ...parsed,
      profile: mergeProfile(parsed.profile),
      reminders: {
        ...defaultReminders,
        ...parsed.reminders,
        lastNotified: parsed.reminders?.lastNotified ?? {},
      },
      dailyLogs: parsed.dailyLogs ?? {},
      trainingSessions: parsed.trainingSessions ?? {},
      workoutSessions: parsed.workoutSessions ?? {},
      mealPlans: parsed.mealPlans ?? {},
      frequentStores: parsed.frequentStores?.length ? parsed.frequentStores : defaultFrequentStores,
      waterLogs: parsed.waterLogs ?? {},
      waterReminderSettings: {
        ...defaultWaterReminderSettings,
        ...parsed.waterReminderSettings,
        lastNotified: parsed.waterReminderSettings?.lastNotified ?? {},
      },
      createdAt: parsed.createdAt ?? toDateKey(),
      updatedAt: parsed.updatedAt ?? toDateKey(),
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

export function updateProfile(state: AppState, profile: UserProfile): AppState {
  return {
    ...state,
    profile,
  };
}

export function upsertMealPlan(state: AppState, mealPlan: MealPlan): AppState {
  return {
    ...state,
    mealPlans: {
      ...state.mealPlans,
      [mealPlan.date]: mealPlan,
    },
  };
}

export function upsertFrequentStore(state: AppState, store: FrequentStore): AppState {
  const exists = state.frequentStores.some((item) => item.id === store.id);
  return {
    ...state,
    frequentStores: exists
      ? state.frequentStores.map((item) => (item.id === store.id ? store : item))
      : [store, ...state.frequentStores],
  };
}

export function deleteFrequentStore(state: AppState, storeId: string): AppState {
  return {
    ...state,
    frequentStores: state.frequentStores.filter((store) => store.id !== storeId),
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
