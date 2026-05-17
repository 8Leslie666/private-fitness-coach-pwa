import type { ReactNode } from 'react';
import type { AppPage } from '../../types';
import { BottomNav } from '../BottomNav/BottomNav';
import { InkBackground } from './InkBackground';

interface AppShellProps {
  page: AppPage;
  onPageChange: (page: AppPage) => void;
  hideNav?: boolean;
  children: ReactNode;
}

export function AppShell({ page, onPageChange, hideNav = false, children }: AppShellProps) {
  return (
    <div className="art-canvas min-h-screen bg-paper text-ink900">
      <InkBackground />
      {hideNav ? (
        children
      ) : (
        <>
          <main className="safe-bottom mx-auto w-full max-w-md px-4 pb-28 pt-[calc(env(safe-area-inset-top)+18px)]">
            {children}
          </main>
          <BottomNav page={page} onChange={onPageChange} />
        </>
      )}
    </div>
  );
}
