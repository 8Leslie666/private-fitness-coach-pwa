import { Check, Pencil, RefreshCw, Star, Trash2 } from 'lucide-react';
import { InkButton } from '../Ink/InkButton';
import { mealTypeLabel } from '../../rules/mealRules';
import type { MealItem, MealType } from '../../types';

interface MealCardProps {
  type: MealType;
  item: MealItem | null;
  onToggle: () => void;
  onReplace: () => void;
  onEdit: () => void;
  onAddFrequent: () => void;
  onDelete: () => void;
  compact?: boolean;
}

export function MealCard({ type, item, onToggle, onReplace, onEdit, onAddFrequent, onDelete, compact = false }: MealCardProps) {
  return (
    <article className="rounded-card border border-white/80 bg-white/64 p-3 shadow-soft backdrop-blur">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-mountain">{mealTypeLabel(type)}</p>
          <h3 className="mt-1 text-[16px] font-semibold leading-6 text-ink900">{item?.name ?? '未安排'}</h3>
          <p className="mt-1 text-xs text-ink500">{item?.storeName ?? '点击编辑安排'}</p>
        </div>
        {item?.completed && (
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-mountain text-white">
            <Check size={16} />
          </span>
        )}
      </div>

      {item && !compact && (
        <div className="mt-3 grid grid-cols-4 gap-2 text-center text-[11px] text-ink500">
          <div className="rounded-2xl bg-inkwash p-2"><b className="block text-ink">{item.price}</b>元</div>
          <div className="rounded-2xl bg-inkwash p-2"><b className="block text-ink">{item.proteinEstimate}</b>蛋白</div>
          <div className="rounded-2xl bg-inkwash p-2"><b className="block text-ink">{item.caloriesEstimate}</b>kcal</div>
          <div className="rounded-2xl bg-inkwash p-2"><b className="block text-ink">{item.dietScore}</b>评分</div>
        </div>
      )}

      {item?.storeName.includes('麦当劳') && (
        <p className="mt-3 rounded-2xl bg-amber-50 p-3 text-xs leading-5 text-amber-800">
          麦当劳可接受但减脂友好度中低。每周控制 1-2 次以内，不配薯条，饮料换无糖。
        </p>
      )}

      {compact && item && (
        <p className="mt-2 text-xs text-ink500">{item.price} 元 · 蛋白约 {item.proteinEstimate}g · 评分 {item.dietScore}/10</p>
      )}

      <div className="mt-3 grid grid-cols-5 gap-1.5">
        <button type="button" onClick={onToggle} className="rounded-2xl bg-mountain/10 p-2 text-xs font-semibold text-mountain">
          <Check size={15} className="mx-auto mb-1" />
          {item?.completed ? '取消' : '已吃'}
        </button>
        <button type="button" onClick={onReplace} className="rounded-2xl bg-inkwash p-2 text-xs font-semibold text-ink900">
          <RefreshCw size={15} className="mx-auto mb-1" />
          替换
        </button>
        <button type="button" onClick={onEdit} className="rounded-2xl bg-inkwash p-2 text-xs font-semibold text-ink900">
          <Pencil size={15} className="mx-auto mb-1" />
          编辑
        </button>
        <button type="button" onClick={onAddFrequent} className="rounded-2xl bg-inkwash p-2 text-xs font-semibold text-ink900">
          <Star size={15} className="mx-auto mb-1" />
          常吃
        </button>
        <button type="button" onClick={onDelete} className="rounded-2xl bg-red-50 p-2 text-xs font-semibold text-red-700">
          <Trash2 size={15} className="mx-auto mb-1" />
          删除
        </button>
      </div>

      {!item && <InkButton onClick={onEdit} className="mt-3 w-full">安排{mealTypeLabel(type)}</InkButton>}
    </article>
  );
}
