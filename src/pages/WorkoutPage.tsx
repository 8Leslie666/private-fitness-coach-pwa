import { AlertTriangle, Dumbbell, ListChecks, Pause, Plus, SlidersHorizontal } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { EditableMetric } from '../components/Ink/EditableMetric';
import { InkDrawer } from '../components/Ink/InkDrawer';
import { InkTimeline } from '../components/Ink/InkTimeline';
import { RestRing } from '../components/Ink/RestRing';
import { TrainingFocusView } from '../components/Ink/TrainingFocusView';
import { defaultTrainingPlan } from '../data/defaultTrainingPlan';
import {
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
import type { AppState, TrainingSession, WorkoutSession, WorkoutSet } from '../types';
import { getDayKey, getPhaseLabel, toDateKey } from '../utils/date';

type SheetType = 'plan' | 'cue' | 'weight' | 'reps' | 'sets' | 'rest' | 'status' | 'pause' | 'pain' | null;

interface WorkoutPageProps {
  state: AppState;
  onWorkoutChange: (session: WorkoutSession) => void;
  onSaveTraining: (session: TrainingSession) => void;
  onExit: () => void;
}

function intensityAdjusted(session: WorkoutSession): WorkoutSession {
  return {
    ...session,
    loweredIntensity: true,
    exercises: session.exercises.map((exercise) => ({
      ...exercise,
      plannedWeight: exercise.plannedWeight ? Math.round((exercise.plannedWeight * 0.9) / 2.5) * 2.5 : exercise.plannedWeight,
      plannedSets: Math.max(1, exercise.plannedSets - (exercise.category === 'main' ? 0 : 1)),
      sets: exercise.sets
        .slice(0, Math.max(1, exercise.sets.length - (exercise.category === 'main' ? 0 : 1)))
        .map((set) => ({
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
  if (category === 'main') return '主项正式组';
  if (category === 'core') return '核心收尾';
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
  return <InkDrawer title={title} open onClose={onClose}>{children}</InkDrawer>;
}

function createSet(index: number, weight: number | null, reps: string): WorkoutSet {
  return {
    setIndex: index,
    plannedWeight: weight,
    plannedReps: reps,
    completed: false,
    pain: false,
  };
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
  const [customReps, setCustomReps] = useState('');
  const currentExercise = getCurrentExercise(session);
  const currentSet = getCurrentSet(session);
  const activeElapsed = getElapsedSeconds(session.timer);
  const restRemaining = getRemainingRestSeconds(session.timer);
  const isSetRunning = session.timer.mode === 'active_set' && Boolean(session.timer.startedAt) && !session.timer.completedAt && session.currentState === 'active_set';
  const isRest = session.currentState === 'rest';
  const isSummary = session.currentState === 'summary';
  const tips = exerciseTips(currentExercise.name);
  const focusMode = ['active_set', 'set_feedback', 'rest', 'next_exercise', 'cooldown', 'summary'].includes(session.currentState);

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

  function updateCurrentExercise(nextExercise: typeof currentExercise, extra: Partial<WorkoutSession> = {}) {
    update({
      ...session,
      ...extra,
      exercises: session.exercises.map((exercise, index) => (index === session.currentExerciseIndex ? nextExercise : exercise)),
    });
  }

  function setCurrentWeight(weight: number | null) {
    const nextExercise = {
      ...currentExercise,
      plannedWeight: weight,
      actualWeight: weight,
      sets: currentExercise.sets.map((set, index) =>
        index >= session.currentSetIndex && !set.completed ? { ...set, plannedWeight: weight } : set,
      ),
    };
    updateCurrentExercise(nextExercise);
  }

  function setCurrentReps(reps: string) {
    const nextExercise = {
      ...currentExercise,
      plannedReps: reps,
      actualReps: reps,
      sets: currentExercise.sets.map((set, index) =>
        index >= session.currentSetIndex && !set.completed ? { ...set, plannedReps: reps } : set,
      ),
    };
    updateCurrentExercise(nextExercise);
  }

  function setCurrentSets(count: number) {
    const sets = Array.from({ length: count }, (_, index) => currentExercise.sets[index] ?? createSet(index, currentExercise.plannedWeight, currentExercise.plannedReps))
      .map((set, index) => ({ ...set, setIndex: index }));
    const nextExercise = {
      ...currentExercise,
      plannedSets: count,
      actualSets: count,
      sets,
    };
    updateCurrentExercise(nextExercise, { currentSetIndex: Math.min(session.currentSetIndex, count - 1) });
  }

  function setCurrentRest(seconds: number) {
    updateCurrentExercise({ ...currentExercise, restSeconds: seconds });
  }

  function skipCurrentExercise() {
    const isLastExercise = session.currentExerciseIndex >= session.exercises.length - 1;
    updateCurrentExercise(
      {
        ...currentExercise,
        skipped: true,
        completed: true,
        sets: currentExercise.sets.map((set) => ({ ...set, completed: false, completedAt: set.completedAt ?? new Date().toISOString() })),
      },
      {
        currentState: isLastExercise ? 'cooldown' : 'next_exercise',
        timer: { mode: 'idle', plannedSeconds: 0, extendedSeconds: 0 },
      },
    );
  }

  function reduceCurrentExercise() {
    const nextWeight = currentExercise.plannedWeight ? Math.round((currentExercise.plannedWeight * 0.9) / 2.5) * 2.5 : null;
    setCurrentWeight(nextWeight);
    if (currentExercise.plannedSets > 2) setCurrentSets(currentExercise.plannedSets - 1);
  }

  function renderOverview() {
    return (
      <div className="flex h-full flex-col justify-between">
        <div>
          <p className="text-sm font-semibold text-mountain">起势</p>
          <h2 className="ink-title mt-3 text-4xl font-semibold text-ink">静气凝神</h2>
          <p className="mt-3 text-sm leading-6 text-muted">先定其心，再起其势。今天只完成计划，不追极限。</p>
          <div className="mt-5 grid grid-cols-2 gap-2">
            <div className="rounded-2xl bg-white/80 p-3 shadow-soft">
              <p className="text-xs text-muted">预计时长</p>
              <p className="mt-1 text-xl font-bold">{plan.estimatedMinutes} 分钟</p>
            </div>
            <div className="rounded-2xl bg-white/80 p-3 shadow-soft">
              <p className="text-xs text-muted">主项重量</p>
              <p className="mt-1 text-lg font-bold">{plan.exercises[0].weightDisplay}</p>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-2 text-sm">
            {['身体状态可训练', '装备准备好', '水杯 / 毛巾', '手机电量够'].map((item) => (
              <div key={item} className="rounded-2xl bg-white/64 p-3 text-ink shadow-soft">{item}</div>
            ))}
          </div>
        </div>
        <div className="grid gap-2">
          <button type="button" onClick={() => start('normal')} className="breath-button min-h-[62px] rounded-[24px] bg-ink px-4 text-base font-semibold text-white shadow-ink">
            进入训练
          </button>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => start('lowered')} className="min-h-[52px] rounded-2xl bg-mountain/10 px-3 text-sm font-semibold text-mountain">
              今天很累，降低强度
            </button>
            <button type="button" onClick={() => start('short')} className="min-h-[52px] rounded-2xl bg-white px-3 text-sm font-semibold text-ink shadow-soft">
              今天没空，30分钟版
            </button>
          </div>
        </div>
      </div>
    );
  }

  function renderWarmup() {
    const items = [
      { title: '快速热身', detail: '快走 3 分钟，徒手深蹲 15 次。', minutes: '5 分钟', done: false },
      { title: '主项热身组', detail: '空杠或轻重量，找轨迹，不追强度。', minutes: '7 分钟', done: false },
      { title: '主项训练', detail: `${plan.exercises[0].name} ${plan.exercises[0].weightDisplay}`, minutes: '20 分钟', done: false },
      { title: '辅助训练', detail: '卧推辅助 / 下肢辅助 / 背部按今日计划。', minutes: '20 分钟', done: false },
      { title: '核心收尾', detail: '平板、死虫、侧桥或卷腹。', minutes: '5 分钟', done: false },
      { title: '冷身放松', detail: '简单拉伸，训练后补水。', minutes: '3 分钟', done: false },
    ];
    return (
      <div className="flex h-full flex-col justify-between">
        <div className="min-h-0 overflow-y-auto pr-1">
          <p className="text-sm font-semibold text-mountain">行练次第</p>
          <h2 className="ink-title mt-2 text-3xl font-semibold text-ink">今日流程</h2>
          <div className="mt-4">
            <InkTimeline items={items} activeIndex={0} />
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button type="button" onClick={() => update(finishWarmup(session))} className="min-h-[58px] rounded-2xl bg-ink font-semibold text-white">
            开始训练
          </button>
          <button type="button" onClick={() => update(finishWarmup(session))} className="min-h-[58px] rounded-2xl bg-white font-semibold text-ink shadow-soft">
            跳过热身
          </button>
        </div>
      </div>
    );
  }

  function renderActiveSet() {
    return (
      <TrainingFocusView
        label="正式行练"
        title={currentExercise.name}
        cue={currentExercise.cue}
        metrics={
          <div className="grid grid-cols-3 gap-2">
            <EditableMetric dark label={stageLabel(currentExercise.category)} value={`${currentSet.setIndex + 1}/${currentExercise.plannedSets}`} onClick={() => setSheet('sets')} hint="点此改组数" />
            <EditableMetric dark label="重量" value={currentSet.plannedWeight ? `${currentSet.plannedWeight}kg` : '自重'} onClick={() => setSheet('weight')} hint="点此改重量" />
            <EditableMetric dark label="次数" value={`${currentSet.plannedReps}`} onClick={() => setSheet('reps')} hint="点此改次数" />
          </div>
        }
        timer={
          <button type="button" onClick={() => setSheet('rest')} className="w-full rounded-pageCard bg-trainCard p-5 text-center ring-1 ring-white/10">
            <p className="text-sm text-white/60">{isSetRunning ? '当前组进行中' : '等待开始本组'}</p>
            <p className="mt-2 text-7xl font-bold tracking-normal text-white">{formatTimer(isSetRunning ? activeElapsed : 0)}</p>
            <p className="mt-2 text-sm text-white/55">目标 RPE：{currentExercise.targetRpe} · 休息 {currentExercise.restSeconds} 秒</p>
          </button>
        }
        primaryAction={
          <button
            type="button"
            onClick={() => update(isSetRunning ? completeCurrentSet(session) : startCurrentSet(session))}
            className="breath-button min-h-[64px] rounded-[24px] bg-mountain px-4 text-lg font-semibold text-white shadow-ink active:scale-[0.99]"
          >
            {isSetRunning ? '完成本组' : '开始本组'}
          </button>
        }
        secondaryActions={
          <div className="grid grid-cols-3 gap-2">
            <button type="button" onClick={() => setSheet('cue')} className="min-h-[50px] rounded-2xl bg-white/10 text-sm font-semibold text-white">
              动作提示
            </button>
            <button type="button" onClick={() => setSheet('pain')} className="min-h-[50px] rounded-2xl bg-red-500/18 text-sm font-semibold text-red-100">
              疼痛反馈
            </button>
            <button type="button" onClick={() => setSheet('status')} className="min-h-[50px] rounded-2xl bg-white/10 text-sm font-semibold text-white">
              状态调整
            </button>
          </div>
        }
      />
    );
  }

  function renderSetFeedback() {
    return (
      <div className="flex h-full flex-col justify-center text-white">
        <p className="text-sm font-semibold text-white/65">本组反馈</p>
        <h2 className="mt-3 text-4xl font-bold text-white">这组难度？</h2>
        <p className="mt-3 text-sm text-white/55">按真实体感记录，系统会用它决定下次加重或降重。</p>
        <div className="mt-8 grid grid-cols-5 gap-2">
          {[6, 7, 8, 9, 10].map((rpe) => (
            <button key={rpe} type="button" onClick={() => update(applySetRpe(session, rpe))} className="min-h-[64px] rounded-2xl bg-white/10 text-xl font-bold text-white">
              {rpe}
            </button>
          ))}
        </div>
      </div>
    );
  }

  function renderRest() {
    const total = session.timer.plannedSeconds + session.timer.extendedSeconds;
    return (
      <div className="flex h-full flex-col justify-between text-center text-white">
        <div>
          <p className="text-sm font-semibold text-white/65">调息</p>
          <p className="mt-2 text-sm text-white/55">第 {currentSet.setIndex + 1} 组完成</p>
          <div className="mt-5">
            <RestRing
              dark
              remainingSeconds={restRemaining}
              totalSeconds={total}
              formattedTime={formatTimer(restRemaining)}
            />
          </div>
          <button type="button" onClick={() => setSheet('rest')} className="mt-5 rounded-[22px] bg-white/10 p-3 text-sm leading-6 text-white/75">
            下一组：{currentExercise.name} {Math.min(currentSet.setIndex + 2, currentExercise.plannedSets)} / {currentExercise.plannedSets}<br />
            {currentSet.plannedWeight ? `${currentSet.plannedWeight}kg` : '自重'} × {currentSet.plannedReps}
          </button>
        </div>
        <div className="grid gap-2">
          <button type="button" onClick={() => update(startNextSet(session))} className="min-h-[64px] rounded-[24px] bg-white px-4 text-lg font-semibold text-ink">
            {restRemaining <= 0 ? '开始下一组' : '提前开始'}
          </button>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => update(extendRest(session, 30))} className="flex min-h-[50px] items-center justify-center gap-2 rounded-2xl bg-white/10 text-sm font-semibold text-white">
              <Plus size={16} />
              +30秒
            </button>
            <button type="button" onClick={() => update(startNextSet(session))} className="min-h-[50px] rounded-2xl bg-white/10 text-sm font-semibold text-white">
              跳过休息
            </button>
          </div>
        </div>
      </div>
    );
  }

  function renderNextExercise() {
    return (
      <div className="flex h-full flex-col justify-center text-white">
        <p className="text-sm font-semibold text-white/65">动作完成</p>
        <h2 className="mt-3 text-4xl font-bold text-white">{currentExercise.name}</h2>
        <p className="mt-3 text-sm text-white/55">本动作结束，进入下一个动作。</p>
        <button type="button" onClick={() => update(startNextExercise(session))} className="mt-8 min-h-[64px] rounded-[24px] bg-white px-4 text-lg font-semibold text-ink">
          进入下一个动作
        </button>
      </div>
    );
  }

  function renderCooldown() {
    return (
      <div className="flex h-full flex-col justify-center text-white">
        <p className="text-sm font-semibold text-white/65">冷身</p>
        <h2 className="ink-title mt-3 text-4xl font-semibold text-white">简短拉伸</h2>
        <p className="mt-3 text-sm leading-6 text-white/60">拉伸髋、腿后侧、胸肩。3-5 分钟即可。</p>
        <button type="button" onClick={finishAndSave} className="mt-8 min-h-[64px] rounded-[24px] bg-white px-4 text-lg font-semibold text-ink">
          完成训练
        </button>
      </div>
    );
  }

  function renderSummary() {
    const completedSets = session.exercises.flatMap((exercise) => exercise.sets).filter((set) => set.completed);
    const avgRpe = completedSets.length ? Math.round(completedSets.reduce((sum, set) => sum + (set.rpe ?? 0), 0) / completedSets.length) : 0;
    const pain = session.exercises.some((exercise) => exercise.sets.some((set) => set.pain));
    return (
      <div className="flex h-full flex-col justify-center text-white">
        <p className="text-sm font-semibold text-white/65">收势</p>
        <h2 className="ink-title mt-3 text-5xl font-semibold text-white">训练完成</h2>
        <p className="mt-3 text-sm leading-6 text-white/60">今日之功，已成一笔。训练后补水 500ml 左右，第二餐优先蛋白质和半份主食。</p>
        <div className="mt-6 grid grid-cols-2 gap-2">
          <EditableMetric dark label="总用时" value={formatTimer(session.totalDuration ?? session.actualDuration ?? 0)} />
          <EditableMetric dark label="完成率" value={`${session.completionRate}%`} />
          <EditableMetric dark label="平均 RPE" value={avgRpe ? String(avgRpe) : '--'} />
          <EditableMetric dark label="疼痛情况" value={pain ? '有疼痛' : '无明显'} />
        </div>
        <button type="button" onClick={onExit} className="mt-8 min-h-[64px] rounded-[24px] bg-white px-4 text-lg font-semibold text-ink">
          查看明日建议
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
        <BottomSheet title="行练次第" onClose={() => setSheet(null)}>
          <div className="space-y-2">
            {session.exercises.map((exercise, index) => (
              <div key={exercise.id} className={`rounded-2xl p-3 text-sm ${index === session.currentExerciseIndex ? 'bg-mountain/10 text-ink' : 'bg-white/70 text-muted'}`}>
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
            <div className="rounded-[24px] bg-mountain/10 p-5 text-center text-mountain">
              <Dumbbell size={36} className="mx-auto" />
              <p className="mt-2 font-semibold">{currentExercise.name}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-semibold text-ink">关键提示</p>
              {tips.tips.map((tip) => <p key={tip} className="rounded-2xl bg-white/70 p-3 text-sm text-muted">{tip}</p>)}
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
      const common = [40, 45, 47.5, 50, 52.5, 55, 57.5, 60];
      return (
        <BottomSheet title="修改重量" onClose={() => setSheet(null)}>
          <div className="space-y-3">
            <p className="text-center text-4xl font-bold text-ink">{current ? `${current}kg` : '自重'}</p>
            <div className="grid grid-cols-4 gap-2">
              {[-2.5, -1.25, 1.25, 2.5].map((delta) => (
                <button key={delta} type="button" onClick={() => setCurrentWeight(Math.max(current + delta, 0))} className="min-h-[54px] rounded-2xl bg-white/80 font-semibold text-ink shadow-soft">
                  {delta > 0 ? '+' : ''}{delta}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-4 gap-2">
              {common.map((weight) => (
                <button key={weight} type="button" onClick={() => setCurrentWeight(weight)} className="min-h-[48px] rounded-2xl bg-mountain/10 text-sm font-semibold text-mountain">
                  {weight}
                </button>
              ))}
            </div>
            <input value={customWeight} onChange={(event) => setCustomWeight(event.target.value)} type="number" className="h-12 w-full rounded-2xl border border-line bg-white/80 px-3 outline-none" placeholder="自定义 kg" />
            <button type="button" onClick={() => { const next = Number(customWeight); if (Number.isFinite(next)) setCurrentWeight(next); setSheet(null); }} className="min-h-[54px] w-full rounded-2xl bg-ink font-semibold text-white">保存</button>
          </div>
        </BottomSheet>
      );
    }
    if (sheet === 'reps') {
      return (
        <BottomSheet title="修改次数" onClose={() => setSheet(null)}>
          <div className="grid gap-3">
            <div className="grid grid-cols-5 gap-2">
              {['3', '4', '5', '6', '8'].map((reps) => (
                <button key={reps} type="button" onClick={() => { setCurrentReps(reps); setSheet(null); }} className="min-h-[58px] rounded-2xl bg-white/80 text-xl font-bold text-ink shadow-soft">
                  {reps}
                </button>
              ))}
            </div>
            <input value={customReps} onChange={(event) => setCustomReps(event.target.value)} className="h-12 rounded-2xl border border-line bg-white/80 px-3 outline-none" placeholder="自定义，例如 8/侧、40秒" />
            <button type="button" onClick={() => { if (customReps.trim()) setCurrentReps(customReps.trim()); setSheet(null); }} className="min-h-[54px] rounded-2xl bg-ink font-semibold text-white">保存次数</button>
          </div>
        </BottomSheet>
      );
    }
    if (sheet === 'sets') {
      return (
        <BottomSheet title="修改组数" onClose={() => setSheet(null)}>
          <div className="grid grid-cols-4 gap-2">
            {[3, 4, 5, 6].map((sets) => (
              <button key={sets} type="button" onClick={() => { setCurrentSets(sets); setSheet(null); }} className="min-h-[62px] rounded-2xl bg-white/80 text-lg font-bold text-ink shadow-soft">
                {sets}组
              </button>
            ))}
          </div>
        </BottomSheet>
      );
    }
    if (sheet === 'rest') {
      return (
        <BottomSheet title="修改休息时间" onClose={() => setSheet(null)}>
          <div className="grid grid-cols-3 gap-2">
            {[60, 90, 120, 150, 180, 240].map((seconds) => (
              <button key={seconds} type="button" onClick={() => { setCurrentRest(seconds); setSheet(null); }} className="min-h-[58px] rounded-2xl bg-white/80 font-semibold text-ink shadow-soft">
                {Math.round(seconds / 60)}:{String(seconds % 60).padStart(2, '0')}
              </button>
            ))}
          </div>
        </BottomSheet>
      );
    }
    if (sheet === 'status') {
      return (
        <BottomSheet title="状态调整" onClose={() => setSheet(null)}>
          <div className="grid gap-2">
            <button type="button" onClick={() => { reduceCurrentExercise(); setSheet(null); }} className="min-h-[54px] rounded-2xl bg-mountain/10 font-semibold text-mountain">降低强度</button>
            <button type="button" onClick={() => { setCurrentWeight((currentExercise.plannedWeight ?? 0) + 2.5); setSheet(null); }} className="min-h-[54px] rounded-2xl bg-white/80 font-semibold text-ink shadow-soft">增加强度</button>
            <button type="button" onClick={() => setSheet('weight')} className="min-h-[54px] rounded-2xl bg-white/80 font-semibold text-ink shadow-soft">修改重量</button>
            <button type="button" onClick={() => setSheet('reps')} className="min-h-[54px] rounded-2xl bg-white/80 font-semibold text-ink shadow-soft">修改次数</button>
            <button type="button" onClick={() => setSheet('sets')} className="min-h-[54px] rounded-2xl bg-white/80 font-semibold text-ink shadow-soft">修改组数</button>
            <button type="button" onClick={() => { reduceCurrentExercise(); setSheet(null); }} className="min-h-[54px] rounded-2xl bg-white/80 font-semibold text-ink shadow-soft">改轻量版</button>
            <button type="button" onClick={() => { skipCurrentExercise(); setSheet(null); }} className="min-h-[54px] rounded-2xl bg-amber-50 font-semibold text-amber-800">跳过当前动作</button>
            <button type="button" onClick={finishAndSave} className="min-h-[54px] rounded-2xl bg-red-50 font-semibold text-red-700">提前结束训练</button>
          </div>
        </BottomSheet>
      );
    }
    if (sheet === 'pause') {
      return (
        <BottomSheet title="暂停训练" onClose={() => setSheet(null)}>
          <div className="grid gap-2">
            <button type="button" onClick={() => setSheet(null)} className="min-h-[54px] rounded-2xl bg-ink font-semibold text-white">继续训练</button>
            <button type="button" onClick={onExit} className="min-h-[54px] rounded-2xl bg-white/80 font-semibold text-ink shadow-soft">暂停并返回首页</button>
            <button type="button" onClick={finishAndSave} className="min-h-[54px] rounded-2xl bg-mountain/10 font-semibold text-mountain">结束并保存</button>
            <button type="button" onClick={() => { update({ ...session, status: 'abandoned' }); onExit(); }} className="min-h-[54px] rounded-2xl bg-red-50 font-semibold text-red-700">放弃训练</button>
          </div>
        </BottomSheet>
      );
    }
    return (
      <BottomSheet title="疼痛反馈" onClose={() => setSheet(null)}>
        <div className="space-y-3">
          <div className="rounded-2xl bg-red-50 p-3 text-sm leading-6 text-red-700">疼痛明显时停止相关动作。评分 4 分以上建议暂停主项，改快走和拉伸。</div>
          <input className="h-12 w-full rounded-2xl border border-line bg-white/80 px-3 outline-none" placeholder="疼痛部位，例如膝、腰、肩" />
          <div className="grid grid-cols-5 gap-2">
            {[1, 3, 5, 7, 10].map((score) => <button key={score} type="button" className="min-h-[48px] rounded-2xl bg-white/80 font-semibold shadow-soft">{score}</button>)}
          </div>
          <button type="button" onClick={() => { update(completeCurrentSet(session, true)); setSheet(null); }} className="min-h-[54px] w-full rounded-2xl bg-red-50 font-semibold text-red-700">记录疼痛并结束本组</button>
        </div>
      </BottomSheet>
    );
  }

  return (
    <div className={`workout-screen h-[100dvh] overflow-hidden ${focusMode ? 'training-focus' : 'bg-paper'}`}>
      <header className="flex h-[116px] items-start justify-between gap-3 px-4 pt-[calc(env(safe-area-inset-top)+14px)]">
        <div className="min-w-0">
          <p className={`text-xs font-semibold uppercase tracking-[0.16em] ${focusMode ? 'text-white/55' : 'text-mountain'}`}>{getPhaseLabel(state.createdAt, today)}</p>
          <h1 className={`mt-1 truncate text-xl font-bold ${focusMode ? 'text-white' : 'text-ink'}`}>{session.workoutName}</h1>
          <p className={`mt-1 text-sm ${focusMode ? 'text-white/55' : 'text-muted'}`}>进度 {session.currentExerciseIndex + 1} / {session.exercises.length}</p>
        </div>
        <button type="button" onClick={() => setSheet('pause')} className={`flex min-h-[44px] items-center gap-1 rounded-full px-3 text-sm font-semibold shadow-soft ${focusMode ? 'bg-white/10 text-white' : 'bg-white text-ink'}`}>
          <Pause size={16} />
          暂停
        </button>
      </header>

      <main className="mx-auto flex h-[calc(100dvh-116px)] max-w-md flex-col px-4 pb-[calc(env(safe-area-inset-bottom)+14px)]">
        <div className={`min-h-0 flex-1 rounded-[34px] p-4 ${focusMode ? 'bg-white/[0.03] ring-1 ring-white/10' : 'border border-white/80 bg-white/72 shadow-card backdrop-blur'}`}>
          {renderCurrentState()}
        </div>
        {!['overview', 'summary'].includes(session.currentState) && (
          <div className="mt-3 grid grid-cols-3 gap-2">
            <button type="button" onClick={() => setSheet('plan')} className={`min-h-[48px] rounded-2xl text-sm font-semibold shadow-soft ${focusMode ? 'bg-white/10 text-white' : 'bg-white text-ink'}`}>
              <ListChecks size={16} className="mx-auto mb-1 text-mountain" />
              计划
            </button>
            <button type="button" onClick={() => setSheet('cue')} className={`min-h-[48px] rounded-2xl text-sm font-semibold shadow-soft ${focusMode ? 'bg-white/10 text-white' : 'bg-white text-ink'}`}>
              <AlertTriangle size={16} className="mx-auto mb-1 text-mountain" />
              提示
            </button>
            <button type="button" onClick={() => setSheet('status')} className={`min-h-[48px] rounded-2xl text-sm font-semibold shadow-soft ${focusMode ? 'bg-white/10 text-white' : 'bg-white text-ink'}`}>
              <SlidersHorizontal size={16} className="mx-auto mb-1 text-mountain" />
              调整
            </button>
          </div>
        )}
      </main>
      {renderSheet()}
    </div>
  );
}
