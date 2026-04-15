import { motion } from 'motion/react';
import { Calendar, LogOut, Timer, TrendingUp } from 'lucide-react';
import type { ActiveView, GamificationState } from '../types';
import TreeGrowth from './TreeGrowth';
import LevelProgress from './LevelProgress';
import StreakBadge from './StreakBadge';

interface SidebarProps {
  activeView: ActiveView;
  onViewChange: (view: ActiveView) => void;
  gamification: GamificationState;
  treeProgress: number;
  todayScore: number;
  userLabel: string;
  userEmail: string;
  onSignOut: () => void;
}

const NAV_ITEMS: { view: ActiveView; label: string; Icon: React.ElementType }[] = [
  { view: 'daily', label: 'Diario', Icon: Calendar },
  { view: 'weekly', label: 'Semanal', Icon: TrendingUp },
  { view: 'focus', label: 'Enfoque', Icon: Timer },
];

export default function Sidebar({
  activeView,
  onViewChange,
  gamification,
  treeProgress,
  todayScore,
  userLabel,
  userEmail,
  onSignOut,
}: SidebarProps) {
  return (
    <aside className="hidden lg:flex fixed left-0 top-0 h-full w-[280px] bg-[#F8F9FA]
                      border-r-2 border-[#E9ECEF] flex-col p-6 z-40">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#2ECC71] to-[#27AE60]
                        flex items-center justify-center shadow-sm text-lg">
          🌱
        </div>
        <span className="text-xl font-bold text-[#2C3E50]">Growth</span>
      </div>

      {/* Navigation */}
      <nav className="space-y-2 mb-8">
        {NAV_ITEMS.map(({ view, label, Icon }) => (
          <motion.button
            key={view}
            whileTap={{ scale: 0.97 }}
            onClick={() => onViewChange(view)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
              activeView === view
                ? 'bg-gradient-to-r from-[#2ECC71] to-[#27AE60] text-white shadow-md'
                : 'text-[#6C757D] hover:bg-white hover:shadow-sm'
            }`}
          >
            <Icon size={18} />
            {label}
          </motion.button>
        ))}
      </nav>

      <div className="mb-4 rounded-2xl border-2 border-[#E9ECEF] bg-white p-4 shadow-sm">
        <p className="section-label mb-2">Sesion activa</p>
        <p className="truncate text-sm font-semibold text-[#2C3E50]">{userLabel}</p>
        <p className="truncate text-xs text-[#95A5A6]">{userEmail}</p>
        <button
          type="button"
          onClick={onSignOut}
          className="btn-secondary mt-4 flex w-full items-center justify-center gap-2 px-4 py-2.5 text-sm"
        >
          <LogOut size={16} />
          Cerrar sesion
        </button>
      </div>

      {/* Score display */}
      <div className="bg-gradient-to-r from-[#F8F9FA] to-[#E9ECEF] rounded-2xl p-4 mb-4 shadow-lg">
        <p className="section-label mb-1">Puntuación hoy</p>
        <motion.p
          key={todayScore}
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className={`text-5xl font-bold leading-none ${
            todayScore >= 0 ? 'text-[#2ECC71]' : 'text-[#95A5A6]'
          }`}
        >
          {todayScore}
        </motion.p>
        <p className="text-xs text-[#ADB5BD] mt-1">puntos</p>
      </div>

      {/* Tree */}
      <TreeGrowth progress={treeProgress} />

      {/* Spacer */}
      <div className="mt-auto space-y-3">
        <StreakBadge streak={gamification.streak} />
        <LevelProgress gamification={gamification} />
      </div>
    </aside>
  );
}
