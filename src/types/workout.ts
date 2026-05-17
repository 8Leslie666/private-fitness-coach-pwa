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
  actualWeight?: number | null;
  plannedSets: number;
  actualSets?: number;
  plannedReps: string;
  actualReps?: string;
  restSeconds: number;
  targetRpe: string;
  cue: string;
  sets: WorkoutSet[];
  skipped?: boolean;
  completed: boolean;
}

export interface WorkoutSession {
  id: string;
  date: string;
  title?: string;
  workoutName: string;
  phase?: string;
  status: WorkoutStatus;
  startedAt?: string;
  completedAt?: string;
  estimatedDuration?: number;
  actualDuration?: number;
  currentStepIndex?: number;
  currentExerciseIndex: number;
  currentSetIndex: number;
  currentState: WorkoutState;
  exercises: WorkoutExercise[];
  timer: TimerState;
  totalDuration?: number;
  completionRate: number;
  summary?: string;
  loweredIntensity?: boolean;
  shortVersion?: boolean;
}
