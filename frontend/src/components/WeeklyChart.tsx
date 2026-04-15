import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';

interface WeeklyDataPoint {
  date: string;
  day: string;
  score: number;
  tasks: number;
  completed: number;
}

interface WeeklyChartProps {
  data: WeeklyDataPoint[];
}

interface TooltipPayload {
  value: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#2C3E50] text-white px-3 py-2 rounded-xl text-sm shadow-lg"
         style={{ borderRadius: 12 }}>
      <p className="font-semibold">{label}</p>
      <p className="text-[#2ECC71] font-bold">{payload[0].value} pts</p>
    </div>
  );
}

const today = new Date().toISOString().split('T')[0];

export default function WeeklyChart({ data }: WeeklyChartProps) {
  return (
    <div className="card">
      <h3 className="text-lg font-bold text-[#2C3E50] mb-6">Últimos 7 días</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} barSize={28} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E9ECEF" vertical={false} />
          <XAxis
            dataKey="day"
            tick={{ fontSize: 13, fontWeight: 500, fill: '#6C757D' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 13, fontWeight: 500, fill: '#6C757D' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F8F9FA', radius: 8 }} />
          <Bar dataKey="score" radius={[6, 6, 0, 0]}>
            {data.map((entry) => (
              <Cell
                key={entry.date}
                fill={entry.date === today ? '#2ECC71' : '#D4EDDA'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
