import { motion } from 'motion/react';
import { Plus } from 'lucide-react';
import type { Task, Score } from '../types';
import TaskItem from '../components/TaskItem';
import QuickStats from '../components/QuickStats';
import ScoreCard from '../components/ScoreCard';
import BreakdownCard from '../components/BreakdownCard';
import DailyGoal from '../components/DailyGoal';
import EmptyState from '../components/EmptyState';

interface DailyViewProps {
  tasks: Task[];
  score: Score;
  onCompleteTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onOpenAddModal: () => void;
  streak: number;
}

export default function DailyView({
  tasks,
  score,
  onCompleteTask,
  onDeleteTask,
  onOpenAddModal,
  streak,
}: DailyViewProps) {
  if (tasks.length === 0) {
    return <EmptyState onAddTask={onOpenAddModal} />;
  }

  const baseTasks = tasks.filter((t) => t.task_type === 'BASE');
  const additionalTasks = tasks.filter((t) => t.task_type === 'ADDITIONAL');

  const today = new Date().toLocaleDateString('es', {
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
      className="flex flex-col lg:flex-row gap-6"
    >
      {/* ── Left column ── */}
      <div className="flex-1 space-y-6 min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#2C3E50] capitalize">{today}</h1>
            <p className="text-sm text-[#6C757D] mt-0.5">
              {tasks.filter((t) => t.completed).length}/{tasks.length} tareas completadas
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={onOpenAddModal}
            id="daily-add-task-btn"
            className="hidden lg:flex btn-primary items-center gap-2 py-2.5 px-5 text-sm"
          >
            <Plus size={16} />
            Nueva tarea
          </motion.button>
        </div>

        {/* Quick stats */}
        <QuickStats tasks={tasks} streak={streak} />

        {/* BASE tasks */}
        {baseTasks.length > 0 && (
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[#2C3E50]">Tareas BASE</h2>
              <span className="section-label">
                {baseTasks.filter((t) => t.completed).length}/{baseTasks.length}
              </span>
            </div>
            <div>
              {baseTasks.map((task, i) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  index={i}
                  onComplete={onCompleteTask}
                  onDelete={onDeleteTask}
                />
              ))}
            </div>
          </div>
        )}

        {/* ADDITIONAL tasks */}
        {additionalTasks.length > 0 && (
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[#2C3E50]">Adicionales</h2>
              <span className="section-label">
                {additionalTasks.filter((t) => t.completed).length}/{additionalTasks.length}
              </span>
            </div>
            <div>
              {additionalTasks.map((task, i) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  index={i}
                  onComplete={onCompleteTask}
                  onDelete={onDeleteTask}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Right column ── */}
      <div className="w-full lg:w-[340px] space-y-4 flex-shrink-0">
        <DailyGoal score={score.value} />
        <ScoreCard score={score} />
        <BreakdownCard score={score} />
      </div>
    </motion.div>
  );
}
