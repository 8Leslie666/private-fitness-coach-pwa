import { ArrowLeft, Clock3, Droplets, Flag, Plus, SkipForward } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { RitualCard } from '../components/RitualCard';
import { defaultTrainingPlan } from '../data/defaultTrainingPlan';
import {
  abandonCurrentSet,
  applySetRpe,
  completeCurrentSet,
  createWorkoutSession,
  extendRest,
  finishCooldown,
  finishWarmup,
  formatTimer,
  getCurrentExercise,
  getCurrentSet,
  getElapsedSeconds,
  getRemainingRestSeconds,
  startCurrentSet,
  startNextExercise,
  startNextSet,
  startWorkout,
  workoutToTrainingSession,
} from '../rules/workoutRules';
import type { AppState, TrainingSession, WorkoutSession } from '../types';
import { getDayKey, getPhaseLabel, toDateKey } from '../utils/date';

interface WorkoutPageProps {
  state: AppState;
  onWorkoutChange: (session: WorkoutSession) => void;
  onSaveTraining: (session: TrainingSession) => void;
  onExit: () => void;
}

function intensityAdjusted(session: WorkoutSession): WorkoutSession {
  return {
    ...session,
    exercises: session.exercises.map((exercise) => ({
      ...exercise,
      plannedWeight: exercise.plannedWeight ? Math.round((exercise.plannedWeight * 0.9) / 2.5) * 2.5 : exercise.plannedWeight,
      sets: exercise.sets.map((set) => ({
        ...set,
        plannedWeight: set.plannedWeight ? Math.round((set.plannedWeight * 0.9) / 2.5) * 2.5 : set.plannedWeight,
      })),
    })),
  };
}

function shortVersion(session: WorkoutSession): WorkoutSession {
  return {
    ...session,
    exercises: session.exercises.slice(0, 3),
    shortVersion: true,
  };
}

function stageLabel(category: string): string {
  if (category === 'main') return '正式组';
  if (category === 'core') return '核心';
  return '辅助动作';
}

