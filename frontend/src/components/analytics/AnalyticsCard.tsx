import React from 'react';
import { SkeletonLine } from '@/components/Skeleton';

interface AnalyticsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
  isLoading?: boolean;
}

export const AnalyticsCard: React.FC<AnalyticsCardProps> = ({
  title,
  value,
  description,
  icon: Icon,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-3 animate-pulse shadow-sm shadow-slate-100 dark:shadow-none">
        <div className="flex justify-between items-center">
          <SkeletonLine width="w-24" height="h-3" />
          <div className="w-8 h-8 rounded-lg bg-slate-150 dark:bg-slate-800" />
        </div>
        <SkeletonLine width="w-16" height="h-6" />
        <SkeletonLine width="w-32" height="h-3" />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col justify-between shadow-sm shadow-slate-100 dark:shadow-none hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
      <div className="flex justify-between items-start gap-4">
        <div className="space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-450 dark:text-slate-500 tracking-wider">
            {title}
          </span>
          <h3 className="text-xl md:text-2xl font-black text-slate-800 dark:text-slate-200">
            {value}
          </h3>
        </div>
        <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
          <Icon className="w-5 h-5" />
        </div>
      </div>
      {description && (
        <span className="mt-2.5 text-[10px] text-slate-500 dark:text-slate-450 leading-relaxed block">
          {description}
        </span>
      )}
    </div>
  );
};

export default AnalyticsCard;
