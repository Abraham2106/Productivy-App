import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'motion/react';
import { Play, Pause, RotateCcw, Coffee, Brain } from 'lucide-react';

const WORK_SECONDS = 25 * 60;
const BREAK_SECONDS = 5 * 60;
const MAX_SESSIONS = 4;

type TimerMode = 'work' | 'break';

interface PomodoroTimerProps {
  onSessionComplete?: (type: 'work' | 'break', minutes: number) => void;
}

export default function PomodoroTimer({ onSessionComplete }: PomodoroTimerProps) {
  const [mode, setMode] = useState<TimerMode>('work');
  const [secondsLeft, setSecondsLeft] = useState(WORK_SECONDS);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const total = mode === 'work' ? WORK_SECONDS : BREAK_SECONDS;
  const progress = 1 - secondsLeft / total;
  const circumference = 2 * Math.PI * 100;
  const dashOffset = circumference * (1 - progress);

  const mins = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const secs = String(secondsLeft % 60).padStart(2, '0');

  const tick = useCallback(() => {
    setSecondsLeft((prev) => {
      if (prev <= 1) {
        setRunning(false);
        if (onSessionComplete) {
          onSessionComplete(mode, mode === 'work' ? Math.floor(WORK_SECONDS / 60) : Math.floor(BREAK_SECONDS / 60));
        }
        if (mode === 'work') {
          setSessions((s) => s + 1);
          setMode('break');
          return BREAK_SECONDS;
        } else {
          setMode('work');
          return WORK_SECONDS;
        }
      }
      return prev - 1;
    });
  }, [mode]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(tick, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, tick]);

  const reset = () => {
    setRunning(false);
    setMode('work');
    setSecondsLeft(WORK_SECONDS);
  };

  const switchMode = (m: TimerMode) => {
    setRunning(false);
    setMode(m);
    setSecondsLeft(m === 'work' ? WORK_SECONDS : BREAK_SECONDS);
  };

  const strokeColor = mode === 'work' ? '#2ECC71' : '#6C757D';

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Mode tabs */}
      <div className="flex gap-2 bg-[#F8F9FA] border-2 border-[#E9ECEF] rounded-xl p-1">
        {([['work', 'Enfoque', Brain], ['break', 'Descanso', Coffee]] as const).map(([m, label, Icon]) => (
          <button
            key={m}
            onClick={() => switchMode(m)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              mode === m
                ? 'bg-white text-[#2C3E50] shadow-sm'
                : 'text-[#6C757D] hover:text-[#2C3E50]'
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      {/* Circular timer */}
      <div className="relative flex items-center justify-center">
        <svg width="224" height="224" viewBox="0 0 224 224">
          {/* Track */}
          <circle cx="112" cy="112" r="100" fill="none" stroke="#F8F9FA" strokeWidth="12" />
          {/* Progress */}
          <motion.circle
            cx="112" cy="112" r="100"
            fill="none"
            stroke={strokeColor}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            transform="rotate(-90 112 112)"
            transition={{ duration: 0.5, ease: 'linear' }}
          />
        </svg>

        {/* Time display */}
        <div className="absolute flex flex-col items-center">
          <span className="text-5xl font-black tabular-nums text-[#2C3E50]">
            {mins}:{secs}
          </span>
          <span className="bg-[#F8F9FA] text-[#6C757D] text-xs font-semibold px-4 py-1.5 rounded-full mt-2">
            {mode === 'work' ? 'ENFOQUE' : 'DESCANSO'}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <button
          onClick={reset}
          className="p-3 text-[#ADB5BD] hover:text-[#6C757D] hover:bg-[#F8F9FA] rounded-xl transition-all"
        >
          <RotateCcw size={20} />
        </button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setRunning((r) => !r)}
          id="pomodoro-play-btn"
          className="btn-primary flex items-center gap-2 py-3.5 px-8 text-sm"
        >
          {running ? <Pause size={18} /> : <Play size={18} />}
          {running ? 'Pausar' : 'Iniciar'}
        </motion.button>
      </div>

      {/* Session dots */}
      <div className="flex gap-2 items-center">
        <span className="section-label mr-1">Sesiones</span>
        {Array.from({ length: MAX_SESSIONS }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0 }}
            animate={{ scale: i < sessions ? 1 : 0.6 }}
            className={`w-3 h-3 rounded-full ${
              i < sessions
                ? 'bg-gradient-to-br from-[#2ECC71] to-[#27AE60]'
                : 'bg-[#E9ECEF]'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
