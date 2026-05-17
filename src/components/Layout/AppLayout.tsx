import type { ReactNode } from 'react';
import type { AppPage } from '../../types';
import { AppShell } from '../Ink/AppShell';

interface AppLayoutProps {
  page: AppPage;
  onPageChange: (page: AppPage) => void;
  hideNav?: boolean;
  children: ReactNode;
}

export function AppLayout({ page, onPageChange, hideNav = false, children }: AppLayoutProps) {
  return <AppShell page={page} onPageChange={onPageChange} hideNav={hideNav}>{children}</AppShell>;
}
