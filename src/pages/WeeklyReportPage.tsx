import { Download, RotateCcw, Trash2 } from 'lucide-react';
import { Card } from '../components/Cards/Card';
import { MetricCard } from '../components/Cards/MetricCard';
import { generateWeeklyReport } from '../rules/coachRules';
import type { AppState } from '../types';
import { formatChineseDate, toDateKey } from '../utils/date';

interface WeeklyReportPageProps {
  state: AppState;
  onExport: () => void;
  onReset: () => void;
}

export function WeeklyReportPage({ state, onExport, onReset }: WeeklyReportPageProps) {
  const today = toDateKey();
  const report = generateWeeklyReport(state, today);

  function resetWithConfirm() {
    const confirmed = window.confirm('确认清空所有本地数据？此操作不可恢复。');
    if (confirmed) onReset();
  }

  return (
    <div className="space-y-4">
      <header className="pt-2">
        <div className="mb-4 h-1.5 w-20 rounded-full brush-stroke" />
        <p className="text-sm text-muted">{formatChineseDate(report.weekStart)} - {formatChineseDate(report.weekEnd)}</p>
        <h1 className="mt-2 text-2xl font-bold">周报</h1>
        <p className="mt-1 text-sm text-muted">用本周数据判断减脂、训练和恢复，不看单日波动。</p>
      </header>

      {!report.enoughData && (
        <Card className="border-amber-100 bg-amber-50" title="数据不足">
          <p className="text-sm leading-6 text-amber-800">本周记录不足，建议至少完成 5 天打卡后再判断趋势。</p>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-3">
        <MetricCard label="平均体重" value={report.averageWeight ? `${report.averageWeight}kg` : '不足'} />
        <MetricCard label="训练完成率" value={`${report.trainingCompletionRate}%`} />
        <MetricCard label="平均睡眠" value={report.averageSleep ? `${report.averageSleep}小时` : '不足'} />
        <MetricCard label="平均步数" value={report.averageSteps ? `${report.averageSteps}` : '不足'} />
        <MetricCard label="饮食完成度" value={report.averageDietScore ? `${report.averageDietScore}/10` : '不足'} />
        <MetricCard label="趋势判断" value={report.enoughData ? '可参考' : '先记录'} />
      </div>

      <Card title="体重趋势">
        <p className="text-sm leading-6 text-muted">{report.weightTrend}</p>
      </Card>

      <Card title="三大项变化">
        <div className="space-y-2 text-sm">
          <div className="rounded-2xl bg-surface p-3"><span className="font-semibold">深蹲：</span>{report.squatProgress}</div>
          <div className="rounded-2xl bg-surface p-3"><span className="font-semibold">卧推：</span>{report.benchProgress}</div>
          <div className="rounded-2xl bg-surface p-3"><span className="font-semibold">硬拉：</span>{report.deadliftProgress}</div>
        </div>
      </Card>

      <Card title="本周最大问题">
        <p className="text-sm leading-6 text-muted">{report.mainProblem}</p>
      </Card>

      <Card title="下周执行重点">
        <p className="text-sm leading-6 text-muted">{report.nextWeekFocus}</p>
      </Card>

      <Card title="数据管理" subtitle="数据保存在当前浏览器本地，可导出 JSON 备份。">
        <div className="grid gap-2">
          <button
            type="button"
            onClick={onExport}
            className="flex items-center justify-center gap-2 rounded-2xl bg-ink px-4 py-3 font-semibold text-white"
          >
            <Download size={18} />
            导出 JSON
          </button>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="flex items-center justify-center gap-2 rounded-2xl bg-surface px-4 py-3 font-semibold text-ink"
          >
            <RotateCcw size={18} />
            刷新读取本地数据
          </button>
          <button
            type="button"
            onClick={resetWithConfirm}
            className="flex items-center justify-center gap-2 rounded-2xl bg-red-50 px-4 py-3 font-semibold text-red-700"
          >
            <Trash2 size={18} />
            清空所有数据
          </button>
        </div>
      </Card>
    </div>
  );
}
