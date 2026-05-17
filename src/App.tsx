import { AppShell } from './components/layout/AppShell';
import { CultivationPage } from './pages/CultivationPage';
import { DietPage } from './pages/DietPage';
import { FeedbackPage } from './pages/FeedbackPage';
import { FinishPage } from './pages/FinishPage';
import { HydrationPage } from './pages/HydrationPage';
import { ProfilePage } from './pages/ProfilePage';
import { ProgressPage } from './pages/ProgressPage';
import { RestPage } from './pages/RestPage';
import { StatusPage } from './pages/StatusPage';
import { TrainingPlanPage } from './pages/TrainingPlanPage';
import { WorkoutPage } from './pages/WorkoutPage';
import { useAppStore } from './store/appStore';

export default function App() {
  const screen = useAppStore((state) => state.screen);

  return (
    <AppShell>
      {screen === 'cultivation' ? <CultivationPage /> : null}
      {screen === 'training' ? <TrainingPlanPage /> : null}
      {screen === 'diet' ? <DietPage /> : null}
      {screen === 'progress' ? <ProgressPage /> : null}
      {screen === 'profile' ? <ProfilePage /> : null}
      {screen === 'hydration' ? <HydrationPage /> : null}
      {screen === 'status' ? <StatusPage /> : null}
      {screen === 'workout' ? <WorkoutPage /> : null}
      {screen === 'rest' ? <RestPage /> : null}
      {screen === 'feedback' ? <FeedbackPage /> : null}
      {screen === 'finish' ? <FinishPage /> : null}
    </AppShell>
  );
}

