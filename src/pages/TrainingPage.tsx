import { Check, Copy, Droplets, Save } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Card } from '../components/Cards/Card';
import { RitualCard } from '../components/RitualCard';
import { WaterTracker } from '../components/WaterTracker';
import { defaultTrainingPlan } from '../data/defaultTrainingPlan';
import { getAdjustedTodayWeight, planToRecord } from '../rules/trainingRules';
import type { AppState, ExerciseRecord, TrainingSession, WaterLog } from '../types';
import { formatChineseDate, getDayKey, toDateKey } from '../utils/date';

interface TrainingPageProps {
  state: AppState;
  onSave: (session: TrainingSession) => void;
  onAddWater: (log: WaterLog) => void;
  onUndoWater: (date: string) => void;
}

function numberFromInput(value: string): number | undefined {
  if (value.trim() === '') return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function TrainingPage({ state, onSave, onAddWater, onUndoWater }: TrainingPageProps) {
  const today = toDateKey();
  const plan = defaultTrainingPlan[getDayKey(today)];
  const saved = state.trainingSessions[today];
  const todayLog = state.dailyLogs[today];
  const initial = useMemo<TrainingSession>(() => {
    if (saved) return saved;
    return {
      date: today,
      dayType: plan.dayType,
      exercises: plan.exercises.map((exercise) => {
        const record = planToRecord(exercise);
        return {
          ...record,
          plannedWeight: exercise.isMainLift ? getAdjustedTodayWeight(exercise.plannedWeight, todayLog) : exercise.plannedWeight,
        };
      }),
      notes: '',
    };
  }, [saved, plan, today, todayLog]);
  const [session, setSession] = useState<TrainingSession>(initial);
  const [savedNow, setSavedNow] = useState(false);
  const [trainingStarted, setTrainingStarted] = useState(Boolean(saved));
  const [justStarted, setJustStarted] = useState(false);
  const waterLogs = state.waterLogs[today] ?? [];
  const completedCount = session.exercises.filter((exercise) => exercise.completed).length;
  const completionRate = Math.round((completedCount / session.exercises.length) * 100);
  const painCount = session.exercises.filter((exercise) => exercise.pain).length;
  const highRpeCount = session.exercises.filter((exercise) => (exercise.rpe ?? 0) >= 9).length;
  const completionScore = Math.max(0, Math.min(100, completionRate - painCount * 8 - highRpeCount * 5));

  function updateExercise(index: number, patch: Partial<ExerciseRecord>) {
    setSession((current) => ({
      ...current,
      exercises: current.exercises.map((exercise, itemIndex) => (itemIndex === index ? { ...exercise, ...patch } : exercise)),
    }));
  }

  function fillPlan(index: number) {
    const exercise = session.exercises[index];
    updateExercise(index, {
      actualWeight: exercise.plannedWeight ?? undefined,
      actualSets: exercise.plannedSets,
      actualReps: exercise.plannedReps,
      completed: true,
    });
  }

  function copyPrevious(index: number) {
    const previous = session.exercises[index - 1];
    if (!previous) return;
    updateExercise(index, {
      actualWeight: previous.actualWeight,
      actualSets: previous.actualSets,
      actualReps: previous.actualReps,
      rpe: previous.rpe,
    });
  }

  function save() {
    onSave(session);
    setSavedNow(true);
    window.setTimeout(() => setSavedNow(false), 1800);
  }

  function startTraining() {
    setTrainingStarted(true);
    setJustStarted(true);
    window.setTimeout(() => setJustStarted(false), 1200);
  }

  return (
    <div className="space-y-4">
      <header className="pt-2">
        <div className="mb-4 h-1.5 w-20 rounded-full brush-stroke" />
        <p className="text-sm text-muted">{formatChineseDate(today)}</p>
        <h1 className="mt-2 text-2xl font-bold">训练记录</h1>
        <p className="mt-1 text-sm text-muted">{plan.dayType} · {plan.location}</p>
      </header>

      {!trainingStarted ? (
        <RitualCard
          eyebrow="准备开始"
          title="准备开始今日训练"
          body="今天只做一件事：完成计划，不追重量。睡眠差或疼痛明显时，主动降强度。"
          action={
            <button
              type="button"
              onClick={startTraining}
              className="w-full rounded-2xl bg-ink px-4 py-4 text-base font-semibold text-white shadow-card"
            >
              进入训练
            </button>
          }
        >
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-2xl bg-white/80 p-3">
              <p className="text-xs text-muted">今日训练</p>
              <p className="mt-1 text-sm font-semibold">{plan.dayType}</p>
            </div>
            <div className="rounded-2xl bg-white/80 p-3">
              <p className="text-xs text-muted">预计时长</p>
              <p className="mt-1 text-sm font-semibold">{plan.estimatedMinutes} 分钟</p>
            </div>
          </div>
        </RitualCard>
      ) : (
        <>
          {justStarted && (
            <div className="rounded-[26px] border border-blue-100 bg-blue-50 p-4 text-center text-sm font-semibold text-coach shadow-soft">
              训练开始。按计划执行，动作稳定优先。
            </div>
          )}
          <Card title="训练陪伴" subtitle="组间休息提示，不打断训练流程。">
            <div className="rest-glow rounded-[24px] bg-white p-4 text-sm leading-6 text-muted">
              <div className="mb-2 flex items-center gap-2 font-semibold text-ink">
                <Droplets size={18} className="text-coach" />
                小口喝水，保持状态。
              </div>
              长训练超过 45 分钟时补一次水。不要每组都灌水，也不要完全不喝。
            </div>
          </Card>
        </>
      )}

      <Card title="今日计划" subtitle={plan.summary}>
        <div className="rounded-2xl bg-surface p-3 text-sm leading-6 text-muted">
          替代方案：{plan.alternative}
        </div>
      </Card>

      {trainingStarted && (
        <WaterTracker
          date={today}
          profile={state.profile}
          todayPlan={plan}
          logs={waterLogs}
          compact
          showHistory={false}
          onAdd={onAddWater}
          onUndo={() => onUndoWater(today)}
        />
      )}

      <div className="space-y-3">
        {session.exercises.map((exercise, index) => (
          <Card key={`${exercise.name}-${index}`} title={exercise.name}>
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-2xl bg-surface p-2">
                  <p className="text-xs text-muted">计划重量</p>
                  <p className="font-semibold">{exercise.plannedWeight ? `${exercise.plannedWeight}kg` : plan.exercises[index].weightDisplay}</p>
                </div>
                <div className="rounded-2xl bg-surface p-2">
                  <p className="text-xs text-muted">组数</p>
                  <p className="font-semibold">{exercise.plannedSets}</p>
                </div>
                <div className="rounded-2xl bg-surface p-2">
                  <p className="text-xs text-muted">次数</p>
                  <p className="font-semibold">{exercise.plannedReps}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <label>
                  <span className="mb-1 block text-xs text-muted">实际重量</span>
                  <input
                    type="number"
                    value={exercise.actualWeight ?? ''}
                    onChange={(event) => updateExercise(index, { actualWeight: numberFromInput(event.target.value) })}
                    className="h-12 w-full rounded-2xl border border-line px-3 outline-none"
                    placeholder="kg"
                  />
                </label>
                <label>
                  <span className="mb-1 block text-xs text-muted">完成组数</span>
                  <input
                    type="number"
                    value={exercise.actualSets ?? ''}
                    onChange={(event) => updateExercise(index, { actualSets: numberFromInput(event.target.value) })}
                    className="h-12 w-full rounded-2xl border border-line px-3 outline-none"
                    placeholder="组"
                  />
                </label>
                <label>
                  <span className="mb-1 block text-xs text-muted">实际次数</span>
                  <input
                    value={exercise.actualReps ?? ''}
                    onChange={(event) => updateExercise(index, { actualReps: event.target.value })}
                    className="h-12 w-full rounded-2xl border border-line px-3 outline-none"
                    placeholder="次"
                  />
                </label>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-medium">RPE</span>
                  <span className="text-muted">{exercise.rpe ?? '未选'}</span>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {[5, 6, 7, 8, 9, 10].map((rpe) => (
                    <button
                      key={rpe}
                      type="button"
                      onClick={() => updateExercise(index, { rpe })}
                      className={`rounded-xl border text-sm font-semibold ${
                        exercise.rpe === rpe ? 'border-coach bg-blue-50 text-coach' : 'border-line bg-white text-ink'
                      }`}
                    >
                      {rpe}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => updateExercise(index, { completed: !exercise.completed })}
                  className={`rounded-2xl px-3 py-2 text-sm font-semibold ${
                    exercise.completed ? 'bg-green-50 text-green-700' : 'bg-surface text-ink'
                  }`}
                >
                  {exercise.completed ? '已完成' : '标记完成'}
                </button>
                <button
                  type="button"
                  onClick={() => updateExercise(index, { pain: !exercise.pain })}
                  className={`rounded-2xl px-3 py-2 text-sm font-semibold ${
                    exercise.pain ? 'bg-red-50 text-red-700' : 'bg-surface text-ink'
                  }`}
                >
                  {exercise.pain ? '有疼痛' : '无疼痛'}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => fillPlan(index)}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-blue-50 px-3 py-2 text-sm font-semibold text-coach"
                >
                  <Check size={16} />
                  填入计划
                </button>
                <button
                  type="button"
                  onClick={() => copyPrevious(index)}
                  disabled={index === 0}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-surface px-3 py-2 text-sm font-semibold text-ink disabled:opacity-40"
                >
                  <Copy size={16} />
                  复制上项
                </button>
              </div>

              <textarea
                value={exercise.notes ?? ''}
                onChange={(event) => updateExercise(index, { notes: event.target.value })}
                rows={2}
                className="w-full rounded-2xl border border-line p-3 text-base outline-none"
                placeholder="动作备注，可选"
              />
            </div>
          </Card>
        ))}
      </div>

      <Card title="训练备注">
        <textarea
          value={session.notes ?? ''}
          onChange={(event) => setSession({ ...session, notes: event.target.value })}
          rows={3}
          className="w-full rounded-2xl border border-line p-3 text-base outline-none"
          placeholder="整体训练感受，可选"
        />
      </Card>

      {completedCount > 0 && (
        <RitualCard
          eyebrow="训练完成"
          title="训练完成"
          body="今天完成了最重要的事。保存记录后，建议页会根据 RPE、疼痛和睡眠给出明天调整。"
          score={`${completionScore}`}
        >
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-2xl bg-white/80 p-3">
              <p className="text-xs text-muted">完成率</p>
              <p className="mt-1 text-lg font-semibold">{completionRate}%</p>
            </div>
            <div className="rounded-2xl bg-white/80 p-3">
              <p className="text-xs text-muted">关键表现</p>
              <p className="mt-1 text-sm font-semibold">{painCount ? '有疼痛，需降强度' : '动作记录有效'}</p>
            </div>
          </div>
          <p className="mt-3 rounded-2xl bg-blue-50 p-3 text-sm leading-6 text-blue-900">
            训练后建议补水 500ml 左右，配合第二餐恢复。
          </p>
        </RitualCard>
      )}

      <button
        type="button"
        onClick={save}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-ink px-4 py-4 text-base font-semibold text-white shadow-card"
      >
        <Save size={19} />
        {savedNow ? '已保存' : '保存训练记录'}
      </button>
    </div>
  );
}