export function WorkoutPage({ state, onWorkoutChange, onSaveTraining, onExit }: WorkoutPageProps) {
  const today = toDateKey();
  const plan = defaultTrainingPlan[getDayKey(today)];
  const existing = state.workoutSessions[today];
  const initialSession = useMemo(() => existing ?? createWorkoutSession(today, plan), [existing, plan, today]);
  const [tick, setTick] = useState(0);
  const session = existing ?? initialSession;
  const currentExercise = getCurrentExercise(session);
  const currentSet = getCurrentSet(session);
  const activeElapsed = getElapsedSeconds(session.timer);
  const restRemaining = getRemainingRestSeconds(session.timer);
  const flow = ['热身', ...session.exercises.map((exercise) => exercise.name), '拉伸'].slice(0, 7).join(' → ');

  useEffect(() => {
    if (!existing) onWorkoutChange(initialSession);
  }, [existing, initialSession, onWorkoutChange]);

  useEffect(() => {
    const timer = window.setInterval(() => setTick((value) => value + 1), 1000);
    const onVisible = () => setTick((value) => value + 1);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  void tick;

  function update(next: WorkoutSession) {
    onWorkoutChange(next);
  }

  function start(mode: 'normal' | 'lowered' | 'short') {
    let next = session;
    if (mode === 'lowered') next = intensityAdjusted(next);
    if (mode === 'short') next = shortVersion(next);
    update(startWorkout(next, mode));
  }

  function finishAndSave() {
    const next = finishCooldown(session);
    update(next);
    onSaveTraining(workoutToTrainingSession(next));
  }

  function renderTop() {
    return (
      <header className="sticky top-0 z-20 -mx-4 border-b border-white/80 bg-white/90 px-4 pb-3 pt-[calc(env(safe-area-inset-top)+12px)] backdrop-blur-xl">
        <div className="mx-auto max-w-md">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-coach">{session.currentState === 'summary' ? '训练总结' : '训练陪伴'}</p>
              <h1 className="mt-1 text-xl font-bold text-ink">{session.workoutName}</h1>
              <p className="mt-1 text-sm text-muted">{getPhaseLabel(state.createdAt, today)} · 进度 {session.currentExerciseIndex + 1} / {session.exercises.length}</p>
            </div>
            <button type="button" onClick={onExit} className="rounded-full bg-surface px-3 py-2 text-sm font-semibold text-ink">
              退出
            </button>
          </div>
        </div>
      </header>
    );
  }

  function renderOverview() {
    return (
      <RitualCard
        eyebrow="开始前确认"
        title={session.workoutName}
        body="今天只做一件事：完成计划，不追极限。状态不好就主动降强度。"
      >
        <div className="space-y-3">
          <div className="rounded-[22px] bg-white/80 p-3 text-sm leading-6 text-muted">
            <p className="font-semibold text-ink">今日流程</p>
            <p className="mt-1">{flow}</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-2xl bg-white/80 p-3">
              <p className="text-xs text-muted">预计时长</p>
              <p className="mt-1 text-lg font-semibold">{plan.estimatedMinutes} 分钟</p>
            </div>
            <div className="rounded-2xl bg-white/80 p-3">
              <p className="text-xs text-muted">核心动作</p>
              <p className="mt-1 text-sm font-semibold">{plan.exercises[0].name}</p>
            </div>
          </div>
          <button type="button" onClick={() => start('normal')} className="min-h-[58px] w-full rounded-[22px] bg-ink px-4 py-4 text-base font-semibold text-white shadow-card">
            开始今日训练
          </button>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => start('lowered')} className="min-h-[52px] rounded-2xl bg-blue-50 px-3 text-sm font-semibold text-coach">
              今天很累，降低强度
            </button>
            <button type="button" onClick={() => start('short')} className="min-h-[52px] rounded-2xl bg-surface px-3 text-sm font-semibold text-ink">
              今天没空，30分钟版
            </button>
          </div>
        </div>
      </RitualCard>
    );
  }

  function renderWarmup() {
    return (
      <RitualCard eyebrow="热身" title="快速热身 5-7 分钟" body="把身体叫醒，不要一上来就进正式重量。">
        <div className="space-y-2 text-sm leading-6 text-muted">
          {['快走 3分钟', '徒手深蹲 15次', '髋关节活动 10次/侧', '空杠动作 10次'].map((item) => (
            <div key={item} className="rounded-2xl bg-white/80 p-3">{item}</div>
          ))}
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          <button type="button" onClick={() => update({ ...session, timer: { mode: 'active_set', startedAt: new Date().toISOString(), plannedSeconds: 420, extendedSeconds: 0 } })} className="min-h-[56px] rounded-2xl bg-blue-50 px-3 font-semibold text-coach">
            开始计时
          </button>
          <button type="button" onClick={() => update(finishWarmup(session))} className="min-h-[56px] rounded-2xl bg-ink px-3 font-semibold text-white">
            完成热身
          </button>
          <button type="button" onClick={() => update(finishWarmup(session))} className="min-h-[56px] rounded-2xl bg-surface px-3 font-semibold text-ink">
            跳过
          </button>
        </div>
        {session.timer.startedAt && <p className="mt-4 text-center text-4xl font-bold text-ink">{formatTimer(activeElapsed)}</p>}
      </RitualCard>
    );
  }

  function renderExerciseCard() {
    const isRunning = session.timer.mode === 'active_set' && Boolean(session.timer.startedAt) && !session.timer.completedAt;
    return (
      <section className="rounded-[32px] border border-white/80 bg-white/95 p-5 shadow-card">
        <p className="text-sm font-semibold text-coach">当前动作</p>
        <h2 className="mt-2 text-4xl font-bold tracking-normal text-ink">{currentExercise.name}</h2>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="rounded-[22px] bg-surface p-3">
            <p className="text-xs text-muted">{stageLabel(currentExercise.category)}</p>
            <p className="mt-1 text-xl font-semibold">{currentSet.setIndex + 1} / {currentExercise.plannedSets}</p>
          </div>
          <div className="rounded-[22px] bg-surface p-3">
            <p className="text-xs text-muted">重量 × 次数</p>
            <p className="mt-1 text-xl font-semibold">{currentSet.plannedWeight ? `${currentSet.plannedWeight}kg` : '自重'} × {currentSet.plannedReps}</p>
          </div>
        </div>
        <div className="mt-3 rounded-[22px] bg-blue-50 p-3 text-sm leading-6 text-blue-950">
          目标 RPE：{currentExercise.targetRpe}<br />
          提示：{currentExercise.cue}
        </div>
        <div className="mt-5 rounded-[28px] bg-ink p-5 text-center text-white">
          <p className="text-sm text-white/70">{isRunning ? '当前组进行中' : '等待开始本组'}</p>
          <p className="mt-2 text-6xl font-bold tracking-normal">{formatTimer(isRunning ? activeElapsed : 0)}</p>
        </div>
        <div className="mt-4 grid gap-2">
          {!isRunning ? (
            <button type="button" onClick={() => update(startCurrentSet(session))} className="min-h-[60px] rounded-[22px] bg-coach px-4 text-base font-semibold text-white shadow-soft">
              开始本组
            </button>
          ) : (
            <button type="button" onClick={() => update(completeCurrentSet(session))} className="min-h-[60px] rounded-[22px] bg-coach px-4 text-base font-semibold text-white shadow-soft">
              完成本组
            </button>
          )}
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => update(completeCurrentSet(session, true))} className="min-h-[52px] rounded-2xl bg-red-50 px-3 text-sm font-semibold text-red-700">
              有疼痛
            </button>
            <button type="button" onClick={() => update(abandonCurrentSet(session))} className="min-h-[52px] rounded-2xl bg-surface px-3 text-sm font-semibold text-ink">
              放弃本组
            </button>
          </div>
        </div>
      </section>
    );
  }

  function renderSetFeedback() {
    return (
      <RitualCard eyebrow="本组反馈" title="这组难度？" body="按真实体感记录，不要为了加重量压低 RPE。">
        <div className="grid grid-cols-5 gap-2">
          {[6, 7, 8, 9, 10].map((rpe) => (
            <button key={rpe} type="button" onClick={() => update(applySetRpe(session, rpe))} className="min-h-[58px] rounded-2xl bg-blue-50 text-lg font-bold text-coach">
              {rpe}
            </button>
          ))}
        </div>
      </RitualCard>
    );
  }

  function renderRest() {
    const total = session.timer.plannedSeconds + session.timer.extendedSeconds;
    const progress = total ? Math.min(((total - restRemaining) / total) * 100, 100) : 0;
    const nextSetNumber = currentSet.setIndex + 2;
    return (
      <section className="rounded-[32px] border border-white/80 bg-white/95 p-5 text-center shadow-card">
        <p className="text-sm font-semibold text-coach">休息中</p>
        <div className="rest-ring mx-auto mt-5" style={{ background: `conic-gradient(#2563eb ${progress * 3.6}deg, #eef3ff 0deg)` }}>
          <div className="rest-ring-inner">
            <p className="text-6xl font-bold text-ink">{formatTimer(restRemaining)}</p>
          </div>
        </div>
        <div className="mt-5 rounded-[22px] bg-surface p-3 text-sm leading-6 text-muted">
          下一组：{currentExercise.name} {nextSetNumber} / {currentExercise.plannedSets}<br />
          {currentSet.plannedWeight ? `${currentSet.plannedWeight}kg` : '自重'} × {currentSet.plannedReps}
        </div>
        <div className="mt-5 grid gap-2">
          <button type="button" onClick={() => update(startNextSet(session))} className="min-h-[60px] rounded-[22px] bg-ink px-4 text-base font-semibold text-white">
            {restRemaining <= 0 ? '开始下一组' : '提前开始下一组'}
          </button>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => update(extendRest(session, 30))} className="flex min-h-[52px] items-center justify-center gap-2 rounded-2xl bg-blue-50 px-3 text-sm font-semibold text-coach">
              <Plus size={16} />
              +30秒
            </button>
            <button type="button" onClick={() => update(startNextSet(session))} className="flex min-h-[52px] items-center justify-center gap-2 rounded-2xl bg-surface px-3 text-sm font-semibold text-ink">
              <SkipForward size={16} />
              跳过休息
            </button>
          </div>
        </div>
        <p className="mt-4 flex items-center justify-center gap-2 text-sm text-muted">
          <Droplets size={15} />
          小口喝水，保持状态。
        </p>
      </section>
    );
  }

  function renderNextExercise() {
    const avgRpe = currentExercise.sets.filter((set) => set.rpe).reduce((sum, set, _, arr) => sum + (set.rpe ?? 0) / arr.length, 0);
    return (
      <RitualCard eyebrow="动作完成" title={`${currentExercise.name} 完成`} body={`${currentExercise.plannedWeight ? `${currentExercise.plannedWeight}kg` : '自重'} ${currentExercise.plannedSets}×${currentExercise.plannedReps} · 平均 RPE ${avgRpe ? Math.round(avgRpe) : '-'}`}>
        <button type="button" onClick={() => update(startNextExercise(session))} className="min-h-[58px] w-full rounded-[22px] bg-ink px-4 text-base font-semibold text-white">
          进入下一个动作
        </button>
      </RitualCard>
    );
  }

  function renderCooldown() {
    return (
      <RitualCard eyebrow="收尾" title="简短拉伸 3-5 分钟" body="今天的训练主体已完成，拉伸一下髋、腿后侧、胸肩。">
        <button type="button" onClick={finishAndSave} className="min-h-[58px] w-full rounded-[22px] bg-ink px-4 text-base font-semibold text-white">
          完成训练
        </button>
      </RitualCard>
    );
  }

  function renderSummary() {
    return (
      <RitualCard eyebrow="训练完成" title="训练完成" body="今天完成了最重要的事。下一步看建议页决定明天是否加重量、维持或降强度。" score={`${session.completionRate}`}>
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-2xl bg-white/80 p-3">
            <p className="text-xs text-muted">总用时</p>
            <p className="mt-1 text-lg font-semibold">{formatTimer(session.totalDuration ?? 0)}</p>
          </div>
          <div className="rounded-2xl bg-white/80 p-3">
            <p className="text-xs text-muted">完成率</p>
            <p className="mt-1 text-lg font-semibold">{session.completionRate}%</p>
          </div>
        </div>
        <div className="mt-3 rounded-2xl bg-blue-50 p-3 text-sm leading-6 text-blue-900">
          训练后补水 500ml 左右。第二餐优先蛋白质和半份主食，不要用奶茶或重油外卖补偿。
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button type="button" onClick={onExit} className="min-h-[54px] rounded-2xl bg-ink px-3 text-sm font-semibold text-white">
            回到今日
          </button>
          <button type="button" onClick={() => onSaveTraining(workoutToTrainingSession(session))} className="min-h-[54px] rounded-2xl bg-blue-50 px-3 text-sm font-semibold text-coach">
            保存记录
          </button>
        </div>
      </RitualCard>
    );
  }

  function renderMain() {
    if (session.currentState === 'overview') return renderOverview();
    if (session.currentState === 'warmup') return renderWarmup();
    if (session.currentState === 'set_feedback') return renderSetFeedback();
    if (session.currentState === 'rest') return renderRest();
    if (session.currentState === 'next_exercise') return renderNextExercise();
    if (session.currentState === 'cooldown') return renderCooldown();
    if (session.currentState === 'summary') return renderSummary();
    return renderExerciseCard();
  }

  return (
    <div className="min-h-screen bg-surface">
      {renderTop()}
      <main className="mx-auto max-w-md space-y-4 px-4 pb-8 pt-4">
        {session.currentState !== 'overview' && (
          <div className="rounded-[24px] border border-white/80 bg-white/90 p-3 text-sm leading-6 text-muted shadow-soft">
            今日流程：{flow}
          </div>
        )}
        {renderMain()}
        {session.currentState !== 'summary' && (
          <button type="button" onClick={onExit} className="flex min-h-[50px] w-full items-center justify-center gap-2 rounded-2xl bg-white px-3 text-sm font-semibold text-ink shadow-soft">
            <ArrowLeft size={16} />
            暂停，回到今日
          </button>
        )}
      </main>
    </div>
  );
}
