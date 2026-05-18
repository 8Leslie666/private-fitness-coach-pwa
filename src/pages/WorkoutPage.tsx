import { ArrowLeft, Check, MoreHorizontal, Pause, SlidersHorizontal, Square, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { PauseOverlay } from '../components/training/PauseOverlay';
import { TrainingLightArc } from '../components/training/TrainingLightArc';
import { ActionMenu } from '../components/ui/ActionMenu';
import { GlassPanel } from '../components/ui/GlassPanel';
import { useAppStore } from '../store/appStore';
import { formatClock, formatDuration, sessionElapsedMs } from '../utils/time';
import { useNow } from '../utils/useNow';

export function WorkoutPage() {
  const now = useNow();
  const workout = useAppStore((state) => state.workoutSession);
  const navigate = useAppStore((state) => state.navigate);
  const openDrawer = useAppStore((state) => state.openDrawer);
  const pauseWorkout = useAppStore((state) => state.pauseWorkout);
  const resumeWorkout = useAppStore((state) => state.resumeWorkout);
  const completeSet = useAppStore((state) => state.completeSet);
  const finishWorkout = useAppStore((state) => state.finishWorkout);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!workout) navigate('training');
  }, [workout, navigate]);

  if (!workout) return null;

  const pausedElapsed = workout.pausedAt ? formatClock(now - workout.pausedAt) : '00:00';
  const totalElapsed = formatDuration(
    sessionElapsedMs(workout.sessionStartedAt, workout.pausedAccumulatedMs, workout.pausedAt, now),
  );
  const setElapsed =
    workout.status === 'paused' ? '00:00' : formatClock(now - workout.setStartedAt - workout.setPausedAccumulatedMs);

  return (
    <section className="page page-immersive">
      <TrainingLightArc />
      <header className="top-row workout-header-layer">
        <button className="icon-button dark pressable" type="button" onClick={() => navigate('training')} aria-label="返回">
          <ArrowLeft size={20} />
        </button>
        <div className="text-center text-base font-semibold">正式行练</div>
        <div className="workout-menu-anchor">
          <button
            className="icon-button dark pressable workout-more-button"
            type="button"
            aria-label="更多"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <MoreHorizontal size={20} />
          </button>
          {menuOpen ? (
            <ActionMenu
              className="dark-menu"
              items={[
                {
                  label: '调整参数',
                  icon: <SlidersHorizontal size={15} />,
                  onClick: () => {
                    openDrawer({ kind: 'workout-params' });
                    setMenuOpen(false);
                  },
                },
                {
                  label: '暂停训练',
                  icon: <Pause size={15} />,
                  onClick: () => {
                    pauseWorkout();
                    setMenuOpen(false);
                  },
                },
                {
                  label: '结束训练',
                  icon: <Square size={15} />,
                  danger: true,
                  onClick: () => {
                    finishWorkout();
                    setMenuOpen(false);
                  },
                },
                {
                  label: '回到计划',
                  icon: <X size={15} />,
                  onClick: () => {
                    navigate('training');
                    setMenuOpen(false);
                  },
                },
              ]}
            />
          ) : null}
        </div>
      </header>

      <div className="relative z-10 mt-3 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">{workout.exerciseName}</h1>
          <div className="mt-2 text-sm text-white/62">
            {workout.sectionTitle} · 动作 {workout.currentExerciseIndex + 1} / {workout.exerciseQueue.length} · 第 {workout.currentSet} 组 / 共 {workout.totalSets} 组
          </div>
        </div>
        <div className="rounded-full border border-white/12 bg-white/8 px-3 py-1 text-sm text-white/78">RPE {workout.rpe}</div>
      </div>

      <div className="relative z-10 grid flex-1 place-items-center pt-28">
        <button
          type="button"
          className="glass-panel glass-dark pressable grid h-[194px] w-[242px] place-items-center rounded-[34px] text-center"
          onClick={() => openDrawer({ kind: 'workout-params' })}
        >
          <div>
            <div className="text-sm text-white/62">本组重量</div>
            <div className="mt-2 flex items-end justify-center gap-2">
              {workout.weight > 0 ? (
                <>
                  <span className="text-[82px] font-semibold leading-none tabular-nums">{workout.weight}</span>
                  <span className="mb-3 text-2xl">kg</span>
                </>
              ) : (
                <span className="text-[58px] font-semibold leading-none">自重</span>
              )}
            </div>
            <div className="mt-1 text-3xl">× {workout.reps} 次</div>
          </div>
        </button>
      </div>

      <div className="relative z-10 workout-metrics">
        <TrainingMetric label="建议休息" value={`${workout.restSeconds}s`} />
        <TrainingMetric label="总时长" value={totalElapsed} />
        <TrainingMetric label="本组" value={setElapsed} />
      </div>

      <div className="relative z-10 mt-4 workout-controls">
        <button
          type="button"
          onClick={pauseWorkout}
          className="workout-side-control pressable"
        >
          <Pause size={24} fill="currentColor" />
          <span className="text-xs">暂停</span>
        </button>
        <button
          type="button"
          onClick={completeSet}
          className="workout-complete-control pressable"
        >
          <Check size={28} />
          <span className="text-sm font-semibold">完成本组</span>
        </button>
        <button
          type="button"
          onClick={() => openDrawer({ kind: 'workout-params' })}
          className="workout-side-control pressable"
        >
          <SlidersHorizontal size={23} />
          <span className="text-xs">调整</span>
        </button>
      </div>

      <div className="relative z-10 mx-auto h-1 w-28 rounded-full bg-white/28" />
      {workout.status === 'paused' ? <PauseOverlay elapsed={pausedElapsed} onResume={resumeWorkout} onEnd={finishWorkout} /> : null}
    </section>
  );
}

function TrainingMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="workout-metric">
      <div className="text-xs text-white/48">{label}</div>
      <div className="mt-1 text-xl font-medium tabular-nums text-white/88">{value}</div>
    </div>
  );
}
