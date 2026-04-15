import { motion } from 'motion/react';
import PomodoroTimer from '../components/PomodoroTimer';

export default function FocusView() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center"
    >
      <div className="w-full mb-8">
        <h1 className="text-2xl font-bold text-[#2C3E50]">Modo Enfoque</h1>
        <p className="text-sm text-[#6C757D] mt-0.5">
          25 min de trabajo · 5 min de descanso
        </p>
      </div>

      <div className="card w-full max-w-md py-10">
        <PomodoroTimer />
      </div>

      {/* Tips */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 w-full max-w-2xl">
        {[
          { emoji: '📵', tip: 'Silencia tu teléfono' },
          { emoji: '💧', tip: 'Ten agua a la mano' },
          { emoji: '🎯', tip: 'Una tarea a la vez' },
        ].map((item) => (
          <div
            key={item.tip}
            className="card p-4 flex items-center gap-3 text-sm text-[#6C757D]"
          >
            <span className="text-2xl">{item.emoji}</span>
            {item.tip}
          </div>
        ))}
      </div>
    </motion.div>
  );
}
