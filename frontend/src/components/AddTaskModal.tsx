import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { X } from 'lucide-react';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (name: string, type: 'BASE' | 'ADDITIONAL') => void;
}

export default function AddTaskModal({ isOpen, onClose, onAdd }: AddTaskModalProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<'BASE' | 'ADDITIONAL'>('BASE');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd(name.trim(), type);
    setName('');
    setType('BASE');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="bg-white rounded-3xl w-full max-w-[500px] shadow-2xl border-2 border-[#E9ECEF]"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b-2 border-[#E9ECEF]">
              <h2 className="text-xl font-bold text-[#2C3E50]">Nueva tarea</h2>
              <button
                onClick={onClose}
                className="p-2 text-[#95A5A6] hover:text-[#2C3E50] hover:bg-[#F8F9FA] rounded-xl transition-all"
              >
                <X size={22} />
              </button>
            </div>

            {/* Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Name input */}
              <div>
                <label className="section-label block mb-2">Nombre de la tarea</label>
                <input
                  id="task-name-input"
                  className="input-field"
                  placeholder="ej: Ejercicio 30 min"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                />
              </div>

              {/* Type selector */}
              <div>
                <label className="section-label block mb-3">Tipo de tarea</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    {
                      value: 'BASE' as const,
                      label: 'BASE',
                      desc: '+10 / −5 pts',
                      sub: 'Hábito fundamental',
                    },
                    {
                      value: 'ADDITIONAL' as const,
                      label: 'ADICIONAL',
                      desc: '+5 / 0 pts',
                      sub: 'Sin penalización',
                    },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setType(opt.value)}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        type === opt.value
                          ? 'border-[#2ECC71] bg-[#D4EDDA]'
                          : 'border-[#E9ECEF] bg-[#F8F9FA] hover:border-[#2ECC71]/50'
                      }`}
                    >
                      <p className={`text-sm font-bold ${type === opt.value ? 'text-[#2C3E50]' : 'text-[#6C757D]'}`}>
                        {opt.label}
                      </p>
                      <p className={`text-xs font-semibold mt-0.5 ${type === opt.value ? 'text-[#2ECC71]' : 'text-[#ADB5BD]'}`}>
                        {opt.desc}
                      </p>
                      <p className="text-xs text-[#ADB5BD] mt-1">{opt.sub}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-secondary flex-1 py-3 text-sm"
                >
                  Cancelar
                </button>
                <button
                  id="add-task-submit"
                  type="submit"
                  disabled={!name.trim()}
                  className="btn-primary flex-1 py-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  Agregar tarea
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
