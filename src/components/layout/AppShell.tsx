import { useEffect, useMemo, useState, type PropsWithChildren, type ReactNode } from 'react';
import { Bell, Clock, Dumbbell, Minus, Moon, Plus, ScrollText } from 'lucide-react';
import {
  useAppStore,
  getPlanSections,
  type Meal,
  type Profile,
  type ReminderRhythm,
  type TrainingPlan,
  type UpsertPlanInput,
  type Vitals,
  type WorkoutSession,
} from '../../store/appStore';
import { AppDrawer } from '../ui/AppDrawer';
import { BottomNav } from './BottomNav';
import { PrimaryButton } from '../ui/PrimaryButton';

const immersiveScreens = new Set(['workout', 'rest', 'feedback', 'finish']);

export function AppShell({ children }: PropsWithChildren) {
  const screen = useAppStore((state) => state.screen);
  const drawer = useAppStore((state) => state.drawer);
  const closeDrawer = useAppStore((state) => state.closeDrawer);
  const hideNav = Boolean(drawer) || immersiveScreens.has(screen);
  useReminderNotifications();

  return (
    <div className="app-viewport">
      <div className="app-device">
        <main className="app-main">{children}</main>
        {!hideNav ? <BottomNav /> : null}
        {drawer ? (
          <DrawerRenderer key={`${drawer.kind}-${drawer.payload?.id ?? drawer.payload?.group ?? ''}`} onClose={closeDrawer} />
        ) : null}
      </div>
    </div>
  );
}

function useReminderNotifications() {
  const reminderRhythm = useAppStore((state) => state.reminderRhythm);

  useEffect(() => {
    if (!reminderRhythm.dailyEnabled || typeof window === 'undefined' || !('Notification' in window)) return;

    const tick = () => {
      if (Notification.permission !== 'granted') return;
      const now = new Date();
      const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const today = now.toLocaleDateString('en-CA');
      const items = [
        ['morning', reminderRhythm.morning],
        ['training', reminderRhythm.training],
        ['summary', reminderRhythm.summary],
      ] as const;

      items.forEach(([key, item]) => {
        if (!item.enabled || item.time !== time) return;
        const storageKey = `private-fitness-reminder-${key}-${today}`;
        if (localStorage.getItem(storageKey)) return;
        localStorage.setItem(storageKey, 'sent');
        new Notification(item.title, {
          body: item.note,
          tag: `private-fitness-${key}`,
          icon: '/icon.svg',
        });
      });
    };

    tick();
    const timer = window.setInterval(tick, 30_000);
    return () => window.clearInterval(timer);
  }, [reminderRhythm]);
}

