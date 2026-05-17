import { useEffect, useMemo, useState } from 'react';
import { AppLayout } from './components/Layout/AppLayout';
import { AdvicePage } from './pages/AdvicePage';
import { CheckInPage } from './pages/CheckInPage';
import { DietPage } from './pages/DietPage';
import { MinePage } from './pages/MinePage';
import {
  DataExportPage,
  DietDetailPage,
  DietRestrictionsPage,
  ExerciseLibraryPage,
  FrequentOrdersPage,
  McDonaldsPage,
  ProfilePage,
  ReminderSettingsPage,
  TakeoutLibraryPage,
  TakeoutScanPage,
  TrainingHistoryPage,
  TrainingPlanDetailPage,
  TrainingSettingsPage,
  WaterDetailPage,
  WaterSettingsPage,
} from './pages/SecondaryPages';
import { TodayPage } from './pages/TodayPage';
import { TrainingPage } from './pages/TrainingPage';
import { WorkoutPage } from './pages/WorkoutPage';
import { WeeklyReportPage } from './pages/WeeklyReportPage';
import {
  exportState,
  loadAppState,
  resetAppState,
  saveAppState,
  deleteFrequentStore,
  updateReminders,
  updateProfile,
  upsertFrequentStore,
  upsertDailyLog,
  upsertMealPlan,
  upsertTrainingSession,
} from './storage/localStorage';
import { addWaterLog, undoLatestWaterLog, updateWaterReminderSettings } from './storage/waterStorage';
import { upsertWorkoutSession } from './storage/workoutStorage';
import type {
  AppPage,
  DailyLog,
  FrequentStore,
  MealPlan,
  ReminderSettings,
  TrainingSession,
  UserProfile,
  WaterLog,
  WaterReminderSettings,
  WorkoutSession,
} from './types';

const validPages: AppPage[] = [
  'today',
  'training',
  'workout',
  'diet',
  'mine',
  'checkin',
  'advice',
  'weekly',
  'water',
  'diet-detail',
  'takeout-scan',
  'frequent-orders',
  'mcdonalds',
  'profile',
  'training-plan',
  'training-history',
  'training-settings',
  'diet-restrictions',
  'water-settings',
  'reminder-settings',
  'exercise-library',
  'takeout-library',
  'data-export',
];

function pageFromHash(): AppPage {
  const hash = window.location.hash.replace('#', '') as AppPage;
  return validPages.includes(hash) ? hash : 'today';
}

function setHash(page: AppPage) {
  window.location.hash = page;
}

