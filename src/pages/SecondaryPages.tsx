import { ArrowLeft, Download, Search, Trash2 } from 'lucide-react';
import { Card } from '../components/Cards/Card';
import { ReminderSettings } from '../components/ReminderSettings';
import { WaterReminderCard } from '../components/WaterReminderCard';
import { WaterTracker } from '../components/WaterTracker';
import { defaultTrainingPlan } from '../data/defaultTrainingPlan';
import { eveningSnackOptions, proteinSources, takeawayOptions } from '../data/dietOptions';
import type { AppPage, AppState, ReminderSettings as ReminderSettingsType, WaterLog, WaterReminderSettings } from '../types';
import { dateKeysBetween, getDayKey, getWeekRange, toDateKey } from '../utils/date';
import { WeeklyReportPage } from './WeeklyReportPage';

interface SecondaryPageProps {
  state: AppState;
  onBack: () => void;
  onPageChange: (page: AppPage) => void;
  onAddWater: (log: WaterLog) => void;
  onUndoWater: (date: string) => void;
  onWaterSettingsChange: (settings: WaterReminderSettings) => void;
  onReminderChange: (settings: ReminderSettingsType) => void;
  onExport: () => void;
  onReset: () => void;
}

function Shell({ title, subtitle, onBack, children }: { title: string; subtitle?: string; onBack: () => void; children: React.ReactNode }) {
  return (
    <div className="page-slide space-y-4">
      <header className="flex items-start gap-3 pt-2">
        <button type="button" onClick={onBack} className="rounded-full bg-white p-3 text-ink shadow-soft">
          <ArrowLeft size={18} />
        </button>
        <div>
          <p className="text-sm text-muted">{subtitle ?? '二级页面'}</p>
          <h1 className="mt-1 text-2xl font-bold">{title}</h1>
        </div>
      </header>
      {children}
    </div>
  );
}

function SimpleList({ items }: { items: string[] }) {
  return (
    <div className="space-y-2">
      {items.slice(0, 8).map((item) => (
        <div key={item} className="rounded-2xl bg-surface p-3 text-sm leading-6 text-muted">{item}</div>
      ))}
    </div>
  );
}

export function WaterDetailPage(props: SecondaryPageProps) {
  const today = toDateKey();
  const plan = defaultTrainingPlan[getDayKey(today)];
  const logs = props.state.waterLogs[today] ?? [];
  return (
    <Shell title="饮水详情" subtitle="记录和提醒" onBack={props.onBack}>
      <WaterTracker date={today} profile={props.state.profile} todayPlan={plan} logs={logs} onAdd={props.onAddWater} onUndo={() => props.onUndoWater(today)} />
      <WaterReminderCard date={today} profile={props.state.profile} todayPlan={plan} logs={logs} settings={props.state.waterReminderSettings} onSettingsChange={props.onWaterSettingsChange} onAdd={props.onAddWater} />
    </Shell>
  );
}

export function DietDetailPage(props: SecondaryPageProps) {
  return (
    <Shell title="今日饮食详情" subtitle="两餐方案" onBack={props.onBack}>
      <Card title="今日方案" subtitle="不吃海鲜、鸡蛋，预算 30 元以内。">
        <div className="space-y-3 text-sm leading-6 text-muted">
          <p><span className="font-semibold text-ink">第一餐：</span>牛肉饭，饭半份，少酱，加青菜。</p>
          <p><span className="font-semibold text-ink">第二餐：</span>去皮鸡腿饭或猪瘦肉套餐，饭半份。</p>
          <p><span className="font-semibold text-ink">训练前：</span>牛奶、无糖豆浆或一勺蛋白粉。</p>
          <p><span className="font-semibold text-ink">夜间备用：</span>无糖酸奶、豆干、鸡胸肉即食包。</p>
        </div>
      </Card>
      <button type="button" className="min-h-[56px] w-full rounded-[22px] bg-ink px-4 text-base font-semibold text-white">换一组方案</button>
    </Shell>
  );
}

export function TakeoutScanPage(props: SecondaryPageProps) {
  return (
    <Shell title="外卖识别" subtitle="只做订单判断" onBack={props.onBack}>
      <Card title="粘贴订单">
        <textarea className="min-h-32 w-full rounded-2xl border border-line p-3 outline-none" placeholder="把淘宝闪购或美团订单文字粘贴到这里" />
      </Card>
      <button type="button" className="min-h-[56px] w-full rounded-[22px] bg-ink px-4 text-base font-semibold text-white">识别并确认</button>
    </Shell>
  );
}

export function FrequentOrdersPage(props: SecondaryPageProps) {
  return (
    <Shell title="常吃订单" subtitle="按场景分组" onBack={props.onBack}>
      <Card title="搜索">
        <div className="flex items-center gap-2 rounded-2xl bg-surface px-3">
          <Search size={18} className="text-muted" />
          <input className="h-12 flex-1 bg-transparent outline-none" placeholder="搜索牛肉饭、麦当劳、轻食" />
        </div>
      </Card>
      <Card title="推荐保留">
        <SimpleList items={takeawayOptions} />
      </Card>
    </Shell>
  );
}

export function McDonaldsPage(props: SecondaryPageProps) {
  return (
    <Shell title="麦当劳建议" subtitle="常点时先避坑" onBack={props.onBack}>
      <Card title="可接受组合">
        <SimpleList items={['板烧鸡腿堡单点 + 无糖饮料', '双层牛肉堡单点 + 玉米杯', '麦辣鸡腿堡偶尔可选，但不要配薯条和奶茶', '训练后可加一份牛奶或蛋白粉补蛋白']} />
      </Card>
      <Card title="不推荐组合">
        <SimpleList items={['炸鸡桶 + 薯条 + 甜饮', '双堡套餐再加甜品', '夜间高油套餐', '用奶茶或甜饮补训练后能量']} />
      </Card>
    </Shell>
  );
}

