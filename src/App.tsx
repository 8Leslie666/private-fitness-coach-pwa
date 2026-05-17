import { useEffect, useMemo, useState } from 'react';
import { AppLayout } from './components/Layout/AppLayout';
import { AdvicePage } from './pages/AdvicePage';
import { CheckInPage } from './pages/CheckInPage';
import { TodayPage } from './pages/TodayPage';
import { TrainingPage } from './pages/TrainingPage';
import { WeeklyReportPage } from './pages/WeeklyReportPage';
import {
  exportState,
  loadAppState,
  resetAppState,
  saveAppState,
  updateReminders,
  upsertDailyLog,
  upsertTrainingSession,
} from './storage/localStorage';
import type { AppPage, DailyLog, ReminderSettings, TrainingSession } from './types';

const validPages: AppPage[] = ['today', 'checkin', 'training', 'advice', 'weekly'];

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
    switch (page) {
      case 'checkin':
        return <CheckInPage state={state} onSave={(log: DailyLog) => setState((current) => upsertDailyLog(current, log))} />;
      case 'training':
        return (
          <TrainingPage
            state={state}
            onSave={(session: TrainingSession) => setState((current) => upsertTrainingSession(current, session))}
          />
        );
      case 'advice':
        return <AdvicePage state={state} />;
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
            onReminderChange={(settings: ReminderSettings) =>
              setState((current) => updateReminders(current, settings))
            }
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
    <AppLayout page={page} onPageChange={changePage}>
      {currentPage}
    </AppLayout>
  );
}
