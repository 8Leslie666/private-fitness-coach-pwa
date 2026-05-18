import { ArrowLeft, Droplets, Minus, Pencil, Plus } from 'lucide-react';
import { GlassPanel } from '../components/ui/GlassPanel';
import { PrimaryButton } from '../components/ui/PrimaryButton';
import { useAppStore } from '../store/appStore';
import { clamp } from '../utils/time';

export function HydrationPage() {
  const navigate = useAppStore((state) => state.navigate);
  const openDrawer = useAppStore((state) => state.openDrawer);
  const addWater = useAppStore((state) => state.addWater);
  const hydration = useAppStore((state) => state.hydration);
  const percent = clamp(Math.round((hydration.currentMl / hydration.targetMl) * 100), 0, 160);
  const fill = clamp(percent, 0, 100);

  return (
    <section className="page page-secondary">
      <header className="top-row">
        <button className="icon-button pressable" type="button" onClick={() => navigate('cultivation')} aria-label="返回首页">
          <ArrowLeft size={20} />
        </button>
        <div className="text-center">
          <h1 className="text-xl font-bold">喝水计划</h1>
          <p className="page-subtitle mt-1">独立记录 · 今日节律</p>
        </div>
        <button className="icon-button pressable" type="button" onClick={() => openDrawer({ kind: 'water-target', payload: { targetMl: hydration.targetMl } })}>
          <Pencil size={17} />
        </button>
      </header>

      <GlassPanel className="grid min-h-[350px] place-items-center p-5">
        <div className="relative grid h-[236px] w-[236px] place-items-center">
          <div className="absolute h-full w-full rounded-full bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,.9),rgba(255,255,255,.34)_58%,rgba(216,226,239,.42))] shadow-[inset_0_1px_0_rgba(255,255,255,.9),0_24px_50px_rgba(36,64,99,.16)]" />
          <div className="absolute inset-[18px] overflow-hidden rounded-full border border-white/80 bg-white/35">
            <div
              className="absolute inset-x-0 bottom-0 animate-water-rise bg-[linear-gradient(180deg,rgba(143,185,255,.88),rgba(58,130,247,.74))]"
              style={{ height: `${fill}%` }}
            >
              <div className="absolute -top-5 left-[-15%] h-12 w-[130%] rounded-[50%] bg-white/45 blur-[3px]" />
              <div className="absolute -top-1 left-[-8%] h-8 w-[116%] rounded-[50%] border-t border-white/70" />
            </div>
          </div>
          <div className="relative text-center">
            <div className="text-xs text-[color:var(--text-muted)]">完成率</div>
            <div className="mt-2 text-5xl font-semibold tabular-nums">{percent}%</div>
            <div className="mt-3 text-sm text-[color:var(--text-muted)]">
              {(hydration.currentMl / 1000).toFixed(1)} / {(hydration.targetMl / 1000).toFixed(1)} L
            </div>
          </div>
        </div>
        <div className="mt-3 grid w-full grid-cols-2 gap-3">
          <Summary label="今日目标" value={`${(hydration.targetMl / 1000).toFixed(1)}L`} />
          <Summary label="当前饮水" value={`${(hydration.currentMl / 1000).toFixed(1)}L`} />
        </div>
      </GlassPanel>

      <div className="grid grid-cols-3 gap-3">
        <PrimaryButton variant="secondary" onClick={() => addWater(250)} className="flex items-center justify-center gap-1 !px-2">
          <Plus size={16} />
          250ml
        </PrimaryButton>
        <PrimaryButton onClick={() => addWater(500)} className="flex items-center justify-center gap-1 !px-2">
          <Plus size={16} />
          500ml
        </PrimaryButton>
        <PrimaryButton variant="secondary" onClick={() => addWater(-250)} className="flex items-center justify-center gap-1 !px-2">
          <Minus size={16} />
          250ml
        </PrimaryButton>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          className="glass-panel pressable flex h-12 items-center justify-center gap-2 rounded-full text-sm font-semibold"
          type="button"
          onClick={() => openDrawer({ kind: 'water-custom' })}
        >
          <Droplets size={17} className="text-[color:var(--blue-main)]" />
          自定义添加
        </button>
        <button
          className="glass-panel pressable flex h-12 items-center justify-center gap-2 rounded-full text-sm font-semibold"
          type="button"
          onClick={() => openDrawer({ kind: 'water-target', payload: { targetMl: hydration.targetMl } })}
        >
          <Pencil size={16} className="text-[color:var(--blue-main)]" />
          修改目标
        </button>
      </div>

      <GlassPanel className="min-h-0 flex-1 p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-sm font-semibold">今日饮水记录</div>
          <div className="text-xs text-[color:var(--text-muted)]">时间线</div>
        </div>
        {hydration.logs.length ? (
          <div className="grid grid-cols-3 gap-2">
            {hydration.logs.slice(0, 6).map((log) => (
              <div key={log.id} className="rounded-2xl bg-white/50 px-3 py-3 text-center">
                <div className="text-xs text-[color:var(--text-muted)]">{log.time}</div>
                <div className={`mt-1 text-sm font-semibold ${log.amountMl < 0 ? 'text-amber-700' : ''}`}>
                  {log.amountMl > 0 ? '+' : ''}
                  {log.amountMl}ml
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl bg-white/50 p-4 text-sm text-[color:var(--text-muted)]">
            今日还没有饮水记录，先用上方快捷按钮添加一杯水。
          </div>
        )}
      </GlassPanel>
    </section>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl bg-white/50 p-4 text-center">
      <div className="text-xs text-[color:var(--text-muted)]">{label}</div>
      <div className="mt-1 text-2xl font-semibold tabular-nums">{value}</div>
    </div>
  );
}