export default function App() {
  const [state, setState] = useState(loadAppState);
  const [page, setPage] = useState<AppPage>(pageFromHash);

  useEffect(() => {
    const handler = () => setPage(pageFromHash());
    window.addEventListener('hashchange', handler);
    if (!window.location.hash) setHash('today');
    return () => window.removeEventListener('hashchange', handler);
  }, []);

  useEffect(() => {
    saveAppState(state);
  }, [state]);

  const currentPage = useMemo(() => {
    const secondaryProps = {
      state,
      onBack: () => changePage('mine'),
      onPageChange: changePage,
      onAddWater: (log: WaterLog) => setState((current) => addWaterLog(current, log)),
      onUndoWater: (date: string) => setState((current) => undoLatestWaterLog(current, date)),
      onWaterSettingsChange: (settings: WaterReminderSettings) =>
        setState((current) => updateWaterReminderSettings(current, settings)),
      onReminderChange: (settings: ReminderSettings) => setState((current) => updateReminders(current, settings)),
      onProfileChange: (profile: UserProfile) => setState((current) => updateProfile(current, profile)),
      onMealPlanChange: (mealPlan: MealPlan) => setState((current) => upsertMealPlan(current, mealPlan)),
      onFrequentStoreChange: (store: FrequentStore) => setState((current) => upsertFrequentStore(current, store)),
      onFrequentStoreDelete: (storeId: string) => setState((current) => deleteFrequentStore(current, storeId)),
      onExport: () => exportState(state),
      onReset: () => setState(resetAppState()),
    };

    switch (page) {
      case 'checkin':
        return (
          <CheckInPage
            state={state}
            onSave={(log: DailyLog) => setState((current) => upsertDailyLog(current, log))}
            onAddWater={(log: WaterLog) => setState((current) => addWaterLog(current, log))}
            onUndoWater={(date) => setState((current) => undoLatestWaterLog(current, date))}
            onWaterSettingsChange={(settings: WaterReminderSettings) =>
              setState((current) => updateWaterReminderSettings(current, settings))
            }
          />
        );
      case 'training':
        return (
          <TrainingPage
            state={state}
            onPageChange={changePage}
            onSave={(session: TrainingSession) => setState((current) => upsertTrainingSession(current, session))}
            onAddWater={(log: WaterLog) => setState((current) => addWaterLog(current, log))}
            onUndoWater={(date) => setState((current) => undoLatestWaterLog(current, date))}
          />
        );
      case 'diet':
        return (
          <DietPage
            state={state}
            onPageChange={changePage}
            onAddWater={(log: WaterLog) => setState((current) => addWaterLog(current, log))}
            onMealPlanChange={(mealPlan: MealPlan) => setState((current) => upsertMealPlan(current, mealPlan))}
            onFrequentStoreChange={(store: FrequentStore) => setState((current) => upsertFrequentStore(current, store))}
          />
        );
      case 'mine':
        return (
          <MinePage
            state={state}
            onPageChange={changePage}
            onProfileChange={(profile: UserProfile) => setState((current) => updateProfile(current, profile))}
            onReminderChange={(settings: ReminderSettings) => setState((current) => updateReminders(current, settings))}
            onExport={() => exportState(state)}
            onReset={() => setState(resetAppState())}
          />
        );
      case 'workout':
        return (
          <WorkoutPage
            state={state}
            onWorkoutChange={(session: WorkoutSession) => setState((current) => upsertWorkoutSession(current, session))}
            onSaveTraining={(session: TrainingSession) => setState((current) => upsertTrainingSession(current, session))}
            onExit={() => changePage('today')}
          />
        );
      case 'advice':
        return <AdvicePage state={state} />;
      case 'water':
        return <WaterDetailPage {...secondaryProps} onBack={() => changePage('diet')} />;
      case 'diet-detail':
        return <DietDetailPage {...secondaryProps} onBack={() => changePage('diet')} />;
      case 'takeout-scan':
        return <TakeoutScanPage {...secondaryProps} onBack={() => changePage('diet')} />;
      case 'frequent-orders':
        return <FrequentOrdersPage {...secondaryProps} onBack={() => changePage('diet')} />;
      case 'mcdonalds':
        return <McDonaldsPage {...secondaryProps} onBack={() => changePage('diet')} />;
      case 'profile':
        return <ProfilePage {...secondaryProps} />;
      case 'training-plan':
        return <TrainingPlanDetailPage {...secondaryProps} onBack={() => changePage('training')} />;
      case 'training-history':
        return <TrainingHistoryPage {...secondaryProps} onBack={() => changePage('training')} />;
      case 'training-settings':
        return <TrainingSettingsPage {...secondaryProps} onBack={() => changePage(page === 'training-settings' ? 'mine' : 'training')} />;
      case 'exercise-library':
        return <ExerciseLibraryPage {...secondaryProps} />;
      case 'diet-restrictions':
        return <DietRestrictionsPage {...secondaryProps} />;
      case 'water-settings':
        return <WaterSettingsPage {...secondaryProps} />;
      case 'reminder-settings':
        return <ReminderSettingsPage {...secondaryProps} />;
      case 'takeout-library':
        return <TakeoutLibraryPage {...secondaryProps} />;
      case 'data-export':
        return <DataExportPage {...secondaryProps} />;
      case 'weekly':
        return (
          <WeeklyReportPage
            state={state}
            onExport={() => exportState(state)}
            onReset={() => setState(resetAppState())}
          />
        );
      case 'today':
      default:
        return (
          <TodayPage
            state={state}
            onPageChange={(nextPage) => {
              setPage(nextPage);
              setHash(nextPage);
            }}
            onAddWater={(log: WaterLog) => setState((current) => addWaterLog(current, log))}
            onSaveLog={(log: DailyLog) => setState((current) => upsertDailyLog(current, log))}
            onMealPlanChange={(mealPlan: MealPlan) => setState((current) => upsertMealPlan(current, mealPlan))}
          />
        );
    }
  }, [page, state]);

  function changePage(nextPage: AppPage) {
    setPage(nextPage);
    setHash(nextPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <AppLayout page={page} onPageChange={changePage} hideNav={page === 'workout'}>
      {currentPage}
    </AppLayout>
  );
}
