import { motion } from 'motion/react';
import { Leaf } from 'lucide-react';

interface StreakBadgeProps {
  streak: number;
}

export default function StreakBadge({ streak }: StreakBadgeProps) {
  return (
    <div className="flex items-center gap-3 bg-white border-2 border-[#2ECC71] rounded-2xl p-3 shadow-sm">
      <motion.div
        animate={{ rotate: [0, -10, 10, -10, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
      >
        <Leaf size={28} className="text-[#2ECC71]" />
      </motion.div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-[#95A5A6]">
          Racha activa
        </p>
        <p className="text-xl font-bold text-[#2C3E50]">
          {streak}{' '}
          <span className="text-sm font-medium text-[#6C757D]">
            {streak === 1 ? 'día' : 'días'}
          </span>
        </p>
      </div>
    </div>
  );
}