function DrawerRenderer({ onClose }: { onClose: () => void }) {
  const drawer = useAppStore((state) => state.drawer);
  const plans = useAppStore((state) => state.plans);
  const meals = useAppStore((state) => state.meals);
  const vitals = useAppStore((state) => state.vitals);
  const profile = useAppStore((state) => state.profile);
  const reminderRhythm = useAppStore((state) => state.reminderRhythm);
  const workout = useAppStore((state) => state.workoutSession);
  const addWater = useAppStore((state) => state.addWater);
  const setWaterTarget = useAppStore((state) => state.setWaterTarget);
  const updateVitals = useAppStore((state) => state.updateVitals);
  const upsertPlan = useAppStore((state) => state.upsertPlan);
  const deletePlan = useAppStore((state) => state.deletePlan);
  const updateMeal = useAppStore((state) => state.updateMeal);
  const updateProfile = useAppStore((state) => state.updateProfile);
  const updateReminderRhythm = useAppStore((state) => state.updateReminderRhythm);
  const updateWorkoutParams = useAppStore((state) => state.updateWorkoutParams);
  const resetData = useAppStore((state) => state.resetData);

  if (!drawer) return null;

  if (drawer.kind === 'water-custom') {
    return (
      <WaterAmountDrawer
        title="添加饮水量"
        subtitle="核心记录在喝水计划页完成"
        initialValue={300}
        onClose={onClose}
        onSave={(value) => {
          addWater(value);
          onClose();
        }}
      />
    );
  }

  if (drawer.kind === 'water-target') {
    return (
      <WaterAmountDrawer
        title="修改今日目标"
        subtitle="建议保持 2.0L - 3.0L 区间"
        initialValue={Number(drawer.payload?.targetMl ?? 2500)}
        unit="ml"
        min={800}
        max={5000}
        step={100}
        onClose={onClose}
        onSave={(value) => {
          setWaterTarget(value);
          onClose();
        }}
      />
    );
  }

  if (drawer.kind === 'status-edit') {
    return <VitalsDrawer vitals={vitals} onClose={onClose} onSave={updateVitals} />;
  }

  if (drawer.kind === 'plan-edit' || drawer.kind === 'plan-add') {
    const plan = plans.find((item) => item.id === drawer.payload?.id);
    return (
      <PlanDrawer
        plan={plan}
        onClose={onClose}
        onSave={(value) => {
          upsertPlan(value);
          onClose();
        }}
      />
    );
  }

  if (drawer.kind === 'plan-delete') {
    const plan = plans.find((item) => item.id === drawer.payload?.id);
    return (
      <ConfirmDrawer
        title="确认删除"
        subtitle={plan ? `${plan.day} · ${plan.title} 将从本周计划移除` : '该计划将被移除'}
        confirmLabel="删除计划"
        onClose={onClose}
        onConfirm={() => {
          if (plan) deletePlan(plan.id);
          onClose();
        }}
      />
    );
  }

  if (drawer.kind === 'meal-edit') {
    const meal = meals.find((item) => item.id === drawer.payload?.id);
    return (
      <MealDrawer
        meal={meal}
        onClose={onClose}
        onSave={(id, patch) => {
          updateMeal(id, patch);
          onClose();
        }}
      />
    );
  }

  if (drawer.kind === 'training-detail') {
    const plan = plans.find((item) => item.id === drawer.payload?.id);
    return <TrainingDetailDrawer plan={plan} onClose={onClose} />;
  }

  if (drawer.kind === 'profile-edit') {
    const group = String(drawer.payload?.group ?? '训练偏好');
    if (group === '提醒节律') {
      return (
        <ReminderDrawer
          reminderRhythm={reminderRhythm}
          onClose={onClose}
          onSave={(patch) => {
            updateReminderRhythm(patch);
            onClose();
          }}
        />
      );
    }

    return (
      <ProfileDrawer
        group={group}
        profile={profile}
        onClose={onClose}
        onSave={(patch) => {
          updateProfile(patch);
          onClose();
        }}
      />
    );
  }

  if (drawer.kind === 'workout-params') {
    return (
      <WorkoutParamsDrawer
        workout={workout}
        onClose={onClose}
        onSave={(patch) => {
          updateWorkoutParams(patch);
          onClose();
        }}
      />
    );
  }

  if (drawer.kind === 'progress-record') {
    return (
      <AppDrawer title={String(drawer.payload?.title ?? '记录详情')} subtitle="保留判断，不做后台报表" onClose={onClose}>
        <div className="drawer-body">
          <div className="grid gap-3">
            <div className="rounded-3xl bg-white/55 p-4 text-sm text-[color:var(--text-muted)]">
              最近记录还不够密集。先保持本周 4 次行练、饮水 2.5L 和两餐制执行，连续 7 天后这里会形成更清晰的判断。
            </div>
            <div className="rounded-3xl bg-white/55 p-4">
              <div className="text-sm font-semibold">当前判断</div>
              <div className="mt-2 text-2xl font-semibold">{drawer.payload?.value ?? '稳定'}</div>
            </div>
          </div>
        </div>
        <div className="drawer-actions !grid-cols-1">
          <PrimaryButton onClick={onClose}>知道了</PrimaryButton>
        </div>
      </AppDrawer>
    );
  }

  return (
    <ConfirmDrawer
      title="重置数据"
      subtitle="将清空本地记录、训练完成状态、喝水时间线和餐食勾选；私人教练计划模板会保留。"
      confirmLabel="确认重置"
      onClose={onClose}
      onConfirm={resetData}
    />
  );
}

