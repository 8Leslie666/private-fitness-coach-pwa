import { Save } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Card } from '../components/Cards/Card';
import { RatingButtons } from '../components/Forms/RatingButtons';
import { TextField } from '../components/Forms/TextField';
import { WaterReminderCard } from '../components/WaterReminderCard';
import { WaterTracker } from '../components/WaterTracker';
import { defaultTrainingPlan } from '../data/defaultTrainingPlan';
import { generateCoachAdvice } from '../rules/coachRules';
import type { AppState, DailyLog, WaterLog, WaterReminderSettings } from '../types';
import { calculateSleepHours } from '../utils/calculations';
import { formatChineseDate, getDayKey, toDateKey } from '../utils/date';

interface CheckInPageProps {
  state: AppState;
  onSave: (log: DailyLog) => void;
  onAddWater: (log: WaterLog) => void;
  onUndoWater: (date: string) => void;
  onWaterSettingsChange: (settings: WaterReminderSettings) => void;
}

function toNumber(value: string): number | undefined {
  if (value.trim() === '') return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function CheckInPage({ state, onSave, onAddWater, onUndoWater, onWaterSettingsChange }: CheckInPageProps) {
  const today = toDateKey();
  const todayPlan = defaultTrainingPlan[getDayKey(today)];
  const waterLogs = state.waterLogs[today] ?? [];
  const saved = state.dailyLogs[today];
  const [form, setForm] = useState<DailyLog>({
    date: today,
    weight: saved?.weight,
    sleepStart: saved?.sleepStart ?? '00:30',
    sleepEnd: saved?.sleepEnd ?? '08:30',
    sleepQuality: saved?.sleepQuality,
    steps: saved?.steps,
    dietScore: saved?.dietScore,
    hungerScore: saved?.hungerScore,
    energyScore: saved?.energyScore,
    fatigueScore: saved?.fatigueScore,
    painLocation: saved?.painLocation ?? '',
    painScore: saved?.painScore ?? 0,
    notes: saved?.notes ?? '',
  });
  const [savedNow, setSavedNow] = useState(false);
  const advice = useMemo(() => generateCoachAdvice({ ...state, dailyLogs: { ...state.dailyLogs, [today]: form } }, today), [state, form, today]);
  const sleepHours = calculateSleepHours(form.sleepStart, form.sleepEnd);

  function save() {
    onSave(form);
    setSavedNow(true);
    window.setTimeout(() => setSavedNow(false), 1800);
  }

  return (
    <div className="space-y-4">
      <header className="pt-2">
        <div className="mb-4 h-1.5 w-20 rounded-full brush-stroke" />
        <p className="text-sm text-muted">{formatChineseDate(today)}</p>
        <h1 className="mt-2 text-2xl font-bold">每日打卡</h1>
        <p className="mt-1 text-sm text-muted">输入关键数据即可，不需要写长日记。</p>
      </header>

      <Card title="基础记录">
        <div className="grid gap-4">
          <TextField
            label="今日体重"
            type="number"
            suffix="kg"
            value={form.weight}
            onChange={(value) => setForm({ ...form, weight: toNumber(value) })}
            placeholder="70.0"
          />
          <div className="grid grid-cols-2 gap-3">
            <TextField label="入睡时间" type="time" value={form.sleepStart} onChange={(value) => setForm({ ...form, sleepStart: value })} />
            <TextField label="起床时间" type="time" value={form.sleepEnd} onChange={(value) => setForm({ ...form, sleepEnd: value })} />
          </div>
          {sleepHours !== undefined && (
            <div className="rounded-2xl bg-surface p-3 text-sm text-muted">睡眠时长：{sleepHours} 小时</div>
          )}
          <TextField
            label="今日步数"
            type="number"
            suffix="步"
            value={form.steps}
            onChange={(value) => setForm({ ...form, steps: toNumber(value) })}
            placeholder="8000"
          />
        </div>
      </Card>

      <Card title="状态评分">
        <div className="space-y-5">
          <RatingButtons label="睡眠质量" value={form.sleepQuality} onChange={(value) => setForm({ ...form, sleepQuality: value })} />
          <RatingButtons label="饮食完成度" value={form.dietScore} onChange={(value) => setForm({ ...form, dietScore: value })} />
          <RatingButtons label="饥饿感" value={form.hungerScore} onChange={(value) => setForm({ ...form, hungerScore: value })} />
          <RatingButtons label="精神状态" value={form.energyScore} onChange={(value) => setForm({ ...form, energyScore: value })} />
          <RatingButtons label="疲劳感" value={form.fatigueScore} onChange={(value) => setForm({ ...form, fatigueScore: value })} />
          <RatingButtons label="疼痛评分" min={0} value={form.painScore} onChange={(value) => setForm({ ...form, painScore: value })} />
          <TextField
            label="疼痛部位"
            value={form.painLocation}
            onChange={(value) => setForm({ ...form, painLocation: value })}
            placeholder="无 / 腰 / 膝 / 肩"
          />
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-ink">今日备注</span>
            <textarea
              value={form.notes ?? ''}
              onChange={(event) => setForm({ ...form, notes: event.target.value })}
              rows={3}
              className="w-full rounded-2xl border border-line bg-white p-3 text-base outline-none"
              placeholder="可选：训练感受、外卖情况、疼痛描述"
            />
          </label>
        </div>
      </Card>

      <WaterTracker
        date={today}
        profile={state.profile}
        todayPlan={todayPlan}
        logs={waterLogs}
        onAdd={onAddWater}
        onUndo={() => onUndoWater(today)}
      />

      <WaterReminderCard
        date={today}
        profile={state.profile}
        todayPlan={todayPlan}
        logs={waterLogs}
        settings={state.waterReminderSettings}
        onSettingsChange={onWaterSettingsChange}
        onAdd={onAddWater}
      />

      <Card title="保存后反馈">
        <p className="text-sm leading-6 text-muted">{advice.coachNote}</p>
        <p className="mt-2 text-sm leading-6 text-muted">{advice.sleepAdvice}</p>
      </Card>

      <button
        type="button"
        onClick={save}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-ink px-4 py-4 text-base font-semibold text-white shadow-card"
      >
        <Save size={19} />
        {savedNow ? '已保存' : '保存今日打卡'}
      </button>
    </div>
  );
}
