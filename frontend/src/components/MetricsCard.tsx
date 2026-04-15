import { useEffect, useState } from 'react';
import { BookOpen, Moon, Smartphone } from 'lucide-react';

import {
  getPhoneFeedback,
  getPhonePoints,
  getSleepFeedback,
  getSleepPoints,
  getStudyFeedback,
  getStudyPoints,
} from '../lib/metricScoring';
import type { DailyMetrics } from '../types';

interface MetricsCardProps {
  metrics: DailyMetrics | null;
  onSave: (values: Omit<DailyMetrics, 'date' | 'user_id'>) => void;
}

function formatPoints(value: number): string {
  if (value > 0) return `+${value} pts`;
  if (value < 0) return `${value} pts`;
  return '0 pts';
}

function badgeClasses(points: number): string {
  if (points >= 12) {
    return 'bg-[#D4EDDA] text-[#1F8A57] border-[#2ECC71]/20';
  }
  if (points > 0) {
    return 'bg-[#EAF7EE] text-[#2ECC71] border-[#2ECC71]/20';
  }
  if (points === 0) {
    return 'bg-[#F8F9FA] text-[#95A5A6] border-[#E9ECEF]';
  }
  if (points <= -20) {
    return 'bg-[#FBE3E3] text-[#B42318] border-[#E24B4A]/20';
  }
  return 'bg-[#FDECEC] text-[#E24B4A] border-[#E24B4A]/20';
}

export default function MetricsCard({ metrics, onSave }: MetricsCardProps) {
  const [sleepHours, setSleepHours] = useState(metrics?.sleep_hours ?? 7);
  const [phoneMinutes, setPhoneMinutes] = useState(metrics?.phone_minutes ?? 60);
  const [studyMinutes, setStudyMinutes] = useState(metrics?.study_minutes ?? 30);

  useEffect(() => {
    setSleepHours(metrics?.sleep_hours ?? 7);
    setPhoneMinutes(metrics?.phone_minutes ?? 60);
    setStudyMinutes(metrics?.study_minutes ?? 30);
  }, [metrics]);

  const sleepPoints = getSleepPoints(sleepHours);
  const phonePoints = getPhonePoints(phoneMinutes);
  const studyPoints = getStudyPoints(studyMinutes);
  const totalImpact = sleepPoints + phonePoints + studyPoints;

  return (
    <div className="card space-y-5">
      <div>
        <p className="section-label mb-2">Metricas de hoy</p>
        <h3 className="text-lg font-bold text-[#2C3E50]">Condicionamiento diario</h3>
        <p className="mt-1 text-sm text-[#6C757D]">
          El impacto cambia en tiempo real segun la calidad de tus habitos.
        </p>
      </div>

      <div className="space-y-5">
        <label className="block space-y-2">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#2C3E50]">
              <Moon size={16} className="text-[#2ECC71]" />
              Horas de sueno
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-[#6C757D]">{sleepHours.toFixed(1)} h</span>
              <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${badgeClasses(sleepPoints)}`}>
                {formatPoints(sleepPoints)}
              </span>
            </div>
          </div>
          <input
            type="range"
            min={0}
            max={12}
            step={0.5}
            value={sleepHours}
            onChange={(event) => setSleepHours(Number(event.target.value))}
            className="w-full accent-[#2ECC71]"
          />
          <p className="text-xs text-[#95A5A6]">{getSleepFeedback(sleepHours)}</p>
        </label>

        <label className="block space-y-2">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#2C3E50]">
              <Smartphone size={16} className="text-[#2ECC71]" />
              Uso del celular
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-[#6C757D]">{phoneMinutes} min</span>
              <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${badgeClasses(phonePoints)}`}>
                {formatPoints(phonePoints)}
              </span>
            </div>
          </div>
          <input
            type="range"
            min={0}
            max={300}
            step={5}
            value={phoneMinutes}
            onChange={(event) => setPhoneMinutes(Number(event.target.value))}
            className="w-full accent-[#2ECC71]"
          />
          <p className="text-xs text-[#95A5A6]">{getPhoneFeedback(phoneMinutes)}</p>
        </label>

        <label className="block space-y-2">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#2C3E50]">
              <BookOpen size={16} className="text-[#2ECC71]" />
              Tiempo de estudio
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-[#6C757D]">{studyMinutes} min</span>
              <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${badgeClasses(studyPoints)}`}>
                {formatPoints(studyPoints)}
              </span>
            </div>
          </div>
          <input
            type="range"
            min={0}
            max={240}
            step={10}
            value={studyMinutes}
            onChange={(event) => setStudyMinutes(Number(event.target.value))}
            className="w-full accent-[#2ECC71]"
          />
          <p className="text-xs text-[#95A5A6]">{getStudyFeedback(studyMinutes)}</p>
        </label>
      </div>

      <div className="flex items-center justify-between gap-4 rounded-2xl bg-[#F8F9FA] p-4">
        <div>
          <p className="section-label mb-1">Impacto total</p>
          <p className={`text-lg font-bold ${totalImpact >= 0 ? 'text-[#2ECC71]' : 'text-[#E24B4A]'}`}>
            {totalImpact > 0 ? '+' : ''}
            {totalImpact} pts
          </p>
          <p className="mt-1 text-xs text-[#95A5A6]">
            Los habitos negativos ahora pesan mas en el score global.
          </p>
        </div>
        <button
          type="button"
          onClick={() =>
            onSave({
              sleep_hours: sleepHours,
              phone_minutes: phoneMinutes,
              study_minutes: studyMinutes,
            })
          }
          className="btn-primary px-4 py-3 text-sm"
        >
          {metrics ? 'Actualizar metricas' : 'Guardar metricas'}
        </button>
      </div>
    </div>
  );
}
