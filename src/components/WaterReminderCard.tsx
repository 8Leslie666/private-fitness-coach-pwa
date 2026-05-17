import { Bell, BellOff, Plus } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Card } from './Cards/Card';
import { calculateWaterGoal, createWaterLog, getWaterReminderMessage, getWaterSummary } from '../rules/waterRules';
import type { TrainingPlanDay, UserProfile } from '../types';
import type { WaterLog, WaterReminderSettings } from '../types/water';

interface WaterReminderCardProps {
  date: string;
  profile: UserProfile;
  todayPlan: TrainingPlanDay;
  logs: WaterLog[];
  settings: WaterReminderSettings;
  onSettingsChange: (settings: WaterReminderSettings) => void;
  onAdd: (log: WaterLog) => void;
  compact?: boolean;
}

function currentTimeKey(date = new Date()): string {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

export function WaterReminderCard({
  date,
  profile,
  todayPlan,
  logs,
  settings,
  onSettingsChange,
  onAdd,
  compact = false,
}: WaterReminderCardProps) {
  const [deviceNote, setDeviceNote] = useState('');
  const goal = useMemo(() => calculateWaterGoal(profile, todayPlan, date), [profile, todayPlan, date]);
  const summary = useMemo(() => getWaterSummary(date, goal, logs), [date, goal, logs]);
  const pageMessage = getWaterReminderMessage(summary, goal, logs, settings);

  useEffect(() => {
    if (!settings.enabled) return;
    const timer = window.setInterval(() => {
      const now = new Date();
      const time = currentTimeKey(now);
      const key = `${date}-${time}-water`;
      const dueByClock = settings.reminderTimes.includes(time);
      const dueByRule = Boolean(getWaterReminderMessage(summary, goal, logs, settings, now));
      if ((!dueByClock && !dueByRule) || settings.lastNotified[key]) return;

      const body = getWaterReminderMessage(summary, goal, logs, settings, now) ?? '到点喝水，先补 200-300ml。';
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('喝水提醒', { body });
      }
      onSettingsChange({
        ...settings,
        lastNotified: {
          ...settings.lastNotified,
          [key]: date,
        },
      });
    }, 30000);

    return () => window.clearInterval(timer);
  }, [date, goal, logs, onSettingsChange, settings, summary]);

  async function toggleEnabled() {
    if (!settings.enabled && 'Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setDeviceNote('当前设备可能限制后台通知，请以页面内提醒为主。iPhone PWA 通知取决于系统版本和安装方式。');
      }
    } else if (!('Notification' in window)) {
      setDeviceNote('当前浏览器不支持通知，请以页面内提醒为主。');
    }
    onSettingsChange({ ...settings, enabled: !settings.enabled });
  }

  function updateTime(index: number, value: string) {
    const nextTimes = settings.reminderTimes.map((time, itemIndex) => (itemIndex === index ? value : time));
    onSettingsChange({ ...settings, reminderTimes: nextTimes });
  }

  function addTime() {
    onSettingsChange({ ...settings, reminderTimes: [...settings.reminderTimes, '18:30'] });
  }

  return (
    <Card title="喝水提醒" subtitle="iPhone 后台通知可能受限制，打开 App 时的页面内提醒最可靠。">
      <div className="space-y-3">
        {pageMessage && (
          <div className="water-alert rounded-[22px] border border-blue-100 bg-blue-50 p-3 text-sm leading-6 text-blue-900">
            {pageMessage}
            <button
              type="button"
              onClick={() => onAdd(createWaterLog(settings.defaultCupMl, 'reminder'))}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-3 py-2 font-semibold text-coach"
            >
              <Plus size={16} />
              已补 {settings.defaultCupMl}ml
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={toggleEnabled}
          className={`flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 font-semibold ${
            settings.enabled ? 'bg-blue-50 text-coach' : 'bg-ink text-white'
          }`}
        >
          {settings.enabled ? <Bell size={18} /> : <BellOff size={18} />}
          {settings.enabled ? '喝水提醒已开启' : '开启喝水提醒'}
        </button>

        {deviceNote && <p className="rounded-2xl bg-amber-50 p-3 text-sm leading-6 text-amber-800">{deviceNote}</p>}

        {!compact && (
          <>
            <div className="grid grid-cols-2 gap-2">
              {settings.reminderTimes.map((time, index) => (
                <input
                  key={`${time}-${index}`}
                  type="time"
                  value={time}
                  onChange={(event) => updateTime(index, event.target.value)}
                  className="h-12 rounded-2xl border border-line bg-white px-3 text-base outline-none"
                />
              ))}
            </div>
            <button type="button" onClick={addTime} className="w-full rounded-2xl bg-surface px-4 py-3 text-sm font-semibold text-ink">
              增加提醒时间
            </button>
            <label className="flex items-center justify-between rounded-2xl bg-surface p-3 text-sm">
              <span>默认杯量</span>
              <select
                value={settings.defaultCupMl}
                onChange={(event) => onSettingsChange({ ...settings, defaultCupMl: Number(event.target.value) })}
                className="rounded-xl border border-line bg-white px-3 py-2"
              >
                <option value={200}>200ml</option>
                <option value={300}>300ml</option>
                <option value={500}>500ml</option>
              </select>
            </label>
            <label className="flex items-center justify-between rounded-2xl bg-surface p-3 text-sm">
              <span>训练前后补水提醒</span>
              <input
                type="checkbox"
                checked={settings.trainingPreReminder && settings.trainingPostReminder}
                onChange={(event) =>
                  onSettingsChange({
                    ...settings,
                    trainingPreReminder: event.target.checked,
                    trainingPostReminder: event.target.checked,
                  })
                }
                className="h-5 w-5"
              />
            </label>
          </>
        )}
      </div>
    </Card>
  );
}
