import { AlertTriangle, CheckCircle2, MinusCircle } from 'lucide-react';

import type { HabitPattern } from '../types';

interface HabitPatternsCardProps {
  habits: HabitPattern[];
}

function sectionMeta(classification: HabitPattern['classification']) {
  if (classification === 'positive') {
    return {
      title: 'Hábitos positivos',
      empty: 'No hay hábitos positivos detectados todavía.',
      headerClass: 'bg-[#D4EDDA] text-[#2ECC71]',
      badgeClass: 'bg-[#D4EDDA] text-[#2ECC71]',
      Icon: CheckCircle2,
    };
  }
  if (classification === 'negative') {
    return {
      title: 'Hábitos a mejorar',
      empty: 'No hay hábitos críticos esta semana.',
      headerClass: 'bg-[#FDECEC] text-[#E24B4A]',
      badgeClass: 'bg-[#FDECEC] text-[#E24B4A]',
      Icon: AlertTriangle,
    };
  }
  return {
    title: 'Neutrales',
    empty: 'Sin hábitos neutrales por ahora.',
    headerClass: 'bg-[#F8F9FA] text-[#6C757D]',
    badgeClass: 'bg-[#F8F9FA] text-[#6C757D]',
    Icon: MinusCircle,
  };
}

function HabitDots({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: 7 }, (_, index) => (
        <span
          key={index}
          className={`h-2.5 w-2.5 rounded-full border ${
            index < value
              ? 'border-[#2ECC71] bg-[#2ECC71]'
              : 'border-[#D5DBDB] bg-transparent'
          }`}
        />
      ))}
    </div>
  );
}

export default function HabitPatternsCard({ habits }: HabitPatternsCardProps) {
  const groups: HabitPattern['classification'][] = ['positive', 'negative', 'neutral'];

  return (
    <div className="card space-y-5">
      <div>
        <p className="section-label mb-2">Patrones detectados</p>
        <h3 className="text-lg font-bold text-[#2C3E50]">Lectura de hábitos recientes</h3>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {groups.map((classification) => {
          const meta = sectionMeta(classification);
          const items = habits.filter((habit) => habit.classification === classification);

          return (
            <div key={classification} className="rounded-2xl border-2 border-[#E9ECEF] bg-white">
              <div className={`flex items-center gap-2 rounded-t-2xl px-4 py-3 text-sm font-semibold ${meta.headerClass}`}>
                <meta.Icon size={16} />
                {meta.title}
              </div>
              <div className="space-y-3 p-4">
                {items.length === 0 && (
                  <p className="text-sm text-[#95A5A6]">{meta.empty}</p>
                )}
                {items.map((habit) => (
                  <div key={habit.task_name} className="rounded-xl bg-[#F8F9FA] p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-[#2C3E50]">{habit.task_name}</p>
                        <p className="text-xs text-[#95A5A6]">
                          {habit.frequency_7d} de 7 días esta semana
                        </p>
                      </div>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${meta.badgeClass}`}>
                        {classification === 'positive'
                          ? 'Positivo'
                          : classification === 'negative'
                            ? 'Atención'
                            : 'Neutral'}
                      </span>
                    </div>
                    {classification !== 'neutral' && (
                      <div className="mt-3 flex items-center justify-between gap-3">
                        <HabitDots value={habit.frequency_7d} />
                        <span className="text-xs text-[#6C757D]">{habit.frequency_30d}/30d</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
