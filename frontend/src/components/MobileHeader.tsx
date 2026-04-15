import { motion } from 'motion/react';
import { Calendar, TrendingUp, Timer, Plus, Sprout } from 'lucide-react';
import type { ActiveView, GamificationState } from '../types';

interface MobileHeaderProps {
  activeView: ActiveView;
  onViewChange: (view: ActiveView) => void;
  gamification: GamificationState;
  score: number;
  onAddTask: () => void;
}

const NAV_ITEMS: { view: ActiveView; label: string; Icon: React.ElementType }[] = [
  { view: 'daily', label: 'Diario', Icon: Calendar },
  { view: 'weekly', label: 'Semanal', Icon: TrendingUp },
  { view: 'focus', label: 'Enfoque', Icon: Timer },
];

export default function MobileHeader({
  activeView,
  onViewChange,
  gamification,
  score,
  onAddTask,
}: MobileHeaderProps) {
  return (
    <header className="lg:hidden sticky top-0 z-30 bg-gradient-to-r from-[#F8F9FA] to-[#E9ECEF]
                       border-b-2 border-[#E9ECEF]">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">🌱</span>
          <span className="text-base font-bold text-[#2C3E50]">Growth</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Streak badge */}
          <div className="flex items-center gap-1.5 bg-white border border-[#2ECC71]/30 rounded-full px-3 py-1">
            <Sprout size={14} className="text-[#2ECC71]" />
            <span className="text-xs font-bold text-[#2C3E50]">{gamification.streak}d</span>
          </div>

          {/* Score */}
          <motion.div
            key={score}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className={`font-bold text-lg ${score >= 0 ? 'text-[#2ECC71]' : 'text-[#95A5A6]'}`}
          >
            {score} pts
          </motion.div>

          {/* Add button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onAddTask}
            className="btn-primary p-2.5 rounded-xl"
          >
            <Plus size={18} />
          </motion.button>
        </div>
      </div>

      {/* Nav tabs */}
      <div className="flex gap-1 px-4 pb-3 overflow-x-auto">
        {NAV_ITEMS.map(({ view, label, Icon }) => (
          <button
            key={view}
            onClick={() => onViewChange(view)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold
                        whitespace-nowrap transition-all flex-shrink-0 ${
              activeView === view
                ? 'bg-gradient-to-r from-[#2ECC71] to-[#27AE60] text-white shadow-md'
                : 'text-[#6C757D] bg-white/50 hover:bg-white'
            }`}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>
    </header>
  );
}
