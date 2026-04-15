interface TaskBadgeProps {
  points: number;
}

export default function TaskBadge({ points }: TaskBadgeProps) {
  const isPositive = points > 0;
  const isNeutral = points === 0;

  const colorClass = isPositive
    ? 'bg-[#D4EDDA] text-[#2ECC71] border-[#2ECC71]/20'
    : isNeutral
    ? 'bg-[#F8F9FA] text-[#ADB5BD] border-[#ADB5BD]/20'
    : 'bg-[#F1F3F5] text-[#95A5A6] border-[#95A5A6]/20';

  const sign = points > 0 ? '+' : points < 0 ? '−' : '';
  const label = `${sign}${Math.abs(points)} pts`;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-semibold ${colorClass}`}
    >
      {label}
    </span>
  );
}
