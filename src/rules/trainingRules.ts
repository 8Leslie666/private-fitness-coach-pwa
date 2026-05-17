import type { DailyLog, ExercisePlan, ExerciseRecord, MainLift, TrainingSession } from '../types';
import { calculateSleepHours } from '../utils/calculations';

export function planToRecord(plan: ExercisePlan): ExerciseRecord {
  return {
    name: plan.name,
    plannedWeight: plan.plannedWeight,
    plannedSets: plan.plannedSets,
    plannedReps: plan.plannedReps,
    completed: false,
    pain: false,
    notes: '',
  };
}

export function getMainLift(name: string): MainLift | undefined {
  if (name === '深蹲') return '深蹲';
  if (name === '卧推') return '卧推';
  if (name === '硬拉') return '硬拉';
  return undefined;
}

export function getAdjustedTodayWeight(plannedWeight: number | null, log?: DailyLog): number | null {
  if (plannedWeight === null) return null;
  const sleepHours = calculateSleepHours(log?.sleepStart, log?.sleepEnd);
  if (sleepHours !== undefined && sleepHours < 6) {
    return Math.round((plannedWeight * 0.9) / 2.5) * 2.5;
  }
  return plannedWeight;
}

export function getExerciseWeightAdvice(record: ExerciseRecord, log?: DailyLog): string | undefined {
  const lift = getMainLift(record.name);
  if (!lift) return undefined;

  const weight = record.actualWeight ?? record.plannedWeight;
  if (!weight) return `${lift} 没有记录实际重量，下次先按计划重量执行。`;

  const painScore = log?.painScore ?? 0;
  if (record.pain || painScore > 0) {
    if (painScore >= 7) return `${lift} 疼痛评分过高，停止相关动作，休息并评估。`;
    if (painScore >= 4) return `${lift} 暂停主项，改不诱发疼痛的替代训练。`;
    return `${lift} 下次降重 10%，并减少 1-2 组。`;
  }

  const rpe = record.rpe ?? 0;
  if (!record.completed) return `${lift} 未完成，下次维持或降低 5%，先保证动作稳定。`;
  if (rpe >= 9) return `${lift} RPE 达到 9 或更高，下次降重 5%-10%。`;
  if (rpe >= 8) return `${lift} RPE 约 8，动作稳定时下次维持 ${weight}kg。`;
  if (rpe > 0 && rpe <= 7) {
    const increment = lift === '卧推' ? 2.5 : rpe <= 6 ? 5 : 2.5;
    return `${lift} 完成且 RPE 不高，下次建议 ${weight + increment}kg。`;
  }
  return `${lift} 已记录完成，下次先维持 ${weight}kg，补齐 RPE 后再判断加重量。`;
}

export function getWeightAdjustmentAdvice(session?: TrainingSession, log?: DailyLog): string[] {
  if (!session) return ['今天还没有训练记录，无法判断下次重量。'];
  const advices = session.exercises
    .map((exercise) => getExerciseWeightAdvice(exercise, log))
    .filter((advice): advice is string => Boolean(advice));
  return advices.length ? advices : ['今天没有主项记录，按恢复任务执行即可。'];
}

export function getLatestMainLiftProgress(
  sessions: Record<string, TrainingSession>,
  lift: MainLift,
  weekStart: string,
  weekEnd: string,
): string {
  const records = Object.values(sessions)
    .filter((session) => session.date >= weekStart && session.date <= weekEnd)
    .flatMap((session) => session.exercises.map((exercise) => ({ date: session.date, exercise })))
    .filter(({ exercise }) => getMainLift(exercise.name) === lift && exercise.completed);

  if (!records.length) return '本周无有效记录';

  const first = records[0];
  const last = records[records.length - 1];
  const firstWeight = first.exercise.actualWeight ?? first.exercise.plannedWeight;
  const lastWeight = last.exercise.actualWeight ?? last.exercise.plannedWeight;
  if (!firstWeight || !lastWeight) return '已完成，但重量记录不足';
  if (firstWeight === lastWeight) return `${lastWeight}kg，维持`;
  const diff = Math.round((lastWeight - firstWeight) * 10) / 10;
  return `${firstWeight}kg -> ${lastWeight}kg（${diff > 0 ? '+' : ''}${diff}kg）`;
}
