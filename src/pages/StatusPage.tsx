import { ArrowLeft, HeartPulse, Moon, Pencil, ShieldCheck, Waves } from 'lucide-react';
import type { ReactNode } from 'react';
import { GlassPanel } from '../components/ui/GlassPanel';
import { PrimaryButton } from '../components/ui/PrimaryButton';
import { useAppStore } from '../store/appStore';

export function StatusPage() {
  const navigate = useAppStore((state) => state.navigate);
  const openDrawer = useAppStore((state) => state.openDrawer);
  const vitals = useAppStore((state) => state.vitals);

  return (
    <section className="page page-secondary">
      <header className="top-row">
        <button className="icon-button pressable" type="button" onClick={() => navigate('cultivation')} aria-label="返回首页">
          <ArrowLeft size={20} />
        </button>
        <div className="text-center">
          <h1 className="text-xl font-bold">今日状态</h1>
          <p className="page-subtitle mt-1">恢复判断 · 训练准备</p>
        </div>
        <button className="icon-button pressable" type="button" onClick={() => openDrawer({ kind: 'status-edit' })}>
          <Pencil size={17} />
        </button>
      </header>

      <GlassPanel className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-[color:var(--text-muted)]">综合状态</div>
            <div className="mt-2 text-4xl font-semibold">良好</div>
            <div className="mt-2 text-sm text-[color:var(--text-muted)]">恢复正常，可以按计划训练。</div>
          </div>
          <div className="grid h-20 w-20 place-items-center rounded-full bg-white/55 text-emerald-600 shadow-inner">
            <ShieldCheck size={36} />
          </div>
        </div>
      </GlassPanel>

      <div className="grid grid-cols-2 gap-3">
        <StateCard icon={<Moon size={21} />} label="睡眠" value={`${vitals.sleepHours}h`} sub="略高于底线" />
        <StateCard icon={<HeartPulse size={21} />} label="心率" value={`${vitals.heartRate}bpm`} sub="静息稳定" />
        <StateCard icon={<Waves size={21} />} label="HRV" value={`${vitals.hrv}ms`} sub="恢复正常" />
        <StateCard icon={<HeartPulse size={21} />} label="压力" value={`${vitals.stress}`} sub="轻度" />
      </div>

      <GlassPanel className="min-h-0 flex-1 p-4">
        <div className="text-sm font-semibold">今日建议</div>
        <div className="mt-3 text-sm leading-6 text-[color:var(--text-muted)]">
          深蹲维持 50kg，RPE 控制在 6-7。若第 4 组开始速度明显下降，不加重量，优先动作质量。
        </div>
      </GlassPanel>

      <PrimaryButton onClick={() => openDrawer({ kind: 'status-edit' })}>更新状态</PrimaryButton>
    </section>
  );
}

function StateCard({ icon, label, value, sub }: { icon: ReactNode; label: string; value: string; sub: string }) {
  return (
    <GlassPanel className="p-4">
      <div className="flex items-center justify-between">
        <span className="grid h-10 w-10 place-items-center rounded-full bg-white/55 text-[color:var(--blue-main)]">{icon}</span>
        <span className="text-xs text-[color:var(--text-muted)]">{sub}</span>
      </div>
      <div className="mt-4 text-sm font-semibold">{label}</div>
      <div className="mt-1 text-3xl font-semibold tabular-nums">{value}</div>
    </GlassPanel>
  );
}
