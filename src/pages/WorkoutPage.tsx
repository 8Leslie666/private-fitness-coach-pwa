import { AlertTriangle, ChevronDown, Dumbbell, ListChecks, Pause, Plus, SlidersHorizontal } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
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

type SheetType = 'plan' | 'cue' | 'weight' | 'pause' | 'pain' | null;

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
  return { ...session, exercises: session.exercises.slice(0, 3), shortVersion: true };
}

function stageLabel(category: string): string {
  if (category === 'main') return '正式组';
  if (category === 'core') return '核心';
  return '辅助动作';
}

function exerciseTips(name: string): { tips: string[]; mistakes: string[] } {
  if (name.includes('深蹲')) {
    return {
      tips: ['脚掌三点踩稳。', '下蹲时膝盖跟脚尖方向一致。', '起身时胸和髋一起上。'],
      mistakes: ['膝盖内扣。', '起身先抬屁股。', '下放太快失控。'],
    };
  }
  if (name.includes('卧推')) {
    return {
      tips: ['肩胛收紧下沉。', '手腕保持中立。', '杠铃落点稳定。'],
      mistakes: ['肩膀前顶。', '臀部离凳。', '弹胸借力。'],
    };
  }
  if (name.includes('硬拉')) {
    return {
      tips: ['杠铃贴近身体。', '先收紧背再拉。', '锁定时站直不要后仰。'],
      mistakes: ['弓背启动。', '杠铃离腿太远。', '用腰猛拽。'],
    };
  }
  return {
    tips: ['动作稳定。', '保留 2-3 次余力。', '不要为了重量牺牲轨迹。'],
    mistakes: ['速度失控。', '借力过多。', '疼痛还继续硬做。'],
  };
}

