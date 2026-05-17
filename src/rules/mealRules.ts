import { bannedDietTerms, replacementFoods } from '../data/dietOptions';
import type { MealItem, MealPlan, MealType, UserProfile } from '../types';

const mealNames: Record<MealType, string> = {
  firstMeal: '第一餐',
  preWorkout: '训练前补给',
  secondMeal: '第二餐',
  lateSnack: '夜间备用',
};

const defaultMeals: Record<MealType, Omit<MealItem, 'id' | 'mealType' | 'completed'>> = {
  firstMeal: {
    name: '牛肉饭，饭半份，少酱，加青菜',
    storeName: '美团 / 淘宝闪购',
    price: 28,
    caloriesEstimate: 620,
    proteinEstimate: 38,
    carbEstimate: 70,
    fatEstimate: 18,
    containsEgg: false,
    containsSeafood: false,
    containsOffal: false,
    dietScore: 8,
    orderNote: '米饭半份，酱汁少放，额外加青菜。',
  },
  preWorkout: {
    name: '无糖豆浆或牛奶',
    storeName: '便利店 / 外卖',
    price: 8,
    caloriesEstimate: 150,
    proteinEstimate: 9,
    carbEstimate: 14,
    fatEstimate: 5,
    containsEgg: false,
    containsSeafood: false,
    containsOffal: false,
    dietScore: 8,
    orderNote: '训练前 60-90 分钟，小份即可。',
  },
  secondMeal: {
    name: '去皮鸡腿饭，饭半份，加青菜',
    storeName: '美团 / 淘宝闪购',
    price: 30,
    caloriesEstimate: 650,
    proteinEstimate: 42,
    carbEstimate: 72,
    fatEstimate: 20,
    containsEgg: false,
    containsSeafood: false,
    containsOffal: false,
    dietScore: 8,
    orderNote: '鸡腿去皮，少汁，饭半份。',
  },
  lateSnack: {
    name: '无糖酸奶或豆干',
    storeName: '便利店 / 外卖',
    price: 12,
    caloriesEstimate: 160,
    proteinEstimate: 13,
    carbEstimate: 10,
    fatEstimate: 6,
    containsEgg: false,
    containsSeafood: false,
    containsOffal: false,
    dietScore: 8,
    orderNote: '只有饿明显再吃，不补油脂。',
  },
};

const mealAlternatives: Record<MealType, string[]> = {
  firstMeal: [
    '鸡胸肉轻食碗，主食半份，加青菜',
    '猪瘦肉套餐，饭半份，加青菜',
    '兰州拉面，牛肉加量，少面，不喝汤',
  ],
  preWorkout: ['牛奶', '无糖豆浆', '无糖酸奶', '蛋白粉一勺'],
  secondMeal: [
    '黄焖鸡，少汁，饭半份',
    '白切鸡饭，去皮，饭半份',
    '麻辣烫：多蔬菜 + 豆腐/豆干 + 牛肉/鸡肉，少粉，不喝汤',
  ],
  lateSnack: ['鸡胸肉即食包', '无糖酸奶', '豆腐/豆干类低油食品', '蛋白粉一勺'],
};

function uid(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function sanitizeDietText(text: string): string {
  return bannedDietTerms.reduce((current, term, index) => {
    if (!current.includes(term)) return current;
    return current.replaceAll(term, replacementFoods[index % replacementFoods.length]);
  }, text);
}

export function createMealItem(type: MealType, overrides: Partial<MealItem> = {}): MealItem {
  const base = defaultMeals[type];
  const name = sanitizeDietText(overrides.name ?? base.name);
  return {
    ...base,
    id: overrides.id ?? uid(type),
    mealType: type,
    completed: overrides.completed ?? false,
    ...overrides,
    name,
    containsEgg: false,
    containsSeafood: false,
    containsOffal: overrides.containsOffal ?? false,
  };
}

export function createDefaultMealPlan(date: string, profile: UserProfile, waterTarget: number): MealPlan {
  return {
    date,
    firstMeal: createMealItem('firstMeal'),
    preWorkout: createMealItem('preWorkout'),
    secondMeal: createMealItem('secondMeal'),
    lateSnack: createMealItem('lateSnack'),
    waterTarget,
    accepted: false,
    completed: false,
    budget: profile.mealBudget,
    note: `${profile.mealsPerDay} 餐制，不吃早餐，禁用鸡蛋和海鲜。`,
  };
}

export function updateMeal(plan: MealPlan, type: MealType, patch: Partial<MealItem>): MealPlan {
  const current = plan[type] ?? createMealItem(type);
  const next = createMealItem(type, { ...current, ...patch, id: current.id });
  return {
    ...plan,
    [type]: next,
    completed: [plan.firstMeal, plan.preWorkout, plan.secondMeal, plan.lateSnack]
      .map((item) => (item?.mealType === type ? next : item))
      .filter(Boolean)
      .every((item) => item?.completed),
  };
}

export function replaceMeal(plan: MealPlan, type: MealType): MealPlan {
  const current = plan[type];
  const alternatives = mealAlternatives[type];
  const currentIndex = alternatives.findIndex((name) => name === current?.name);
  const nextName = alternatives[(currentIndex + 1) % alternatives.length];
  return updateMeal(plan, type, {
    name: nextName,
    storeName: type === 'preWorkout' || type === 'lateSnack' ? '便利店 / 外卖' : '美团 / 淘宝闪购',
    dietScore: nextName.includes('麦当劳') ? 5 : 8,
  });
}

export function mealTypeLabel(type: MealType): string {
  return mealNames[type];
}

export function createFrequentStoreFromMeal(item: MealItem) {
  return {
    id: uid('store'),
    storeName: item.storeName || item.name,
    platform: '美团',
    location: '福建福州仓山区',
    dishes: [{ ...item, id: uid('dish') }],
    enabled: true,
  };
}
