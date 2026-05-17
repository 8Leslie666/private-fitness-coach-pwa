import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { clamp, getTimeLabel } from '../utils/time';

export type Screen =
  | 'cultivation'
  | 'training'
  | 'diet'
  | 'progress'
  | 'profile'
  | 'hydration'
  | 'status'
  | 'workout'
  | 'rest'
  | 'feedback'
  | 'finish';

export type DrawerKind =
  | 'water-custom'
  | 'water-target'
  | 'status-edit'
  | 'plan-edit'
  | 'plan-delete'
  | 'plan-add'
  | 'meal-edit'
  | 'profile-edit'
  | 'training-detail'
  | 'workout-params'
  | 'progress-record'
  | 'data-reset';

export type AppDrawerState = {
  kind: DrawerKind;
  payload?: Record<string, string | number | boolean | undefined>;
} | null;

export type TrainingDayType = 'strength' | 'light';
export type TrainingSectionType = 'checkin' | 'warmup' | 'mainWarmup' | 'main' | 'accessory' | 'core' | 'cooldown';
export type ExerciseType = 'strength' | 'light' | 'mobility' | 'cardio';

export type PlannedExercise = {
  id: string;
  name: string;
  exerciseType: ExerciseType;
  sets?: number;
  reps?: number;
  weight?: number;
  weightUnit?: string;
  target?: number;
  targetUnit?: string;
  restSeconds?: number;
  targetRpe?: string;
  notes?: string;
  progressionRule?: string;
};

export type TrainingSection = {
  id: string;
  type: TrainingSectionType;
  title: string;
  estimatedMinutes: number;
  exercises: PlannedExercise[];
};

export type TrainingProgram = {
  id: string;
  phaseName: string;
  currentWeek: number;
  weeklyFrequency: number;
  currentSequenceIndex: number;
  days: TrainingPlan[];
  progressionWeeks: ProgressionWeek[];
  dynamicRules: string[];
};

export type ProgressionWeek = {
  week: number;
  condition: string;
  squatKg: number;
  benchKg: number;
  deadliftKg: number;
  benchTechKg: number;
};

export type TrainingPlan = {
  id: string;
  phaseName?: string;
  currentWeek?: number;
  day: string;
  calendarDays?: string[];
  dayName?: string;
  sequenceIndex: number;
  type: TrainingDayType;
  title: string;
  subtitle: string;
  goal: string;
  focus: string;
  accessory: string;
  finisher: string;
  weight: number;
  reps: number;
  sets: number;
  rpe: string;
  durationMin: number;
  estimatedMinutes: number;
  targetRpe?: string;
  flow: TrainingFlowStep[];
  sections: TrainingSection[];
  completed?: boolean;
};

export type TrainingFlowStep = {
  id: string;
  title: string;
  description: string;
  minutes: number;
};

export type Meal = {
  id: string;
  name: string;
  description: string;
  detail: string;
  done?: boolean;
};

export type HydrationLog = {
  id: string;
  time: string;
  amountMl: number;
};

export type Vitals = {
  sleepHours: number;
  heartRate: number;
  hrv: number;
  stress: number;
};

export type Profile = {
  phase: string;
  week: number;
  heightCm: number;
  currentWeightKg: number;
  targetWeightKg: number;
  trainingDays: number;
  sessionLimitMin: number;
};

export type ReminderItem = {
  enabled: boolean;
  time: string;
  title: string;
  note: string;
};

export type ReminderRhythm = {
  dailyEnabled: boolean;
  morning: ReminderItem;
  training: ReminderItem;
  summary: ReminderItem;
};

export type WorkoutSession = {
  planId: string;
  exerciseName: string;
  sectionTitle?: string;
  currentExerciseIndex: number;
  exerciseQueue: SessionExercise[];
  currentSet: number;
  totalSets: number;
  weight: number;
  reps: number;
  rpe: string;
  restSeconds: number;
  sessionStartedAt: number;
  setStartedAt: number;
  restStartedAt: number;
  pausedAt?: number;
  pausedAccumulatedMs: number;
  status: 'running' | 'paused' | 'finished';
  lastFeedback?: string;
  completionState?: 'completed' | 'incomplete';
  suggestion?: string;
};

export type SessionExercise = {
  id: string;
  name: string;
  sectionTitle: string;
  sets: number;
  reps: number;
  weight: number;
  restSeconds: number;
  targetRpe: string;
  notes?: string;
};

export type UpsertPlanInput = Omit<
  TrainingPlan,
  | 'id'
  | 'accessory'
  | 'finisher'
  | 'durationMin'
  | 'flow'
  | 'sections'
  | 'type'
  | 'sequenceIndex'
  | 'subtitle'
  | 'goal'
  | 'focus'
  | 'estimatedMinutes'
> & {
  id?: string;
  accessory?: string;
  finisher?: string;
  durationMin?: number;
  flow?: TrainingFlowStep[];
  sections?: TrainingSection[];
  type?: TrainingDayType;
  sequenceIndex?: number;
  subtitle?: string;
  goal?: string;
  focus?: string;
  estimatedMinutes?: number;
};

