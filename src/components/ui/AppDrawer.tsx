import type { PropsWithChildren } from 'react';
import { X } from 'lucide-react';

type AppDrawerProps = PropsWithChildren<{
  title: string;
  subtitle?: string;
  onClose: () => void;
}>;

export function AppDrawer({ title, subtitle, onClose, children }: AppDrawerProps) {
  return (
    <>
      <button className="drawer-backdrop" aria-label="关闭抽屉遮罩" type="button" onClick={onClose} />
      <section className="drawer-panel" aria-modal="true" role="dialog">
        <div className="flex items-start justify-between px-6 pb-2 pt-5">
          <div>
            <div className="text-lg font-bold text-[color:var(--text-main)]">{title}</div>
            {subtitle ? <div className="mt-1 text-xs text-[color:var(--text-muted)]">{subtitle}</div> : null}
          </div>
          <button className="mini-round" type="button" onClick={onClose} aria-label="关闭">
            <X size={17} />
          </button>
        </div>
        {children}
      </section>
    </>
  );
}

