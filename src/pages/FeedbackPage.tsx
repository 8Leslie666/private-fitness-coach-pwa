import { AlertTriangle, ArrowLeft, Check, Gauge, Minus, Plus, XCircle } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { GlassPanel } from '../components/ui/GlassPanel';
import { PrimaryButton } from '../components/ui/PrimaryButton';
import { useAppStore } from '../store/appStore';

type FeedbackValue = '偏轻' | '合适' | '偏重' | '有疼痛' | '未完成';

const feedbackOptions: Array<{
  value: FeedbackValue;
  label: string;
  sub: string;
  icon: ReactNode;
  tone?: 'safe' | 'warn';
}> = [
  { value: '偏轻', label: '偏轻', sub: '下组可小幅增加', icon: <Minus size={17} /> },
  { value: '合适', label: '状态合适', sub: '维持当前节奏', icon: <Gauge size={17} />, tone: 'safe' },
  { value: '偏重', label: '偏重', sub: '优先稳定动作', icon: <Plus size={17} /> },
  { value: '有疼痛', label: '有疼痛', sub: '停止加重，降低强度', icon: <AlertTriangle size={17} />, tone: 'warn' },
  { value: '未完成', label: '未完成', sub: '不补偿训练，下次保持重量', icon: <XCircle size={17} />, tone: 'warn' },
];

export function FeedbackPage() {
  const workout = useAppStore((state) => state.workoutSession);
  const submitFeedback = useAppStore((state) => state.submitFeedback);
  const navigate = useAppStore((state) => state.navigate);
  const [selected, setSelected] = useState<FeedbackValue>('合适');

  if (!workout) return null;

  return (
    <section className="page page-immersive">
      <header className="top-row">
        <button className="icon-button dark pressable" type="button" onClick={() => navigate('workout')} aria-label="返回">
          <ArrowLeft size={20} />
        </button>
        <div className="text-center text-base font-semibold">本组反馈</div>
        <div className="w-[42px]" />
      </header>

      <div className="mt-5">
        <div className="text-sm text-white/54">第 {workout.currentSet} 组</div>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal">{workout.exerciseName}</h1>
        <div className="mt-2 text-base text-white/60">
          {workout.weight ? `${workout.weight}kg` : '自重'} × {workout.reps} 次 · RPE {workout.rpe}
        </div>
      </div>

      <GlassPanel dark className="mt-7 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm text-white/52">这一组感觉</div>
            <div className="mt-1 text-2xl font-semibold">选择反馈</div>
          </div>
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-white/12 bg-white/8 text-[color:var(--blue-soft)]">
            <Check size={22} />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          {feedbackOptions.slice(0, 4).map((option) => (
            <FeedbackOption key={option.value} option={option} selected={selected === option.value} onSelect={setSelected} />
          ))}
        </div>

        <FeedbackOption
          option={feedbackOptions[4]}
          selected={selected === '未完成'}
          onSelect={setSelected}
          className="mt-3 min-h-[64px]"
          wide
        />
      </GlassPanel>

      <GlassPanel dark className="mt-3 p-4">
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="text-white/48">下一步判断</span>
          <span className="font-semibold text-white/84">{selected === '合适' ? '进入调息' : '按反馈调整节奏'}</span>
        </div>
      </GlassPanel>

      <div className="mt-auto grid gap-3">
        <PrimaryButton className="w-full !animate-none" onClick={() => submitFeedback(selected)}>
          继续
        </PrimaryButton>
      </div>
    </section>
  );
}

function FeedbackOption({
  option,
  selected,
  onSelect,
  className = '',
  wide = false,
}: {
  option: (typeof feedbackOptions)[number];
  selected: boolean;
  onSelect: (value: FeedbackValue) => void;
  className?: string;
  wide?: boolean;
}) {
  const selectedClass = selected
    ? 'border-[color:var(--blue-soft)]/80 bg-[rgba(143,185,255,.22)] shadow-[inset_0_1px_0_rgba(255,255,255,.28),0_0_28px_rgba(78,145,255,.24)]'
    : 'border-white/12 bg-white/[.055]';
  const iconTone = option.tone === 'warn' ? 'text-amber-200' : option.tone === 'safe' ? 'text-[color:var(--blue-soft)]' : 'text-white/70';

  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={() => onSelect(option.value)}
      className={`pressable relative flex min-h-[88px] items-center gap-3 rounded-[24px] border p-3 text-left transition ${selectedClass} ${className}`}
    >
      {selected ? (
        <span className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-[color:var(--blue-main)] text-white shadow-[0_0_18px_rgba(78,145,255,.42)]">
          <Check size={14} strokeWidth={3} />
        </span>
      ) : null}
      <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/8 ${iconTone}`}>
        {option.icon}
      </span>
      <span className={wide ? 'min-w-0 flex-1' : 'min-w-0'}>
        <span className="block truncate text-base font-semibold text-white">{option.label}</span>
        <span className="mt-1 block text-xs leading-4 text-white/50">{option.sub}</span>
      </span>
    </button>
  );
}
