import { motion } from 'motion/react';
import type { GamificationState } from '../types';

interface LevelProgressProps {
  gamification: GamificationState;
}

export default function LevelProgress({ gamification }: LevelProgressProps) {
  const { level, levelName, xpInCurrentLevel, xpForNextLevel } = gamification;
  const progress = xpInCurrentLevel / xpForNextLevel;

  return (
    <div className="bg-gradient-to-r from-[#2C3E50] to-[#34495E] rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs font-semibold text-white/50 uppercase tracking-wide">Nivel</p>
          <p className="text-xl font-bold text-white">{level}</p>
        </div>
        <span className="bg-white/10 text-white/80 text-xs font-semibold px-2 py-1 rounded-full">
          {levelName}
        </span>
      </div>

      {/* XP bar */}
      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mb-1.5">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="h-full rounded-full bg-gradient-to-r from-[#2ECC71] to-[#52C41A]"
        />
      </div>
      <p className="text-xs text-white/40">
        {xpInCurrentLevel} / {xpForNextLevel} XP
      </p>
    </div>
  );
}
