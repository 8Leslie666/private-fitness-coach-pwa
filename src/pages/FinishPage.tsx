import { CheckCircle2, Home, RotateCcw } from 'lucide-react';
import { GlassPanel } from '../components/ui/GlassPanel';
import { PrimaryButton } from '../components/ui/PrimaryButton';
import { useAppStore } from '../store/appStore';

export function FinishPage() {
  const workout = useAppStore((state) => state.workoutSession);
  const navigate = useAppStore((state) => state.navigate);

  return (
    <section className="page page-immersive">
      <div className="grid flex-1 place-items-center">
        <div className="w-full text-center">
          <div className="mx-auto grid h-24 w-24 place-items-center rounded-full border border-white/18 bg-white/10 text-[color:var(--blue-soft)] shadow-[0_0_42px_rgba(78,145,255,.25)]">
            <CheckCircle2 size={46} />
          </div>
          <h1 className="mt-6 text-4xl font-semibold">收势</h1>
          <div className="mt-3 text-sm text-white/58">本次行练已完成，保持恢复节律。</div>

          <GlassPanel dark className="mt-8 p-5 text-left">
            <div className="text-sm text-white/52">训练摘要</div>
            <div className="mt-4 grid grid-cols-3 gap-3 text-center">
              <Summary label="动作" value={workout?.exerciseName ?? '深蹲'} />
              <Summary label="完成" value={workout?.completionState === 'incomplete' ? '未完成' : '已完成'} />
              <Summary label="反馈" value={workout?.lastFeedback ?? '合适'} />
            </div>
            <div className="mt-4 rounded-3xl bg-white/8 p-4">
              <div className="text-xs text-white/48">下次建议</div>
              <div className="mt-2 text-sm leading-6 text-white/78">
                {workout?.suggestion ?? '本次训练完成稳定，平均 RPE 在目标范围内。下次同主项可以小幅加重。'}
              </div>
            </div>
          </GlassPanel>
        </div>
      </div>
      <div className="grid gap-3">
        <PrimaryButton onClick={() => navigate('cultivation')} className="flex items-center justify-center gap-2">
          <Home size={17} />
          回到修炼
        </PrimaryButton>
        <PrimaryButton variant="dark" onClick={() => navigate('training')} className="flex items-center justify-center gap-2">
          <RotateCcw size={17} />
          查看计划
        </PrimaryButton>
      </div>
    </section>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/8 p-3">
      <div className="text-xs text-white/48">{label}</div>
      <div className="mt-1 truncate text-sm font-semibold text-white">{value}</div>
    </div>
  );
}
