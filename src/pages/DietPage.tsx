import { ChevronRight, Plus, Shuffle, Store, Utensils } from 'lucide-react';
import { useState } from 'react';
import { InkButton } from '../components/Ink/InkButton';
import { InkCard } from '../components/Ink/InkCard';
import { InkDrawer } from '../components/Ink/InkDrawer';
import { InkPage } from '../components/Ink/InkPage';
import { MealCard } from '../components/Meals/MealCard';
import { defaultTrainingPlan } from '../data/defaultTrainingPlan';
import {
  createDefaultMealPlan,
  createFrequentStoreFromMeal,
  createMealItem,
  replaceMeal,
  sanitizeDietText,
  updateMeal,
} from '../rules/mealRules';
import { calculateWaterGoal } from '../rules/waterRules';
import type { AppPage, AppState, FrequentStore, MealItem, MealPlan, MealType, WaterLog } from '../types';
import { getDayKey, toDateKey } from '../utils/date';

interface DietPageProps {
  state: AppState;
  onPageChange: (page: AppPage) => void;
  onAddWater: (log: WaterLog) => void;
  onMealPlanChange: (mealPlan: MealPlan) => void;
  onFrequentStoreChange: (store: FrequentStore) => void;
}

const mealTypes: MealType[] = ['firstMeal', 'preWorkout', 'secondMeal', 'lateSnack'];

