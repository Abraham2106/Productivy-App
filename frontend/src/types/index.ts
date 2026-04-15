export interface Task {
  id: string;
  user_id: string;
  name: string;
  task_type: 'BASE' | 'ADDITIONAL';
  completed: boolean;
  date: string;
}

export interface DailyMetrics {
  user_id: string;
  date: string;
  sleep_hours: number;
  phone_minutes: number;
  study_minutes: number;
}

export interface Score {
  value: number;
  breakdown: Record<string, number>;
}

export interface WeeklyDataPoint {
  date: string;
  day: string;
  dateLabel: string;
  score: number;
  tasks: number;
  completed: number;
  isToday: boolean;
}

export interface HabitPattern {
  task_name: string;
  frequency_7d: number;
  frequency_30d: number;
  classification: 'positive' | 'negative' | 'neutral';
}

export interface GamificationState {
  xp: number;
  level: number;
  levelName: string;
  xpForNextLevel: number;
  xpInCurrentLevel: number;
  streak: number;
  lastCompletedDate: string | null;
  totalCompleted: number;
  todayCompleted: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

export type ActiveView = 'daily' | 'weekly' | 'focus';
