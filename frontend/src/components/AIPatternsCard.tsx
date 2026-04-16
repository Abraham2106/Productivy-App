import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import type { BehaviorPattern } from '../types';
import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';

export default function AIPatternsCard() {
  const [patterns, setPatterns] = useState<BehaviorPattern[]>([]);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8001';
        const res = await fetch(`${apiUrl}/patterns/?user_id=${user.id}`);
        if(res.ok) {
           const data = await res.json();
           setPatterns(data);
        }
      } catch (e) {
        console.error(e);
      }
    }
    load();
  }, []);

  if (!patterns || patterns.length === 0) {
    return (
      <div className="card mt-6 bg-gray-50 border-dashed border-2 border-gray-200 p-8 text-center text-gray-400">
        <p className="text-sm">Aún no hay patrones de comportamiento detectados.</p>
        <p className="text-xs mt-1">Sigue registrando tus días para que la IA pueda analizarlos.</p>
      </div>
    );
  }

  return (
    <div className="card mt-6">
      <div className="flex items-center gap-2 mb-4">
         <Sparkles className="text-[#9B59B6]" size={20} />
         <h3 className="text-lg font-bold text-[#2C3E50]">Patrones Detectados</h3>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
         {patterns.map((p, i) => (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} key={i} className="rounded-xl border border-[#E9ECEF] p-4 text-sm">
               <div className="font-semibold text-[#2C3E50] mb-1">{p.title}</div>
               <div className="text-[#6C757D] mb-2">{p.description}</div>
               <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider">
                 <span className={`${p.impact === 'positive' ? 'text-[#2ECC71]' : p.impact === 'negative' ? 'text-[#E74C3C]' : 'text-[#F39C12]'}`}>
                    {p.impact}
                 </span>
                 <span className="text-[#95A5A6]">Confianza: {Math.round(p.confidence * 100)}%</span>
               </div>
            </motion.div>
         ))}
      </div>
    </div>
  );
}
