import { Bell, Database, Dumbbell, UserRound, Utensils } from 'lucide-react';
import { useState } from 'react';
import { InkButton } from '../components/Ink/InkButton';
import { InkCard } from '../components/Ink/InkCard';
import { SettingRow } from '../components/Ink/SettingRow';
import type { AppPage, AppState, ReminderSettings, UserProfile } from '../types';

interface MinePageProps {
  state: AppState;
  onPageChange: (page: AppPage) => void;
  onProfileChange: (profile: UserProfile) => void;
  onReminderChange: (settings: ReminderSettings) => void;
  onExport: () => void;
  onReset: () => void;
}

type Tab = 'profile' | 'training' | 'diet' | 'reminder' | 'data';

const tabs: Array<{ key: Tab; label: string; Icon: typeof UserRound }> = [
  { key: 'profile', label: '个人', Icon: UserRound },
  { key: 'training', label: '训练', Icon: Dumbbell },
  { key: 'diet', label: '饮食', Icon: Utensils },
  { key: 'reminder', label: '提醒', Icon: Bell },
  { key: 'data', label: '数据', Icon: Database },
];

function NumberInput({ value, onChange, suffix }: { value: number; onChange: (value: number) => void; suffix?: string }) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-11 min-w-0 flex-1 rounded-2xl border border-line bg-white/80 px-3 outline-none"
      />
      {suffix && <span className="text-sm text-muted">{suffix}</span>}
    </div>
  );
}

function TextInput({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder?: string }) {
  return (
    <input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-11 w-full rounded-2xl border border-line bg-white/80 px-3 outline-none"
      placeholder={placeholder}
    />
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative h-8 w-14 rounded-full transition ${checked ? 'bg-mountain' : 'bg-ink/15'}`}
    >
      <span className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow-soft transition ${checked ? 'left-7' : 'left-1'}`} />
    </button>
  );
}

