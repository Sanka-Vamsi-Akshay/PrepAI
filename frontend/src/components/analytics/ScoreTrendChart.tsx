import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface TrendPoint {
  date: string;
  interviewScore: number | null;
  questionsSolved: number;
  studyTime: number;
  confidenceScore?: number | null;
}

interface ScoreTrendChartProps {
  data: TrendPoint[];
  isLoading?: boolean;
}

export const ScoreTrendChart: React.FC<ScoreTrendChartProps> = ({ data, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 h-72 flex items-center justify-center animate-pulse">
        <span className="text-xs text-slate-400">Loading chart data...</span>
      </div>
    );
  }

  // Check if we have at least one data point with an interview score
  const hasInterviews = data.some((point) => point.interviewScore !== null);

  if (!hasInterviews) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 h-72 flex flex-col items-center justify-center text-center space-y-2">
        <span className="text-xs font-bold text-slate-450">No Interview Performance Data</span>
        <p className="text-[10px] text-slate-500 max-w-xs">
          Complete your first AI interview simulation to view score progress charts.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 h-72 flex flex-col justify-between shadow-sm shadow-slate-100 dark:shadow-none">
      <span className="text-[10px] uppercase font-bold text-slate-455 dark:text-slate-500 tracking-wider mb-2 block">
        Average Interview & Confidence Score Progress
      </span>
      <div className="w-full h-56">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
          >
            <defs>
              <linearGradient id="scoreColor" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="confidenceColor" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-slate-800" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 500 }}
            />
            <YAxis
              domain={[0, 100]}
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 500 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                borderRadius: '8px',
                border: 'none',
                color: '#fff',
                fontSize: '11px',
              }}
              labelClassName="font-bold text-slate-450 block mb-1"
            />
            <Area
              type="monotone"
              dataKey="interviewScore"
              name="Interview Score"
              stroke="#10b981"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#scoreColor)"
              connectNulls
            />
            <Area
              type="monotone"
              dataKey="confidenceScore"
              name="Confidence Score"
              stroke="#6366f1"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#confidenceColor)"
              connectNulls
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ScoreTrendChart;
