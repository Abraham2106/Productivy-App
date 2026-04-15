import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';

import AchievementToast from './components/AchievementToast';
import AddTaskModal from './components/AddTaskModal';
import MobileHeader from './components/MobileHeader';
import Sidebar from './components/Sidebar';
import XPGainToast from './components/XPGainToast';
import { DAILY_SCORE_GOAL } from './constants/data';
import { useAchievements } from './hooks/useAchievements';
import { useGamification } from './hooks/useGamification';
import { useTasks } from './hooks/useTasks';
import type { ActiveView, DailyMetrics } from './types';
import { supabase } from './utils/supabase';
import DailyView from './views/DailyView';
import FocusView from './views/FocusView';
import WeeklyView from './views/WeeklyView';

interface TodoRecord {
  id: number | string;
  name: string;
}

export default function App() {
  const [activeView, setActiveView] = useState<ActiveView>('daily');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [xpGain, setXpGain] = useState<number | null>(null);
  const [todos, setTodos] = useState<TodoRecord[]>([]);
  const [todosLoading, setTodosLoading] = useState(true);
  const [todosError, setTodosError] = useState<string | null>(null);

  const {
    todayTasks,
    todayMetrics,
    addTask,
    completeTask,
    deleteTask,
    saveTodayMetrics,
    getTodayScore,
    getWeeklyData,
    getHabitPatterns,
  } = useTasks();
  const { gamification, addXP } = useGamification();
  const { achievements, newlyUnlocked } = useAchievements(gamification, todayTasks);

  const score = getTodayScore();
  const weeklyData = getWeeklyData();
  const habitPatterns = getHabitPatterns();

  useEffect(() => {
    let isMounted = true;

    async function getTodos() {
      setTodosLoading(true);
      setTodosError(null);

      const { data, error } = await supabase.from('todos').select('id, name');

      if (!isMounted) {
        return;
      }

      if (error) {
        setTodosError(error.message);
        setTodos([]);
      } else {
        setTodos((data ?? []) as TodoRecord[]);
      }

      setTodosLoading(false);
    }

    void getTodos();

    return () => {
      isMounted = false;
    };
  }, []);

  const treeProgress =
    todayTasks.length === 0
      ? 0
      : Math.round((todayTasks.filter((task) => task.completed).length / todayTasks.length) * 100);

  const handleCompleteTask = useCallback(
    (taskId: string) => {
      const task = todayTasks.find((candidate) => candidate.id === taskId);
      if (!task || task.completed) {
        return;
      }

      completeTask(taskId);

      const xpAmount = task.task_type === 'BASE' ? 10 : 5;
      const { leveledUp } = addXP(xpAmount);

      setXpGain(xpAmount);
      setTimeout(() => setXpGain(null), 2000);

      confetti({
        particleCount: 30,
        spread: 40,
        colors: ['#2ECC71', '#52C41A', '#27AE60'],
        origin: { y: 0.7 },
      });

      const newScore = score.value + (task.task_type === 'BASE' ? 10 : 5);
      const wasGoalMet = score.value < DAILY_SCORE_GOAL;
      const isGoalMet = newScore >= DAILY_SCORE_GOAL;
      if (wasGoalMet && isGoalMet) {
        setTimeout(() => {
          confetti({
            particleCount: 100,
            spread: 70,
            colors: ['#2ECC71', '#D4EDDA', '#27AE60', '#52C41A'],
            origin: { y: 0.5 },
          });
        }, 300);
      }

      if (leveledUp) {
        const burst = () =>
          confetti({
            particleCount: 40,
            spread: 55,
            colors: ['#2ECC71', '#52C41A', '#27AE60'],
            origin: { x: Math.random(), y: 0.3 },
          });
        setTimeout(burst, 0);
        setTimeout(burst, 100);
        setTimeout(burst, 200);
      }
    },
    [todayTasks, completeTask, addXP, score.value]
  );

  const handleAddTask = useCallback(
    (name: string, type: 'BASE' | 'ADDITIONAL') => {
      addTask(name, type);
    },
    [addTask]
  );

  const handleSaveMetrics = useCallback(
    (values: Omit<DailyMetrics, 'date' | 'user_id'>) => {
      saveTodayMetrics(values);
    },
    [saveTodayMetrics]
  );

  return (
    <div className="flex min-h-screen bg-[#F8F9FA] font-inter">
      <Sidebar
        activeView={activeView}
        onViewChange={setActiveView}
        gamification={gamification}
        treeProgress={treeProgress}
        todayScore={score.value}
      />

      <div className="flex flex-1 flex-col lg:ml-[280px]">
        <MobileHeader
          activeView={activeView}
          onViewChange={setActiveView}
          gamification={gamification}
          score={score.value}
          onAddTask={() => setIsAddModalOpen(true)}
        />

        <main className="flex-1 p-4 lg:p-8">
          <div className="mx-auto max-w-[1400px]">
            <section className="card mb-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="section-label">Supabase</p>
                  <h2 className="text-lg font-bold text-[#2C3E50]">Todos sync preview</h2>
                </div>
                <span className="rounded-full bg-[#D4EDDA] px-3 py-1 text-xs font-semibold text-[#27AE60]">
                  {todos.length} loaded
                </span>
              </div>

              {todosLoading && (
                <p className="mt-4 text-sm text-[#6C757D]">Loading todos from Supabase...</p>
              )}

              {!todosLoading && todosError && (
                <p className="mt-4 text-sm text-[#C0392B]">
                  Could not load todos: {todosError}
                </p>
              )}

              {!todosLoading && !todosError && todos.length === 0 && (
                <p className="mt-4 text-sm text-[#6C757D]">
                  Connected successfully, but the `todos` table returned no rows.
                </p>
              )}

              {!todosLoading && !todosError && todos.length > 0 && (
                <ul className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {todos.map((todo) => (
                    <li
                      key={todo.id}
                      className="rounded-[20px] border border-[#E9F3EA] bg-[#F8FFFA] px-4 py-3 text-sm font-medium text-[#2C3E50]"
                    >
                      {todo.name}
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <AnimatePresence mode="wait">
              {activeView === 'daily' && (
                <DailyView
                  key="daily"
                  tasks={todayTasks}
                  score={score}
                  metrics={todayMetrics}
                  onCompleteTask={handleCompleteTask}
                  onDeleteTask={deleteTask}
                  onOpenAddModal={() => setIsAddModalOpen(true)}
                  onSaveMetrics={handleSaveMetrics}
                  streak={gamification.streak}
                />
              )}
              {activeView === 'weekly' && (
                <WeeklyView
                  key="weekly"
                  weeklyData={weeklyData}
                  habits={habitPatterns}
                  achievements={achievements}
                />
              )}
              {activeView === 'focus' && <FocusView key="focus" />}
            </AnimatePresence>
          </div>
        </main>
      </div>

      <AddTaskModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddTask}
      />

      <AnimatePresence>{xpGain !== null && <XPGainToast key="xp" xp={xpGain} />}</AnimatePresence>

      <AnimatePresence>
        {newlyUnlocked && (
          <AchievementToast key={newlyUnlocked.id} achievement={newlyUnlocked} />
        )}
      </AnimatePresence>
    </div>
  );
}
