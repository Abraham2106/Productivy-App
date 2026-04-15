import { useState, useEffect } from 'react';
import type { Achievement, GamificationState, Task } from '../types';
import { ACHIEVEMENT_DEFS } from '../constants/data';

const STORAGE_KEY = 'growth_app_achievements';

function loadUnlocked(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

export function useAchievements(
  gamification: GamificationState,
  todayTasks: Task[]
) {
  const [unlockedIds, setUnlockedIds] = useState<Set<string>>(loadUnlocked);
  const [newlyUnlocked, setNewlyUnlocked] = useState<Achievement | null>(null);

  useEffect(() => {
    const newUnlocks: string[] = [];
    for (const def of ACHIEVEMENT_DEFS) {
      if (!unlockedIds.has(def.id) && def.check(gamification, todayTasks)) {
        newUnlocks.push(def.id);
      }
    }
    if (newUnlocks.length > 0) {
      const updated = new Set([...unlockedIds, ...newUnlocks]);
      setUnlockedIds(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...updated]));

      const firstDef = ACHIEVEMENT_DEFS.find((d) => d.id === newUnlocks[0])!;
      setNewlyUnlocked({ ...firstDef, unlocked: true });
      const timer = setTimeout(() => setNewlyUnlocked(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [gamification, todayTasks, unlockedIds]);

  const achievements: Achievement[] = ACHIEVEMENT_DEFS.map((def) => ({
    id: def.id,
    title: def.title,
    description: def.description,
    icon: def.icon,
    unlocked: unlockedIds.has(def.id),
  }));

  return { achievements, newlyUnlocked };
}
