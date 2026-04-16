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
    setUnlockedIds(loadUnlocked(userId));
    setNewlyUnlocked(null);
  }, [userId]);

  // Manejar la desaparición automática del brindis de logro
  useEffect(() => {
    if (newlyUnlocked) {
      const timer = window.setTimeout(() => setNewlyUnlocked(null), 2500);
      return () => window.clearTimeout(timer);
    }
  }, [newlyUnlocked]);

  useEffect(() => {
    const storageKey = getStorageKey(userId);
    if (!storageKey) {
      return;
    }

    const stored = loadUnlocked(userId);
    const newUnlocks: string[] = [];
    for (const def of ACHIEVEMENT_DEFS) {
      // Solo notificar si no está en el estado actual Y no estaba ya guardado en disco
      if (!unlockedIds.has(def.id) && !stored.has(def.id) && def.check(gamification, todayTasks)) {
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

      return () => {
        window.cancelAnimationFrame(frameId);
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
