import { motion } from 'motion/react';
import type { Task } from '../types';

interface QuickStatsProps {
  tasks: Task[];
  streak: number;
}

export default function QuickStats({ tasks, streak }: QuickStatsProps) {
  const completed = tasks.filter((t) => t.completed).length;
  const baseTasks = tasks.filter((t) => t.task_type === 'BASE');
  const baseCompleted = baseTasks.filter((t) => t.completed).length;

  const stats = [
    {
      label: 'Completadas',
      value: `${completed}/${tasks.length}`,
      sub: 'tareas hoy',
      color: 'text-[#2ECC71]',
      bg: 'bg-[#D4EDDA]',
    },
    {
      label: 'Bases',
      value: `${baseCompleted}/${baseTasks.length}`,
      sub: 'tareas BASE',
      color: 'text-[#2C3E50]',
      bg: 'bg-[#F8F9FA]',
    },
    {
      label: 'Racha',
      value: `${streak}`,
      sub: streak === 1 ? 'día activo' : 'días activos',
      color: 'text-[#27AE60]',
      bg: 'bg-[#D4EDDA]',
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          whileHover={{ scale: 1.05, y: -2 }}
          className="card p-4 cursor-default"
        >
          <p className="section-label mb-2">{stat.label}</p>
          <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          <p className="text-xs text-[#ADB5BD] mt-0.5">{stat.sub}</p>
        </motion.div>
      ))}
    </div>
  );
}
