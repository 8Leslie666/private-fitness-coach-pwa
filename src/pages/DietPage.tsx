import { Check, Droplets, MoreHorizontal, Pencil, Plus, RefreshCcw, Trash2, Utensils } from 'lucide-react';
import { useState } from 'react';
import { ActionMenu } from '../components/ui/ActionMenu';
import { GlassPanel } from '../components/ui/GlassPanel';
import { useAppStore } from '../store/appStore';
import { useDismissMenu } from '../utils/useDismissMenu';

export function DietPage() {
  const meals = useAppStore((state) => state.meals);
  const hydration = useAppStore((state) => state.hydration);
  const dietPreferences = useAppStore((state) => state.dietPreferences);
  const navigate = useAppStore((state) => state.navigate);
  const openDrawer = useAppStore((state) => state.openDrawer);
  const toggleMealDone = useAppStore((state) => state.toggleMealDone);
  const updateMeal = useAppStore((state) => state.updateMeal);
  const deleteMeal = useAppStore((state) => state.deleteMeal);
  const [menuId, setMenuId] = useState<string | null>(null);
  const waterRate = Math.round((hydration.currentMl / hydration.targetMl) * 100);
  const doneMeals = meals.filter((meal) => meal.done);
  const mealRate = meals.length ? Math.round((doneMeals.length / meals.length) * 100) : 0;
  const calories = doneMeals.reduce((total, meal) => total + (meal.calories ?? 0), 0);
  const protein = doneMeals.reduce((total, meal) => total + (meal.protein ?? 0), 0);
  const carbs = doneMeals.reduce((total, meal) => total + (meal.carbs ?? 0), 0);
  const fat = doneMeals.reduce((total, meal) => total + (meal.fat ?? 0), 0);
  useDismissMenu(Boolean(menuId), () => setMenuId(null));

  return (
    <section className="page">
      <header className="top-row">
        <div>
          <h1 className="page-title">膳食</h1>
          <p className="page-subtitle mt-2">
            {dietPreferences.mealsPerDay}餐制 · {dietPreferences.budgetYuan}元以内 · 蛋白 {dietPreferences.proteinTargetG}g
          </p>
        </div>
        <button className="icon-button pressable" type="button" onClick={() => openDrawer({ kind: 'meal-add' })} aria-label="新增餐食">
          <Plus size={19} />
        </button>
      </header>

      <GlassPanel className="p-4" onClick={() => navigate('hydration')}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-white/55 text-[color:var(--blue-main)]">
              <Droplets size={23} />
            </div>
            <div>
              <div className="text-sm font-semibold">喝水计划</div>
              <div className="mt-1 text-xs text-[color:var(--text-muted)]">
                {(hydration.currentMl / 1000).toFixed(1)} / {(hydration.targetMl / 1000).toFixed(1)} L
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-semibold tabular-nums">{waterRate}%</div>
            <div className="text-xs text-[color:var(--text-muted)]">打开记录</div>
          </div>
        </div>
        <div className="progress-track mt-3">
          <div className="progress-fill" style={{ width: `${Math.min(waterRate, 100)}%` }} />
        </div>
      </GlassPanel>

      <GlassPanel className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-[color:var(--text-muted)]">今日摄入</div>
            <div className="mt-1 text-3xl font-semibold">
              {calories > 0 ? calories : '未记录'}
              {calories > 0 ? <span className="text-sm font-medium text-[color:var(--text-muted)]"> kcal</span> : null}
            </div>
          </div>
          <div className="grid h-16 w-16 place-items-center rounded-full border border-white/70 bg-white/45 text-lg font-semibold text-[color:var(--text-main)]">
            {mealRate}%
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
          <Macro label="蛋白质" value={protein ? `${protein} / ${dietPreferences.proteinTargetG}g` : `0 / ${dietPreferences.proteinTargetG}g`} />
          <Macro label="碳水" value={carbs ? `${carbs}g` : '待记录'} />
          <Macro label="脂肪" value={fat ? `${fat}g` : '待记录'} />
        </div>
      </GlassPanel>

      <div className="min-h-0 flex-1 overflow-y-auto pb-2 hide-scrollbar">
        <div className="mb-2 flex items-center justify-between px-1">
          <div className="text-sm font-semibold">今日餐食</div>
          <button className="text-xs font-semibold text-[color:var(--blue-main)]" type="button" onClick={() => openDrawer({ kind: 'meal-add' })}>
            新增
          </button>
        </div>
        <div className="grid gap-2">
          {meals.map((meal, index) => {
            const isMcdonalds =
              meal.fatLossFriendliness === 'medium-low' || /麦当劳|麦辣|M记|McDonald/i.test(`${meal.description} ${meal.detail}`);
            return (
            <GlassPanel key={meal.id} className={`relative p-3 ${menuId === meal.id ? 'menu-host' : ''}`}>
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white/55 text-[color:var(--blue-main)]">
                  <Utensils size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{meal.name}</span>
                    {meal.done ? <Check size={14} className="text-emerald-600" /> : null}
                  </div>
                  <div className="mt-1 truncate text-xs text-[color:var(--text-muted)]">{meal.description}</div>
                </div>
                <button
                  className="mini-round"
                  type="button"
                  data-action-menu-trigger="true"
                  onClick={() => setMenuId(menuId === meal.id ? null : meal.id)}
                >
                  <MoreHorizontal size={18} />
                </button>
              </div>
              {isMcdonalds ? (
                <div className="mt-2 inline-flex rounded-full bg-white/55 px-3 py-1 text-[11px] font-semibold text-amber-700">
                  减脂友好度中低
                </div>
              ) : null}
              {menuId === meal.id ? (
                <ActionMenu
                  className={index >= 2 ? 'action-menu-up' : ''}
                  items={[
                    {
                      label: meal.done ? '取消已吃' : '标记已吃',
                      icon: <Check size={15} />,
                      onClick: () => {
                        toggleMealDone(meal.id);
                        setMenuId(null);
                      },
                    },
                    {
                      label: '编辑',
                      icon: <Pencil size={15} />,
                      onClick: () => {
                        openDrawer({ kind: 'meal-edit', payload: { id: meal.id } });
                        setMenuId(null);
                      },
                    },
                    {
                      label: '替换',
                      icon: <RefreshCcw size={15} />,
                      onClick: () => {
                        updateMeal(meal.id, {
                          description: '麦当劳板烧鸡腿堡去酱 + 无糖茶',
                          detail: '应急可用，减脂友好度中低；不作为高频推荐。',
                          fatLossFriendliness: 'medium-low',
                        });
                        setMenuId(null);
                      },
                    },
                    {
                      label: '删除',
                      icon: <Trash2 size={15} />,
                      danger: true,
                      onClick: () => {
                        if (window.confirm('确认删除该餐次？')) deleteMeal(meal.id);
                        setMenuId(null);
                      },
                    },
                  ]}
                />
              ) : null}
            </GlassPanel>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Macro({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/45 p-2">
      <div className="text-[color:var(--text-muted)]">{label}</div>
      <div className="mt-1 font-semibold">{value}</div>
    </div>
  );
}
