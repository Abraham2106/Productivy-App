import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import PomodoroTimer from '../components/PomodoroTimer';
import { supabase } from '../utils/supabase';
import type { FocusSessionSummary } from '../types';

export default function FocusView() {
  const [summary, setSummary] = useState<FocusSessionSummary | null>(null);

  const loadSummary = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    try {
      const res = await fetch(`http://localhost:8001/focus/today?user_id=${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setSummary(data);
      }
    } catch {}
  };

  useEffect(() => {
    loadSummary();
  }, []);

  const handleSessionComplete = async (type: 'work' | 'break', minutes: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    const ended_at = new Date();
    const started_at = new Date(ended_at.getTime() - minutes * 60000);

    try {
      await fetch(`http://localhost:8001/focus/sessions?user_id=${user.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          started_at: started_at.toISOString(),
          ended_at: ended_at.toISOString(),
          session_type: type,
          planned_minutes: minutes,
          actual_minutes: minutes,
          completed: true
        })
      });
      sessionStorage.removeItem('coach_feedback_today'); // Invalidar caché
      loadSummary();
    } catch (e) {
      console.error("Failed to save session", e);
    }
  };

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

      <div className="card w-full max-w-md py-10 relative">
        <PomodoroTimer onSessionComplete={handleSessionComplete} />
        {summary && summary.completed_work_sessions > 0 && (
          <div className="absolute top-4 right-4 bg-[#E8F8F5] text-[#2ECC71] px-3 py-1 rounded-full text-xs font-bold shadow-sm">
            🔥 {summary.completed_work_sessions} sesiones hoy ({summary.total_focus_minutes} min)
          </div>
        )}
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
