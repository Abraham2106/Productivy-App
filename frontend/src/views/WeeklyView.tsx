import { motion } from 'motion/react';

import AchievementCard from '../components/AchievementCard';
import HabitPatternsCard from '../components/HabitPatternsCard';
import WeeklyChart from '../components/WeeklyChart';
import AIPatternsCard from '../components/AIPatternsCard';
import type { Achievement, HabitPattern, WeeklyDataPoint } from '../types';

interface WeeklyViewProps {
  weeklyData: WeeklyDataPoint[];
  habits: HabitPattern[];
  achievements: Achievement[];
}

export default function WeeklyView({
  weeklyData,
  habits,
  achievements,
}: WeeklyViewProps) {
  const total = weeklyData.reduce((sum, day) => sum + day.score, 0);
  const average = weeklyData.length > 0 ? Math.round((total / weeklyData.length) * 10) / 10 : 0;
  const bestDay = weeklyData.reduce((best, day) => (day.score > best.score ? day : best), weeklyData[0]);
  const worstDay = weeklyData.reduce((worst, day) => (day.score < worst.score ? day : worst), weeklyData[0]);

  const summary = [
    { label: 'Total semanal', value: total, helper: 'puntos' },
    { label: 'Promedio diario', value: average, helper: 'pts' },
    { label: 'Mejor día', value: bestDay ? `${bestDay.day} ${bestDay.dateLabel}` : '-', helper: 'máximo' },
    { label: 'Peor día', value: worstDay ? `${worstDay.day} ${worstDay.dateLabel}` : '-', helper: 'mínimo' },
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
        <h1 className="text-2xl font-bold text-[#2C3E50]">Vista semanal</h1>
        <p className="mt-0.5 text-sm text-[#6C757D]">
          Score, tendencia y hábitos de los últimos 7 días
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {summary.map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
            className="rounded-2xl bg-[#F8F9FA] p-4"
          >
            <p className="text-sm font-medium text-[#6C757D]">{item.label}</p>
            <p className="mt-2 text-2xl font-bold text-[#2C3E50]">{item.value}</p>
            <p className="mt-1 text-xs uppercase tracking-wide text-[#95A5A6]">{item.helper}</p>
          </motion.div>
        ))}
      </div>

      <WeeklyChart data={weeklyData} />
      <HabitPatternsCard habits={habits} />
      <AIPatternsCard />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="card">
          <div className="mb-4">
            <p className="section-label mb-2">Breakdown semanal</p>
            <h3 className="text-lg font-bold text-[#2C3E50]">Resumen por día</h3>
          </div>
          <div className="space-y-3">
            {weeklyData.map((day) => (
              <div key={day.date} className="rounded-xl bg-[#F8F9FA] p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold capitalize text-[#2C3E50]">
                      {day.day} {day.dateLabel}
                    </p>
                    <p className="text-sm text-[#6C757D]">
                      {day.completed}/{day.tasks} tareas completadas
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-sm font-semibold ${
                      day.score > 0
                        ? 'bg-[#D4EDDA] text-[#2ECC71]'
                        : day.score < 0
                          ? 'bg-[#FDECEC] text-[#E24B4A]'
                          : 'bg-white text-[#95A5A6]'
                    }`}
                  >
                    {day.score > 0 ? '+' : ''}
                    {day.score} pts
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <AchievementCard achievements={achievements} />
      </div>
    </motion.div>
  );
}
