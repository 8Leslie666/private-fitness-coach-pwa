import { Check, Copy, Dumbbell, ListChecks, MoreHorizontal, Pencil, Play, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { ActionMenu } from '../components/ui/ActionMenu';
import { GlassPanel } from '../components/ui/GlassPanel';
import { PrimaryButton } from '../components/ui/PrimaryButton';
import { getPlanFlow, getPlanSessionTitle, useAppStore } from '../store/appStore';
import { useDismissMenu } from '../utils/useDismissMenu';

export function TrainingPlanPage() {
  const plans = useAppStore((state) => state.plans);
  const trainingProgram = useAppStore((state) => state.trainingProgram);
  const startWorkout = useAppStore((state) => state.startWorkout);
  const openDrawer = useAppStore((state) => state.openDrawer);
  const duplicatePlan = useAppStore((state) => state.duplicatePlan);
  const [menuId, setMenuId] = useState<string | null>(null);
  const today = plans.find((plan) => plan.sequenceIndex === trainingProgram.currentSequenceIndex) ?? plans[0];
  const todayFlow = getPlanFlow(today);
  useDismissMenu(Boolean(menuId), () => setMenuId(null));

  return (
    <section className="page">
      <header className="top-row">
        <div>
          <h1 className="page-title">行练计划</h1>
          <p className="page-subtitle mt-2">本周计划 · 训练历史</p>
        </div>
        <button className="icon-button pressable" type="button" onClick={() => openDrawer({ kind: 'plan-add' })}>
          <Plus size={19} />
        </button>
      </header>

      {today ? (
        <GlassPanel className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs font-semibold text-emerald-700">
                第 {trainingProgram.currentWeek} 周 / {trainingProgram.phaseName}
              </div>
              <div className="mt-2 text-2xl font-bold">{getPlanSessionTitle(today)}</div>
              <div className="mt-1 text-sm text-[color:var(--text-muted)]">
                进度 1 / {todayFlow.length} · 预计 {today.durationMin ?? 55} 分钟
              </div>
            </div>
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-[linear-gradient(145deg,rgba(255,255,255,.8),rgba(255,255,255,.35))] text-[color:var(--blue-main)] shadow-inner">
              <ListChecks size={25} />
            </div>
          </div>

          <div className="mt-4 rounded-[28px] border border-white/70 bg-white/45 p-3">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-emerald-700">行练次第</div>
                <div className="text-xl font-bold">今日流程概要</div>
              </div>
              <div className="text-xs text-[color:var(--text-muted)]">主项 + 辅助 + 核心</div>
            </div>
            <div className="grid max-h-[212px] gap-2 overflow-y-auto pr-1 hide-scrollbar">
              {todayFlow.map((step, index) => (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => openDrawer({ kind: 'training-detail', payload: { id: today.id } })}
                  className="grid grid-cols-[34px_1fr_auto] items-center gap-3 rounded-2xl bg-white/62 px-3 py-2 text-left"
                >
                  <div
                    className={`grid h-8 w-8 place-items-center rounded-full text-xs font-bold ${
                      index === 0 ? 'bg-emerald-600 text-white' : 'bg-white/70 text-[color:var(--text-muted)]'
                    }`}
                  >
                    {String(index + 1).padStart(2, '0')}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold">{step.title}</div>
                    <div className="truncate text-xs text-[color:var(--text-muted)]">{step.description}</div>
                  </div>
                  <div className="text-xs text-[color:var(--text-muted)]">{step.minutes} 分钟</div>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-[1.2fr_.9fr_.9fr] gap-2">
            <PrimaryButton onClick={() => startWorkout(today.id)} className="!animate-none">
              开始训练
            </PrimaryButton>
            <PrimaryButton variant="secondary" onClick={() => openDrawer({ kind: 'training-detail', payload: { id: today.id } })}>
              详情
            </PrimaryButton>
            <PrimaryButton variant="secondary" onClick={() => openDrawer({ kind: 'plan-edit', payload: { id: today.id } })}>
              调整
            </PrimaryButton>
          </div>
        </GlassPanel>
      ) : (
        <GlassPanel className="p-5">
          <div>
            <div className="text-xs text-[color:var(--text-muted)]">今日流程</div>
            <div className="mt-3 text-2xl font-bold">还没有训练计划</div>
            <div className="mt-1 text-sm text-[color:var(--text-muted)]">先添加一个主项，再配置辅助和收尾。</div>
          </div>
          <PrimaryButton className="mt-5 w-full" onClick={() => openDrawer({ kind: 'plan-add' })}>
            添加训练
          </PrimaryButton>
        </GlassPanel>
      )}

      <div className="min-h-0 flex-1">
        <div className="mb-2 flex items-center justify-between px-1">
          <div className="text-sm font-semibold">本周计划</div>
          <button className="text-xs font-semibold text-[color:var(--blue-main)]" type="button">
            训练历史
          </button>
        </div>
        <div className="grid gap-2">
          {plans.slice(0, 4).map((plan, index) => (
            <GlassPanel key={plan.id} className={`relative px-4 py-3 ${menuId === plan.id ? 'menu-host' : ''}`}>
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/55 text-xs font-semibold text-[color:var(--text-muted)]">
                  {plan.day}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{plan.title}</span>
                    {plan.completed ? <Check size={15} className="text-[color:var(--blue-main)]" /> : null}
                  </div>
                  <div className="mt-1 truncate text-xs text-[color:var(--text-muted)]">
                    {plan.weight}kg × {plan.reps} × {plan.sets} · {plan.accessory ?? '辅助训练'}
                  </div>
                </div>
                <button
                  type="button"
                  className="mini-round"
                  data-action-menu-trigger="true"
                  onClick={() => setMenuId(menuId === plan.id ? null : plan.id)}
                  aria-label="更多"
                >
                  <MoreHorizontal size={18} />
                </button>
              </div>
              {menuId === plan.id ? (
                <ActionMenu
                  className={index >= 2 ? 'action-menu-up' : ''}
                  items={[
                    {
                      label: '开始训练',
                      icon: <Play size={15} />,
                      onClick: () => {
                        startWorkout(plan.id);
                        setMenuId(null);
                      },
                    },
                    {
                      label: '修改计划',
                      icon: <Pencil size={15} />,
                      onClick: () => {
                        openDrawer({ kind: 'plan-edit', payload: { id: plan.id } });
                        setMenuId(null);
                      },
                    },
                    {
                      label: '复制一项',
                      icon: <Copy size={15} />,
                      onClick: () => {
                        duplicatePlan(plan.id);
                        setMenuId(null);
                      },
                    },
                    {
                      label: '删除',
                      icon: <Trash2 size={15} />,
                      danger: true,
                      onClick: () => {
                        openDrawer({ kind: 'plan-delete', payload: { id: plan.id } });
                        setMenuId(null);
                      },
                    },
                  ]}
                />
              ) : null}
            </GlassPanel>
          ))}
        </div>
        <GlassPanel className="mt-3 p-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold">轻活动日</div>
              <div className="mt-1 text-xs text-[color:var(--text-muted)]">周二 / 周四 / 周日 · 6000 步 + 拉伸 8-10 分钟</div>
            </div>
            <div className="rounded-full bg-white/60 px-3 py-1 text-xs font-semibold text-[color:var(--text-muted)]">不进入力量模板</div>
          </div>
        </GlassPanel>
      </div>
    </section>
  );
}
