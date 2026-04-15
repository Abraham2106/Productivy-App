import { motion } from 'motion/react';
import type { Score } from '../types';

interface BreakdownCardProps {
  score: Score;
}

export default function BreakdownCard({ score }: BreakdownCardProps) {
  const entries = Object.entries(score.breakdown);

  if (entries.length === 0) {
    return (
      <div className="card">
        <h3 className="text-lg font-bold text-[#2C3E50] mb-4">Desglose</h3>
        <p className="text-sm text-[#ADB5BD]">Agrega tareas para ver el desglose.</p>
      </div>
    );
  }

  const maxAbs = Math.max(...entries.map(([, v]) => Math.abs(v)), 1);

  return (
    <div className="card">
      <h3 className="text-lg font-bold text-[#2C3E50] mb-4">Desglose</h3>
      <div className="space-y-3">
        {entries.map(([name, pts], i) => {
          const isPositive = pts > 0;
          const isNeutral = pts === 0;
          const barWidth = Math.abs(pts) / maxAbs;

          return (
            <motion.div
              key={name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="space-y-1"
            >
              <div className="flex justify-between items-center">
                <span className="text-sm text-[#2C3E50] font-medium truncate max-w-[180px]">{name}</span>
                <span
                  className={`text-xs font-semibold ${
                    isPositive ? 'text-[#2ECC71]' : isNeutral ? 'text-[#ADB5BD]' : 'text-[#95A5A6]'
                  }`}
                >
                  {pts > 0 ? '+' : pts < 0 ? '−' : ''}{Math.abs(pts)} pts
                </span>
              </div>
              <div className="h-1.5 bg-[#F8F9FA] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${barWidth * 100}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut', delay: i * 0.05 }}
                  className={`h-full rounded-full ${
                    isPositive
                      ? 'bg-gradient-to-r from-[#2ECC71] to-[#52C41A]'
                      : 'bg-[#E9ECEF]'
                  }`}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
