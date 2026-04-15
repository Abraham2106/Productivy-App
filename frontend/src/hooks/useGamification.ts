import { useState, useEffect } from 'react';
import type { GamificationState } from '../types';
import { XP_PER_LEVEL, getLevelName } from '../constants/data';

const STORAGE_KEY = 'growth_app_gamification';

interface StoredState {
  xp: number;
  streak: number;
  lastCompletedDate: string | null;
  totalCompleted: number;
  todayCompleted: number;
  lastTodayDate: string;
}

function getToday(): string {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, '0');
  const day = String(currentDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function createDefaultState(): StoredState {
  return {
    xp: 0,
    streak: 0,
    lastCompletedDate: null,
    totalCompleted: 0,
    todayCompleted: 0,
    lastTodayDate: getToday(),
  };
}

function getStorageKey(userId: string | null): string | null {
  return userId ? `${STORAGE_KEY}_${userId}` : null;
}

function loadState(userId: string | null): StoredState {
  const storageKey = getStorageKey(userId);
  if (!storageKey) {
    return createDefaultState();
  }

  try {
    const raw = localStorage.getItem(storageKey);
    const parsed: StoredState = raw
      ? JSON.parse(raw)
      : createDefaultState();

    if (parsed.lastTodayDate !== getToday()) {
      return { ...parsed, todayCompleted: 0, lastTodayDate: getToday() };
    }
    return parsed;
  } catch {
    return createDefaultState();
  }
}

export function useGamification(userId: string | null) {
  const [stored, setStored] = useState<StoredState>(() => loadState(userId));

  useEffect(() => {
    setStored(loadState(userId));
  }, [userId]);

  useEffect(() => {
    const storageKey = getStorageKey(userId);
    if (!storageKey) {
      return;
    }

    localStorage.setItem(storageKey, JSON.stringify(stored));
  }, [stored, userId]);

  const level = Math.floor(stored.xp / XP_PER_LEVEL) + 1;
  const xpInCurrentLevel = stored.xp % XP_PER_LEVEL;

  const gamification: GamificationState = {
    xp: stored.xp,
    level,
    levelName: getLevelName(level),
    xpForNextLevel: XP_PER_LEVEL,
    xpInCurrentLevel,
    streak: stored.streak,
    lastCompletedDate: stored.lastCompletedDate,
    totalCompleted: stored.totalCompleted,
    todayCompleted: stored.todayCompleted,
  };

  const addXP = (amount: number): { leveledUp: boolean; newLevel: number } => {
    if (!userId) {
      return { leveledUp: false, newLevel: level };
    }

    const today = getToday();
    let leveledUp = false;
    let newLevel = level;

    setStored((prev) => {
      const prevLevel = Math.floor(prev.xp / XP_PER_LEVEL) + 1;
      const nextXP = prev.xp + amount;
      const nextLevel = Math.floor(nextXP / XP_PER_LEVEL) + 1;

      if (nextLevel > prevLevel) {
        leveledUp = true;
        newLevel = nextLevel;
      }

      let newStreak = prev.streak;
      if (prev.lastCompletedDate === null) {
        newStreak = 1;
      } else {
        const lastDate = new Date(prev.lastCompletedDate);
        const todayDate = new Date(today);
        const diffDays = Math.round(
          (todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        if (diffDays === 1) newStreak = prev.streak + 1;
        else if (diffDays === 0) newStreak = prev.streak;
        else newStreak = 1;
      }

      return {
        ...prev,
        xp: nextXP,
        streak: newStreak,
        lastCompletedDate: today,
        totalCompleted: prev.totalCompleted + 1,
        todayCompleted: prev.todayCompleted + 1,
      };
    });

    return { leveledUp, newLevel };
  };

  return { gamification, addXP };
}
