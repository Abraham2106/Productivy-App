import { useCallback, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import confetti from 'canvas-confetti';

import AchievementToast from './components/AchievementToast';
import AddTaskModal from './components/AddTaskModal';
import MobileHeader from './components/MobileHeader';
import Sidebar from './components/Sidebar';
import XPGainToast from './components/XPGainToast';
import { DAILY_SCORE_GOAL } from './constants/data';
import AuthScreen from './features/auth/AuthScreen';
import { useAuth } from './features/auth/useAuth';
import { useAchievements } from './hooks/useAchievements';
import { useGamification } from './hooks/useGamification';
import { useTasks } from './hooks/useTasks';
import type { ActiveView, DailyMetrics } from './types';
import DailyView from './views/DailyView';
import FocusView from './views/FocusView';
import WeeklyView from './views/WeeklyView';

function AppSplash() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(46,204,113,0.18),_transparent_34%),#F8F9FA] px-4">
      <div className="rounded-[28px] border-2 border-[#E9ECEF] bg-white px-8 py-10 text-center shadow-xl">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-[#2ECC71] to-[#27AE60] text-white shadow-sm">
          <span className="text-2xl">🌱</span>
        </div>
        <p className="section-label mb-2">Growth</p>
        <h1 className="text-2xl font-bold text-[#2C3E50]">Recuperando tu sesion</h1>
        <p className="mt-2 text-sm text-[#6C757D]">Cargando autenticacion y datos personales...</p>
      </div>
    </div>
  );
}

export default function App() {
  const { user, loading: authLoading, signOut } = useAuth();
  const [activeView, setActiveView] = useState<ActiveView>('daily');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [xpGain, setXpGain] = useState<number | null>(null);

  const {
    todayTasks,
    todayMetrics,
    loading: tasksLoading,
    error: tasksError,
    addTask,
    completeTask,
    deleteTask,
    saveTodayMetrics,
    getTodayScore,
    getWeeklyData,
    getHabitPatterns,
  } = useTasks(user?.id ?? null);
  const { gamification, addXP } = useGamification(user?.id ?? null);
  const { achievements, newlyUnlocked } = useAchievements(user?.id ?? null, gamification, todayTasks);
  const score = getTodayScore();
  const weeklyData = getWeeklyData();
  const habitPatterns = getHabitPatterns();
  const treeProgress =
    todayTasks.length === 0
      ? 0
      : Math.round((todayTasks.filter((task) => task.completed).length / todayTasks.length) * 100);
  const userLabel =
    (typeof user?.user_metadata?.name === 'string' && user.user_metadata.name.trim()) ||
    user?.email?.split('@')[0] ||
    'Usuario';
  const userEmail = user?.email ?? 'Sin email';

  const handleCompleteTask = useCallback(
    (taskId: string) => {
      const task = todayTasks.find((candidate) => candidate.id === taskId);
      if (!task || task.completed) {
        return;
      }

      void completeTask(taskId);

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
      void addTask(name, type);
    },
    [addTask]
  );

  const handleDeleteTask = useCallback(
    (taskId: string) => {
      void deleteTask(taskId);
    },
    [deleteTask]
  );

  const handleSaveMetrics = useCallback(
    (values: Omit<DailyMetrics, 'date' | 'user_id'>) => {
      void saveTodayMetrics(values);
    },
    [saveTodayMetrics]
  );

  const handleSignOut = useCallback(() => {
    void signOut();
  }, [signOut]);

  if (authLoading) {
    return <AppSplash />;
  }

  if (!user) {
    return <AuthScreen />;
  }

  return (
    <div className="flex min-h-screen bg-[#F8F9FA] font-inter">
      <Sidebar
        activeView={activeView}
        onViewChange={setActiveView}
        gamification={gamification}
        treeProgress={treeProgress}
        todayScore={score.value}
        userLabel={userLabel}
        userEmail={userEmail}
        onSignOut={handleSignOut}
      />

      <div className="flex flex-1 flex-col lg:ml-[280px]">
        <MobileHeader
          activeView={activeView}
          onViewChange={setActiveView}
          gamification={gamification}
          score={score.value}
          onAddTask={() => setIsAddModalOpen(true)}
          userLabel={userLabel}
          onSignOut={handleSignOut}
        />

        <main className="flex-1 p-4 lg:p-8">
          <div className="mx-auto max-w-[1400px] space-y-6">
            {tasksError && (
              <section className="rounded-2xl border-2 border-[#FDECEC] bg-white px-5 py-4 shadow-sm">
                <p className="section-label mb-1 text-[#B42318]">Sincronizacion</p>
                <p className="text-sm text-[#B42318]">{tasksError}</p>
              </section>
            )}

            <AnimatePresence mode="wait">
              {tasksLoading ? (
                <motion.section
                  key="loading"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  className="card flex min-h-[320px] flex-col items-center justify-center text-center"
                >
                  <div className="mb-4 h-12 w-12 rounded-full border-4 border-[#E9ECEF] border-t-[#2ECC71]" />
                  <p className="text-lg font-bold text-[#2C3E50]">Cargando tus datos</p>
                  <p className="mt-2 max-w-[360px] text-sm text-[#6C757D]">
                    Recuperando tareas, metricas y score del usuario autenticado.
                  </p>
                </motion.section>
              ) : (
                <>
                  {activeView === 'daily' && (
                    <DailyView
                      key="daily"
                      tasks={todayTasks}
                      score={score}
                      metrics={todayMetrics}
                      onCompleteTask={handleCompleteTask}
                      onDeleteTask={handleDeleteTask}
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
                </>
              )}
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