function BottomSheet({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-ink/20 backdrop-blur-sm" onClick={onClose}>
      <section className="sheet-slide fixed inset-x-0 bottom-0 mx-auto max-h-[72dvh] max-w-md overflow-y-auto rounded-t-[30px] bg-white p-5 shadow-card" onClick={(event) => event.stopPropagation()}>
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-line" />
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-ink">{title}</h2>
          <button type="button" onClick={onClose} className="rounded-full bg-surface p-2 text-ink">
            <ChevronDown size={18} />
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}

export function WorkoutPage({ state, onWorkoutChange, onSaveTraining, onExit }: WorkoutPageProps) {
  const today = toDateKey();
  const plan = defaultTrainingPlan[getDayKey(today)];
  const existing = state.workoutSessions[today];
  const initialSession = useMemo(() => existing ?? createWorkoutSession(today, plan), [existing, plan, today]);
  const session = existing ?? initialSession;
  const [tick, setTick] = useState(0);
  const [sheet, setSheet] = useState<SheetType>(null);
  const [customWeight, setCustomWeight] = useState('');
  const currentExercise = getCurrentExercise(session);
  const currentSet = getCurrentSet(session);
  const activeElapsed = getElapsedSeconds(session.timer);
  const restRemaining = getRemainingRestSeconds(session.timer);
  const isSetRunning = session.timer.mode === 'active_set' && Boolean(session.timer.startedAt) && !session.timer.completedAt && session.currentState === 'active_set';
  const isRest = session.currentState === 'rest';
  const isSummary = session.currentState === 'summary';
  const tips = exerciseTips(currentExercise.name);

  useEffect(() => {
    if (!existing) onWorkoutChange(initialSession);
  }, [existing, initialSession, onWorkoutChange]);

  useEffect(() => {
    const timer = window.setInterval(() => setTick((value) => value + 1), 1000);
    const sync = () => setTick((value) => value + 1);
    document.addEventListener('visibilitychange', sync);
    window.addEventListener('focus', sync);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', sync);
      window.removeEventListener('focus', sync);
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

  function setCurrentWeight(weight: number | null) {
    const next = {
      ...session,
      exercises: session.exercises.map((exercise, exerciseIndex) =>
        exerciseIndex === session.currentExerciseIndex
          ? {
              ...exercise,
              plannedWeight: weight,
              sets: exercise.sets.map((set, setIndex) =>
                setIndex === session.currentSetIndex ? { ...set, plannedWeight: weight } : set,
              ),
            }
          : exercise,
      ),
    };
    update(next);
  }

  function renderOverview() {
    return (
      <div className="flex h-full flex-col justify-between">
        <div>
          <p className="text-sm font-semibold text-coach">开始前确认</p>
          <h2 className="mt-3 text-3xl font-bold text-ink">{session.workoutName}</h2>
          <p className="mt-3 text-sm leading-6 text-muted">今天只做一件事：完成计划，不追极限。</p>
          <div className="mt-5 grid grid-cols-2 gap-2">
            <div className="rounded-2xl bg-white/80 p-3 shadow-soft">
              <p className="text-xs text-muted">预计时长</p>
              <p className="mt-1 text-xl font-bold">{plan.estimatedMinutes} 分钟</p>
            </div>
            <div className="rounded-2xl bg-white/80 p-3 shadow-soft">
              <p className="text-xs text-muted">核心动作</p>
              <p className="mt-1 text-lg font-bold">{plan.exercises[0].name}</p>
            </div>
          </div>
        </div>
        <div className="grid gap-2">
          <button type="button" onClick={() => start('normal')} className="min-h-[60px] rounded-[22px] bg-ink px-4 text-base font-semibold text-white shadow-card">
            开始今日训练
          </button>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => start('lowered')} className="min-h-[52px] rounded-2xl bg-blue-50 px-3 text-sm font-semibold text-coach">
              降低强度
            </button>
            <button type="button" onClick={() => start('short')} className="min-h-[52px] rounded-2xl bg-white px-3 text-sm font-semibold text-ink shadow-soft">
              30分钟版
            </button>
          </div>
        </div>
      </div>
    );
  }

  function renderWarmup() {
    return (
      <div className="flex h-full flex-col justify-between">
        <div>
          <p className="text-sm font-semibold text-coach">热身</p>
          <h2 className="mt-3 text-3xl font-bold text-ink">快速热身</h2>
          <p className="mt-3 text-sm leading-6 text-muted">快走、徒手深蹲、髋关节活动、空杠动作。5-7 分钟即可。</p>
          <div className="mt-6 rounded-[28px] bg-ink p-5 text-center text-white">
            <p className="text-sm text-white/70">热身计时</p>
            <p className="mt-2 text-6xl font-bold">{formatTimer(session.timer.startedAt ? activeElapsed : 0)}</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <button type="button" onClick={() => update({ ...session, timer: { mode: 'active_set', startedAt: new Date().toISOString(), plannedSeconds: 420, extendedSeconds: 0 } })} className="min-h-[56px] rounded-2xl bg-blue-50 font-semibold text-coach">
            计时
          </button>
          <button type="button" onClick={() => update(finishWarmup(session))} className="min-h-[56px] rounded-2xl bg-ink font-semibold text-white">
            完成
          </button>
          <button type="button" onClick={() => update(finishWarmup(session))} className="min-h-[56px] rounded-2xl bg-white font-semibold text-ink shadow-soft">
            跳过
          </button>
        </div>
      </div>
    );
  }

  function renderActiveSet() {
    return (
      <div className="flex h-full flex-col justify-between">
        <div>
          <p className="text-sm font-semibold text-coach">当前动作</p>
          <h2 className="mt-2 text-5xl font-bold tracking-normal text-ink">{currentExercise.name}</h2>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="rounded-[22px] bg-white/90 p-3 shadow-soft">
              <p className="text-xs text-muted">{stageLabel(currentExercise.category)}</p>
              <p className="mt-1 text-2xl font-bold">{currentSet.setIndex + 1} / {currentExercise.plannedSets}</p>
            </div>
            <div className="rounded-[22px] bg-white/90 p-3 shadow-soft">
              <p className="text-xs text-muted">重量 × 次数</p>
              <p className="mt-1 text-2xl font-bold">{currentSet.plannedWeight ? `${currentSet.plannedWeight}kg` : '自重'} × {currentSet.plannedReps}</p>
            </div>
          </div>
          <div className="mt-5 rounded-[30px] bg-ink p-5 text-center text-white">
            <p className="text-sm text-white/70">{isSetRunning ? '当前组进行中' : '等待开始本组'}</p>
            <p className="mt-2 text-7xl font-bold tracking-normal">{formatTimer(isSetRunning ? activeElapsed : 0)}</p>
          </div>
        </div>
        <div className="grid gap-2">
          <button
            type="button"
            onClick={() => update(isSetRunning ? completeCurrentSet(session) : startCurrentSet(session))}
            className="min-h-[64px] rounded-[24px] bg-coach px-4 text-lg font-semibold text-white shadow-card active:scale-[0.99]"
          >
            {isSetRunning ? '完成本组' : '开始本组'}
          </button>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => setSheet('cue')} className="min-h-[50px] rounded-2xl bg-white text-sm font-semibold text-ink shadow-soft">
              动作提示
            </button>
            <button type="button" onClick={() => setSheet('pain')} className="min-h-[50px] rounded-2xl bg-red-50 text-sm font-semibold text-red-700">
              有疼痛
            </button>
          </div>
        </div>
      </div>
    );
  }

  function renderSetFeedback() {
    return (
      <div className="flex h-full flex-col justify-center">
        <p className="text-sm font-semibold text-coach">本组反馈</p>
        <h2 className="mt-3 text-4xl font-bold text-ink">这组难度？</h2>
        <p className="mt-3 text-sm text-muted">按真实体感记录，系统会用它决定下次加重或降重。</p>
        <div className="mt-8 grid grid-cols-5 gap-2">
          {[6, 7, 8, 9, 10].map((rpe) => (
            <button key={rpe} type="button" onClick={() => update(applySetRpe(session, rpe))} className="min-h-[64px] rounded-2xl bg-blue-50 text-xl font-bold text-coach">
              {rpe}
            </button>
          ))}
        </div>
      </div>
    );
  }

  function renderRest() {
    const total = session.timer.plannedSeconds + session.timer.extendedSeconds;
    const progress = total ? Math.min(((total - restRemaining) / total) * 100, 100) : 0;
    return (
      <div className="flex h-full flex-col justify-between text-center">
        <div>
          <p className="text-sm font-semibold text-coach">休息中</p>
          <div className="rest-ring mx-auto mt-5" style={{ background: `conic-gradient(#2563eb ${progress * 3.6}deg, #eef3ff 0deg)` }}>
            <div className="rest-ring-inner">
              <p className="text-6xl font-bold text-ink">{formatTimer(restRemaining)}</p>
            </div>
          </div>
          <div className="mt-5 rounded-[22px] bg-white/90 p-3 text-sm leading-6 text-muted shadow-soft">
            下一组：{currentExercise.name} {currentSet.setIndex + 2} / {currentExercise.plannedSets}<br />
            {currentSet.plannedWeight ? `${currentSet.plannedWeight}kg` : '自重'} × {currentSet.plannedReps}
          </div>
        </div>
        <div className="grid gap-2">
          <button type="button" onClick={() => update(startNextSet(session))} className="min-h-[64px] rounded-[24px] bg-ink px-4 text-lg font-semibold text-white">
            {restRemaining <= 0 ? '开始下一组' : '提前开始'}
          </button>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => update(extendRest(session, 30))} className="flex min-h-[50px] items-center justify-center gap-2 rounded-2xl bg-blue-50 text-sm font-semibold text-coach">
              <Plus size={16} />
              +30秒
            </button>
            <button type="button" onClick={() => update(startNextSet(session))} className="min-h-[50px] rounded-2xl bg-white text-sm font-semibold text-ink shadow-soft">
              跳过休息
            </button>
          </div>
        </div>
      </div>
    );
  }

  function renderNextExercise() {
    return (
      <div className="flex h-full flex-col justify-center">
        <p className="text-sm font-semibold text-coach">动作完成</p>
        <h2 className="mt-3 text-4xl font-bold text-ink">{currentExercise.name}</h2>
        <p className="mt-3 text-sm text-muted">本动作结束，进入下一个动作。</p>
        <button type="button" onClick={() => update(startNextExercise(session))} className="mt-8 min-h-[64px] rounded-[24px] bg-ink px-4 text-lg font-semibold text-white">
          进入下一个动作
        </button>
      </div>
    );
  }

  function renderCooldown() {
    return (
      <div className="flex h-full flex-col justify-center">
        <p className="text-sm font-semibold text-coach">收尾</p>
        <h2 className="mt-3 text-4xl font-bold text-ink">简短拉伸</h2>
        <p className="mt-3 text-sm leading-6 text-muted">拉伸髋、腿后侧、胸肩。3-5 分钟即可。</p>
        <button type="button" onClick={finishAndSave} className="mt-8 min-h-[64px] rounded-[24px] bg-ink px-4 text-lg font-semibold text-white">
          完成训练
        </button>
      </div>
    );
  }

  function renderSummary() {
    return (
      <div className="flex h-full flex-col justify-center">
        <p className="text-sm font-semibold text-coach">训练完成</p>
        <h2 className="mt-3 text-5xl font-bold text-ink">{session.completionRate}分</h2>
        <p className="mt-3 text-sm leading-6 text-muted">今天完成了最重要的事。训练后补水 500ml 左右，第二餐优先蛋白质和半份主食。</p>
        <div className="mt-6 grid grid-cols-2 gap-2">
          <div className="rounded-2xl bg-white/90 p-3 shadow-soft">
            <p className="text-xs text-muted">总用时</p>
            <p className="mt-1 text-xl font-bold">{formatTimer(session.totalDuration ?? 0)}</p>
          </div>
          <div className="rounded-2xl bg-white/90 p-3 shadow-soft">
            <p className="text-xs text-muted">完成率</p>
            <p className="mt-1 text-xl font-bold">{session.completionRate}%</p>
          </div>
        </div>
        <button type="button" onClick={onExit} className="mt-8 min-h-[64px] rounded-[24px] bg-ink px-4 text-lg font-semibold text-white">
          回到今日
        </button>
      </div>
    );
  }

  function renderCurrentState() {
    if (session.currentState === 'overview') return renderOverview();
    if (session.currentState === 'warmup') return renderWarmup();
    if (session.currentState === 'set_feedback') return renderSetFeedback();
    if (isRest) return renderRest();
    if (session.currentState === 'next_exercise') return renderNextExercise();
    if (session.currentState === 'cooldown') return renderCooldown();
    if (isSummary) return renderSummary();
    return renderActiveSet();
  }

  function renderSheet() {
    if (!sheet) return null;
    if (sheet === 'plan') {
      return (
        <BottomSheet title="今日计划" onClose={() => setSheet(null)}>
          <div className="space-y-2">
            {session.exercises.map((exercise, index) => (
              <div key={exercise.id} className={`rounded-2xl p-3 text-sm ${index === session.currentExerciseIndex ? 'bg-blue-50 text-blue-950' : 'bg-surface text-muted'}`}>
                <span className="font-semibold">{exercise.name}</span> · {exercise.plannedWeight ? `${exercise.plannedWeight}kg` : '自重'} · {exercise.plannedSets}×{exercise.plannedReps}
              </div>
            ))}
          </div>
        </BottomSheet>
      );
    }
    if (sheet === 'cue') {
      return (
        <BottomSheet title="动作提示" onClose={() => setSheet(null)}>
          <div className="space-y-4">
            <div className="rounded-[24px] bg-blue-50 p-5 text-center text-coach">
              <Dumbbell size={36} className="mx-auto" />
              <p className="mt-2 font-semibold">{currentExercise.name}</p>
            </div>
            <div>
              <p className="mb-2 text-sm font-semibold text-ink">关键提示</p>
              {tips.tips.map((tip) => <p key={tip} className="rounded-2xl bg-surface p-3 text-sm text-muted">{tip}</p>)}
            </div>
            <div className="space-y-2">
              <p className="text-sm font-semibold text-ink">常见错误</p>
              {tips.mistakes.map((tip) => <p key={tip} className="rounded-2xl bg-amber-50 p-3 text-sm text-amber-800">{tip}</p>)}
            </div>
            <p className="rounded-2xl bg-red-50 p-3 text-sm text-red-700">安全提醒：出现明显疼痛时停止相关动作。</p>
          </div>
        </BottomSheet>
      );
    }
    if (sheet === 'weight') {
      const current = currentSet.plannedWeight ?? 0;
      return (
        <BottomSheet title="调整重量" onClose={() => setSheet(null)}>
          <div className="space-y-3">
            <p className="text-center text-4xl font-bold text-ink">{current ? `${current}kg` : '自重'}</p>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setCurrentWeight(Math.max(current - 2.5, 0))} className="min-h-[54px] rounded-2xl bg-surface font-semibold">-2.5kg</button>
              <button type="button" onClick={() => setCurrentWeight(current + 2.5)} className="min-h-[54px] rounded-2xl bg-blue-50 font-semibold text-coach">+2.5kg</button>
            </div>
            <input value={customWeight} onChange={(event) => setCustomWeight(event.target.value)} type="number" className="h-12 w-full rounded-2xl border border-line px-3 outline-none" placeholder="自定义 kg" />
            <button type="button" onClick={() => { const next = Number(customWeight); if (Number.isFinite(next)) setCurrentWeight(next); setSheet(null); }} className="min-h-[54px] w-full rounded-2xl bg-ink font-semibold text-white">保存</button>
          </div>
        </BottomSheet>
      );
    }
    if (sheet === 'pause') {
      return (
        <BottomSheet title="暂停训练" onClose={() => setSheet(null)}>
          <div className="grid gap-2">
            <button type="button" onClick={() => setSheet(null)} className="min-h-[54px] rounded-2xl bg-ink font-semibold text-white">继续训练</button>
            <button type="button" onClick={onExit} className="min-h-[54px] rounded-2xl bg-surface font-semibold text-ink">暂停并返回首页</button>
            <button type="button" onClick={finishAndSave} className="min-h-[54px] rounded-2xl bg-blue-50 font-semibold text-coach">结束并保存</button>
            <button type="button" onClick={() => { update({ ...session, status: 'abandoned' }); onExit(); }} className="min-h-[54px] rounded-2xl bg-red-50 font-semibold text-red-700">放弃训练</button>
          </div>
        </BottomSheet>
      );
    }
    return (
      <BottomSheet title="疼痛反馈" onClose={() => setSheet(null)}>
        <div className="space-y-3">
          <div className="rounded-2xl bg-red-50 p-3 text-sm leading-6 text-red-700">疼痛明显时停止相关动作。评分 4 分以上建议暂停主项，改快走和拉伸。</div>
          <input className="h-12 w-full rounded-2xl border border-line px-3 outline-none" placeholder="疼痛部位，例如膝、腰、肩" />
          <div className="grid grid-cols-5 gap-2">
            {[1, 3, 5, 7, 10].map((score) => <button key={score} type="button" className="min-h-[48px] rounded-2xl bg-surface font-semibold">{score}</button>)}
          </div>
          <button type="button" onClick={() => { update(completeCurrentSet(session, true)); setSheet(null); }} className="min-h-[54px] w-full rounded-2xl bg-red-50 font-semibold text-red-700">记录疼痛并结束本组</button>
        </div>
      </BottomSheet>
    );
  }

  return (
    <div className="workout-screen h-[100dvh] overflow-hidden bg-surface">
      <header className="flex h-[116px] items-start justify-between gap-3 px-4 pt-[calc(env(safe-area-inset-top)+14px)]">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-coach">{getPhaseLabel(state.createdAt, today)}</p>
          <h1 className="mt-1 truncate text-xl font-bold text-ink">{session.workoutName}</h1>
          <p className="mt-1 text-sm text-muted">进度 {session.currentExerciseIndex + 1} / {session.exercises.length}</p>
        </div>
        <button type="button" onClick={() => setSheet('pause')} className="flex min-h-[44px] items-center gap-1 rounded-full bg-white px-3 text-sm font-semibold text-ink shadow-soft">
          <Pause size={16} />
          暂停
        </button>
      </header>

      <main className="mx-auto flex h-[calc(100dvh-116px)] max-w-md flex-col px-4 pb-[calc(env(safe-area-inset-bottom)+14px)]">
        <div className="min-h-0 flex-1 rounded-[34px] border border-white/80 bg-white/80 p-4 shadow-card backdrop-blur">
          {renderCurrentState()}
        </div>
        {!['overview', 'summary'].includes(session.currentState) && (
          <div className="mt-3 grid grid-cols-3 gap-2">
            <button type="button" onClick={() => setSheet('plan')} className="min-h-[48px] rounded-2xl bg-white text-sm font-semibold text-ink shadow-soft">
              <ListChecks size={16} className="mx-auto mb-1 text-coach" />
              计划
            </button>
            <button type="button" onClick={() => setSheet('cue')} className="min-h-[48px] rounded-2xl bg-white text-sm font-semibold text-ink shadow-soft">
              <AlertTriangle size={16} className="mx-auto mb-1 text-coach" />
              提示
            </button>
            <button type="button" onClick={() => setSheet('weight')} className="min-h-[48px] rounded-2xl bg-white text-sm font-semibold text-ink shadow-soft">
              <SlidersHorizontal size={16} className="mx-auto mb-1 text-coach" />
              重量
            </button>
          </div>
        )}
      </main>
      {renderSheet()}
    </div>
  );
}
