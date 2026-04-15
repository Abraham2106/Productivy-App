import { motion } from 'motion/react';
import { Plus } from 'lucide-react';

interface EmptyStateProps {
  onAddTask: () => void;
}

export default function EmptyState({ onAddTask }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] text-center px-4"
    >
      {/* Seed illustration */}
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="text-6xl mb-6"
      >
        🌱
      </motion.div>

      <h2 className="text-2xl font-bold text-[#2C3E50] mb-3">
        Tu día empieza aquí
      </h2>
      <p className="text-[#6C757D] text-sm max-w-xs mb-8 leading-relaxed">
        Agrega tus primeras tareas del día. Completa las BASE para sumar puntos
        y ver crecer tu árbol.
      </p>

      <motion.button
        whileHover={{ scale: 1.02, boxShadow: '0 10px 30px rgba(46,204,113,0.3)' }}
        whileTap={{ scale: 0.98 }}
        onClick={onAddTask}
        id="empty-state-add-task"
        className="btn-primary flex items-center gap-2 py-4 px-6 text-sm"
      >
        <Plus size={18} />
        Agregar primera tarea
      </motion.button>
    </motion.div>
  );
}
