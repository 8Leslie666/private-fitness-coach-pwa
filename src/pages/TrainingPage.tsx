import { Check, Copy, Save } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Card } from '../components/Cards/Card';
import { defaultTrainingPlan } from '../data/defaultTrainingPlan';
import { getAdjustedTodayWeight, planToRecord } from '../rules/trainingRules';
import type { AppState, ExerciseRecord, TrainingSession } from '../types';
import { formatChineseDate, getDayKey, toDateKey } from '../utils/date';

interface TrainingPageProps {
  state: AppState;
  onSave: (session: TrainingSession) => void;
}

function numberFromInput(value: string): number | undefined {
  if (value.trim() === '') return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function TrainingPage({ state, onSave }: TrainingPageProps) {
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

  return (
    <div className="space-y-4">
      <header className="pt-2">
        <div className="mb-4 h-1.5 w-20 rounded-full brush-stroke" />
        <p className="text-sm text-muted">{formatChineseDate(today)}</p>
        <h1 className="mt-2 text-2xl font-bold">训练记录</h1>
        <p className="mt-1 text-sm text-muted">{plan.dayType} · {plan.location}</p>
      </header>

      <Card title="今日计划" subtitle={plan.summary}>
        <div className="rounded-2xl bg-surface p-3 text-sm leading-6 text-muted">
          替代方案：{plan.alternative}
        </div>
      </Card>

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
