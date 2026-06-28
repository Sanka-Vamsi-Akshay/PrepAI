import React from 'react';
import { Calendar, Video, ArrowUpRight } from 'lucide-react';
import { SkeletonLine } from './Skeleton';

interface Interview {
  id: string;
  title: string;
  date: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED';
}

interface UpcomingInterviewsProps {
  interviews?: Interview[];
  isLoading?: boolean;
}

export const UpcomingInterviews: React.FC<UpcomingInterviewsProps> = ({
  interviews = [],
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-4">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-200">Upcoming Mock Sessions</h3>
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="flex justify-between items-center">
              <div className="space-y-2">
                <SkeletonLine width="w-24" height="h-3.5" />
                <SkeletonLine width="w-32" height="h-3" />
              </div>
              <SkeletonLine width="w-16" height="h-6" />
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
          <h3 className="text-md font-semibold text-slate-800 dark:text-slate-200">Mock Sessions</h3>
          <button className="text-xs text-emerald-600 dark:text-emerald-450 hover:underline inline-flex items-center gap-0.5">
            Schedule <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>

        <div className="space-y-4">
          {interviews.length === 0 ? (
            <div className="text-center py-6 text-xs text-slate-500">
              No sessions scheduled. Start a new simulation run!
            </div>
          ) : (
            interviews.map((session) => (
              <div key={session.id} className="p-4 rounded-lg bg-white dark:bg-slate-950 border border-slate-150 dark:border-slate-850 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      {session.title}
                    </h4>
                    <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {session.date}
                    </p>
                  </div>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                    session.status === 'SCHEDULED'
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400'
                      : 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 animate-pulse'
                  }`}>
                    {session.status}
                  </span>
                </div>

                <button className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-slate-100 dark:bg-slate-900 hover:bg-slate-250 dark:hover:bg-slate-850 rounded-lg text-[10px] font-semibold text-slate-650 dark:text-slate-300 transition-colors duration-150">
                  <Video className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Enter Simulator
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
