import { ArrowLeft, CirclePlus, Play } from 'lucide-react';
import { useEffect } from 'react';
import { RestRing } from '../components/training/RestRing';
import { GlassPanel } from '../components/ui/GlassPanel';
import { PrimaryButton } from '../components/ui/PrimaryButton';
import { getNextSessionExercise, useAppStore } from '../store/appStore';
import { clamp, formatClock, remainingMs } from '../utils/time';
import { useNow } from '../utils/useNow';

export function RestPage() {
  const now = useNow();
  const workout = useAppStore((state) => state.workoutSession);
  const navigate = useAppStore((state) => state.navigate);
  const startNextSet = useAppStore((state) => state.startNextSet);
  const updateWorkoutParams = useAppStore((state) => state.updateWorkoutParams);

  useEffect(() => {
    if (!workout) navigate('training');
  }, [workout, navigate]);

  if (!workout) return null;
  const left = remainingMs(workout.restStartedAt, workout.restSeconds, now);
  const progress = 1 - left / (workout.restSeconds * 1000);
  const nextExercise = getNextSessionExercise(workout);
  const nextSet = workout.currentSet < workout.totalSets ? workout.currentSet + 1 : 1;

  return (
    <section className="page page-immersive">
      <header className="top-row">
        <button className="icon-button dark pressable" type="button" onClick={() => navigate('workout')} aria-label="返回">
          <ArrowLeft size={20} />
        </button>
        <div className="text-center text-base font-semibold">调息</div>
        <button className="text-sm font-semibold text-white/72" type="button" onClick={startNextSet}>
          跳过
        </button>
      </header>

      <div className="mt-2 text-center text-base text-white/74">第 {workout.currentSet} 组已完成</div>

      <RestRing progress={clamp(progress, 0, 1)}>
        <div className="text-center">
          <div className="text-sm text-white/54">组间休息</div>
          <div className="mt-3 text-6xl font-semibold tabular-nums">{formatClock(left)}</div>
          <div className="mt-3 text-sm text-white/52">建议 {workout.restSeconds}s</div>
        </div>
      </RestRing>

      <div className="mx-auto rounded-full border border-white/12 bg-white/5 px-6 py-2 text-sm text-white/72">
        深呼吸，放松，准备下一组
      </div>

      <GlassPanel dark className="mt-2 p-5">
        <div className="text-sm text-white/52">下一组预告</div>
        <div className="mt-3 flex items-end justify-between">
          <div>
            <div className="text-2xl font-semibold">{nextExercise?.name ?? workout.exerciseName}</div>
            <div className="mt-1 text-sm text-white/62">
              {nextExercise?.weight ? `${nextExercise.weight}kg · ` : '自重 · '}
              {nextExercise?.reps ?? workout.reps} 次
            </div>
          </div>
          <div className="rounded-full border border-white/12 bg-white/8 px-3 py-1 text-sm">第 {nextSet} 组</div>
        </div>
      </GlassPanel>

      <div className="mt-auto grid grid-cols-2 gap-3">
        <PrimaryButton variant="dark" onClick={startNextSet} className="flex items-center justify-center gap-2">
          <Play size={16} fill="currentColor" />
          提前开始
        </PrimaryButton>
        <PrimaryButton
          variant="dark"
          onClick={() => updateWorkoutParams({ restSeconds: workout.restSeconds + 30 })}
          className="flex items-center justify-center gap-2"
        >
          <CirclePlus size={17} />
          + 30 秒
        </PrimaryButton>
      </div>
      <PrimaryButton variant="secondary" onClick={startNextSet} className="!min-h-11">
        跳过休息
      </PrimaryButton>
    </section>
  );
}
