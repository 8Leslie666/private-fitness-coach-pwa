import { bannedDietTerms, eveningSnackOptions, takeawayOptions } from '../data/dietOptions';
import type { DailyLog } from '../types';
import { getRecentLogs } from '../utils/calculations';

const replacementMap: Record<string, string> = {
  鸡蛋轻食: '鸡胸肉轻食碗',
  鸡蛋白: '蛋白粉',
  茶叶蛋: '无糖酸奶',
  水煮蛋: '鸡胸肉即食包',
  蛋炒饭: '牛肉饭',
  鸡蛋: '牛奶',
  煎蛋: '豆腐',
  海鲜: '鸡胸肉',
  鱼: '牛肉',
  虾: '鸡胸肉',
  蟹: '猪瘦肉',
};

export function sanitizeDietAdvice(text: string): string {
  return bannedDietTerms
    .slice()
    .sort((a, b) => b.length - a.length)
    .reduce((result, term) => result.replaceAll(term, replacementMap[term] ?? '鸡胸肉'), text);
}

export function containsBannedDietTerm(text: string): boolean {
  return bannedDietTerms.some((term) => text.includes(term));
}

export function getTakeawayRotation(): string[] {
  return takeawayOptions.map(sanitizeDietAdvice);
}

export function getEveningSnackOptions(): string[] {
  return eveningSnackOptions.map(sanitizeDietAdvice);
}

export function generateDietAdvice(logs: Record<string, DailyLog>, dateKey: string): string {
  const recent = getRecentLogs(logs, dateKey, 3);
  const today = logs[dateKey];
  const lowDietDays = recent.filter((log) => (log.dietScore ?? 10) < 6).length;
  const highHungerDays = recent.filter((log) => (log.hungerScore ?? 0) >= 8).length;

  let advice = '今天外卖优先选鸡腿饭去皮、牛肉饭、鸡胸肉轻食碗或猪瘦肉套餐；饭半份，加青菜，少酱少汤。';

  if (lowDietDays >= 3) {
    advice = '连续 3 天饮食完成度偏低，先固定两个可执行外卖选项：鸡腿饭去皮或牛肉饭，饭半份，加青菜。不要靠临时意志力选餐。';
  } else if ((today?.dietScore ?? 10) < 6) {
    advice = '今天饮食完成度偏低，明天每餐先锁定蛋白质：鸡胸肉、去皮鸡腿肉、牛肉、猪瘦肉、豆腐或豆干。主食半份，不要完全断碳水。';
  }

  if (highHungerDays >= 3) {
    advice += ' 饥饿感连续偏高，增加蔬菜和蛋白质，不增加油脂；晚上饿了用无糖酸奶、牛奶、无糖豆浆、豆干或蛋白粉处理。';
  }

  return sanitizeDietAdvice(advice);
}
