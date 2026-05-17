import { Save } from 'lucide-react';
import { useState } from 'react';
import { Card } from '../components/Cards/Card';
import { TextField } from '../components/Forms/TextField';
import type { AppState, DailyLog, WaterLog, WaterReminderSettings } from '../types';
import { calculateSleepHours } from '../utils/calculations';
import { formatChineseDate, toDateKey } from '../utils/date';

interface CheckInPageProps {
  state: AppState;
  onSave: (log: DailyLog) => void;
  onAddWater?: (log: WaterLog) => void;
  onUndoWater?: (date: string) => void;
  onWaterSettingsChange?: (settings: WaterReminderSettings) => void;
}

function toNumber(value: string): number | undefined {
  if (value.trim() === '') return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function CheckInPage({ state, onSave }: CheckInPageProps) {
  const today = toDateKey();
  const saved = state.dailyLogs[today];
  const [form, setForm] = useState<DailyLog>({
    date: today,
    weight: saved?.weight,
    sleepStart: saved?.sleepStart ?? '00:30',
    sleepEnd: saved?.sleepEnd ?? '08:30',
    sleepQuality: saved?.sleepQuality ?? 7,
    steps: saved?.steps,
    dietScore: saved?.dietScore,
    fatigueScore: saved?.fatigueScore,
    painScore: saved?.painScore ?? 0,
    notes: saved?.notes ?? '',
  });
  const [savedNow, setSavedNow] = useState(false);
  const sleepHours = calculateSleepHours(form.sleepStart, form.sleepEnd);

  function save() {
    onSave(form);
    setSavedNow(true);
    window.setTimeout(() => setSavedNow(false), 1400);
  }

  return (
    <div className="page-slide space-y-4">
      <header className="pt-2">
        <div className="mb-4 h-1.5 w-20 rounded-full brush-stroke" />
        <p className="text-sm text-muted">{formatChineseDate(today)}</p>
        <h1 className="mt-2 text-2xl font-bold">每日记录</h1>
      </header>

      <Card title="今日基础记录" subtitle="体重、睡眠、步数先记录清楚。">
        <div className="space-y-4">
          <TextField label="今日体重" type="number" suffix="kg" value={form.weight} onChange={(value) => setForm({ ...form, weight: toNumber(value) })} placeholder="70.0" />
          <div className="grid grid-cols-2 gap-3">
            <TextField label="入睡" type="time" value={form.sleepStart} onChange={(value) => setForm({ ...form, sleepStart: value })} />
            <TextField label="起床" type="time" value={form.sleepEnd} onChange={(value) => setForm({ ...form, sleepEnd: value })} />
          </div>
          {sleepHours !== undefined && <div className="rounded-2xl bg-surface p-3 text-sm text-muted">睡眠时长：{sleepHours} 小时</div>}
          <TextField label="今日步数" type="number" suffix="步" value={form.steps} onChange={(value) => setForm({ ...form, steps: toNumber(value) })} placeholder="8000" />
        </div>
      </Card>

      <Card title="快速状态" subtitle="用 1-10 分粗略记录即可。">
        <div className="grid grid-cols-3 gap-2">
          {[
            ['饮食', 'dietScore'],
            ['疲劳', 'fatigueScore'],
            ['疼痛', 'painScore'],
          ].map(([label, key]) => (
            <label key={key} className="rounded-2xl bg-surface p-3 text-sm">
              <span className="text-muted">{label}</span>
              <input
                type="number"
                min={0}
                max={10}
                value={(form[key as keyof DailyLog] as number | undefined) ?? ''}
                onChange={(event) => setForm({ ...form, [key]: toNumber(event.target.value) })}
                className="mt-2 h-11 w-full rounded-xl border border-line bg-white px-3 outline-none"
              />
            </label>
          ))}
        </div>
      </Card>

      <button type="button" onClick={save} className="flex min-h-[58px] w-full items-center justify-center gap-2 rounded-[22px] bg-ink px-4 text-base font-semibold text-white shadow-card">
        <Save size={18} />
        {savedNow ? '已保存' : '保存记录'}
      </button>
    </div>
  );
}
