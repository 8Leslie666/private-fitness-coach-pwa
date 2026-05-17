import { Bell } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { ReminderSettings as ReminderSettingsType } from '../types';
import { Card } from './Cards/Card';

interface ReminderSettingsProps {
  settings: ReminderSettingsType;
  onChange: (settings: ReminderSettingsType) => void;
}

const reminderLabels = {
  checkInTime: '09:00 记录体重和睡眠',
  trainingTime: '17:30 训练日准备训练',
  summaryTime: '22:30 完成今日总结',
};

export function ReminderSettings({ settings, onChange }: ReminderSettingsProps) {
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (!settings.enabled) return;
    const timer = window.setInterval(() => {
      const now = new Date();
      const current = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const today = now.toISOString().slice(0, 10);
      const due = Object.entries({
        checkInTime: settings.checkInTime,
        trainingTime: settings.trainingTime,
        summaryTime: settings.summaryTime,
      }).find(([key, time]) => current === time && settings.lastNotified[key] !== today);

      if (!due) return;
      const [key] = due;
      const title = reminderLabels[key as keyof typeof reminderLabels];
      setNotice(title);
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('私人健身监督', { body: title });
      }
      onChange({
        ...settings,
        lastNotified: {
          ...settings.lastNotified,
          [key]: today,
        },
      });
    }, 30000);
    return () => window.clearInterval(timer);
  }, [settings, onChange]);

  async function toggleEnabled() {
    if (!settings.enabled && 'Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
    onChange({ ...settings, enabled: !settings.enabled });
  }

  return (
    <Card title="提醒设置" subtitle="浏览器限制时会显示页面内提醒。iPhone 通知能力取决于系统和浏览器版本。">
      <div className="space-y-3">
        {notice && <div className="rounded-2xl bg-blue-50 p-3 text-sm font-medium text-coach">{notice}</div>}
        <button
          type="button"
          onClick={toggleEnabled}
          className={`flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 font-semibold ${
            settings.enabled ? 'bg-blue-50 text-coach' : 'bg-ink text-white'
          }`}
        >
          <Bell size={18} />
          {settings.enabled ? '提醒已开启' : '开启每日提醒'}
        </button>
        <div className="grid gap-3">
          {[
            ['checkInTime', '早晨提醒'],
            ['trainingTime', '训练提醒'],
            ['summaryTime', '总结提醒'],
          ].map(([key, label]) => (
            <label key={key} className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-white p-3">
              <span className="text-sm font-medium text-ink">{label}</span>
              <input
                type="time"
                value={settings[key as keyof ReminderSettingsType] as string}
                onChange={(event) => onChange({ ...settings, [key]: event.target.value })}
                className="rounded-xl border border-line px-3 py-2 text-base outline-none"
              />
            </label>
          ))}
        </div>
      </div>
    </Card>
  );
}
