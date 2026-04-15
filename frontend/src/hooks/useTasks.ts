import { useCallback, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { getMetricBreakdown } from '../lib/metricScoring';
import type { DailyMetrics, HabitPattern, Score, Task, WeeklyDataPoint } from '../types';

const TASKS_STORAGE_KEY = 'growth_app_tasks';
const METRICS_STORAGE_KEY = 'growth_app_metrics';
const DEFAULT_USER_ID = 'local-user-001';

function getDateString(targetDate: Date = new Date()): string {
  return targetDate.toISOString().split('T')[0];
}

export function calculateScore(tasks: Task[], metrics?: DailyMetrics | null): Score {
  const breakdown: Record<string, number> = {};
  let value = 0;

  for (const task of tasks) {
    const points =
      task.task_type === 'BASE'
        ? task.completed
          ? 10
          : -5
        : task.completed
          ? 5
          : 0;

    breakdown[task.name] = points;
    value += points;
  }

  const metricBreakdown = getMetricBreakdown(metrics);
  for (const [key, points] of Object.entries(metricBreakdown)) {
    breakdown[key] = points;
    value += points;
  }

  return { value, breakdown };
}

function loadTasks(): Task[] {
  try {
    const raw = localStorage.getItem(TASKS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function loadMetrics(): Record<string, DailyMetrics> {
  try {
    const raw = localStorage.getItem(METRICS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>(loadTasks);
  const [metricsByDate, setMetricsByDate] = useState<Record<string, DailyMetrics>>(loadMetrics);

  useEffect(() => {
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem(METRICS_STORAGE_KEY, JSON.stringify(metricsByDate));
  }, [metricsByDate]);

  const today = getDateString();
  const todayTasks = tasks.filter((task) => task.date === today);
  const todayMetrics = metricsByDate[today] ?? null;

  const addTask = useCallback(
    (name: string, task_type: 'BASE' | 'ADDITIONAL'): Task => {
      const newTask: Task = {
        id: uuidv4(),
        user_id: DEFAULT_USER_ID,
        name,
        task_type,
        completed: false,
        date: today,
      };
      setTasks((previous) => [...previous, newTask]);
      return newTask;
    },
    [today]
  );

  const completeTask = useCallback((taskId: string) => {
    setTasks((previous) =>
      previous.map((task) =>
        task.id === taskId ? { ...task, completed: true } : task
      )
    );
  }, []);

  const deleteTask = useCallback((taskId: string) => {
    setTasks((previous) => previous.filter((task) => task.id !== taskId));
  }, []);

  const saveTodayMetrics = useCallback(
    (values: Omit<DailyMetrics, 'date' | 'user_id'>): DailyMetrics => {
      const metrics: DailyMetrics = {
        user_id: DEFAULT_USER_ID,
        date: today,
        ...values,
      };
      setMetricsByDate((previous) => ({ ...previous, [today]: metrics }));
      return metrics;
    },
    [today]
  );

  const getTodayScore = useCallback(
    () => calculateScore(todayTasks, todayMetrics),
    [todayMetrics, todayTasks]
  );

  const getWeeklyData = useCallback((): WeeklyDataPoint[] => {
    return Array.from({ length: 7 }, (_, index) => {
      const currentDate = new Date();
      currentDate.setDate(currentDate.getDate() - (6 - index));
      const date = getDateString(currentDate);
      const dayTasks = tasks.filter((task) => task.date === date);
      const metrics = metricsByDate[date] ?? null;
      const score = calculateScore(dayTasks, metrics).value;

      return {
        date,
        day: currentDate.toLocaleDateString('es-CR', { weekday: 'short' }),
        dateLabel: currentDate.toLocaleDateString('es-CR', {
          day: 'numeric',
          month: 'short',
        }),
        score,
        tasks: dayTasks.length,
        completed: dayTasks.filter((task) => task.completed).length,
        isToday: date === today,
      };
    });
  }, [metricsByDate, tasks, today]);

  const getHabitPatterns = useCallback((): HabitPattern[] => {
    const statsByTask = new Map<
      string,
      {
        frequency_7d: number;
        frequency_30d: number;
        isBase: boolean;
      }
    >();

    Array.from({ length: 30 }, (_, index) => {
      const currentDate = new Date();
      currentDate.setDate(currentDate.getDate() - index);
      const date = getDateString(currentDate);
      const isInLastWeek = index < 7;
      const tasksForDate = tasks.filter((task) => task.date === date);

      for (const task of tasksForDate) {
        const stats = statsByTask.get(task.name) ?? {
          frequency_7d: 0,
          frequency_30d: 0,
          isBase: false,
        };

        if (task.task_type === 'BASE') {
          stats.isBase = true;
        }

        if (task.completed) {
          stats.frequency_30d += 1;
          if (isInLastWeek) {
            stats.frequency_7d += 1;
          }
        }

        statsByTask.set(task.name, stats);
      }
    });

    return Array.from(statsByTask.entries())
      .map(([taskName, stats]) => {
        let classification: HabitPattern['classification'] = 'neutral';

        if (stats.frequency_7d >= 5) {
          classification = 'positive';
        } else if (stats.isBase && stats.frequency_7d <= 1) {
          classification = 'negative';
        }

        return {
          task_name: taskName,
          frequency_7d: stats.frequency_7d,
          frequency_30d: stats.frequency_30d,
          classification,
        };
      })
      .sort((left, right) => {
        const priority = { positive: 0, negative: 1, neutral: 2 };
        return (
          priority[left.classification] - priority[right.classification] ||
          right.frequency_7d - left.frequency_7d ||
          left.task_name.localeCompare(right.task_name)
        );
      });
  }, [tasks]);

  return {
    tasks,
    todayTasks,
    todayMetrics,
    addTask,
    completeTask,
    deleteTask,
    saveTodayMetrics,
    getTodayScore,
    getWeeklyData,
    getHabitPatterns,
  };
}
