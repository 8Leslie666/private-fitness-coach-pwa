import type { UserProfile } from '../types';

export const defaultUserProfile: UserProfile = {
  height: 173,
  currentWeight: 70,
  targetWeight: 65,
  trainingExperience: '有力量训练基础，停训约 1 年',
  goal: '减脂第一，恢复力量第二，体型改善第三',
  sleepTarget: {
    week1: { sleep: '00:30', wake: '08:30' },
    week2: { sleep: '00:00', wake: '08:00' },
    week3Plus: { sleep: '23:30-00:00', wake: '07:30-08:00' },
  },
  dietRestrictions: ['不吃海鲜', '不吃鸡蛋', '全外卖为主'],
  baselineLifts: {
    深蹲: '80kg 5x5',
    卧推: '75kg 5x5',
    硬拉: '75kg 5x5',
  },
};