type AppState = {
  screen: Screen;
  previousScreen: Screen;
  drawer: AppDrawerState;
  trainingProgram: TrainingProgram;
  plans: TrainingPlan[];
  meals: Meal[];
  hydration: {
    targetMl: number;
    currentMl: number;
    logs: HydrationLog[];
  };
  vitals: Vitals;
  profile: Profile;
  reminderRhythm: ReminderRhythm;
  workoutSession: WorkoutSession | null;
  navigate: (screen: Screen) => void;
  backHome: () => void;
  openDrawer: (drawer: NonNullable<AppDrawerState>) => void;
  closeDrawer: () => void;
  addWater: (amountMl: number) => void;
  setWaterTarget: (targetMl: number) => void;
  updateVitals: (vitals: Partial<Vitals>) => void;
  upsertPlan: (plan: UpsertPlanInput) => void;
  duplicatePlan: (id: string) => void;
  deletePlan: (id: string) => void;
  toggleMealDone: (id: string) => void;
  updateMeal: (id: string, patch: Partial<Meal>) => void;
  deleteMeal: (id: string) => void;
  updateProfile: (patch: Partial<Profile>) => void;
  updateReminderRhythm: (patch: Partial<ReminderRhythm>) => void;
  resetData: () => void;
  startWorkout: (planId: string) => void;
  updateWorkoutParams: (patch: Partial<Pick<WorkoutSession, 'weight' | 'reps' | 'totalSets' | 'restSeconds' | 'rpe'>>) => void;
  pauseWorkout: () => void;
  resumeWorkout: () => void;
  completeSet: () => void;
  submitFeedback: (feedback: string) => void;
  startNextSet: () => void;
  finishWorkout: () => void;
};

const initialPlans: TrainingPlan[] = createWeekOneStrengthDays();

const initialTrainingProgram: TrainingProgram = {
  id: 'rebuild-fat-loss-4-week',
  phaseName: '恢复减脂期',
  currentWeek: 1,
  weeklyFrequency: 4,
  currentSequenceIndex: 1,
  days: [...initialPlans, ...createLightDays()],
  progressionWeeks: [
    { week: 1, condition: '恢复动作质量，RPE 6-7', squatKg: 50, benchKg: 45, deadliftKg: 50, benchTechKg: 40 },
    { week: 2, condition: '完成率 >= 75% 且平均 RPE <= 7', squatKg: 52.5, benchKg: 47.5, deadliftKg: 52.5, benchTechKg: 42.5 },
    { week: 3, condition: '第 2 周完成良好', squatKg: 55, benchKg: 50, deadliftKg: 55, benchTechKg: 45 },
    { week: 4, condition: '第 3 周完成良好', squatKg: 57.5, benchKg: 52.5, deadliftKg: 57.5, benchTechKg: 47.5 },
  ],
  dynamicRules: [
    '第 5 周开始根据训练记录自动调整。',
    '所有计划组完成、平均 RPE <= 7、无疼痛、动作良好时，下次小幅加重。',
    '平均 RPE = 8 或动作质量一般时，下次保持重量。',
    'RPE >= 9、未完成、疼痛评分 >= 5 或今天很累时，下次降低 5%-10% 或减少 1-2 组。',
  ],
};

const initialMeals: Meal[] = [
  {
    id: 'meal-1',
    name: '第一餐',
    description: '黄焖鸡去皮少油 + 米饭半份',
    detail: '优先鸡腿去皮，多青菜，少汤汁。',
  },
  {
    id: 'meal-pre',
    name: '训练前补给',
    description: '无糖酸奶 / 牛奶 / 豆浆',
    detail: '训练前 60-90 分钟，控制在 250kcal 内。',
  },
  {
    id: 'meal-2',
    name: '第二餐',
    description: '牛肉饭少油 + 青菜',
    detail: '主食半份到七分，避免油炸配菜。',
  },
  {
    id: 'meal-night',
    name: '夜间备用',
    description: '蛋白粉待购买后启用',
    detail: '仅在蛋白不足且饥饿明显时使用。',
  },
];

const initialVitals: Vitals = {
  sleepHours: 7.2,
  heartRate: 56,
  hrv: 68,
  stress: 32,
};

const initialProfile: Profile = {
  phase: '恢复减脂期',
  week: 1,
  heightCm: 173,
  currentWeightKg: 70,
  targetWeightKg: 65,
  trainingDays: 4,
  sessionLimitMin: 60,
};

const initialReminderRhythm: ReminderRhythm = {
  dailyEnabled: true,
  morning: {
    enabled: true,
    time: '08:30',
    title: '早晨提醒',
    note: '喝水 300ml，记录睡眠与恢复感。',
  },
  training: {
    enabled: true,
    time: '19:00',
    title: '训练提醒',
    note: '检查今日主项，提前 30 分钟补水。',
  },
  summary: {
    enabled: true,
    time: '22:30',
    title: '总结提醒',
    note: '记录饮水、膳食执行与明日节律。',
  },
};

const initialHydration = {
  targetMl: 2500,
  currentMl: 0,
  logs: [],
};