export function MinePage({ state, onPageChange, onProfileChange, onReminderChange, onExport, onReset }: MinePageProps) {
  const [tab, setTab] = useState<Tab>('profile');
  const profile = state.profile;

  function patchProfile(patch: Partial<UserProfile>) {
    onProfileChange({ ...profile, ...patch });
  }

  function patchReminder(patch: Partial<ReminderSettings>) {
    onReminderChange({ ...state.reminders, ...patch });
  }

  function renderProfile() {
    return (
      <InkCard title="个人资料" subtitle="基础信息会影响饮水、训练和膳食建议。">
        <div className="grid gap-3">
          <SettingRow label="昵称"><TextInput value={profile.nickname} onChange={(nickname) => patchProfile({ nickname })} /></SettingRow>
          <SettingRow label="头像标记"><TextInput value={profile.avatar} onChange={(avatar) => patchProfile({ avatar })} placeholder="可填一个字或头像 URL" /></SettingRow>
          <SettingRow label="身高"><NumberInput value={profile.height} onChange={(height) => patchProfile({ height })} suffix="cm" /></SettingRow>
          <SettingRow label="当前体重"><NumberInput value={profile.currentWeight} onChange={(currentWeight) => patchProfile({ currentWeight })} suffix="kg" /></SettingRow>
          <SettingRow label="目标体重"><NumberInput value={profile.targetWeight} onChange={(targetWeight) => patchProfile({ targetWeight })} suffix="kg" /></SettingRow>
          <SettingRow label="当前阶段"><TextInput value={profile.phase} onChange={(phase) => patchProfile({ phase })} /></SettingRow>
          <SettingRow label="训练目标"><TextInput value={profile.trainingGoal} onChange={(trainingGoal) => patchProfile({ trainingGoal, goal: trainingGoal })} /></SettingRow>
        </div>
      </InkCard>
    );
  }

  function renderTraining() {
    return (
      <InkCard title="训练偏好" subtitle="影响首页主任务和训练提醒。">
        <div className="grid gap-3">
          <SettingRow label="每周训练天数"><NumberInput value={profile.weeklyTrainingDays} onChange={(weeklyTrainingDays) => patchProfile({ weeklyTrainingDays })} suffix="天" /></SettingRow>
          <SettingRow label="工作日训练时间"><TextInput value={profile.weekdayTrainingAfter} onChange={(weekdayTrainingAfter) => patchProfile({ weekdayTrainingAfter })} /></SettingRow>
          <SettingRow label="周末训练时间"><TextInput value={profile.weekendTrainingAfter} onChange={(weekendTrainingAfter) => patchProfile({ weekendTrainingAfter })} /></SettingRow>
          <SettingRow label="单次训练时长"><NumberInput value={profile.sessionTimeLimit} onChange={(sessionTimeLimit) => patchProfile({ sessionTimeLimit })} suffix="分钟" /></SettingRow>
          <SettingRow label="三大项优先级"><TextInput value={profile.strengthPriority} onChange={(strengthPriority) => patchProfile({ strengthPriority })} /></SettingRow>
          <SettingRow label="强提醒" value={<Toggle checked={profile.strictReminder} onChange={(strictReminder) => patchProfile({ strictReminder })} />} />
        </div>
      </InkCard>
    );
  }

  function renderDiet() {
    return (
      <InkCard title="饮食偏好" subtitle="所有建议都会避开鸡蛋、海鲜，内脏默认不推荐。">
        <div className="grid gap-3">
          <SettingRow label="每天几餐"><NumberInput value={profile.mealsPerDay} onChange={(mealsPerDay) => patchProfile({ mealsPerDay })} suffix="餐" /></SettingRow>
          <SettingRow label="是否吃早餐" value={<Toggle checked={profile.eatsBreakfast} onChange={(eatsBreakfast) => patchProfile({ eatsBreakfast })} />} />
          <SettingRow label="每餐预算"><NumberInput value={profile.mealBudget} onChange={(mealBudget) => patchProfile({ mealBudget })} suffix="元" /></SettingRow>
          <SettingRow label="外卖平台">
            <TextInput value={profile.deliveryPlatforms.join('、')} onChange={(text) => patchProfile({ deliveryPlatforms: text.split(/[、,，]/).filter(Boolean) })} />
          </SettingRow>
          <SettingRow label="常用地区"><TextInput value={profile.locationArea} onChange={(locationArea) => patchProfile({ locationArea })} /></SettingRow>
          <SettingRow label="可接受食物">
            <TextInput value={profile.acceptedFoods.join('、')} onChange={(text) => patchProfile({ acceptedFoods: text.split(/[、,，]/).filter(Boolean) })} />
          </SettingRow>
          <SettingRow label="不喜欢 / 不吃">
            <TextInput value={profile.dislikedFoods.join('、')} onChange={(text) => patchProfile({ dislikedFoods: text.split(/[、,，]/).filter(Boolean) })} />
          </SettingRow>
        </div>
      </InkCard>
    );
  }

  function renderReminder() {
    return (
      <InkCard title="提醒设置" subtitle="iPhone PWA 后台通知有限制，页面内提醒仍会保留。">
        <div className="grid gap-3">
          <SettingRow label="训练前提醒" value={<Toggle checked={state.reminders.trainingReminderEnabled} onChange={(trainingReminderEnabled) => patchReminder({ trainingReminderEnabled })} />}>
            <TextInput value={state.reminders.trainingReminderTime} onChange={(trainingReminderTime) => patchReminder({ trainingReminderTime, trainingTime: trainingReminderTime })} />
          </SettingRow>
          <SettingRow label="未开始训练提醒" value={<Toggle checked={state.reminders.missedTrainingReminderEnabled} onChange={(missedTrainingReminderEnabled) => patchReminder({ missedTrainingReminderEnabled })} />} />
          <SettingRow label="晚间总结提醒" value={<Toggle checked={state.reminders.eveningSummaryEnabled} onChange={(eveningSummaryEnabled) => patchReminder({ eveningSummaryEnabled })} />}>
            <TextInput value={state.reminders.eveningSummaryTime} onChange={(eveningSummaryTime) => patchReminder({ eveningSummaryTime, summaryTime: eveningSummaryTime })} />
          </SettingRow>
          <SettingRow label="连续两天未记录强提醒" value={<Toggle checked={state.reminders.twoDayBreakReminderEnabled} onChange={(twoDayBreakReminderEnabled) => patchReminder({ twoDayBreakReminderEnabled })} />} />
          <SettingRow label="最低任务提醒" value={<Toggle checked={state.reminders.minimumTaskReminderEnabled} onChange={(minimumTaskReminderEnabled) => patchReminder({ minimumTaskReminderEnabled })} />} />
        </div>
      </InkCard>
    );
  }

  function renderData() {
    return (
      <InkCard title="数据管理" subtitle="本地浏览器保存，刷新不会丢失。">
        <div className="grid gap-3">
          <InkButton onClick={onExport} className="w-full">导出数据</InkButton>
          <InkButton
            variant="danger"
            onClick={() => {
              if (window.confirm('确认清空所有本地数据？此操作不可撤销。')) onReset();
            }}
            className="w-full"
          >
            清空数据
          </InkButton>
          <InkButton
            variant="secondary"
            onClick={() => {
              if (window.confirm('确认重置默认计划？历史记录不会在这里单独保留。')) onReset();
            }}
            className="w-full"
          >
            重置默认计划
          </InkButton>
          <InkButton variant="ghost" onClick={() => onPageChange('weekly')} className="w-full">查看周报</InkButton>
        </div>
      </InkCard>
    );
  }

  return (
    <div className="page-slide space-y-4">
      <header className="pt-2">
        <div className="mb-4 flex items-center justify-between">
          <span className="seal-dot">身</span>
          <p className="text-sm text-muted">{profile.height}cm · {profile.currentWeight}kg</p>
        </div>
        <h1 className="ink-title text-3xl font-semibold">吾身</h1>
        <p className="mt-2 text-sm leading-6 text-muted">{profile.phase} · {profile.trainingGoal}</p>
      </header>

      <div className="grid grid-cols-5 gap-1 rounded-[24px] bg-white/62 p-1 shadow-soft">
        {tabs.map(({ key, label, Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`min-h-[58px] rounded-[20px] text-[11px] font-semibold transition ${tab === key ? 'bg-mountain text-white shadow-soft' : 'text-muted'}`}
          >
            <Icon size={17} className="mx-auto mb-1" />
            {label}
          </button>
        ))}
      </div>

      {tab === 'profile' && renderProfile()}
      {tab === 'training' && renderTraining()}
      {tab === 'diet' && renderDiet()}
      {tab === 'reminder' && renderReminder()}
      {tab === 'data' && renderData()}
    </div>
  );
}
