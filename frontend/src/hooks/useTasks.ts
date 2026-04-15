import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Task, Score } from '../types';

const STORAGE_KEY = 'growth_app_tasks';
const DEFAULT_USER_ID = 'local-user-001';

function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

export function calculateScore(tasks: Task[]): Score {
  const breakdown: Record<string, number> = {};
  let value = 0;
  for (const task of tasks) {
    const pts =
      task.task_type === 'BASE'
        ? task.completed ? 10 : -5
        : task.completed ? 5 : 0;
    breakdown[task.name] = pts;
    value += pts;
  }
  return { value, breakdown };
}

function loadTasks(): Task[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>(loadTasks);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  const today = getTodayString();
  const todayTasks = tasks.filter((t) => t.date === today);

  const addTask = useCallback(
    (name: string, task_type: 'BASE' | 'ADDITIONAL'): Task => {
      const newTask: Task = {
        id: uuidv4(),
        user_id: DEFAULT_USER_ID,
        name,
        task_type,
        completed: false,
        date: getTodayString(),
      };
      setTasks((prev) => [...prev, newTask]);
      return newTask;
    },
    []
  );

  const completeTask = useCallback((taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: true } : t))
    );
  }, []);

  const deleteTask = useCallback((taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  }, []);

  const getTodayScore = useCallback(
    () => calculateScore(todayTasks),
    [todayTasks]
  );

  const getWeeklyData = useCallback(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('es', { weekday: 'short' });
      const dayLabel = dayName.charAt(0).toUpperCase() + dayName.slice(1);
      const dateTasks = tasks.filter((t) => t.date === dateStr);
      return {
        date: dateStr,
        day: dayLabel,
        score: calculateScore(dateTasks).value,
        tasks: dateTasks.length,
        completed: dateTasks.filter((t) => t.completed).length,
      };
    });
  }, [tasks]);

  return {
    tasks,
    todayTasks,
    addTask,
    completeTask,
    deleteTask,
    getTodayScore,
    getWeeklyData,
  };
}
