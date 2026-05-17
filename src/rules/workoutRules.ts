import type { ExerciseRecord, TrainingPlanDay, TrainingSession } from '../types';
import type { TimerState, WorkoutExercise, WorkoutSession, WorkoutSet } from '../types/workout';

function nowIso(): string {
  return new Date().toISOString();
}

function secondsBetween(start?: string, end = nowIso()): number {
  if (!start) return 0;
  return Math.max(0, Math.floor((new Date(end).getTime() - new Date(start).getTime()) / 1000));
}

function categoryForExercise(index: number, name: string): WorkoutExercise['category'] {
  if (index === 0) return 'main';
  if (name.includes('平板') || name.includes('侧桥') || name.includes('死虫') || name.includes('卷腹')) return 'core';
  return 'accessory';
}

function cueForExercise(name: string): string {
  if (name.includes('深蹲')) return '脚掌踩稳，起身不要先抬屁股。';
  if (name.includes('卧推')) return '肩胛收紧，杠铃路径稳定。';
  if (name.includes('硬拉')) return '先收紧背，再让杠贴近身体。';
  if (name.includes('划船') || name.includes('下拉')) return '先动肩胛，不要耸肩借力。';
  if (name.includes('支撑') || name.includes('死虫') || name.includes('侧桥')) return '核心收紧，动作慢一点。';
  return '动作稳定优先，不追重量。';
}

function restForExercise(category: WorkoutExercise['category']): number {
  if (category === 'main') return 150;
  if (category === 'core') return 60;
  return 90;
}

function targetRpeForExercise(category: WorkoutExercise['category']): string {
  return category === 'main' ? '6-7' : '7';
}

function createSets(plannedSets: number, plannedWeight: number | null, plannedReps: string): WorkoutSet[] {
  return Array.from({ length: plannedSets }, (_, index) => ({
    setIndex: index,
    plannedWeight,
    plannedReps,
    completed: false,
    pain: false,
  }));
}

export function createWorkoutSession(date: string, plan: TrainingPlanDay): WorkoutSession {
  const exercises = plan.exercises.map((exercise, index): WorkoutExercise => {
    const category = categoryForExercise(index, exercise.name);
    return {
      id: `${date}-${index}-${exercise.name}`,
      name: exercise.name,
      category,
      plannedWeight: exercise.plannedWeight,
      actualWeight: exercise.plannedWeight,
      plannedSets: exercise.plannedSets,
      actualSets: exercise.plannedSets,
      plannedReps: exercise.plannedReps,
      actualReps: exercise.plannedReps,
      restSeconds: restForExercise(category),
      targetRpe: targetRpeForExercise(category),
      cue: cueForExercise(exercise.name),
      sets: createSets(exercise.plannedSets, exercise.plannedWeight, exercise.plannedReps),
      completed: false,
    };
  });

  return {
    id: `${date}-${plan.dayKey}`,
    date,
    title: plan.dayType,
    workoutName: plan.dayType,
    phase: '恢复减脂期',
    status: 'not_started',
    estimatedDuration: plan.estimatedMinutes,
    currentStepIndex: 0,
    currentExerciseIndex: 0,
    currentSetIndex: 0,
    currentState: 'overview',
    exercises,
    timer: {
      mode: 'idle',
      plannedSeconds: 0,
      extendedSeconds: 0,
    },
    completionRate: 0,
  };
}

export function getCurrentExercise(session: WorkoutSession): WorkoutExercise {
  return session.exercises[Math.min(session.currentExerciseIndex, session.exercises.length - 1)];
}

export function getCurrentSet(session: WorkoutSession): WorkoutSet {
  const exercise = getCurrentExercise(session);
  return exercise.sets[Math.min(session.currentSetIndex, exercise.sets.length - 1)];
}

export function getElapsedSeconds(timer: TimerState): number {
  if (!timer.startedAt) return 0;
  const end = timer.completedAt ?? nowIso();
  return secondsBetween(timer.startedAt, end);
}

