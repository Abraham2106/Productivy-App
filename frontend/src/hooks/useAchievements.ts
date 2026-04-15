import { useState, useEffect } from 'react';
import type { Achievement, GamificationState, Task } from '../types';
import { ACHIEVEMENT_DEFS } from '../constants/data';

const STORAGE_KEY = 'growth_app_achievements';

function getStorageKey(userId: string | null): string | null {
  return userId ? `${STORAGE_KEY}_${userId}` : null;
}

function loadUnlocked(userId: string | null): Set<string> {
  const storageKey = getStorageKey(userId);
  if (!storageKey) {
    return new Set();
  }

  try {
    const raw = localStorage.getItem(storageKey);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

export function useAchievements(
  userId: string | null,
  gamification: GamificationState,
  todayTasks: Task[]
) {
  const [unlockedIds, setUnlockedIds] = useState<Set<string>>(() => loadUnlocked(userId));
  const [newlyUnlocked, setNewlyUnlocked] = useState<Achievement | null>(null);

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      setUnlockedIds(loadUnlocked(userId));
      setNewlyUnlocked(null);
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [userId]);

  useEffect(() => {
    const storageKey = getStorageKey(userId);
    if (!storageKey) {
      return;
    }

    const newUnlocks: string[] = [];
    for (const def of ACHIEVEMENT_DEFS) {
      if (!unlockedIds.has(def.id) && def.check(gamification, todayTasks)) {
        newUnlocks.push(def.id);
      }
    }
    if (newUnlocks.length > 0) {
      const updated = new Set([...unlockedIds, ...newUnlocks]);
      localStorage.setItem(storageKey, JSON.stringify([...updated]));
      const firstDef = ACHIEVEMENT_DEFS.find((d) => d.id === newUnlocks[0])!;

      const frameId = window.requestAnimationFrame(() => {
        setUnlockedIds(updated);
        setNewlyUnlocked({ ...firstDef, unlocked: true });
      });
      const timer = window.setTimeout(() => setNewlyUnlocked(null), 4000);

      return () => {
        window.cancelAnimationFrame(frameId);
        clearTimeout(timer);
      };
    }
  }, [gamification, todayTasks, unlockedIds, userId]);

  const achievements: Achievement[] = ACHIEVEMENT_DEFS.map((def) => ({
    id: def.id,
    title: def.title,
    description: def.description,
    icon: def.icon,
    unlocked: unlockedIds.has(def.id),
  }));

  return { achievements, newlyUnlocked };
}
