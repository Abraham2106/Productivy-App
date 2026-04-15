import type { GamificationState } from '../types';
import type { Task } from '../types';

export const DAILY_SCORE_GOAL = 50;
export const XP_PER_LEVEL = 100;

export const LEVEL_NAMES: { min: number; name: string }[] = [
  { min: 30, name: 'Bosque' },
  { min: 20, name: 'Árbol fuerte' },
  { min: 10, name: 'Árbol joven' },
  { min: 5, name: 'Brote' },
  { min: 1, name: 'Semilla' },
];

export function getLevelName(level: number): string {
  for (const entry of LEVEL_NAMES) {
    if (level >= entry.min) return entry.name;
  }
  return 'Semilla';
}

export interface AchievementDef {
  id: string;
  title: string;
  description: string;
  icon: string;
  check: (g: GamificationState, tasks: Task[]) => boolean;
}

export const ACHIEVEMENT_DEFS: AchievementDef[] = [
  {
    id: 'first_task',
    title: 'Primera tarea',
    description: 'Completa tu primera tarea',
    icon: 'CheckCircle2',
    check: (g) => g.totalCompleted >= 1,
  },
  {
    id: 'five_tasks',
    title: 'Constante',
    description: 'Completa 5 tareas en total',
    icon: 'Target',
    check: (g) => g.totalCompleted >= 5,
  },
  {
    id: 'ten_tasks',
    title: 'Dedicado',
    description: 'Completa 10 tareas en total',
    icon: 'Award',
    check: (g) => g.totalCompleted >= 10,
  },
  {
    id: 'streak_3',
    title: 'Racha de 3',
    description: '3 días consecutivos activos',
    icon: 'Zap',
    check: (g) => g.streak >= 3,
  },
  {
    id: 'streak_7',
    title: 'Semana perfecta',
    description: '7 días consecutivos activos',
    icon: 'Trophy',
    check: (g) => g.streak >= 7,
  },
  {
    id: 'level_5',
    title: 'Brote desbloqueado',
    description: 'Alcanza el nivel 5',
    icon: 'Sprout',
    check: (g) => g.level >= 5,
  },
  {
    id: 'xp_100',
    title: 'Centurión',
    description: 'Acumula 100 XP',
    icon: 'Brain',
    check: (g) => g.xp >= 100,
  },
  {
    id: 'perfect_day',
    title: 'Día perfecto',
    description: 'Completa todas las tareas BASE del día',
    icon: 'Trophy',
    check: (_, tasks) => {
      const base = tasks.filter((t) => t.task_type === 'BASE');
      return base.length > 0 && base.every((t) => t.completed);
    },
  },
];
