import { useCallback, useEffect, useState } from 'react';

import { supabase } from '../utils/supabase';
import { getMetricBreakdown } from '../lib/metricScoring';
import type { DailyMetrics, HabitPattern, Score, Task, WeeklyDataPoint } from '../types';

interface TaskRecord {
  id: string;
  user_id: string;
  name: string;
  task_type: 'BASE' | 'ADDITIONAL';
  completed: boolean;
  date: string;
  created_at?: string;
}

interface DailyScoreRecord {
  user_id: string;
  date: string;
  sleep_hours: number | null;
  phone_minutes: number | null;
  study_minutes: number | null;
}

function getDateString(targetDate: Date = new Date()): string {
  const year = targetDate.getFullYear();
  const month = String(targetDate.getMonth() + 1).padStart(2, '0');
  const day = String(targetDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function sortTasks(records: TaskRecord[]): TaskRecord[] {
  return [...records].sort((left, right) => {
    const dateComparison = left.date.localeCompare(right.date);
    if (dateComparison !== 0) {
      return dateComparison;
    }

    return (left.created_at ?? '').localeCompare(right.created_at ?? '');
  });
}

function mapTask(record: TaskRecord): Task {
  return {
    id: record.id,
    user_id: record.user_id,
    name: record.name,
    task_type: record.task_type,
    completed: record.completed,
    date: record.date,
  };
}

function buildMetricsMap(records: DailyScoreRecord[]): Record<string, DailyMetrics> {
  return records.reduce<Record<string, DailyMetrics>>((accumulator, record) => {
    if (
      record.sleep_hours === null ||
      record.phone_minutes === null ||
      record.study_minutes === null
    ) {
      return accumulator;
    }

    accumulator[record.date] = {
      user_id: record.user_id,
      date: record.date,
      sleep_hours: record.sleep_hours,
      phone_minutes: record.phone_minutes,
      study_minutes: record.study_minutes,
    };

    return accumulator;
  }, {});
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

export function useTasks(userId: string | null) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [metricsByDate, setMetricsByDate] = useState<Record<string, DailyMetrics>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const today = getDateString();

  const syncDailyScore = useCallback(
    async (nextTasks: Task[], nextMetricsByDate: Record<string, DailyMetrics>) => {
      if (!userId) {
        return;
      }

      const todayTasks = nextTasks.filter((task) => task.date === today);
      const todayMetrics = nextMetricsByDate[today] ?? null;

      if (todayTasks.length === 0 && !todayMetrics) {
        const { error: deleteError } = await supabase
          .from('daily_scores')
          .delete()
          .eq('user_id', userId)
          .eq('date', today);

        if (deleteError) {
          throw deleteError;
        }

        return;
      }

      const score = calculateScore(todayTasks, todayMetrics).value;
      const { error: upsertError } = await supabase.from('daily_scores').upsert(
        {
          user_id: userId,
          date: today,
          score,
          sleep_hours: todayMetrics?.sleep_hours ?? null,
          phone_minutes: todayMetrics?.phone_minutes ?? null,
          study_minutes: todayMetrics?.study_minutes ?? null,
        },
        { onConflict: 'user_id,date' }
      );

      if (upsertError) {
        throw upsertError;
      }
    },
    [today, userId]
  );

  const refreshData = useCallback(async () => {
    if (!userId) {
      setTasks([]);
      setMetricsByDate({});
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const startDate = getDateString(new Date(new Date().setDate(new Date().getDate() - 29)));

    const [tasksResult, scoresResult] = await Promise.all([
      supabase
        .from('tasks')
        .select('id, user_id, name, task_type, completed, date, created_at')
        .eq('user_id', userId)
        .gte('date', startDate)
        .order('date', { ascending: true })
        .order('created_at', { ascending: true }),
      supabase
        .from('daily_scores')
        .select('user_id, date, sleep_hours, phone_minutes, study_minutes')
        .eq('user_id', userId)
        .gte('date', startDate)
        .order('date', { ascending: true }),
    ]);

    if (tasksResult.error || scoresResult.error) {
      setTasks([]);
      setMetricsByDate({});
      setError(tasksResult.error?.message ?? scoresResult.error?.message ?? 'No se pudo cargar la data.');
      setLoading(false);
      return;
    }

    setTasks(sortTasks((tasksResult.data ?? []) as TaskRecord[]).map(mapTask));
    setMetricsByDate(buildMetricsMap((scoresResult.data ?? []) as DailyScoreRecord[]));
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      void refreshData();
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [refreshData]);

  const todayTasks = tasks.filter((task) => task.date === today);
  const todayMetrics = metricsByDate[today] ?? null;

  const addTask = useCallback(
    async (name: string, task_type: 'BASE' | 'ADDITIONAL') => {
      if (!userId) {
        return;
      }

      setError(null);

      const { data, error: insertError } = await supabase
        .from('tasks')
        .insert({
          user_id: userId,
          name,
          task_type,
          completed: false,
          date: today,
        })
        .select('id, user_id, name, task_type, completed, date, created_at')
        .single();

      if (insertError) {
        setError(insertError.message);
        return;
      }

      const insertedTask = mapTask(data as TaskRecord);
      const nextTasks = sortTasks([
        ...tasks,
        {
          ...(data as TaskRecord),
          user_id: insertedTask.user_id,
        },
      ]).map(mapTask);

      setTasks(nextTasks);

      try {
        await syncDailyScore(nextTasks, metricsByDate);
      } catch (syncError) {
        setError(syncError instanceof Error ? syncError.message : 'No pudimos sincronizar el score.');
      }
    },
    [metricsByDate, syncDailyScore, tasks, today, userId]
  );

  const completeTask = useCallback(
    async (taskId: string) => {
      if (!userId) {
        return;
      }

      const nextTasks = tasks.map((task) =>
        task.id === taskId ? { ...task, completed: true } : task
      );

      setTasks(nextTasks);
      setError(null);

      const { error: updateError } = await supabase
        .from('tasks')
        .update({ completed: true })
        .eq('id', taskId)
        .eq('user_id', userId);

      if (updateError) {
        setError(updateError.message);
        await refreshData();
        return;
      }

      try {
        await syncDailyScore(nextTasks, metricsByDate);
      } catch (syncError) {
        setError(syncError instanceof Error ? syncError.message : 'No pudimos sincronizar el score.');
      }
    },
    [metricsByDate, refreshData, syncDailyScore, tasks, userId]
  );

  const deleteTask = useCallback(
    async (taskId: string) => {
      if (!userId) {
        return;
      }

      const nextTasks = tasks.filter((task) => task.id !== taskId);
      setTasks(nextTasks);
      setError(null);

      const { error: deleteError } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)
        .eq('user_id', userId);

      if (deleteError) {
        setError(deleteError.message);
        await refreshData();
        return;
      }

      try {
        await syncDailyScore(nextTasks, metricsByDate);
      } catch (syncError) {
        setError(syncError instanceof Error ? syncError.message : 'No pudimos sincronizar el score.');
      }
    },
    [metricsByDate, refreshData, syncDailyScore, tasks, userId]
  );

  const saveTodayMetrics = useCallback(
    async (values: Omit<DailyMetrics, 'date' | 'user_id'>) => {
      if (!userId) {
        return;
      }

      const nextMetrics: DailyMetrics = {
        user_id: userId,
        date: today,
        ...values,
      };

      const nextMetricsByDate = {
        ...metricsByDate,
        [today]: nextMetrics,
      };

      setMetricsByDate(nextMetricsByDate);
      setError(null);

      const score = calculateScore(todayTasks, nextMetrics).value;
      const { error: upsertError } = await supabase.from('daily_scores').upsert(
        {
          user_id: userId,
          date: today,
          score,
          sleep_hours: nextMetrics.sleep_hours,
          phone_minutes: nextMetrics.phone_minutes,
          study_minutes: nextMetrics.study_minutes,
        },
        { onConflict: 'user_id,date' }
      );

      if (upsertError) {
        setError(upsertError.message);
        await refreshData();
      }
    },
    [metricsByDate, refreshData, today, todayTasks, userId]
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
    loading,
    error,
    addTask,
    completeTask,
    deleteTask,
    saveTodayMetrics,
    getTodayScore,
    getWeeklyData,
    getHabitPatterns,
    refreshData,
  };
}
