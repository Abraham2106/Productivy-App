export interface Task {
  id: string;
  user_id: string;
  name: string;
  task_type: 'BASE' | 'ADDITIONAL';
  completed: boolean;
  date: string; // YYYY-MM-DD
}

export interface Score {
  value: number;
  breakdown: Record<string, number>;
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
