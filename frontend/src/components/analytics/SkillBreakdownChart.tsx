import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';

interface SkillMetrics {
  technicalAccuracy: number;
  communication: number;
  clarity: number;
  depth: number;
}

interface SkillBreakdownChartProps {
  data: SkillMetrics;
  isLoading?: boolean;
}

export const SkillBreakdownChart: React.FC<SkillBreakdownChartProps> = ({
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

  // Check if we have active skills metrics (i.e. has completed interviews)
  const hasData =
    data.technicalAccuracy > 0 ||
    data.communication > 0 ||
    data.clarity > 0 ||
    data.depth > 0;

  if (!hasData) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 h-96 flex flex-col items-center justify-center text-center space-y-2">
        <span className="text-xs font-bold text-slate-400">No Skill Breakdown Data</span>
        <p className="text-[10px] text-slate-500 max-w-xs">
          Complete your first AI interview to unlock your rubrics radar chart.
        </p>
      </div>
    );
  }

  // Format skills data for Recharts
  const formattedData = [
    { subject: 'Technical Accuracy', A: data.technicalAccuracy, fullMark: 100 },
    { subject: 'Communication', A: data.communication, fullMark: 100 },
    { subject: 'Clarity', A: data.clarity, fullMark: 100 },
    { subject: 'Depth', A: data.depth, fullMark: 100 },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 h-96 flex flex-col justify-between shadow-sm shadow-slate-100 dark:shadow-none">
      <span className="text-[10px] uppercase font-bold text-slate-450 dark:text-slate-500 tracking-wider mb-2 block">
        Evaluation Skill Breakdown
      </span>
      <div className="w-full h-80 flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={formattedData}>
            <PolarGrid stroke="#e2e8f0" className="dark:stroke-slate-800" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fill: '#475569', fontSize: 10, fontWeight: 600 }}
            />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 8 }} />
            <Radar
              name="Skills"
              dataKey="A"
              stroke="#6366f1"
              fill="#6366f1"
              fillOpacity={0.15}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SkillBreakdownChart;
