import { motion } from 'motion/react';
import { Trophy } from 'lucide-react';
import type { Achievement } from '../types';

interface AchievementToastProps {
  achievement: Achievement;
}

export default function AchievementToast({ achievement }: AchievementToastProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 60 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 60 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="fixed top-6 right-6 z-50 flex items-center gap-3
                 bg-white border-2 border-[#2ECC71] rounded-2xl px-4 py-3 shadow-2xl max-w-xs"
    >
      <div className="w-10 h-10 rounded-xl bg-[#D4EDDA] flex items-center justify-center flex-shrink-0">
        <Trophy size={20} className="text-[#2ECC71]" />
      </div>
      <div>
        <p className="text-xs font-semibold text-[#95A5A6] uppercase tracking-wide">Logro desbloqueado</p>
        <p className="text-sm font-bold text-[#2C3E50]">{achievement.title}</p>
        <p className="text-xs text-[#6C757D]">{achievement.description}</p>
      </div>
    </motion.div>
  );
}
