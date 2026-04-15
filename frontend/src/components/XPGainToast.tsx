import { motion } from 'motion/react';
import { Zap } from 'lucide-react';

interface XPGainToastProps {
  xp: number;
}

export default function XPGainToast({ xp }: XPGainToastProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.9 }}
      className="fixed bottom-8 right-6 z-50 flex items-center gap-2
                 bg-gradient-to-r from-[#2ECC71] to-[#27AE60]
                 text-white font-bold px-4 py-2.5 rounded-2xl shadow-lg"
    >
      <Zap size={16} className="text-white" />
      <span className="text-sm">+{xp} XP</span>
    </motion.div>
  );
}