function WaterAmountDrawer({
  title,
  subtitle,
  initialValue,
  unit = 'ml',
  min = 0,
  max = 5000,
  step = 50,
  onClose,
  onSave,
}: {
  title: string;
  subtitle: string;
  initialValue: number;
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
  onClose: () => void;
  onSave: (value: number) => void;
}) {
  const [value, setValue] = useState(initialValue);
  return (
    <AppDrawer title={title} subtitle={subtitle} onClose={onClose}>
      <div className="drawer-body">
        <div className="rounded-[30px] bg-white/55 p-5">
          <div className="text-xs text-[color:var(--text-muted)]">数值</div>
          <div className="mt-5 flex items-center justify-between">
            <StepperButton onClick={() => setValue((item) => Math.max(min, item - step))} icon="minus" />
            <div className="text-center">
              <div className="text-5xl font-semibold tabular-nums">{value}</div>
              <div className="mt-1 text-sm text-[color:var(--text-muted)]">{unit}</div>
            </div>
            <StepperButton onClick={() => setValue((item) => Math.min(max, item + step))} icon="plus" />
          </div>
          <input
            className="liquid-input mt-6 text-center font-semibold"
            inputMode="numeric"
            value={value}
            onChange={(event) => setValue(Number(event.target.value.replace(/\D/g, '')) || 0)}
          />
        </div>
      </div>
      <div className="drawer-actions">
        <PrimaryButton variant="secondary" onClick={onClose}>
          取消
        </PrimaryButton>
        <PrimaryButton onClick={() => onSave(value)}>保存</PrimaryButton>
      </div>
    </AppDrawer>
  );
}

function VitalsDrawer({
  vitals,
  onClose,
  onSave,
}: {
  vitals: Vitals;
  onClose: () => void;
  onSave: (vitals: Partial<Vitals>) => void;
}) {
  const [draft, setDraft] = useState(vitals);
  return (
    <AppDrawer title="今日状态" subtitle="只记录影响训练判断的四项" onClose={onClose}>
      <div className="drawer-body">
        <div className="rounded-[30px] bg-white/55 px-4">
          <NumberRow label="睡眠" value={draft.sleepHours} unit="h" step={0.1} onChange={(value) => setDraft({ ...draft, sleepHours: value })} />
          <NumberRow label="心率" value={draft.heartRate} unit="bpm" step={1} onChange={(value) => setDraft({ ...draft, heartRate: value })} />
          <NumberRow label="HRV" value={draft.hrv} unit="ms" step={1} onChange={(value) => setDraft({ ...draft, hrv: value })} />
          <NumberRow label="压力" value={draft.stress} unit="" step={1} onChange={(value) => setDraft({ ...draft, stress: value })} />
        </div>
      </div>
      <div className="drawer-actions">
        <PrimaryButton variant="secondary" onClick={onClose}>
          取消
        </PrimaryButton>
        <PrimaryButton onClick={() => onSave(draft)}>保存状态</PrimaryButton>
      </div>
    </AppDrawer>
  );
}

function PlanDrawer({
  plan,
  onClose,
  onSave,
}: {
  plan?: TrainingPlan;
  onClose: () => void;
  onSave: (plan: UpsertPlanInput) => void;
}) {
  const [draft, setDraft] = useState({
    id: plan?.id,
    day: plan?.day ?? '周一',
    title: plan?.title ?? '深蹲',
    accessory: plan?.accessory ?? '卧推辅助 / 下肢辅助',
    finisher: plan?.finisher ?? '平板支撑 + 死虫',
    weight: plan?.weight ?? 50,
    reps: plan?.reps ?? 5,
    sets: plan?.sets ?? 5,
    rpe: plan?.rpe ?? '6-7',
    durationMin: plan?.durationMin ?? 55,
    flow: plan?.flow ?? [],
    completed: plan?.completed ?? false,
  });

  return (
    <AppDrawer title={plan ? '修改计划' : '添加训练'} subtitle="只设置本周必要参数" onClose={onClose}>
      <div className="drawer-body">
        <div className="grid gap-3">
          <TextField label="日期" value={draft.day} onChange={(day) => setDraft({ ...draft, day })} />
          <TextField label="主项" value={draft.title} onChange={(title) => setDraft({ ...draft, title })} />
          <TextField label="辅助训练" value={draft.accessory} onChange={(accessory) => setDraft({ ...draft, accessory })} />
          <TextField label="核心收尾" value={draft.finisher} onChange={(finisher) => setDraft({ ...draft, finisher })} />
          <div className="rounded-[30px] bg-white/55 px-4">
            <NumberRow label="重量" value={draft.weight} unit="kg" step={2.5} onChange={(weight) => setDraft({ ...draft, weight })} />
            <NumberRow label="次数" value={draft.reps} unit="次" step={1} onChange={(reps) => setDraft({ ...draft, reps })} />
            <NumberRow label="组数" value={draft.sets} unit="组" step={1} onChange={(sets) => setDraft({ ...draft, sets })} />
            <NumberRow label="总时长" value={draft.durationMin} unit="分钟" step={5} onChange={(durationMin) => setDraft({ ...draft, durationMin })} />
          </div>
          <TextField label="RPE" value={draft.rpe} onChange={(rpe) => setDraft({ ...draft, rpe })} />
        </div>
      </div>
      <div className="drawer-actions">
        <PrimaryButton variant="secondary" onClick={onClose}>
          取消
        </PrimaryButton>
        <PrimaryButton onClick={() => onSave(draft)}>确认保存</PrimaryButton>
      </div>
    </AppDrawer>
  );
}