export function ProfilePage(props: SecondaryPageProps) {
  return (
    <Shell title="个人资料" subtitle="基础信息" onBack={props.onBack}>
      <Card title="当前资料">
        <SimpleList items={[`身高：${props.state.profile.height}cm`, `体重：${props.state.profile.currentWeight}kg`, `目标：${props.state.profile.goal}`, `训练经历：${props.state.profile.trainingExperience}`]} />
      </Card>
    </Shell>
  );
}

export function TrainingPlanDetailPage(props: SecondaryPageProps) {
  const today = toDateKey();
  const plan = defaultTrainingPlan[getDayKey(today)];
  return (
    <Shell title="今日计划详情" subtitle={plan.dayType} onBack={props.onBack}>
      <Card title="动作列表">
        <SimpleList items={plan.exercises.map((exercise) => `${exercise.name} · ${exercise.weightDisplay} · ${exercise.plannedSets}×${exercise.plannedReps}`)} />
      </Card>
    </Shell>
  );
}

export function TrainingHistoryPage(props: SecondaryPageProps) {
  const { start, end } = getWeekRange(toDateKey());
  const items = dateKeysBetween(start, end)
    .map((date) => props.state.trainingSessions[date])
    .filter(Boolean)
    .map((session) => `${session.date} · ${session.dayType} · ${session.exercises.filter((exercise) => exercise.completed).length} 项完成`);
  return (
    <Shell title="历史训练" subtitle="本周记录" onBack={props.onBack}>
      <Card title="训练记录">
        {items.length ? <SimpleList items={items} /> : <p className="text-sm text-muted">本周还没有训练记录。</p>}
      </Card>
    </Shell>
  );
}

export function ExerciseLibraryPage(props: SecondaryPageProps) {
  return (
    <Shell title="动作库" subtitle="先保留核心动作" onBack={props.onBack}>
      <Card title="三大项">
        <SimpleList items={['深蹲：脚掌踩稳，膝盖跟脚尖方向一致。', '卧推：肩胛收紧，胸部主动迎杠。', '硬拉：杠贴腿，先收紧背再发力。']} />
      </Card>
    </Shell>
  );
}

export function TrainingSettingsPage(props: SecondaryPageProps) {
  return (
    <Shell title="训练设置" subtitle="短设置页" onBack={props.onBack}>
      <Card title="默认策略">
        <SimpleList items={['每周 4 天训练。', '工作日 16:00 后训练。', '周末 14:00 后训练。', '睡眠不足 6 小时自动降强度。']} />
      </Card>
    </Shell>
  );
}

export function DietRestrictionsPage(props: SecondaryPageProps) {
  return (
    <Shell title="饮食禁忌" subtitle="生成建议会避开" onBack={props.onBack}>
      <Card title="当前限制">
        <SimpleList items={[...props.state.profile.dietRestrictions, '内脏不太爱吃', ...proteinSources.map((item) => `可接受蛋白：${item}`).slice(0, 4)]} />
      </Card>
    </Shell>
  );
}

export function WaterSettingsPage(props: SecondaryPageProps) {
  const today = toDateKey();
  const plan = defaultTrainingPlan[getDayKey(today)];
  return (
    <Shell title="饮水设置" subtitle="提醒和杯量" onBack={props.onBack}>
      <WaterReminderCard date={today} profile={props.state.profile} todayPlan={plan} logs={props.state.waterLogs[today] ?? []} settings={props.state.waterReminderSettings} onSettingsChange={props.onWaterSettingsChange} onAdd={props.onAddWater} />
    </Shell>
  );
}

export function ReminderSettingsPage(props: SecondaryPageProps) {
  return (
    <Shell title="提醒设置" subtitle="打卡和训练" onBack={props.onBack}>
      <ReminderSettings settings={props.state.reminders} onChange={props.onReminderChange} />
    </Shell>
  );
}

export function TakeoutLibraryPage(props: SecondaryPageProps) {
  return (
    <Shell title="外卖库" subtitle="常用选择" onBack={props.onBack}>
      <Card title="外卖优先级">
        <SimpleList items={takeawayOptions} />
      </Card>
      <Card title="夜间备用">
        <SimpleList items={eveningSnackOptions} />
      </Card>
    </Shell>
  );
}

export function DataExportPage(props: SecondaryPageProps) {
  return (
    <Shell title="数据导出" subtitle="本地数据管理" onBack={props.onBack}>
      <Card title="操作">
        <div className="grid gap-2">
          <button type="button" onClick={props.onExport} className="flex min-h-[54px] items-center justify-center gap-2 rounded-2xl bg-ink px-3 font-semibold text-white"><Download size={18} />导出 JSON</button>
          <button type="button" onClick={() => window.confirm('确认清空所有本地数据？') && props.onReset()} className="flex min-h-[54px] items-center justify-center gap-2 rounded-2xl bg-red-50 px-3 font-semibold text-red-700"><Trash2 size={18} />清空数据</button>
        </div>
      </Card>
    </Shell>
  );
}

export function WeeklyEntryPage(props: SecondaryPageProps) {
  return <WeeklyReportPage state={props.state} onExport={props.onExport} onReset={props.onReset} />;
}
