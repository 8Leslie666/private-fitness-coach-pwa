import { ChevronRight, Droplets, ScanLine, ShoppingBag, Utensils } from 'lucide-react';
import { Card } from '../components/Cards/Card';
import { defaultTrainingPlan } from '../data/defaultTrainingPlan';
import { calculateWaterGoal, createWaterLog, getWaterSummary } from '../rules/waterRules';
import type { AppPage, AppState, WaterLog } from '../types';
import { getDayKey, toDateKey } from '../utils/date';

interface DietPageProps {
  state: AppState;
  onPageChange: (page: AppPage) => void;
  onAddWater: (log: WaterLog) => void;
}

export function DietPage({ state, onPageChange, onAddWater }: DietPageProps) {
  const today = toDateKey();
  const plan = defaultTrainingPlan[getDayKey(today)];
  const waterGoal = calculateWaterGoal(state.profile, plan, today);
  const summary = getWaterSummary(today, waterGoal, state.waterLogs[today] ?? []);

  return (
    <div className="page-slide space-y-4">
      <header className="pt-2">
        <div className="mb-4 h-1.5 w-20 rounded-full brush-stroke" />
        <p className="text-sm text-muted">两餐外卖 · 30 元以内</p>
        <h1 className="mt-2 text-2xl font-bold">饮食</h1>
      </header>

      <Card title="今日两餐" subtitle="先安排，不临时乱点。">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-2xl bg-surface p-3">
              <p className="text-xs text-muted">第一餐</p>
              <p className="mt-1 text-sm font-semibold">牛肉饭 / 鸡腿饭</p>
            </div>
            <div className="rounded-2xl bg-surface p-3">
              <p className="text-xs text-muted">第二餐</p>
              <p className="mt-1 text-sm font-semibold">猪瘦肉 / 鸡胸轻食</p>
            </div>
            <div className="rounded-2xl bg-surface p-3">
              <p className="text-xs text-muted">训练前</p>
              <p className="mt-1 text-sm font-semibold">牛奶或无糖豆浆</p>
            </div>
            <div className="rounded-2xl bg-surface p-3">
              <p className="text-xs text-muted">夜间备用</p>
              <p className="mt-1 text-sm font-semibold">酸奶 / 蛋白粉</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onPageChange('diet-detail')}
            className="flex min-h-[58px] w-full items-center justify-center gap-2 rounded-[22px] bg-ink px-4 text-base font-semibold text-white shadow-card"
          >
            生成今日饮食
            <ChevronRight size={18} />
          </button>
        </div>
      </Card>

      <Card title="今日饮水" subtitle={`${summary.consumedMl} / ${summary.goalMl}ml`}>
        <div className="space-y-3">
          <div className="h-2 overflow-hidden rounded-full bg-blue-50">
            <div className="h-full rounded-full bg-coach" style={{ width: `${summary.completionRate}%` }} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onAddWater(createWaterLog(300, 'quick'))}
              className="flex min-h-[50px] items-center justify-center gap-2 rounded-2xl bg-blue-50 font-semibold text-coach"
            >
              <Droplets size={17} />
              +300ml
            </button>
            <button type="button" onClick={() => onPageChange('water')} className="min-h-[50px] rounded-2xl bg-surface font-semibold text-ink">
              饮水详情
            </button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-3 gap-2">
        {[
          ['外卖识别', 'takeout-scan', ScanLine],
          ['常吃订单', 'frequent-orders', ShoppingBag],
          ['麦当劳建议', 'mcdonalds', Utensils],
        ].map(([label, page, Icon]) => {
          const EntryIcon = Icon as typeof ScanLine;
          return (
            <button key={label as string} type="button" onClick={() => onPageChange(page as AppPage)} className="min-h-[78px] rounded-[22px] bg-white p-3 text-sm font-semibold text-ink shadow-soft">
              <EntryIcon size={18} className="mx-auto mb-2 text-coach" />
              {label as string}
            </button>
          );
        })}
      </div>
    </div>
  );
}
