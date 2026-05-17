import type { ReactNode } from 'react';
import { BottomNav } from '../BottomNav/BottomNav';
import type { AppPage } from '../../types';
import { InkBackground } from '../Ink/InkBackground';

interface AppLayoutProps {
  page: AppPage;
  onPageChange: (page: AppPage) => void;
  hideNav?: boolean;
  children: ReactNode;
}

export function AppLayout({ page, onPageChange, hideNav = false, children }: AppLayoutProps) {
  return (
    <div className="art-canvas min-h-screen bg-surface text-ink">
      <InkBackground />
      {hideNav ? (
        children
      ) : (
        <>
          <main className="safe-bottom mx-auto w-full max-w-md px-4 pb-28 pt-4 sm:pt-6">{children}</main>
          <BottomNav page={page} onChange={onPageChange} />
        </>
      )}
    </div>
  );
}