function MealDrawer({
  meal,
  onClose,
  onSave,
}: {
  meal?: Meal;
  onClose: () => void;
  onSave: (id: string, patch: Partial<Meal>) => void;
}) {
  const [description, setDescription] = useState(meal?.description ?? '');
  const [detail, setDetail] = useState(meal?.detail ?? '');
  return (
    <AppDrawer title={meal?.name ?? '餐次'} subtitle="规则：不推荐鸡蛋、海鲜、内脏" onClose={onClose}>
      <div className="drawer-body">
        <div className="grid gap-3">
          <TextField label="餐食" value={description} onChange={setDescription} />
          <label className="liquid-field">
            <span className="text-xs text-[color:var(--text-muted)]">备注</span>
            <textarea
              className="liquid-textarea min-h-28 resize-none"
              value={detail}
              onChange={(event) => setDetail(event.target.value)}
            />
          </label>
        </div>
      </div>
      <div className="drawer-actions">
        <PrimaryButton variant="secondary" onClick={onClose}>
          取消
        </PrimaryButton>
        <PrimaryButton onClick={() => meal && onSave(meal.id, { description, detail })}>保存</PrimaryButton>
      </div>
    </AppDrawer>
  );
}

function TrainingDetailDrawer({ plan, onClose }: { plan?: TrainingPlan; onClose: () => void }) {
  if (!plan) {
    return (
      <AppDrawer title="训练详情" subtitle="未找到该训练日" onClose={onClose}>
        <div className="drawer-body">
          <div className="rounded-[30px] bg-white/55 p-5 text-sm text-[color:var(--text-muted)]">训练计划不存在。</div>
        </div>
      </AppDrawer>
    );
  }

  return (
    <AppDrawer title={plan.title} subtitle={`${plan.subtitle} · 预计 ${plan.estimatedMinutes} 分钟`} onClose={onClose}>
      <div className="drawer-body">
        <div className="mb-3 rounded-[30px] bg-white/55 p-4">
          <div className="text-xs font-semibold text-emerald-700">今日目标</div>
          <div className="mt-2 text-sm leading-5 text-[color:var(--text-muted)]">{plan.goal}</div>
          <div className="mt-3 text-xs font-semibold text-emerald-700">今日重点</div>
          <div className="mt-2 text-sm leading-5 text-[color:var(--text-muted)]">{plan.focus}</div>
        </div>
        <div className="grid gap-3">
          {getPlanSections(plan).map((sectionItem, sectionIndex) => (
            <div key={sectionItem.id} className="rounded-[28px] bg-white/55 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs text-[color:var(--text-muted)]">
                    {String(sectionIndex + 1).padStart(2, '0')} · {sectionItem.type}
                  </div>
                  <div className="mt-1 text-base font-semibold">{sectionItem.title}</div>
                </div>
                <div className="rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-[color:var(--text-muted)]">
                  {sectionItem.estimatedMinutes} 分钟
                </div>
              </div>
              <div className="mt-3 grid gap-2">
                {sectionItem.exercises.map((exercise) => (
                  <div key={exercise.id} className="rounded-2xl bg-white/56 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0 truncate text-sm font-semibold">{exercise.name}</div>
                      <div className="shrink-0 text-xs text-[color:var(--text-muted)]">
                        {exercise.exerciseType === 'strength'
                          ? `${exercise.weight ? `${exercise.weight}kg · ` : ''}${exercise.reps ?? '-'} × ${exercise.sets ?? '-'}`
                          : exercise.target
                            ? `${exercise.target}${exercise.targetUnit ?? ''}`
                            : exercise.targetUnit ?? ''}
                      </div>
                    </div>
                    {exercise.exerciseType === 'strength' ? (
                      <div className="mt-2 grid grid-cols-3 gap-2 text-[11px] text-[color:var(--text-muted)]">
                        <span>休息 {exercise.restSeconds ?? 0}s</span>
                        <span>RPE {exercise.targetRpe ?? '-'}</span>
                        <span>{exercise.weightUnit || '自重/器械'}</span>
                      </div>
                    ) : null}
                    {exercise.notes ? <div className="mt-2 text-xs leading-5 text-[color:var(--text-muted)]">{exercise.notes}</div> : null}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="drawer-actions !grid-cols-1">
        <PrimaryButton onClick={onClose}>完成查看</PrimaryButton>
      </div>
    </AppDrawer>
  );
}

function ReminderDrawer({
  reminderRhythm,
  onClose,
  onSave,
}: {
  reminderRhythm: ReminderRhythm;
  onClose: () => void;
  onSave: (patch: Partial<ReminderRhythm>) => void;
}) {
  const [draft, setDraft] = useState(reminderRhythm);

  const updateItem = (key: 'morning' | 'training' | 'summary', patch: Partial<ReminderRhythm[typeof key]>) => {
    setDraft((current) => ({
      ...current,
      [key]: {
        ...current[key],
        ...patch,
      },
    }));
  };

  return (
    <AppDrawer title="提醒节律" subtitle="开启每日提醒，保持修炼节奏" onClose={onClose}>
      <div className="drawer-body">
        <div className="rounded-[30px] bg-white/55 p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-base font-semibold">开启每日提醒</div>
              <div className="mt-1 text-xs text-[color:var(--text-muted)]">早晨、训练、总结三个轻提醒</div>
            </div>
            <Toggle checked={draft.dailyEnabled} onChange={(dailyEnabled) => setDraft({ ...draft, dailyEnabled })} />
          </div>
        </div>

        <div className="mt-3 grid gap-3">
          <ReminderBlock
            icon={<Moon size={20} />}
            item={draft.morning}
            disabled={!draft.dailyEnabled}
            accent="晨"
            onChange={(patch) => updateItem('morning', patch)}
          />
          <ReminderBlock
            icon={<Dumbbell size={20} />}
            item={draft.training}
            disabled={!draft.dailyEnabled}
            accent="练"
            onChange={(patch) => updateItem('training', patch)}
          />
          <ReminderBlock
            icon={<ScrollText size={20} />}
            item={draft.summary}
            disabled={!draft.dailyEnabled}
            accent="结"
            onChange={(patch) => updateItem('summary', patch)}
          />
        </div>
      </div>
      <div className="drawer-actions">
        <PrimaryButton variant="secondary" onClick={onClose}>
          取消
        </PrimaryButton>
        <PrimaryButton
          onClick={async () => {
            if (draft.dailyEnabled && 'Notification' in window && Notification.permission === 'default') {
              await Notification.requestPermission().catch(() => undefined);
            }
            onSave(draft);
          }}
        >
          保存节律
        </PrimaryButton>
      </div>
    </AppDrawer>
  );
}

function ReminderBlock({
  icon,
  item,
  disabled,
  accent,
  onChange,
}: {
  icon: ReactNode;
  item: ReminderRhythm['morning'];
  disabled: boolean;
  accent: string;
  onChange: (patch: Partial<ReminderRhythm['morning']>) => void;
}) {
  return (
    <div className={`relative overflow-hidden rounded-[28px] border p-4 shadow-[inset_0_1px_0_rgba(255,255,255,.86),0_14px_32px_rgba(32,48,70,.08)] ${disabled ? 'border-slate-200/80 bg-white/40 opacity-60' : item.enabled ? 'border-[#8FB9FF]/70 bg-[rgba(239,246,255,.72)]' : 'border-white/75 bg-white/50'}`}>
      <div className={`pointer-events-none absolute inset-0 ${!disabled && item.enabled ? 'bg-[radial-gradient(circle_at_78%_20%,rgba(58,130,247,.28),rgba(143,185,255,0)_42%)]' : 'bg-[radial-gradient(circle_at_78%_20%,rgba(143,185,255,.12),rgba(143,185,255,0)_38%)]'}`} />
      <div className="relative flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-full shadow-[inset_0_1px_0_rgba(255,255,255,.9)] ${!disabled && item.enabled ? 'bg-[color:var(--blue-main)] text-white' : 'bg-white/62 text-[color:var(--blue-main)]'}`}>
            {icon}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold">{item.title}</span>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${!disabled && item.enabled ? 'bg-[color:var(--blue-main)] text-white' : 'bg-white/62 text-[color:var(--blue-main)]'}`}>
                {accent}
              </span>
            </div>
            <input
              className="liquid-input mt-2 w-28 rounded-full px-3 py-2 font-semibold tabular-nums"
              type="time"
              value={item.time}
              disabled={disabled || !item.enabled}
              onChange={(event) => onChange({ time: event.target.value })}
            />
          </div>
        </div>
        <Toggle checked={item.enabled} disabled={disabled} onChange={(enabled) => onChange({ enabled })} />
      </div>
      <label className="relative mt-3 block">
        <span className="mb-1 flex items-center gap-1 text-xs text-[color:var(--text-muted)]">
          <Clock size={13} />
          提醒内容
        </span>
        <input
          className="liquid-input w-full rounded-2xl px-3 py-2"
          value={item.note}
          disabled={disabled || !item.enabled}
          onChange={(event) => onChange({ note: event.target.value })}
        />
      </label>
    </div>
  );
}

function Toggle({
  checked,
  disabled = false,
  onChange,
}: {
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative h-8 w-[56px] rounded-full border transition ${
        checked
          ? 'border-[#8FB9FF] bg-[color:var(--blue-main)] shadow-[0_0_18px_rgba(58,130,247,.28),inset_0_1px_0_rgba(255,255,255,.34)]'
          : 'border-slate-300/80 bg-slate-300/55'
      } ${disabled ? 'opacity-45' : ''}`}
      aria-pressed={checked}
    >
      <span
        className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow-[0_5px_14px_rgba(16,23,34,.18)] transition ${checked ? 'left-[29px]' : 'left-1'}`}
      />
    </button>
  );
}

function ProfileDrawer({
  group,
  profile,
  onClose,
  onSave,
}: {
  group: string;
  profile: Profile;
  onClose: () => void;
  onSave: (patch: Partial<Profile>) => void;
}) {
  const [draft, setDraft] = useState(profile);
  const rows = useMemo(() => {
    if (group === '训练偏好') {
      return (
        <>
          <NumberRow label="每周训练" value={draft.trainingDays} unit="天" step={1} onChange={(trainingDays) => setDraft({ ...draft, trainingDays })} />
          <NumberRow label="单次限制" value={draft.sessionLimitMin} unit="分钟" step={5} onChange={(sessionLimitMin) => setDraft({ ...draft, sessionLimitMin })} />
        </>
      );
    }
    if (group === '喝水目标') {
      return <div className="py-4 text-sm text-[color:var(--text-muted)]">请在喝水计划页调整今日目标，避免设置分散。</div>;
    }
    return (
      <>
        <NumberRow label="身高" value={draft.heightCm} unit="cm" step={1} onChange={(heightCm) => setDraft({ ...draft, heightCm })} />
        <NumberRow label="当前体重" value={draft.currentWeightKg} unit="kg" step={0.1} onChange={(currentWeightKg) => setDraft({ ...draft, currentWeightKg })} />
        <NumberRow label="目标体重" value={draft.targetWeightKg} unit="kg" step={0.1} onChange={(targetWeightKg) => setDraft({ ...draft, targetWeightKg })} />
      </>
    );
  }, [draft, group]);

  return (
    <AppDrawer title={group} subtitle="只保留影响计划的关键状态" onClose={onClose}>
      <div className="drawer-body">
        <div className="rounded-[30px] bg-white/55 px-4">{rows}</div>
      </div>
      <div className="drawer-actions">
        <PrimaryButton variant="secondary" onClick={onClose}>
          取消
        </PrimaryButton>
        <PrimaryButton onClick={() => onSave(draft)}>保存</PrimaryButton>
      </div>
    </AppDrawer>
  );
}

function WorkoutParamsDrawer({
  workout,
  onClose,
  onSave,
}: {
  workout: WorkoutSession | null;
  onClose: () => void;
  onSave: (patch: Partial<Pick<WorkoutSession, 'weight' | 'reps' | 'totalSets' | 'restSeconds' | 'rpe'>>) => void;
}) {
  const [draft, setDraft] = useState({
    weight: workout?.weight ?? 50,
    reps: workout?.reps ?? 5,
    totalSets: workout?.totalSets ?? 5,
    restSeconds: workout?.restSeconds ?? 150,
    rpe: workout?.rpe ?? '6-7',
  });
  return (
    <AppDrawer title="调整本组参数" subtitle="修改后立即影响当前训练驾驶舱" onClose={onClose}>
      <div className="drawer-body">
        <div className="rounded-[30px] bg-white/55 px-4">
          <NumberRow label="重量" value={draft.weight} unit="kg" step={2.5} onChange={(weight) => setDraft({ ...draft, weight })} />
          <NumberRow label="次数" value={draft.reps} unit="次" step={1} onChange={(reps) => setDraft({ ...draft, reps })} />
          <NumberRow label="组数" value={draft.totalSets} unit="组" step={1} onChange={(totalSets) => setDraft({ ...draft, totalSets })} />
          <NumberRow label="组间休息" value={draft.restSeconds} unit="s" step={30} onChange={(restSeconds) => setDraft({ ...draft, restSeconds })} />
        </div>
        <TextField label="RPE" value={draft.rpe} onChange={(rpe) => setDraft({ ...draft, rpe })} />
      </div>
      <div className="drawer-actions">
        <PrimaryButton variant="secondary" onClick={onClose}>
          取消
        </PrimaryButton>
        <PrimaryButton onClick={() => onSave(draft)}>确认修改</PrimaryButton>
      </div>
    </AppDrawer>
  );
}

function ConfirmDrawer({
  title,
  subtitle,
  confirmLabel,
  onClose,
  onConfirm,
}: {
  title: string;
  subtitle: string;
  confirmLabel: string;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <AppDrawer title={title} subtitle="二次确认" onClose={onClose}>
      <div className="drawer-body">
        <div className="rounded-[30px] bg-white/55 p-5 text-sm leading-6 text-[color:var(--text-muted)]">{subtitle}</div>
      </div>
      <div className="drawer-actions">
        <PrimaryButton variant="secondary" onClick={onClose}>
          取消
        </PrimaryButton>
        <PrimaryButton
          variant="danger"
          onClick={() => {
            onConfirm();
            onClose();
          }}
        >
          {confirmLabel}
        </PrimaryButton>
      </div>
    </AppDrawer>
  );
}

function NumberRow({
  label,
  value,
  unit,
  step,
  onChange,
}: {
  label: string;
  value: number;
  unit: string;
  step: number;
  onChange: (value: number) => void;
}) {
  const decimals = step < 1 ? 1 : 0;
  return (
    <div className="field-row">
      <div className="text-sm font-medium">{label}</div>
      <div className="number-stepper">
        <StepperButton icon="minus" onClick={() => onChange(Number((value - step).toFixed(decimals)))} />
        <div className="min-w-16 text-center text-sm font-semibold tabular-nums">
          {value.toFixed(decimals)}
          <span className="ml-1 text-xs font-normal text-[color:var(--text-muted)]">{unit}</span>
        </div>
        <StepperButton icon="plus" onClick={() => onChange(Number((value + step).toFixed(decimals)))} />
      </div>
    </div>
  );
}

function StepperButton({ icon, onClick }: { icon: 'plus' | 'minus'; onClick: () => void }) {
  return (
    <button className="mini-round" type="button" onClick={onClick} aria-label={icon === 'plus' ? '增加' : '减少'}>
      {icon === 'plus' ? <Plus size={16} /> : <Minus size={16} />}
    </button>
  );
}

function TextField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="liquid-field">
      <span className="text-xs text-[color:var(--text-muted)]">{label}</span>
      <input
        className="liquid-input font-semibold"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
