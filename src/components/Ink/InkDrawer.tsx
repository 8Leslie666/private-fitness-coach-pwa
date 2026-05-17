import { ChevronDown } from 'lucide-react';
import type { ReactNode } from 'react';

interface InkDrawerProps {
  title: string;
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

export function InkDrawer({ title, open, onClose, children }: InkDrawerProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-ink/25 backdrop-blur-sm" onClick={onClose}>
      <section
        className="sheet-slide fixed inset-x-0 bottom-0 mx-auto max-h-[76dvh] max-w-md overflow-y-auto rounded-t-[32px] border border-white/70 bg-paper p-5 shadow-ink"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-ink/15" />
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-ink">{title}</h2>
          <button type="button" onClick={onClose} className="rounded-full bg-white/80 p-2 text-ink shadow-soft">
            <ChevronDown size={18} />
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}
