import { motion } from 'motion/react';
import { Trash2 } from 'lucide-react';
import type { Task } from '../types';
import TaskBadge from './TaskBadge';

interface TaskItemProps {
  task: Task;
  index: number;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
}

function getPoints(task: Task): number {
  if (task.task_type === 'BASE') return task.completed ? 10 : -5;
  return task.completed ? 5 : 0;
}

export default function TaskItem({ task, index, onComplete, onDelete }: TaskItemProps) {
  const points = getPoints(task);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group flex items-center gap-3 py-2.5 -mx-6 px-6 rounded-xl
                 hover:bg-[#F8F9FA] transition-colors min-h-[52px]"
    >
      {/* Checkbox */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => !task.completed && onComplete(task.id)}
        disabled={task.completed}
        className={`relative flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center
                    transition-all ${
                      task.completed
                        ? 'bg-[#2ECC71] border-[#2ECC71] shadow-sm'
                        : 'bg-white border-[#E9ECEF] hover:border-[#2ECC71]/50'
                    }`}
      >
        {task.completed && (
          <motion.svg
            width="12" height="12" viewBox="0 0 12 12"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <motion.path
              d="M2 6 L5 9 L10 3"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.3 }}
            />
          </motion.svg>
        )}
      </motion.button>

      {/* Task name */}
      <span
        className={`flex-1 text-sm font-medium transition-all ${
          task.completed
            ? 'line-through opacity-50 text-[#95A5A6]'
            : 'text-[#2C3E50]'
        }`}
      >
        {task.name}
      </span>

      {/* Badge */}
      <TaskBadge points={points} />

      {/* Delete button */}
      <motion.button
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        onClick={() => onDelete(task.id)}
        className="opacity-0 group-hover:opacity-100 p-1 text-[#ADB5BD]
                   hover:text-[#95A5A6] transition-all rounded-lg hover:bg-[#F1F3F5]"
      >
        <Trash2 size={14} />
      </motion.button>
    </motion.div>
  );
}