function createWeekOneStrengthDays(): TrainingPlan[] {
  return [
    createStrengthDay({
      id: 'week1-day1-squat',
      day: '周一',
      calendarDays: ['周一'],
      dayName: '下肢 A',
      sequenceIndex: 1,
      title: '深蹲主项日',
      subtitle: '下肢 A｜深蹲主项',
      goal: '恢复深蹲动作，建立下肢训练节奏',
      focus: '膝盖轨迹、躯干稳定、RPE 6-7',
      mainName: '杠铃深蹲',
      mainShortName: '深蹲',
      weight: 50,
      reps: 5,
      sets: 5,
      durationMin: 58,
      accessory: '腿举 / 罗马尼亚硬拉',
      finisher: '平板支撑',
      sections: [
        section('checkin', '起势确认', 1, [
          lightExercise('身体状态确认', '身体状态、膝盖/腰部是否不适，水杯、毛巾、手机电量。'),
        ]),
        section('warmup', '快速热身', 5, [
          cardioExercise('跑步机快走', 3, '分钟'),
          mobilityExercise('髋关节环绕', '10 次/侧'),
          mobilityExercise('徒手深蹲', '10 次'),
          mobilityExercise('臀桥', '10 次'),
        ]),
        section('mainWarmup', '深蹲热身组', 8, [
          strengthExercise('空杠深蹲', 1, 8, 20, 60, '轻松', '找站距和深度。'),
          strengthExercise('深蹲热身', 1, 5, 30, 60, '轻松', '保持动作轨迹。'),
          strengthExercise('深蹲热身', 1, 3, 40, 90, '轻松', '不追强度。'),
        ]),
        section('main', '主项：杠铃深蹲', 18, [
          strengthExercise('杠铃深蹲', 5, 5, 50, 150, '6-7', '每组记录重量、次数、RPE、疼痛和本组用时。', '完成且平均 RPE <= 7，下周 +2.5kg。'),
        ]),
        section('accessory', '辅助训练', 16, [
          strengthExercise('腿举', 2, 10, 0, 90, '7', '选择轻中等重量，动作完整。'),
          strengthExercise('罗马尼亚硬拉', 2, 8, 35, 90, '6-7', '髋铰链，不追求拉伸疼痛。'),
        ]),
        section('core', '核心：平板支撑', 4, [
          strengthExercise('平板支撑', 2, 30, 0, 45, '6-7', '单位为秒，腰背保持中立。'),
        ]),
        section('cooldown', '收势', 3, [
          mobilityExercise('股四头肌拉伸', '30 秒/侧'),
          mobilityExercise('臀腿拉伸', '30 秒/侧'),
          mobilityExercise('深呼吸', '1 分钟'),
        ]),
      ],
    }),
    createStrengthDay({
      id: 'week1-day2-bench',
      day: '周三',
      calendarDays: ['周三'],
      dayName: '上肢 A',
      sequenceIndex: 2,
      title: '卧推主项日',
      subtitle: '上肢 A｜卧推主项',
      goal: '恢复卧推动作轨迹和肩胛稳定',
      focus: '肩胛收紧、手腕稳定、不弹胸',
      mainName: '杠铃卧推',
      mainShortName: '卧推',
      weight: 45,
      reps: 5,
      sets: 5,
      durationMin: 58,
      accessory: '坐姿划船 / 高位下拉 / 哑铃肩推',
      finisher: '胸肩拉伸',
      sections: [
        section('checkin', '起势确认', 1, [lightExercise('胸肩状态确认', '肩部、手腕、胸肩状态是否适合训练。')]),
        section('warmup', '快速热身', 5, [
          cardioExercise('椭圆机或划船机', 3, '分钟'),
          mobilityExercise('肩绕环', '10 次/方向'),
          mobilityExercise('肩胛后缩练习', '10 次'),
          mobilityExercise('俯身 Y-T-W', '各 6 次，可跳过'),
        ]),
        section('mainWarmup', '卧推热身组', 8, [
          strengthExercise('空杠卧推', 1, 10, 20, 60, '轻松', '找握距和下放轨迹。'),
          strengthExercise('卧推热身', 1, 5, 30, 60, '轻松'),
          strengthExercise('卧推热身', 1, 3, 40, 90, '轻松'),
        ]),
        section('main', '主项：杠铃卧推', 18, [
          strengthExercise('杠铃卧推', 5, 5, 45, 120, '6-7', '每组肩胛收紧，不弹胸。', '完成且平均 RPE <= 7，下周 +2.5kg。'),
        ]),
        section('accessory', '辅助训练', 22, [
          strengthExercise('坐姿划船', 3, 10, 0, 90, '7', '优先背部发力，不耸肩。'),
          strengthExercise('高位下拉', 2, 10, 0, 75, '7', '下拉至上胸附近。'),
          strengthExercise('哑铃肩推', 2, 8, 0, 75, '6-7', '轻重量稳定推起。'),
        ]),
        section('cooldown', '收势', 3, [
          mobilityExercise('胸肌拉伸', '30 秒/侧'),
          mobilityExercise('肩后侧拉伸', '30 秒/侧'),
          mobilityExercise('深呼吸', '1 分钟'),
        ]),
      ],
    }),
    createStrengthDay({
      id: 'week1-day3-deadlift',
      day: '周五',
      calendarDays: ['周五'],
      dayName: '下肢 B',
      sequenceIndex: 3,
      title: '硬拉主项日',
      subtitle: '下肢 B｜硬拉主项',
      goal: '恢复髋铰链和硬拉发力模式',
      focus: '腰背中立、髋铰链、握力状态',
      mainName: '传统硬拉',
      mainShortName: '硬拉',
      weight: 50,
      reps: 5,
      sets: 3,
      durationMin: 55,
      accessory: '高脚杯深蹲 / 腿弯举',
      finisher: '反向卷腹',
      sections: [
        section('checkin', '起势确认', 1, [lightExercise('腰背状态确认', '腰部是否不适、腘绳肌是否紧张、握力状态。')]),
        section('warmup', '快速热身', 5, [
          cardioExercise('快走', 3, '分钟'),
          mobilityExercise('髋铰链练习', '10 次'),
          mobilityExercise('鸟狗式', '8 次/侧'),
          mobilityExercise('臀桥', '10 次'),
        ]),
        section('mainWarmup', '硬拉热身组', 8, [
          strengthExercise('硬拉热身', 1, 5, 40, 60, '轻松'),
          strengthExercise('硬拉热身', 1, 3, 45, 90, '轻松'),
        ]),
        section('main', '主项：传统硬拉', 15, [
          strengthExercise('传统硬拉', 3, 5, 50, 150, '6-7', '不做力竭，腰部不适立即停止主项。', '完成且平均 RPE <= 7，下周 +2.5kg。'),
        ]),
        section('accessory', '辅助训练', 15, [
          strengthExercise('高脚杯深蹲', 2, 10, 0, 75, '6-7', '轻中等重量，稳定下蹲。'),
          strengthExercise('腿弯举', 2, 10, 0, 75, '7', '控制离心。'),
        ]),
        section('core', '核心：反向卷腹', 5, [strengthExercise('反向卷腹', 2, 12, 0, 45, '6-7')]),
        section('cooldown', '收势', 3, [
          mobilityExercise('腘绳肌拉伸', '30 秒/侧'),
          mobilityExercise('腰背放松', '1 分钟'),
          mobilityExercise('深呼吸', '1 分钟'),
        ]),
      ],
    }),
    createStrengthDay({
      id: 'week1-day4-bench-tech',
      day: '周六',
      calendarDays: ['周六'],
      dayName: '上肢 B',
      sequenceIndex: 4,
      title: '卧推技术 + 上肢辅助',
      subtitle: '上肢 B｜卧推技术 + 上肢辅助',
      goal: '增加上肢训练量，巩固卧推技术，不追求大重量',
      focus: '下放稳定、肩胛收紧、不弹胸、路径稳定',
      mainName: '卧推技术组',
      mainShortName: '卧推技术',
      weight: 40,
      reps: 5,
      sets: 4,
      durationMin: 56,
      accessory: '上斜哑铃卧推 / 坐姿划船 / 侧平举 / 绳索下压',
      finisher: '胸肩拉伸 + 背阔肌放松',
      sections: [
        section('checkin', '起势确认', 1, [lightExercise('上肢状态确认', '肩部状态、胸肌酸痛程度、手腕状态。')]),
        section('warmup', '快速热身', 5, [
          cardioExercise('划船机', 3, '分钟'),
          mobilityExercise('肩绕环', '10 次'),
          mobilityExercise('肩胛后缩练习', '10 次'),
        ]),
        section('mainWarmup', '卧推热身组', 6, [
          strengthExercise('空杠卧推', 1, 10, 20, 60, '轻松'),
          strengthExercise('卧推热身', 1, 5, 30, 60, '轻松'),
        ]),
        section('main', '主项：卧推技术组', 15, [
          strengthExercise('卧推技术组', 4, 5, 40, 120, '6-7', '重点：下放稳定、肩胛收紧、不弹胸、推起路径稳定。', '完成且动作稳定，下周 +2.5kg。'),
        ]),
        section('accessory', '辅助训练', 28, [
          strengthExercise('上斜哑铃卧推', 2, 10, 0, 75, '7'),
          strengthExercise('坐姿划船', 3, 10, 0, 75, '7'),
          strengthExercise('侧平举', 2, 12, 0, 60, '7'),
          strengthExercise('绳索下压', 2, 12, 0, 60, '7'),
        ]),
        section('cooldown', '收势', 3, [
          mobilityExercise('胸肩拉伸', '1 分钟'),
          mobilityExercise('背阔肌放松', '1 分钟'),
          mobilityExercise('深呼吸', '1 分钟'),
        ]),
      ],
    }),
  ];
}

