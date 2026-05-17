import { BookOpen, ClipboardCheck, Dumbbell, MessageSquareText, Moon } from 'lucide-react';
import { Card } from './Cards/Card';

const guideItems = [
  {
    title: '早上 1 分钟',
    body: '记录体重、入睡时间、起床时间和睡眠质量。体重趋势只看 7 天平均，不看单日波动。',
    Icon: Moon,
  },
  {
    title: '训练后立刻记',
    body: '每个动作填实际重量、组数、次数和 RPE。系统根据完成度、RPE 和疼痛判断下次加重、维持或降重。',
    Icon: Dumbbell,
  },
  {
    title: '晚上补总结',
    body: '填步数、饮食完成度、饥饿感、精神、疲劳和疼痛。备注只写影响执行的关键事。',
    Icon: ClipboardCheck,
  },
  {
    title: '第二天照建议执行',
    body: '建议页会给出明天训练、饮食、睡眠和风险处理。睡眠差、疲劳高或疼痛时，优先降强度。',
    Icon: MessageSquareText,
  },
];

export function UseGuide() {
  return (
    <Card title="使用指南" subtitle="每天按这个顺序操作，系统判断会更准确。">
      <div className="space-y-3">
        <div className="brush-panel rounded-[22px] border border-blue-100 bg-white p-4">
          <div className="relative z-10 flex items-start gap-3">
            <div className="rounded-2xl bg-blue-50 p-3 text-coach">
              <BookOpen size={21} />
            </div>
            <div>
              <p className="font-semibold text-ink">核心原则</p>
              <p className="mt-1 text-sm leading-6 text-muted">
                不追求完美打卡。先保证数据连续，再让系统根据趋势调整训练和饮食。
              </p>
            </div>
          </div>
        </div>

        {guideItems.map(({ title, body, Icon }, index) => (
          <div key={title} className="flex gap-3 rounded-[22px] bg-surface p-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-coach shadow-soft">
              <Icon size={19} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-ink">
                {index + 1}. {title}
              </p>
              <p className="mt-1 text-sm leading-6 text-muted">{body}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