export function getRemainingRestSeconds(timer: TimerState): number {
  if (timer.mode !== 'rest') return 0;
  return Math.max(timer.plannedSeconds + timer.extendedSeconds - getElapsedSeconds(timer), 0);
}

export function formatTimer(seconds: number): string {
  const safe = Math.max(0, seconds);
  const minutes = Math.floor(safe / 60);
  const rest = safe % 60;
  return `${String(minutes).padStart(2, '0')}:${String(rest).padStart(2, '0')}`;
}

export function calculateWorkoutCompletion(session: WorkoutSession): number {
  const sets = session.exercises.flatMap((exercise) => exercise.sets);
  if (!sets.length) return 0;
  const completed = sets.filter((set) => set.completed).length;
  return Math.round((completed / sets.length) * 100);
}

export function startWorkout(session: WorkoutSession, mode: 'normal' | 'lowered' | 'short' = 'normal'): WorkoutSession {
  return {
    ...session,
    status: 'in_progress',
    startedAt: session.startedAt ?? nowIso(),
    currentState: 'warmup',
    loweredIntensity: mode === 'lowered',
    shortVersion: mode === 'short',
  };
}

export function finishWarmup(session: WorkoutSession): WorkoutSession {
  return {
    ...session,
    currentState: 'active_set',
    currentExerciseIndex: 0,
    currentSetIndex: 0,
    timer: { mode: 'idle', plannedSeconds: 0, extendedSeconds: 0 },
  };
}

export function startCurrentSet(session: WorkoutSession): WorkoutSession {
  const exercises = session.exercises.map((exercise, exerciseIndex) => {
    if (exerciseIndex !== session.currentExerciseIndex) return exercise;
    return {
      ...exercise,
      sets: exercise.sets.map((set, setIndex) =>
        setIndex === session.currentSetIndex ? { ...set, startedAt: nowIso() } : set,
      ),
    };
  });

  return {
    ...session,
    currentState: 'active_set',
    exercises,
    timer: { mode: 'active_set', startedAt: nowIso(), plannedSeconds: 0, extendedSeconds: 0 },
  };
}

export function completeCurrentSet(session: WorkoutSession, pain = false): WorkoutSession {
  const completedAt = nowIso();
  const exercises = session.exercises.map((exercise, exerciseIndex) => {
    if (exerciseIndex !== session.currentExerciseIndex) return exercise;
    return {
      ...exercise,
      sets: exercise.sets.map((set, setIndex) =>
        setIndex === session.currentSetIndex
          ? {
              ...set,
              actualWeight: set.plannedWeight ?? undefined,
              actualReps: set.plannedReps,
              completedAt,
              durationSeconds: secondsBetween(set.startedAt, completedAt),
              pain: set.pain || pain,
            }
          : set,
      ),
    };
  });

  return {
    ...session,
    currentState: 'set_feedback',
    exercises,
    timer: { ...session.timer, completedAt },
  };
}

export function abandonCurrentSet(session: WorkoutSession): WorkoutSession {
  const completedAt = nowIso();
  const exercises = session.exercises.map((exercise, exerciseIndex) => {
    if (exerciseIndex !== session.currentExerciseIndex) return exercise;
    return {
      ...exercise,
      sets: exercise.sets.map((set, setIndex) =>
        setIndex === session.currentSetIndex
          ? { ...set, completedAt, durationSeconds: secondsBetween(set.startedAt, completedAt), completed: false }
          : set,
      ),
    };
  });

  return {
    ...session,
    currentState: 'set_feedback',
    exercises,
    timer: { ...session.timer, completedAt },
  };
}

