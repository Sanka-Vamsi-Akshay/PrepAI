import React from 'react';
import {
  BarChart,
  Bar,
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
}

interface QuestionsSolvedChartProps {
  data: TrendPoint[];
  isLoading?: boolean;
}

export const QuestionsSolvedChart: React.FC<QuestionsSolvedChartProps> = ({ data, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 h-72 flex items-center justify-center animate-pulse">
        <span className="text-xs text-slate-400">Loading chart data...</span>
      </div>
    );
  }

  const hasActivity = data.some((point) => point.questionsSolved > 0);

  if (!hasActivity) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 h-72 flex flex-col items-center justify-center text-center space-y-2">
        <span className="text-xs font-bold text-slate-400">No Solved Questions Data</span>
        <p className="text-[10px] text-slate-500 max-w-xs">
          Solve your first coding question from the Question Bank to track daily submissions.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 h-72 flex flex-col justify-between shadow-sm shadow-slate-100 dark:shadow-none">
      <span className="text-[10px] uppercase font-bold text-slate-450 dark:text-slate-500 tracking-wider mb-2 block">
        Questions Solved Trend (Completions)
      </span>
      <div className="w-full h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-slate-800" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 500 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 500 }}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                borderRadius: '8px',
                border: 'none',
                color: '#fff',
                fontSize: '11px',
              }}
              labelClassName="font-bold text-slate-400 block mb-1"
            />
            <Bar
              dataKey="questionsSolved"
              name="Solved Count"
              fill="#10b981"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default QuestionsSolvedChart;
