export type WorkoutStatus = 'not_started' | 'in_progress' | 'completed' | 'abandoned';

export type WorkoutState =
  | 'overview'
  | 'warmup'
  | 'active_set'
  | 'set_feedback'
  | 'rest'
  | 'next_exercise'
  | 'cooldown'
  | 'summary';

export type TimerMode = 'active_set' | 'rest' | 'idle';

export interface TimerState {
  mode: TimerMode;
  startedAt?: string;
  plannedSeconds: number;
  extendedSeconds: number;
  completedAt?: string;
}

export interface WorkoutSet {
  setIndex: number;
  plannedWeight: number | null;
  plannedReps: string;
  actualWeight?: number;
  actualReps?: string;
  startedAt?: string;
  completedAt?: string;
  durationSeconds?: number;
  rpe?: number;
  completed: boolean;
  pain: boolean;
  painLocation?: string;
  painScore?: number;
}

export interface WorkoutExercise {
  id: string;
  name: string;
  category: 'main' | 'accessory' | 'core' | 'warmup' | 'cooldown';
  plannedWeight: number | null;
  plannedSets: number;
  plannedReps: string;
  restSeconds: number;
  targetRpe: string;
  cue: string;
  sets: WorkoutSet[];
  completed: boolean;
}

export interface WorkoutSession {
  id: string;
  date: string;
  workoutName: string;
  status: WorkoutStatus;
  startedAt?: string;
  completedAt?: string;
  currentExerciseIndex: number;
  currentSetIndex: number;
  currentState: WorkoutState;
  exercises: WorkoutExercise[];
  timer: TimerState;
  totalDuration?: number;
  completionRate: number;
  loweredIntensity?: boolean;
  shortVersion?: boolean;
}
