import { motion } from 'motion/react';
import { Target } from 'lucide-react';
import { DAILY_SCORE_GOAL } from '../constants/data';

interface DailyGoalProps {
  score: number;
}

export default function DailyGoal({ score }: DailyGoalProps) {
  const progress = Math.max(0, Math.min(score / DAILY_SCORE_GOAL, 1));
  const goalMet = score >= DAILY_SCORE_GOAL;

  return (
    <div
      className={`rounded-2xl p-6 border-2 transition-all duration-500 ${
        goalMet
          ? 'bg-gradient-to-r from-[#2ECC71] to-[#27AE60] border-[#2ECC71]'
          : 'bg-white border-[#E9ECEF]'
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className={`text-xs font-semibold uppercase tracking-wide ${goalMet ? 'text-white/70' : 'text-[#95A5A6]'}`}>
            Meta diaria
          </p>
          <h3 className={`text-lg font-bold mt-0.5 ${goalMet ? 'text-white' : 'text-[#2C3E50]'}`}>
            {goalMet ? '¡Meta cumplida! 🌱' : `${score} / ${DAILY_SCORE_GOAL} pts`}
          </h3>
        </div>
        <motion.div
          animate={goalMet ? { scale: [1, 1.2, 1] } : { scale: 1 }}
          transition={{ duration: 0.5, type: 'spring' }}
          className={`p-2.5 rounded-xl ${goalMet ? 'bg-white/20' : 'bg-[#F8F9FA]'}`}
        >
          <Target size={20} className={goalMet ? 'text-white' : 'text-[#2ECC71]'} />
        </motion.div>
      </div>

      {/* Progress bar */}
      <div className={`h-2 rounded-full overflow-hidden ${goalMet ? 'bg-white/30' : 'bg-[#E9ECEF]'}`}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className={`h-full rounded-full ${
            goalMet
              ? 'bg-white'
              : 'bg-gradient-to-r from-[#2ECC71] to-[#52C41A]'
          }`}
        />
      </div>

      <p className={`text-xs mt-2 ${goalMet ? 'text-white/70' : 'text-[#ADB5BD]'}`}>
        {goalMet
          ? 'Excelente trabajo hoy'
          : `Faltan ${Math.max(0, DAILY_SCORE_GOAL - score)} pts para la meta`}
      </p>
    </div>
  );
}