function createLightDays(): TrainingPlan[] {
  return ['周二', '周四', '周日'].map((day, index) => ({
    id: `light-${index + 1}`,
    phaseName: '恢复减脂期',
    currentWeek: 1,
    day,
    calendarDays: [day],
    dayName: '轻活动日',
    sequenceIndex: 0,
    type: 'light',
    title: '今日轻修',
    subtitle: '步数 / 拉伸 / 恢复',
    goal: '促进恢复和减脂执行，不进入力量训练模板',
    focus: '6000 步、拉伸 8-10 分钟，或轻松步行 20 分钟',
    accessory: '',
    finisher: '',
    weight: 0,
    reps: 0,
    sets: 0,
    rpe: '',
    durationMin: 20,
    estimatedMinutes: 20,
    targetRpe: undefined,
    flow: [
      { id: 'walk', title: '轻松步行', description: '6000 步或 20 分钟轻松步行。', minutes: 20 },
      { id: 'stretch', title: '拉伸恢复', description: '髋、胸椎、肩部 8-10 分钟。', minutes: 10 },
    ],
    sections: [
      section('warmup', '今日轻修', 20, [
        cardioExercise('轻松步行', 20, '分钟'),
        lightExercise('步数目标', '今日目标 6000 步。'),
        mobilityExercise('拉伸恢复', '8-10 分钟'),
      ]),
    ],
  }));
}

