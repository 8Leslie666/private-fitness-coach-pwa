import type { AppState, WorkoutSession } from '../types';

export function upsertWorkoutSession(state: AppState, session: WorkoutSession): AppState {
  return {
    ...state,
    workoutSessions: {
      ...state.workoutSessions,
      [session.date]: session,
    },
  };
}
