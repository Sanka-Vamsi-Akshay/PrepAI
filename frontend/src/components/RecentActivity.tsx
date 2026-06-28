import React from 'react';
import { Code2, Award, ArrowUpRight } from 'lucide-react';
import { SkeletonLine } from './Skeleton';

interface Activity {
  id: string;
  question: string;
  type: string;
  date: string;
  score: number;
}

interface RecentActivityProps {
  activities?: Activity[];
  isLoading?: boolean;
}

export const RecentActivity: React.FC<RecentActivityProps> = ({
  activities = [],
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-4">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-200">Recent Activity</h3>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-800 animate-pulse" />
                <div className="space-y-2">
                  <SkeletonLine width="w-32" height="h-3" />
                  <SkeletonLine width="w-20" height="h-2.5" />
                </div>
              </div>
              <SkeletonLine width="w-12" height="h-4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 flex flex-col justify-between shadow-sm shadow-slate-100 dark:shadow-none">
      <div>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-md font-semibold text-slate-800 dark:text-slate-200">Recent Submissions</h3>
          <button className="text-xs text-emerald-600 dark:text-emerald-450 hover:underline inline-flex items-center gap-0.5">
            View All <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>

        <div className="space-y-4">
          {activities.length === 0 ? (
            <div className="text-center py-6 text-xs text-slate-500">
              No recent submissions found. Start a practice session!
            </div>
          ) : (
            activities.map((act) => (
              <div key={act.id} className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-slate-950 border border-slate-150 dark:border-slate-850">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-900 text-emerald-600 dark:text-emerald-400">
                    <Code2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate max-w-44">
                      {act.question}
                    </h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">{act.date}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-350">
                    {act.score}/100
                  </span>
                  <div className={`p-1 rounded-full ${
                    act.score >= 85
                      ? 'bg-emerald-500/10 text-emerald-500'
                      : act.score >= 70
                      ? 'bg-amber-500/10 text-amber-500'
                      : 'bg-red-500/10 text-red-500'
                  }`}>
                    <Award className="w-4 h-4" />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