function createStrengthDay(input: {
  id: string;
  day: string;
  calendarDays: string[];
  dayName: string;
  sequenceIndex: number;
  title: string;
  subtitle: string;
  goal: string;
  focus: string;
  mainName: string;
  mainShortName: string;
  weight: number;
  reps: number;
  sets: number;
  durationMin: number;
  accessory: string;
  finisher: string;
  sections: TrainingSection[];
}): TrainingPlan {
  return {
    id: input.id,
    phaseName: '恢复减脂期',
    currentWeek: 1,
    day: input.day,
    calendarDays: input.calendarDays,
    dayName: input.dayName,
    sequenceIndex: input.sequenceIndex,
    type: 'strength',
    title: input.title,
    subtitle: input.subtitle,
    goal: input.goal,
    focus: input.focus,
    accessory: input.accessory,
    finisher: input.finisher,
    weight: input.weight,
    reps: input.reps,
    sets: input.sets,
    rpe: '6-7',
    durationMin: input.durationMin,
    estimatedMinutes: input.durationMin,
    targetRpe: '6-7',
    flow: sectionsToFlow(input.sections),
    sections: input.sections,
    completed: false,
  };
}

function section(type: TrainingSectionType, title: string, estimatedMinutes: number, exercises: PlannedExercise[]): TrainingSection {
  return {
    id: `${type}-${title}`.replace(/\s+/g, '-'),
    type,
    title,
    estimatedMinutes,
    exercises,
  };
}

function strengthExercise(
  name: string,
  sets: number,
  reps: number,
  weight: number,
  restSeconds: number,
  targetRpe: string,
  notes = '',
  progressionRule = '',
): PlannedExercise {
  return {
    id: `${name}-${sets}-${reps}-${weight}`.replace(/\s+/g, '-'),
    name,
    exerciseType: 'strength',
    sets,
    reps,
    weight,
    weightUnit: weight > 0 ? 'kg' : '',
    restSeconds,
    targetRpe,
    notes,
    progressionRule,
  };
}

function cardioExercise(name: string, target: number, targetUnit: string): PlannedExercise {
  return {
    id: `${name}-${target}`.replace(/\s+/g, '-'),
    name,
    exerciseType: 'cardio',
    target,
    targetUnit,
    notes: '轻松完成，不追强度。',
  };
}

function mobilityExercise(name: string, target: string): PlannedExercise {
  return {
    id: `${name}-${target}`.replace(/\s+/g, '-'),
    name,
    exerciseType: 'mobility',
    targetUnit: target,
    notes: target,
  };
}

function lightExercise(name: string, notes: string): PlannedExercise {
  return {
    id: `${name}`.replace(/\s+/g, '-'),
    name,
    exerciseType: 'light',
    notes,
  };
}

function sectionsToFlow(sections: TrainingSection[]): TrainingFlowStep[] {
  return sections.map((item) => ({
    id: item.id,
    title: item.title,
    description: item.exercises.map((exercise) => exercise.name).join(' / '),
    minutes: item.estimatedMinutes,
  }));
}

export const getPlanFlow = (plan?: Partial<TrainingPlan> | null): TrainingFlowStep[] => {
  if (!plan) return [];
  if (plan.flow?.length) return plan.flow;
  if (plan.sections?.length) return sectionsToFlow(plan.sections);
  return sectionsToFlow(buildDefaultSections(plan));
};

export const getPlanSections = (plan?: Partial<TrainingPlan> | null): TrainingSection[] =>
  plan?.sections?.length ? plan.sections : buildDefaultSections(plan);

export const getPlanSessionTitle = (plan?: Partial<TrainingPlan> | null) =>
  plan?.type === 'light'
    ? '今日轻修'
    : plan?.title
      ? `${plan.title.replace('日', '')} + 辅助`
      : '今日行练';

export const getMainExercise = (plan?: Partial<TrainingPlan> | null) =>
  plan?.sections
    ?.find((sectionItem) => sectionItem.type === 'main')
    ?.exercises.find((exercise) => exercise.exerciseType === 'strength');

export const getSessionExercises = (plan?: Partial<TrainingPlan> | null): SessionExercise[] => {
  const sections = plan?.sections?.length ? plan.sections : buildDefaultSections(plan);
  return sections.flatMap((sectionItem) =>
    sectionItem.exercises
      .filter((exercise) => exercise.exerciseType === 'strength' && exercise.sets && exercise.reps)
      .map((exercise) => ({
        id: exercise.id,
        name: exercise.name,
        sectionTitle: sectionItem.title,
        sets: exercise.sets ?? 1,
        reps: exercise.reps ?? 1,
        weight: exercise.weight ?? 0,
        restSeconds: exercise.restSeconds ?? 90,
        targetRpe: exercise.targetRpe ?? '6-7',
        notes: exercise.notes,
      })),
  );
};

export const getCurrentSessionExercise = (session?: WorkoutSession | null) =>
  session?.exerciseQueue[session.currentExerciseIndex] ?? null;