export function DietPage({ state, onPageChange, onAddWater, onMealPlanChange, onFrequentStoreChange }: DietPageProps) {
  const today = toDateKey();
  const plan = defaultTrainingPlan[getDayKey(today)];
  const waterGoal = calculateWaterGoal(state.profile, plan, today);
  const mealPlan = state.mealPlans[today] ?? createDefaultMealPlan(today, state.profile, waterGoal.totalGoalMl);
  const [editingType, setEditingType] = useState<MealType | null>(null);
  const [storeDrawer, setStoreDrawer] = useState(false);
  const editingItem = editingType ? mealPlan[editingType] ?? createMealItem(editingType) : null;
  const [draft, setDraft] = useState<MealItem | null>(null);

  function savePlan(next: MealPlan) {
    onMealPlanChange(next);
  }

  function startEdit(type: MealType) {
    const item = mealPlan[type] ?? createMealItem(type);
    setDraft(item);
    setEditingType(type);
  }

  function saveDraft() {
    if (!editingType || !draft) return;
    savePlan(updateMeal(mealPlan, editingType, { ...draft, name: sanitizeDietText(draft.name), orderNote: sanitizeDietText(draft.orderNote) }));
    setEditingType(null);
    setDraft(null);
  }

  function toggleMeal(type: MealType) {
    const item = mealPlan[type] ?? createMealItem(type);
    savePlan(updateMeal(mealPlan, type, { completed: !item.completed }));
  }

  function replace(type: MealType) {
    savePlan(replaceMeal(mealPlan, type));
  }

  function deleteMeal(type: MealType) {
    savePlan({ ...mealPlan, [type]: null, completed: false });
  }

  function addToFrequent(type: MealType) {
    const item = mealPlan[type];
    if (!item) return;
    onFrequentStoreChange(createFrequentStoreFromMeal(item));
  }

  function shuffleAll() {
    const next = mealTypes.reduce((current, type) => replaceMeal(current, type), mealPlan);
    savePlan(next);
  }

  const completedMeals = mealTypes.filter((type) => mealPlan[type]?.completed).length;

  return (
    <InkPage
      title="今日膳食"
      subtitle={`${state.profile.mealsPerDay} 餐外卖 · 不吃鸡蛋和海鲜 · 每餐 ${state.profile.mealBudget} 元以内`}
      eyebrow={
        <>
          <span className="seal-dot">膳</span>
          <span>{state.profile.locationArea}</span>
        </>
      }
    >

      <InkCard title="今日安排" subtitle={`${completedMeals} / ${mealTypes.length} 项已完成`}>
        <div className="grid gap-3">
          {mealTypes.map((type) => (
            <MealCard
              key={type}
              type={type}
              item={mealPlan[type]}
              onToggle={() => toggleMeal(type)}
              onReplace={() => replace(type)}
              onEdit={() => startEdit(type)}
              onAddFrequent={() => addToFrequent(type)}
              onDelete={() => deleteMeal(type)}
              compact
            />
          ))}
        </div>
      </InkCard>

      <InkButton onClick={shuffleAll} className="flex w-full items-center justify-center gap-2 text-base">
        <Shuffle size={18} />
        一键换一套
      </InkButton>

      <div className="grid grid-cols-3 gap-2">
        <button type="button" onClick={() => onPageChange('takeout-scan')} className="min-h-[76px] rounded-[22px] bg-white/82 p-3 text-sm font-semibold text-ink shadow-soft">
          <Utensils size={18} className="mx-auto mb-2 text-mountain" />
          外卖识别
        </button>
        <button type="button" onClick={() => setStoreDrawer(true)} className="min-h-[76px] rounded-[22px] bg-white/82 p-3 text-sm font-semibold text-ink shadow-soft">
          <Store size={18} className="mx-auto mb-2 text-mountain" />
          常吃门店
        </button>
        <button type="button" onClick={() => onPageChange('mcdonalds')} className="min-h-[76px] rounded-[22px] bg-white/82 p-3 text-sm font-semibold text-ink shadow-soft">
          <ChevronRight size={18} className="mx-auto mb-2 text-mountain" />
          麦当劳
        </button>
      </div>

      <InkDrawer title="编辑餐次" open={Boolean(editingType)} onClose={() => setEditingType(null)}>
        {draft && (
          <div className="grid gap-3">
            <input
              value={draft.name}
              onChange={(event) => setDraft({ ...draft, name: event.target.value })}
              className="h-12 rounded-2xl border border-line bg-white/80 px-3 outline-none"
              placeholder="餐品名称"
            />
            <input
              value={draft.storeName}
              onChange={(event) => setDraft({ ...draft, storeName: event.target.value })}
              className="h-12 rounded-2xl border border-line bg-white/80 px-3 outline-none"
              placeholder="门店 / 平台"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                value={draft.price}
                onChange={(event) => setDraft({ ...draft, price: Number(event.target.value) })}
                className="h-12 rounded-2xl border border-line bg-white/80 px-3 outline-none"
                placeholder="价格"
              />
              <input
                type="number"
                value={draft.proteinEstimate}
                onChange={(event) => setDraft({ ...draft, proteinEstimate: Number(event.target.value) })}
                className="h-12 rounded-2xl border border-line bg-white/80 px-3 outline-none"
                placeholder="蛋白质 g"
              />
            </div>
            <textarea
              value={draft.orderNote}
              onChange={(event) => setDraft({ ...draft, orderNote: event.target.value })}
              className="min-h-24 rounded-2xl border border-line bg-white/80 p-3 outline-none"
              placeholder="下单备注，例如饭半份、少酱、去皮"
            />
            <div className="rounded-2xl bg-amber-50 p-3 text-sm leading-6 text-amber-800">
              保存时会自动过滤鸡蛋、海鲜、鱼、虾、蟹等禁用词；内脏默认不推荐。
            </div>
            <InkButton onClick={saveDraft} className="w-full">保存餐次</InkButton>
          </div>
        )}
      </InkDrawer>

      <InkDrawer title="常吃门店" open={storeDrawer} onClose={() => setStoreDrawer(false)}>
        <div className="grid gap-3">
          {state.frequentStores.map((store) => (
            <div key={store.id} className="rounded-2xl bg-white/82 p-3 shadow-soft">
              <p className="font-semibold text-ink">{store.storeName}</p>
              <p className="mt-1 text-sm text-muted">{store.platform} · {store.location}</p>
            </div>
          ))}
          <InkButton
            variant="secondary"
            onClick={() =>
              onFrequentStoreChange({
                id: `store-${Date.now()}`,
                storeName: '新常吃门店',
                platform: state.profile.deliveryPlatforms[0] ?? '美团',
                location: state.profile.locationArea,
                dishes: [],
                enabled: true,
              })
            }
            className="flex w-full items-center justify-center gap-2"
          >
            <Plus size={17} />
            新增常吃门店
          </InkButton>
        </div>
      </InkDrawer>
    </InkPage>
  );
}
