import { BarChart3, Dumbbell, Scale, Utensils } from 'lucide-react';
import { EmptyState } from '../components/Ink/EmptyState';
import { InkCard } from '../components/Ink/InkCard';
import { InkPage } from '../components/Ink/InkPage';
import { StatusBadge } from '../components/Ink/StatusBadge';
import { generateWeeklyReport } from '../rules/coachRules';
import type { AppState } from '../types';
import { formatChineseDate, toDateKey } from '../utils/date';

interface WeeklyReportPageProps {
  state: AppState;
  onExport: () => void;
  onReset: () => void;
}

export function WeeklyReportPage({ state }: WeeklyReportPageProps) {
  const today = toDateKey();
  const report = generateWeeklyReport(state, today);
  const liftText = `深蹲：${report.squatProgress}；卧推：${report.benchProgress}；硬拉：${report.deadliftProgress}`;

  return (
    <InkPage
      title="数据"
      subtitle={`${formatChineseDate(report.weekStart)} - ${formatChineseDate(report.weekEnd)}。只看近期判断，不做后台报表。`}
      eyebrow={<><span className="seal-dot">数</span><StatusBadge tone={report.enoughData ? 'good' : 'warn'}>{report.enoughData ? '可参考' : '数据不足'}</StatusBadge></>}
    >
      {!report.enoughData && (
        <EmptyState
          Icon={BarChart3}
          title="本周记录不足"
          message="至少完成 5 天打卡后再判断趋势。现在先保证记录连续，不急着调整热量和训练量。"
        />
      )}

      <div className="grid gap-3">
        <InkCard title="体重趋势" subtitle={report.averageWeight ? `本周平均 ${report.averageWeight}kg` : '体重记录不足'} action={<Scale size={19} className="text-jade" />}>
          <p className="text-sm leading-6 text-ink500">{report.weightTrend}</p>
        </InkCard>

        <InkCard title="训练完成率" subtitle={`${report.trainingCompletionRate}%`} action={<Dumbbell size={19} className="text-jade" />}>
          <div className="h-2 overflow-hidden rounded-full bg-inkwash">
            <div className="h-full rounded-full bg-jade" style={{ width: `${report.trainingCompletionRate}%` }} />
          </div>
          <p className="mt-3 text-sm leading-6 text-ink500">力量恢复先看执行率，再看重量。完成率稳定后再谈进阶。</p>
        </InkCard>

        <InkCard title="三大项恢复" subtitle="看主项趋势，不看单次波动">
          <p className="text-sm leading-6 text-ink500">{liftText}</p>
        </InkCard>

        <InkCard title="饮食执行" subtitle={report.averageDietScore ? `${report.averageDietScore}/10` : '记录不足'} action={<Utensils size={19} className="text-jade" />}>
          <p className="text-sm leading-6 text-ink500">减脂优先级高于恢复重量。外卖先控油脂、主食半份、每餐有蛋白。</p>
        </InkCard>
      </div>

      <InkCard title="本周最大问题">
        <p className="text-sm leading-6 text-ink500">{report.mainProblem}</p>
      </InkCard>

      <InkCard title="下周重点">
        <p className="text-sm leading-6 text-ink500">{report.nextWeekFocus}</p>
      </InkCard>
    </InkPage>
  );
}
