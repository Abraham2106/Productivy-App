import { useState, useCallback } from 'react';
import { AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';

import type { ActiveView } from './types';
import { useTasks } from './hooks/useTasks';
import { useGamification } from './hooks/useGamification';
import { useAchievements } from './hooks/useAchievements';
import { DAILY_SCORE_GOAL } from './constants/data';

import Sidebar from './components/Sidebar';
import MobileHeader from './components/MobileHeader';
import AddTaskModal from './components/AddTaskModal';
import XPGainToast from './components/XPGainToast';
import AchievementToast from './components/AchievementToast';

import DailyView from './views/DailyView';
import WeeklyView from './views/WeeklyView';
import FocusView from './views/FocusView';

export default function App() {
  const [activeView, setActiveView] = useState<ActiveView>('daily');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [xpGain, setXpGain] = useState<number | null>(null);

  const { todayTasks, addTask, completeTask, deleteTask, getTodayScore, getWeeklyData } =
    useTasks();
  const { gamification, addXP } = useGamification();
  const { achievements, newlyUnlocked } = useAchievements(gamification, todayTasks);

  const score = getTodayScore();
  const weeklyData = getWeeklyData();

  const treeProgress =
    todayTasks.length === 0
      ? 0
      : Math.round((todayTasks.filter((t) => t.completed).length / todayTasks.length) * 100);

  const handleCompleteTask = useCallback(
    (taskId: string) => {
      const task = todayTasks.find((t) => t.id === taskId);
      if (!task || task.completed) return;

      completeTask(taskId);

      const xpAmount = task.task_type === 'BASE' ? 10 : 5;
      const { leveledUp } = addXP(xpAmount);

      // Show XP toast
      setXpGain(xpAmount);
      setTimeout(() => setXpGain(null), 2000);

      // Task completion confetti
      confetti({
        particleCount: 30,
        spread: 40,
        colors: ['#2ECC71', '#52C41A', '#27AE60'],
        origin: { y: 0.7 },
      });

      // Check if daily goal just met
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

      // Level-up confetti burst
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

  return (
    <div className="flex min-h-screen bg-[#F8F9FA] font-inter">
      {/* ── Desktop Sidebar ── */}
      <Sidebar
        activeView={activeView}
        onViewChange={setActiveView}
        gamification={gamification}
        treeProgress={treeProgress}
        todayScore={score.value}
      />

      {/* ── Main content area ── */}
      <div className="flex-1 flex flex-col lg:ml-[280px]">
        {/* Mobile header */}
        <MobileHeader
          activeView={activeView}
          onViewChange={setActiveView}
          gamification={gamification}
          score={score.value}
          onAddTask={() => setIsAddModalOpen(true)}
        />

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-8">
          <div className="max-w-[1400px] mx-auto">
            <AnimatePresence mode="wait">
              {activeView === 'daily' && (
                <DailyView
                  key="daily"
                  tasks={todayTasks}
                  score={score}
                  onCompleteTask={handleCompleteTask}
                  onDeleteTask={deleteTask}
                  onOpenAddModal={() => setIsAddModalOpen(true)}
                  streak={gamification.streak}
                />
              )}
              {activeView === 'weekly' && (
                <WeeklyView
                  key="weekly"
                  weeklyData={weeklyData}
                  achievements={achievements}
                />
              )}
              {activeView === 'focus' && <FocusView key="focus" />}
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* ── Overlays ── */}
      <AddTaskModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddTask}
      />

      <AnimatePresence>
        {xpGain !== null && <XPGainToast key="xp" xp={xpGain} />}
      </AnimatePresence>

      <AnimatePresence>
        {newlyUnlocked && (
          <AchievementToast key={newlyUnlocked.id} achievement={newlyUnlocked} />
        )}
      </AnimatePresence>
    </div>
  );
}
