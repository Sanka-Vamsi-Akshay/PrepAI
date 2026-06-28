import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface TopicItem {
  topic: string;
  completionCount: number;
  averageScore: number;
  successPercentage: number;
}

interface TopicPerformanceChartProps {
  data: TopicItem[];
  isLoading?: boolean;
}

export const TopicPerformanceChart: React.FC<TopicPerformanceChartProps> = ({
  data,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 h-96 flex items-center justify-center animate-pulse">
        <span className="text-xs text-slate-400">Loading chart data...</span>
      </div>
    );
  }

  const hasCompletions = data.some((item) => item.completionCount > 0);

  if (!hasCompletions) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 h-96 flex flex-col items-center justify-center text-center space-y-2">
        <span className="text-xs font-bold text-slate-400">No Topic Performance Metrics</span>
        <p className="text-[10px] text-slate-500 max-w-xs">
          Practice at least 3 questions across any topic to view weighted topic performance ratings.
        </p>
      </div>
    );
  }

  // Curate colorful bars matching SaaS aesthetics
  const colors = [
    '#3b82f6', // Arrays - Blue
    '#10b981', // Strings - Emerald
    '#6366f1', // Linked Lists - Indigo
    '#ec4899', // Trees - Pink
    '#8b5cf6', // Graphs - Purple
    '#f59e0b', // Dynamic Programming - Amber
    '#14b8a6', // SQL - Teal
    '#ef4444', // Behavioral - Red
    '#06b6d4', // System Design - Cyan
  ];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 h-96 flex flex-col justify-between shadow-sm shadow-slate-100 dark:shadow-none">
      <span className="text-[10px] uppercase font-bold text-slate-450 dark:text-slate-500 tracking-wider mb-2 block">
        Weighted Topic Performance Rating (%)
      </span>
      <div className="w-full h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 10, right: 15, left: 15, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" className="dark:stroke-slate-800" />
            <XAxis
              type="number"
              domain={[0, 100]}
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 500 }}
            />
            <YAxis
              type="category"
              dataKey="topic"
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#475569', fontSize: 10, fontWeight: 600 }}
              width={100}
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
            <Bar dataKey="averageScore" name="Rating Score" radius={[0, 4, 4, 0]} barSize={12}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TopicPerformanceChart;
