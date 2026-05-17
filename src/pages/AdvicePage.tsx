import { AlertTriangle, ChevronRight, Dumbbell, Footprints, Moon, Utensils } from 'lucide-react';
import { Card } from '../components/Cards/Card';
import { getEveningSnackOptions, getTakeawayRotation } from '../rules/dietRules';
import { generateCoachAdvice } from '../rules/coachRules';
import type { AppState } from '../types';
import { formatChineseDate, toDateKey } from '../utils/date';

interface AdvicePageProps {
  state: AppState;
}

export function AdvicePage({ state }: AdvicePageProps) {
  const today = toDateKey();
  const advice = generateCoachAdvice(state, today);

  return (
    <div className="space-y-4">
      <header className="pt-2">
        <div className="mb-4 h-1.5 w-20 rounded-full brush-stroke" />
        <p className="text-sm text-muted">{formatChineseDate(today)}</p>
        <h1 className="mt-2 text-2xl font-bold">自动建议</h1>
        <p className="mt-1 text-sm text-muted">根据打卡、训练、RPE、睡眠、疼痛和体重趋势生成。</p>
      </header>

      <Card className="border-blue-100 bg-blue-50" title="一句话教练提醒">
        <p className="text-base font-semibold leading-7 text-blue-950">{advice.coachNote}</p>
      </Card>

      <Card title="明天训练安排" action={<Dumbbell size={20} className="text-coach" />}>
        <p className="text-sm leading-6 text-muted">{advice.nextTrainingPlan}</p>
      </Card>

      <Card title="主项重量调整">
        <div className="space-y-2">
          {advice.weightAdjustments.map((item) => (
            <div key={item} className="flex items-start gap-2 rounded-2xl bg-surface p-3 text-sm leading-6 text-muted">
              <ChevronRight size={16} className="mt-1 shrink-0 text-coach" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card title="饮食调整" action={<Utensils size={20} className="text-coach" />}>
        <p className="text-sm leading-6 text-muted">{advice.dietAdvice}</p>
      </Card>

      <Card title="睡眠与恢复">
        <div className="space-y-3">
          <div className="flex gap-2 rounded-2xl bg-surface p-3 text-sm leading-6 text-muted">
            <Moon size={18} className="mt-1 shrink-0 text-coach" />
            <span>{advice.sleepAdvice}</span>
          </div>
          <div className="flex gap-2 rounded-2xl bg-surface p-3 text-sm leading-6 text-muted">
            <AlertTriangle size={18} className="mt-1 shrink-0 text-coach" />
            <span>{advice.recoveryAdvice}</span>
          </div>
          <div className="flex gap-2 rounded-2xl bg-surface p-3 text-sm leading-6 text-muted">
            <Footprints size={18} className="mt-1 shrink-0 text-coach" />
            <span>{advice.stepAdvice}</span>
          </div>
        </div>
      </Card>

      <Card title="当前最大风险">
        {advice.riskFlags.length ? (
          <div className="space-y-2">
            {advice.riskFlags.map((flag) => (
              <div
                key={`${flag.title}-${flag.message}`}
                className={`rounded-2xl p-3 text-sm leading-6 ${
                  flag.level === 'danger'
                    ? 'bg-red-50 text-red-700'
                    : flag.level === 'warning'
                      ? 'bg-amber-50 text-amber-700'
                      : 'bg-blue-50 text-coach'
                }`}
              >
                <p className="font-semibold">{flag.title}</p>
                <p>{flag.message}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted">暂无高优先级风险。</p>
        )}
      </Card>

      <Card title="外卖优先选项">
        <div className="space-y-2">
          {getTakeawayRotation().map((item) => (
            <div key={item} className="rounded-2xl bg-surface p-3 text-sm text-ink">
              {item}
            </div>
          ))}
        </div>
      </Card>

      <Card title="晚上饿了">
        <div className="flex flex-wrap gap-2">
          {getEveningSnackOptions().map((item) => (
            <span key={item} className="rounded-full bg-surface px-3 py-2 text-sm text-ink">
              {item}
            </span>
          ))}
        </div>
      </Card>
    </div>
  );
}
