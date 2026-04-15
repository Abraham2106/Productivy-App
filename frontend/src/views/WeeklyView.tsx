import { motion } from 'motion/react';
import WeeklyChart from '../components/WeeklyChart';
import AchievementCard from '../components/AchievementCard';
import type { Achievement } from '../types';

interface WeeklyDataPoint {
  date: string;
  day: string;
  score: number;
  tasks: number;
  completed: number;
}

interface WeeklyViewProps {
  weeklyData: WeeklyDataPoint[];
  achievements: Achievement[];
}

export default function WeeklyView({ weeklyData, achievements }: WeeklyViewProps) {
  const totalThisWeek = weeklyData.reduce((sum, d) => sum + d.score, 0);
  const bestDay = weeklyData.reduce((best, d) => (d.score > best.score ? d : best), weeklyData[0]);
  const activeDays = weeklyData.filter((d) => d.tasks > 0).length;

  const summaryStats = [
    { label: 'Total semanal', value: totalThisWeek, unit: 'pts' },
    { label: 'Mejor día', value: bestDay?.score ?? 0, unit: 'pts' },
    { label: 'Días activos', value: activeDays, unit: '/ 7' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold text-[#2C3E50]">Resumen Semanal</h1>
        <p className="text-sm text-[#6C757D] mt-0.5">Últimos 7 días de actividad</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3">
        {summaryStats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="card p-4"
          >
            <p className="section-label mb-2">{stat.label}</p>
            <p className="text-2xl font-bold text-[#2ECC71]">
              {stat.value}
              <span className="text-sm font-medium text-[#ADB5BD] ml-1">{stat.unit}</span>
            </p>
          </motion.div>
        ))}
      </div>

      {/* Chart + Achievements */}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
          <WeeklyChart data={weeklyData} />
        </div>
        <div className="w-full lg:w-[320px] flex-shrink-0">
          <AchievementCard achievements={achievements} />
        </div>
      </div>
    </motion.div>
  );
}
