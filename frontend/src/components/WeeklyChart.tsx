import type { WeeklyDataPoint } from '../types';

interface WeeklyChartProps {
  data: WeeklyDataPoint[];
}

function formatScore(score: number): string {
  if (score > 0) return `+${score}`;
  if (score < 0) return `${score}`;
  return '0';
}

export default function WeeklyChart({ data }: WeeklyChartProps) {
  const maxAbsScore = Math.max(...data.map((entry) => Math.abs(entry.score)), 10);

  return (
    <div className="card">
      <div className="mb-6">
        <p className="section-label mb-2">Tendencia</p>
        <h3 className="text-lg font-bold text-[#2C3E50]">Últimos 7 días</h3>
      </div>

      <div className="overflow-x-auto">
        <div className="flex min-w-[560px] items-end justify-between gap-4">
          {data.map((entry) => {
            const height = Math.max((Math.abs(entry.score) / maxAbsScore) * 150, 6);
            const isPositive = entry.score > 0;
            const isNeutral = entry.score === 0;

            return (
              <div key={entry.date} className="flex w-16 flex-col items-center gap-3">
                <span
                  className={`text-sm font-semibold ${
                    isPositive
                      ? 'text-[#2ECC71]'
                      : isNeutral
                        ? 'text-[#95A5A6]'
                        : 'text-[#E24B4A]'
                  }`}
                >
                  {formatScore(entry.score)}
                </span>
                <div className="flex h-40 items-end">
                  <div
                    className={`w-10 rounded-t-xl rounded-b-md transition-all ${
                      entry.isToday ? 'ring-2 ring-[#2ECC71]/30 ring-offset-4' : ''
                    } ${
                      isPositive
                        ? 'bg-gradient-to-t from-[#27AE60] to-[#2ECC71]'
                        : isNeutral
                          ? 'bg-[#D5DBDB]'
                          : 'bg-[#E24B4A]'
                    }`}
                    style={{ height }}
                    title={`${entry.day} ${entry.dateLabel}: ${formatScore(entry.score)} pts`}
                  />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold capitalize text-[#2C3E50]">
                    {entry.day.replace('.', '')}
                  </p>
                  <p className="text-xs text-[#95A5A6]">{entry.dateLabel}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
