import { motion } from 'motion/react';
import type { Score } from '../types';

interface ScoreCardProps {
  score: Score;
}

export default function ScoreCard({ score }: ScoreCardProps) {
  const isPositive = score.value >= 0;

  return (
    <div className="card">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-[#95A5A6] mb-4">
        Puntuación de hoy
      </h3>

      <div className="flex items-end gap-2 mb-6">
        <motion.span
          key={score.value}
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className={`text-[64px] font-bold leading-none ${
            isPositive ? 'text-[#2ECC71]' : 'text-[#95A5A6]'
          }`}
        >
          {score.value}
        </motion.span>
        <span className="text-lg text-[#ADB5BD] font-medium mb-2">pts</span>
      </div>

      {/* Compact breakdown */}
      {Object.keys(score.breakdown).length > 0 && (
        <div className="space-y-2">
          {Object.entries(score.breakdown).map(([name, pts]) => (
            <div key={name} className="flex items-center justify-between">
              <span className="text-sm text-[#6C757D] truncate max-w-[160px]">{name}</span>
              <span
                className={`text-xs font-semibold ${
                  pts > 0 ? 'text-[#2ECC71]' : pts < 0 ? 'text-[#95A5A6]' : 'text-[#ADB5BD]'
                }`}
              >
                {pts > 0 ? '+' : pts < 0 ? '−' : ''}{Math.abs(pts)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
