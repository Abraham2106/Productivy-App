import { motion } from 'motion/react';
import {
  CheckCircle2, Target, Award, Zap, Trophy, Sprout, Brain,
} from 'lucide-react';
import type { Achievement } from '../types';

const ICON_MAP: Record<string, React.ElementType> = {
  CheckCircle2, Target, Award, Zap, Trophy, Sprout, Brain,
};

interface AchievementCardProps {
  achievements: Achievement[];
}

export default function AchievementCard({ achievements }: AchievementCardProps) {
  const unlocked = achievements.filter((a) => a.unlocked);
  const locked = achievements.filter((a) => !a.unlocked);

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-[#2C3E50]">Logros</h3>
        <span className="section-label">{unlocked.length}/{achievements.length}</span>
      </div>

      <div className="space-y-3">
        {/* Unlocked */}
        {unlocked.map((a, i) => {
          const Icon = ICON_MAP[a.icon] ?? Trophy;
          return (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-3 p-3 bg-[#D4EDDA] rounded-xl"
            >
              <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-sm">
                <Icon size={18} className="text-[#2ECC71]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#2C3E50]">{a.title}</p>
                <p className="text-xs text-[#6C757D] truncate">{a.description}</p>
              </div>
              <span className="text-xs text-[#2ECC71] font-bold">✓</span>
            </motion.div>
          );
        })}

        {/* Locked */}
        {locked.map((a) => {
          const Icon = ICON_MAP[a.icon] ?? Trophy;
          return (
            <div
              key={a.id}
              className="flex items-center gap-3 p-3 bg-[#F8F9FA] rounded-xl opacity-50"
            >
              <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center">
                <Icon size={18} className="text-[#ADB5BD]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#6C757D]">{a.title}</p>
                <p className="text-xs text-[#ADB5BD] truncate">{a.description}</p>
              </div>
              <span className="text-xs text-[#ADB5BD]">🔒</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