export const getNextSessionExercise = (session?: WorkoutSession | null) => {
  if (!session) return null;
  if (session.currentSet < session.totalSets) return getCurrentSessionExercise(session);
  return session.exerciseQueue[session.currentExerciseIndex + 1] ?? null;
};

function buildDefaultSections(plan?: Partial<TrainingPlan> | null): TrainingSection[] {
  const title = plan?.title ?? '主项训练';
  const accessory = plan?.accessory ?? '辅助训练按今日状态执行';
  const finisher = plan?.finisher ?? '平板、死虫或侧桥';
  const weight = plan?.weight ?? 0;
  const reps = plan?.reps ?? 5;
  const sets = plan?.sets ?? 5;
  const rpe = plan?.rpe ?? '6-7';
  return [
    section('warmup', '快速热身', 5, [cardioExercise('快走', 3, '分钟'), mobilityExercise('动态活动', '8-10 次')]),
    section('main', `主项：${title}`, 20, [strengthExercise(title, sets, reps, weight, 120, rpe)]),
    section('accessory', '辅助训练', 20, [strengthExercise(accessory, 2, 10, 0, 90, '7')]),
    section('core', '核心收尾', 5, [strengthExercise(finisher, 2, 30, 0, 45, '6-7')]),
  ];
}

function buildEditablePlan(plan: UpsertPlanInput): TrainingPlan {
  const sections = plan.sections?.length ? plan.sections : buildDefaultSections(plan);
  return {
    id: plan.id ?? makeId('plan'),
    phaseName: plan.phaseName ?? '恢复减脂期',
    currentWeek: plan.currentWeek ?? 1,
    day: plan.day,
    calendarDays: plan.calendarDays ?? [plan.day],
    dayName: plan.dayName ?? '自定义训练',
    sequenceIndex: plan.sequenceIndex ?? 99,
    type: plan.type ?? 'strength',
    title: plan.title,
    subtitle: plan.subtitle ?? `${plan.dayName ?? '自定义'}｜${plan.title}`,
    goal: plan.goal ?? '按当前状态完成训练，不追求力竭',
    focus: plan.focus ?? '动作质量、训练节奏、RPE 6-7',
    accessory: plan.accessory || '辅助训练按今日状态执行',
    finisher: plan.finisher || '平板、死虫或侧桥',
    weight: plan.weight,
    reps: plan.reps,
    sets: plan.sets,
    rpe: plan.rpe,
    durationMin: plan.durationMin || plan.estimatedMinutes || 55,
    estimatedMinutes: plan.estimatedMinutes || plan.durationMin || 55,
    targetRpe: plan.targetRpe ?? plan.rpe,
    flow: plan.flow?.length ? plan.flow : sectionsToFlow(sections),
    sections,
    completed: plan.completed ?? false,
  };
}

function getSuggestion(feedback?: string, completionState: 'completed' | 'incomplete' = 'completed') {
  if (completionState === 'incomplete') {
    return '本次未完成计划，不需要补偿训练。下次保持同样重量，先恢复节奏。';
  }
  if (feedback === '偏重') {
    return '本次训练难度偏高，下次建议保持重量，优先保证动作稳定。';
  }
  if (feedback === '有疼痛') {
    return '本次出现疼痛反馈，下次建议降低重量或替换动作，不建议继续加重。';
  }
  if (feedback === '偏轻') {
    return '本次训练完成稳定，平均 RPE 在目标范围内。下次同主项可以小幅加重。';
  }
  return '本次训练完成稳定，平均 RPE 在目标范围内。下次同主项可以小幅加重。';
}

function nextSequenceIndex(current: number) {
  return current >= 4 ? 1 : current + 1;
}

