import { motion } from 'motion/react';
import { Plus } from 'lucide-react';

import BreakdownCard from '../components/BreakdownCard';
import DailyGoal from '../components/DailyGoal';
import EmptyState from '../components/EmptyState';
import MetricsCard from '../components/MetricsCard';
import QuickStats from '../components/QuickStats';
import ScoreCard from '../components/ScoreCard';
import TaskItem from '../components/TaskItem';
import type { DailyMetrics, Score, Task } from '../types';

interface DailyViewProps {
  tasks: Task[];
  score: Score;
  metrics: DailyMetrics | null;
  onCompleteTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onOpenAddModal: () => void;
  onSaveMetrics: (values: Omit<DailyMetrics, 'date' | 'user_id'>) => void;
  streak: number;
}

export default function DailyView({
  tasks,
  score,
  metrics,
  onCompleteTask,
  onDeleteTask,
  onOpenAddModal,
  onSaveMetrics,
  streak,
}: DailyViewProps) {
  const baseTasks = tasks.filter((task) => task.task_type === 'BASE');
  const additionalTasks = tasks.filter((task) => task.task_type === 'ADDITIONAL');

  const today = new Date().toLocaleDateString('es-CR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-6 lg:flex-row"
    >
      <div className="min-w-0 flex-1 space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold capitalize text-[#2C3E50]">{today}</h1>
            <p className="mt-0.5 text-sm text-[#6C757D]">
              {tasks.filter((task) => task.completed).length}/{tasks.length} tareas completadas
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={onOpenAddModal}
            className="btn-primary hidden items-center gap-2 px-5 py-2.5 text-sm lg:flex"
          >
            <Plus size={16} />
            Nueva tarea
          </motion.button>
        </div>

        <QuickStats tasks={tasks} streak={streak} />

        {tasks.length === 0 ? (
          <EmptyState onAddTask={onOpenAddModal} />
        ) : (
          <>
            {baseTasks.length > 0 && (
              <div className="card">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-[#2C3E50]">Tareas base</h2>
                  <span className="section-label">
                    {baseTasks.filter((task) => task.completed).length}/{baseTasks.length}
                  </span>
                </div>
                <div>
                  {baseTasks.map((task, index) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      index={index}
                      onComplete={onCompleteTask}
                      onDelete={onDeleteTask}
                    />
                  ))}
                </div>
              </div>
            )}

            {additionalTasks.length > 0 && (
              <div className="card">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-[#2C3E50]">Adicionales</h2>
                  <span className="section-label">
                    {
                      additionalTasks.filter((task) => task.completed).length
                    }
                    /{additionalTasks.length}
                  </span>
                </div>
                <div>
                  {additionalTasks.map((task, index) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      index={index}
                      onComplete={onCompleteTask}
                      onDelete={onDeleteTask}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <div className="w-full flex-shrink-0 space-y-4 lg:w-[360px]">
        <MetricsCard
          key={
            metrics
              ? `${metrics.date}-${metrics.sleep_hours}-${metrics.phone_minutes}-${metrics.study_minutes}`
              : 'metrics-empty'
          }
          metrics={metrics}
          onSave={onSaveMetrics}
        />
        <DailyGoal score={score.value} />
        <ScoreCard score={score} />
        <BreakdownCard score={score} />
      </div>
    </motion.div>
  );
}
