import { Droplets, RotateCcw } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Card } from './Cards/Card';
import { calculateWaterGoal, createWaterLog, getWaterAdvice, getWaterSummary } from '../rules/waterRules';
import type { TrainingPlanDay, UserProfile } from '../types';
import type { WaterLog } from '../types/water';

interface WaterTrackerProps {
  date: string;
  profile: UserProfile;
  todayPlan: TrainingPlanDay;
  logs: WaterLog[];
  compact?: boolean;
  showHistory?: boolean;
  onAdd: (log: WaterLog) => void;
  onUndo: () => void;
  onDetails?: () => void;
}

function sourceLabel(source: WaterLog['source']): string {
  if (source === 'quick') return '快捷';
  if (source === 'reminder') return '提醒后';
  return '手动';
}

export function WaterTracker({
  date,
  profile,
  todayPlan,
  logs,
  compact = false,
  showHistory = true,
  onAdd,
  onUndo,
  onDetails,
}: WaterTrackerProps) {
  const [customAmount, setCustomAmount] = useState('');
  const [feedback, setFeedback] = useState('');
  const goal = useMemo(() => calculateWaterGoal(profile, todayPlan, date), [profile, todayPlan, date]);
  const summary = useMemo(() => getWaterSummary(date, goal, logs), [date, goal, logs]);
  const advice = getWaterAdvice(summary, goal);
  const progressStyle = {
    background: `conic-gradient(#2f6feb ${summary.completionRate * 3.6}deg, #eef3ff 0deg)`,
  };

  function addAmount(amountMl: number, source: WaterLog['source']) {
    if (!amountMl || amountMl <= 0) return;
    onAdd(createWaterLog(amountMl, source));
    setFeedback(`已记录 ${amountMl}ml`);
    window.setTimeout(() => setFeedback(''), 1600);
  }

  function addCustom() {
    const amount = Number(customAmount);
    if (!Number.isFinite(amount) || amount <= 0) return;
    addAmount(Math.round(amount), 'custom');
    setCustomAmount('');
  }

  return (
    <Card
      title="今日饮水"
      subtitle={`${summary.consumedMl} / ${summary.goalMl}ml · 剩余 ${summary.remainingMl}ml`}
      className="water-card"
      action={
        onDetails ? (
          <button type="button" onClick={onDetails} className="rounded-full bg-blue-50 px-3 py-2 text-sm font-semibold text-coach">
            查看详情
          </button>
        ) : undefined
      }
    >
      <div className={`grid gap-4 ${compact ? '' : 'sm:grid-cols-[148px_1fr]'}`}>
        <div className="mx-auto flex flex-col items-center">
          <div className="water-ring" style={progressStyle}>
            <div className="water-ring-inner">
              <Droplets size={22} className="text-coach" />
              <p className="mt-1 text-2xl font-bold text-ink">{summary.completionRate}%</p>
              <p className="text-xs text-muted">{summary.consumedMl}ml</p>
            </div>
          </div>
          <div className="mt-3 h-1.5 w-24 rounded-full brush-stroke" />
        </div>

        <div className="space-y-3">
          <div className="rounded-[22px] bg-surface p-3 text-sm leading-6 text-muted">
            <p className="font-medium text-ink">{goal.reason}</p>
            <p className="mt-1">{advice}</p>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[200, 300, 500].map((amount) => (
              <button
                key={amount}
                type="button"
                onClick={() => addAmount(amount, 'quick')}
                className="rounded-2xl bg-blue-50 px-3 py-3 text-sm font-semibold text-coach active:scale-[0.98]"
              >
                +{amount}ml
              </button>
            ))}
          </div>

          {!compact && (
            <div className="grid grid-cols-[1fr_auto] gap-2">
              <input
                type="number"
                value={customAmount}
                onChange={(event) => setCustomAmount(event.target.value)}
                placeholder="自定义 ml"
                className="h-12 rounded-2xl border border-line bg-white px-3 outline-none"
              />
              <button type="button" onClick={addCustom} className="rounded-2xl bg-ink px-4 py-2 text-sm font-semibold text-white">
                记录
              </button>
            </div>
          )}

          <div className="flex items-center justify-between gap-2">
            <p className="min-h-5 text-sm font-medium text-coach">{feedback}</p>
            <button
              type="button"
              onClick={onUndo}
              disabled={!logs.length}
              className="flex items-center gap-1 rounded-full bg-surface px-3 py-2 text-sm font-semibold text-ink disabled:opacity-40"
            >
              <RotateCcw size={15} />
              撤销上一次
            </button>
          </div>
        </div>
      </div>

      {showHistory && !compact && (
        <div className="mt-4 space-y-2">
          <p className="text-sm font-semibold text-ink">今日记录</p>
          {logs.length ? (
            logs
              .slice()
              .reverse()
              .slice(0, 6)
              .map((log) => (
                <div key={log.id} className="flex items-center justify-between rounded-2xl bg-surface px-3 py-2 text-sm">
                  <span className="text-muted">{log.time} · {sourceLabel(log.source)}</span>
                  <span className="font-semibold text-ink">{log.amountMl}ml</span>
                </div>
              ))
          ) : (
            <p className="rounded-2xl bg-surface p-3 text-sm text-muted">今天还没有饮水记录。</p>
          )}
        </div>
      )}
    </Card>
  );
}
