import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import type { CoachFeedback } from '../types';
import { motion } from 'motion/react';
import { BrainCircuit } from 'lucide-react';

export default function CoachCard() {
  const [feedback, setFeedback] = useState<CoachFeedback | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFeedback() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      try {
        // 1. Mostrar inmediatamente lo que tengamos guardado en la memoria del navegador (Caché Frontend)
        const cachedFeedback = sessionStorage.getItem('coach_feedback_today');
        if (cachedFeedback) {
          setFeedback(JSON.parse(cachedFeedback));
          setLoading(false);
          return; // <--- Detener aquí, no hacer request al servidor.
        }

        // 2. Comprobar si hay actualizaciones (Solo llegará aquí si no hay caché)
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8001';
        const res = await fetch(`${apiUrl}/coach/today?user_id=${user.id}`);
        if (res.ok) {
           const data = await res.json();
           setFeedback(data);
           sessionStorage.setItem('coach_feedback_today', JSON.stringify(data)); // Actualizar caché
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadFeedback();
  }, []);

  if (loading) {
    return (
      <div className="card bg-gray-100 animate-pulse h-32 flex items-center justify-center text-gray-400 text-sm">
        Consultando al Coach IA...
      </div>
    );
  }

  if (!feedback) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.9 }}
      className="card bg-gradient-to-br from-[#2C3E50] to-[#1A252F] text-white"
    >
      <div className="flex items-center gap-2 mb-4">
        <BrainCircuit className="text-[#3498DB]" size={20} />
        <h3 className="font-bold">Coach IA</h3>
      </div>
      <p className="text-sm text-gray-200 mb-4">{feedback.summary}</p>
      {feedback.recommendations.length > 0 && (
         <ul className="text-xs space-y-2">
            {feedback.recommendations.map((rec, i) => (
               <li key={i} className="flex gap-2">
                  <span className="text-[#3498DB]">✦</span>
                  <span className="text-gray-300">{rec}</span>
               </li>
            ))}
         </ul>
      )}
    </motion.div>
  );
}