const makeId = (prefix: string) => `${prefix}-${Date.now()}-${Math.round(Math.random() * 1000)}`;

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      screen: 'cultivation',
      previousScreen: 'cultivation',
      drawer: null,
      trainingProgram: initialTrainingProgram,
      plans: initialPlans,
      meals: initialMeals,
      hydration: initialHydration,
      vitals: initialVitals,
      profile: initialProfile,
      reminderRhythm: initialReminderRhythm,
      workoutSession: null,
      navigate: (screen) =>
        set((state) => ({
          previousScreen: state.screen,
          screen,
          drawer: null,
        })),
      backHome: () => set({ screen: 'cultivation', previousScreen: 'cultivation', drawer: null }),
      openDrawer: (drawer) => set({ drawer }),
      closeDrawer: () => set({ drawer: null }),
      addWater: (amountMl) =>
        set((state) => {
          const nextMl = clamp(state.hydration.currentMl + amountMl, 0, 6000);
          const shouldLog = amountMl > 0;
          return {
            hydration: {
              ...state.hydration,
              currentMl: nextMl,
              logs: shouldLog
                ? [
                    { id: makeId('water'), time: getTimeLabel(), amountMl },
                    ...state.hydration.logs,
                  ].slice(0, 8)
                : state.hydration.logs,
            },
          };
        }),
      setWaterTarget: (targetMl) =>
        set((state) => ({
          hydration: {
            ...state.hydration,
            targetMl: clamp(targetMl, 800, 5000),
          },
        })),
      updateVitals: (vitals) =>
        set((state) => ({
          vitals: {
            ...state.vitals,
            ...vitals,
          },
        })),
      upsertPlan: (plan) =>
        set((state) => {
          const normalizedPlan = buildEditablePlan(plan);
          if (plan.id) {
            const plans = state.plans.map((item) => (item.id === plan.id ? { ...item, ...normalizedPlan, id: item.id } : item));
            return {
              plans,
              trainingProgram: {
                ...state.trainingProgram,
                days: state.trainingProgram.days.map((item) =>
                  item.id === plan.id ? { ...item, ...normalizedPlan, id: item.id } : item,
                ),
              },
            };
          }
          const plans = [...state.plans, normalizedPlan];
          return {
            plans,
            trainingProgram: {
              ...state.trainingProgram,
              days: [...state.trainingProgram.days, normalizedPlan],
            },
          };
        }),
      duplicatePlan: (id) =>
        set((state) => {
          const plan = state.plans.find((item) => item.id === id);
          if (!plan) return {};
          const copy = {
            ...plan,
            id: makeId('plan-copy'),
            day: '复制',
            completed: false,
          };
          return {
            plans: [...state.plans, copy],
            trainingProgram: {
              ...state.trainingProgram,
              days: [...state.trainingProgram.days, copy],
            },
          };
        }),
      deletePlan: (id) =>
        set((state) => ({
          plans: state.plans.filter((item) => item.id !== id),
          trainingProgram: {
            ...state.trainingProgram,
            days: state.trainingProgram.days.filter((item) => item.id !== id),
          },
        })),
      toggleMealDone: (id) =>
        set((state) => ({
          meals: state.meals.map((meal) => (meal.id === id ? { ...meal, done: !meal.done } : meal)),
        })),
      updateMeal: (id, patch) =>
        set((state) => ({
          meals: state.meals.map((meal) => (meal.id === id ? { ...meal, ...patch } : meal)),
        })),
      deleteMeal: (id) =>
        set((state) => ({
          meals: state.meals.filter((meal) => meal.id !== id),
        })),
      updateProfile: (patch) =>
        set((state) => ({
          profile: {
            ...state.profile,
            ...patch,
          },
        })),
      updateReminderRhythm: (patch) =>
        set((state) => ({
          reminderRhythm: {
            ...state.reminderRhythm,
            ...patch,
          },
        })),
      resetData: () =>
        set(() => {
          Object.keys(localStorage)
            .filter((key) => key === 'private-fitness-coach-pwa' || key.startsWith('private-fitness-reminder-'))
            .forEach((key) => localStorage.removeItem(key));

          return {
            plans: initialPlans.map((item) => ({ ...item, completed: false })),
            trainingProgram: {
              ...initialTrainingProgram,
              currentSequenceIndex: 1,
              days: initialTrainingProgram.days.map((item) => ({ ...item, completed: false })),
            },
            meals: initialMeals.map((item) => ({ ...item, done: false })),
            hydration: {
              ...initialHydration,
              currentMl: 0,
              logs: [],
            },
            vitals: { ...initialVitals },
            profile: { ...initialProfile },
            reminderRhythm: {
              ...initialReminderRhythm,
              morning: { ...initialReminderRhythm.morning },
              training: { ...initialReminderRhythm.training },
              summary: { ...initialReminderRhythm.summary },
            },
            workoutSession: null,
            screen: 'cultivation',
            previousScreen: 'cultivation',
            drawer: null,
          };
        }),
      startWorkout: (planId) => {
        const plan = get().plans.find((item) => item.id === planId) ?? get().plans[0];
        if (!plan || plan.type === 'light') {
          set({ screen: 'training', drawer: null });
          return;
        }
        const exerciseQueue = getSessionExercises(plan);
        const firstExercise = exerciseQueue[0];
        if (!firstExercise) {
          set({ screen: 'training', drawer: null });
          return;
        }
        const now = Date.now();
        set({
          screen: 'workout',
          drawer: null,
          workoutSession: {
            planId: plan.id,
            exerciseName: firstExercise.name,
            sectionTitle: firstExercise.sectionTitle,
            currentExerciseIndex: 0,
            exerciseQueue,
            currentSet: 1,
            totalSets: firstExercise.sets,
            weight: firstExercise.weight,
            reps: firstExercise.reps,
            rpe: firstExercise.targetRpe,
            restSeconds: firstExercise.restSeconds,
            sessionStartedAt: now,
            setStartedAt: now,
            restStartedAt: now,
            pausedAccumulatedMs: 0,
            status: 'running',
          },
        });
      },
      updateWorkoutParams: (patch) =>
        set((state) => {
          if (!state.workoutSession) return {};
          return {
            workoutSession: {
              ...state.workoutSession,
              ...patch,
              weight: patch.weight ? clamp(patch.weight, 5, 300) : state.workoutSession.weight,
              reps: patch.reps ? clamp(patch.reps, 1, 30) : state.workoutSession.reps,
              totalSets: patch.totalSets ? clamp(patch.totalSets, 1, 12) : state.workoutSession.totalSets,
              restSeconds: patch.restSeconds ? clamp(patch.restSeconds, 30, 360) : state.workoutSession.restSeconds,
            },
          };
        }),
      pauseWorkout: () =>
        set((state) => {
          if (!state.workoutSession || state.workoutSession.status !== 'running') return {};
          return {
            workoutSession: {
              ...state.workoutSession,
              status: 'paused',
              pausedAt: Date.now(),
            },
          };
        }),
      resumeWorkout: () =>
        set((state) => {
          if (!state.workoutSession || state.workoutSession.status !== 'paused' || !state.workoutSession.pausedAt) {
            return {};
          }
          return {
            workoutSession: {
              ...state.workoutSession,
              status: 'running',
              pausedAccumulatedMs:
                state.workoutSession.pausedAccumulatedMs + Date.now() - state.workoutSession.pausedAt,
              pausedAt: undefined,
            },
          };
        }),
      completeSet: () => set({ screen: 'feedback', drawer: null }),
      submitFeedback: (feedback) =>
        set((state) => {
          if (!state.workoutSession) return { screen: 'training' };
          const session = state.workoutSession;
          if (feedback === '未完成' || feedback === '有疼痛') {
            return {
              screen: 'finish',
              workoutSession: {
                ...session,
                lastFeedback: feedback,
                status: 'finished',
                completionState: feedback === '有疼痛' ? 'completed' : 'incomplete',
                suggestion: getSuggestion(feedback, feedback === '有疼痛' ? 'completed' : 'incomplete'),
              },
            };
          }
          const isLastSet = session.currentSet >= session.totalSets;
          const isLastExercise = session.currentExerciseIndex >= session.exerciseQueue.length - 1;
          if (isLastSet && isLastExercise) {
            const plans = state.plans.map((plan) =>
              plan.id === session.planId ? { ...plan, completed: true } : plan,
            );
            const nextIndex = nextSequenceIndex(state.trainingProgram.currentSequenceIndex);
            return {
              screen: 'finish',
              workoutSession: {
                ...session,
                lastFeedback: feedback,
                status: 'finished',
                completionState: 'completed',
                suggestion: getSuggestion(feedback, 'completed'),
              },
              plans,
              trainingProgram: {
                ...state.trainingProgram,
                currentSequenceIndex: nextIndex,
                days: state.trainingProgram.days.map((day) =>
                  day.id === session.planId ? { ...day, completed: true } : day,
                ),
              },
            };
          }
          return {
            screen: 'rest',
            workoutSession: {
              ...session,
              lastFeedback: feedback,
              restStartedAt: Date.now(),
            },
          };
        }),
      startNextSet: () =>
        set((state) => {
          if (!state.workoutSession) return { screen: 'training' };
          const session = state.workoutSession;
          const sameExerciseNextSet = session.currentSet < session.totalSets;
          const nextExerciseIndex = sameExerciseNextSet
            ? session.currentExerciseIndex
            : Math.min(session.currentExerciseIndex + 1, session.exerciseQueue.length - 1);
          const exercise = session.exerciseQueue[nextExerciseIndex];
          const nextSet = sameExerciseNextSet ? session.currentSet + 1 : 1;
          return {
            screen: 'workout',
            workoutSession: {
              ...session,
              currentExerciseIndex: nextExerciseIndex,
              exerciseName: exercise.name,
              sectionTitle: exercise.sectionTitle,
              currentSet: nextSet,
              totalSets: exercise.sets,
              weight: exercise.weight,
              reps: exercise.reps,
              rpe: exercise.targetRpe,
              restSeconds: exercise.restSeconds,
              setStartedAt: Date.now(),
              status: 'running',
            },
          };
        }),
      finishWorkout: () =>
        set((state) => ({
          screen: 'finish',
          workoutSession: state.workoutSession
            ? {
                ...state.workoutSession,
                status: 'finished',
                completionState: 'incomplete',
                suggestion: getSuggestion(state.workoutSession.lastFeedback, 'incomplete'),
              }
            : null,
          drawer: null,
        })),
    }),
    {
      name: 'private-fitness-coach-pwa',
      version: 3,
      storage: createJSONStorage(() => localStorage),
      migrate: (persistedState) => {
        const persisted = persistedState as Partial<AppState>;
        const hasStructuredPlans = Boolean(persisted.plans?.[0]?.sections?.length);
        const cleanPlans = (hasStructuredPlans ? persisted.plans : initialPlans)?.map((item) => ({
          ...item,
          completed: false,
        })) ?? initialPlans;
        const cleanProgramDays = (
          hasStructuredPlans && persisted.trainingProgram?.days?.length
            ? persisted.trainingProgram.days
            : initialTrainingProgram.days
        ).map((item) => ({ ...item, completed: false }));
        return {
          ...persisted,
          screen: 'cultivation',
          previousScreen: 'cultivation',
          drawer: null,
          plans: cleanPlans,
          trainingProgram: {
            ...(persisted.trainingProgram ?? initialTrainingProgram),
            currentSequenceIndex: 1,
            days: cleanProgramDays,
          },
          hydration: {
            ...(persisted.hydration ?? initialHydration),
            currentMl: 0,
            logs: [],
          },
          workoutSession: null,
        };
      },
      partialize: (state) => ({
        screen: state.screen,
        previousScreen: state.previousScreen,
        trainingProgram: state.trainingProgram,
        plans: state.plans,
        meals: state.meals,
        hydration: state.hydration,
        vitals: state.vitals,
        profile: state.profile,
        reminderRhythm: state.reminderRhythm,
        workoutSession: state.workoutSession,
      }),
    },
  ),
);