export function applySetRpe(session: WorkoutSession, rpe: number): WorkoutSession {
  const currentExercise = getCurrentExercise(session);
  const isLastSet = session.currentSetIndex >= currentExercise.sets.length - 1;
  const isLastExercise = session.currentExerciseIndex >= session.exercises.length - 1;
  const completedAt = nowIso();

  const exercises = session.exercises.map((exercise, exerciseIndex) => {
    if (exerciseIndex !== session.currentExerciseIndex) return exercise;
    const sets = exercise.sets.map((set, setIndex) =>
      setIndex === session.currentSetIndex
        ? {
            ...set,
            rpe,
            completed: true,
            actualWeight: set.actualWeight ?? set.plannedWeight ?? undefined,
            actualReps: set.actualReps ?? set.plannedReps,
            completedAt: set.completedAt ?? completedAt,
          }
        : set,
    );
    return {
      ...exercise,
      sets,
      completed: sets.every((set) => set.completed || set.completedAt),
    };
  });

  const nextState = isLastSet ? (isLastExercise ? 'cooldown' : 'next_exercise') : 'rest';

  return {
    ...session,
    exercises,
    currentState: nextState,
    timer:
      nextState === 'rest'
        ? { mode: 'rest', startedAt: nowIso(), plannedSeconds: currentExercise.restSeconds, extendedSeconds: 0 }
        : { mode: 'idle', plannedSeconds: 0, extendedSeconds: 0 },
    completionRate: calculateWorkoutCompletion({ ...session, exercises }),
  };
}

export function extendRest(session: WorkoutSession, seconds: number): WorkoutSession {
  return {
    ...session,
    timer: {
      ...session.timer,
      extendedSeconds: session.timer.extendedSeconds + seconds,
    },
  };
}

export function startNextSet(session: WorkoutSession): WorkoutSession {
  const exercise = getCurrentExercise(session);
  const nextSetIndex = Math.min(session.currentSetIndex + 1, exercise.sets.length - 1);
  return {
    ...session,
    currentSetIndex: nextSetIndex,
    currentState: 'active_set',
    timer: { mode: 'idle', plannedSeconds: 0, extendedSeconds: 0 },
  };
}

export function startNextExercise(session: WorkoutSession): WorkoutSession {
  const nextExerciseIndex = Math.min(session.currentExerciseIndex + 1, session.exercises.length - 1);
  return {
    ...session,
    currentExerciseIndex: nextExerciseIndex,
    currentSetIndex: 0,
    currentState: 'active_set',
    timer: { mode: 'idle', plannedSeconds: 0, extendedSeconds: 0 },
  };
}

export function finishCooldown(session: WorkoutSession): WorkoutSession {
  const completedAt = nowIso();
  const totalDuration = secondsBetween(session.startedAt, completedAt);
  return {
    ...session,
    status: 'completed',
    completedAt,
    currentState: 'summary',
    timer: { mode: 'idle', plannedSeconds: 0, extendedSeconds: 0 },
    totalDuration,
    actualDuration: totalDuration,
    completionRate: calculateWorkoutCompletion(session),
    summary: '完成计划优先，训练后补水 500ml 左右，第二餐保证蛋白质。',
  };
}

export function workoutToTrainingSession(session: WorkoutSession): TrainingSession {
  const exercises: ExerciseRecord[] = session.exercises.map((exercise) => {
    const completedSets = exercise.sets.filter((set) => set.completed);
    const averageRpe = completedSets.length
      ? Math.round(completedSets.reduce((sum, set) => sum + (set.rpe ?? 0), 0) / completedSets.length)
      : undefined;
    return {
      name: exercise.name,
      plannedWeight: exercise.plannedWeight,
      actualWeight: completedSets[0]?.actualWeight,
      plannedSets: exercise.plannedSets,
      actualSets: completedSets.length || undefined,
      plannedReps: exercise.plannedReps,
      actualReps: completedSets[0]?.actualReps,
      rpe: averageRpe,
      completed: completedSets.length > 0,
      pain: exercise.sets.some((set) => set.pain),
      notes: '',
    };
  });

  return {
    date: session.date,
    dayType: session.workoutName,
    exercises,
    notes: `训练陪伴模式完成率 ${session.completionRate}%`,
  };
}
