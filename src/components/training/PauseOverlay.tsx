import { Play, Square } from 'lucide-react';
import { PrimaryButton } from '../ui/PrimaryButton';

export function PauseOverlay({
  elapsed,
  onResume,
  onEnd,
}: {
  elapsed: string;
  onResume: () => void;
  onEnd: () => void;
}) {
  return (
    <div className="absolute inset-0 z-40 grid place-items-center bg-[rgba(4,9,16,.46)] px-8 backdrop-blur-xl animate-page-in">
      <div className="glass-panel glass-dark w-full rounded-[32px] p-7 text-center">
        <div className="text-sm text-white/58">已暂停</div>
        <div className="mt-3 text-5xl font-semibold tabular-nums">{elapsed}</div>
        <div className="mt-2 text-sm text-white/54">呼吸稳定后继续，不急于推进下一组。</div>
        <div className="mt-7 grid gap-3">
          <PrimaryButton variant="dark" onClick={onResume} className="flex items-center justify-center gap-2">
            <Play size={18} fill="currentColor" />
            继续训练
          </PrimaryButton>
          <PrimaryButton variant="secondary" onClick={onEnd} className="flex items-center justify-center gap-2">
            <Square size={16} />
            结束训练
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}

