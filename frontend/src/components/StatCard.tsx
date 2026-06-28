import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  trend: {
    value: string;
    direction: 'up' | 'down' | 'neutral';
  };
  colorClass?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  colorClass = 'from-emerald-500 to-teal-500',
}) => {
  const isUp = trend.direction === 'up';
  const isDown = trend.direction === 'down';

  return (
    <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 hover:border-slate-350 dark:hover:border-slate-700 transition-all duration-200 shadow-sm shadow-slate-100 dark:shadow-none">
      <div className="flex justify-between items-start mb-4">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          {title}
        </span>
        <div className={`p-2 rounded-lg bg-gradient-to-br ${colorClass} bg-opacity-10`}>
          <Icon className="w-5 h-5 text-slate-700 dark:text-slate-100" />
        </div>
      </div>
      
      <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
        {value}
      </h3>

      <div className="flex items-center gap-1 mt-2">
        {isUp && (
          <span className="inline-flex items-center text-xs font-medium text-emerald-600 dark:text-emerald-400">
            <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
            {trend.value}
          </span>
        )}
        {isDown && (
          <span className="inline-flex items-center text-xs font-medium text-red-600 dark:text-red-400">
            <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
            {trend.value}
          </span>
        )}
        {trend.direction === 'neutral' && (
          <span className="inline-flex items-center text-xs font-medium text-slate-500">
            <Minus className="w-3.5 h-3.5 mr-0.5" />
            {trend.value}
          </span>
        )}
        <span className="text-[10px] text-slate-500 dark:text-slate-450 ml-1">
          vs last week
        </span>
      </div>
    </div>
  );
};
