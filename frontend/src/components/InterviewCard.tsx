import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Play, FileText, Clock } from 'lucide-react';

interface InterviewCardProps {
  session: {
    id: string;
    title: string;
    domain: string;
    difficulty: string;
    status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
    durationSeconds: number;
    createdAt: string;
  };
}

export const InterviewCard: React.FC<InterviewCardProps> = ({ session }) => {
  const formatDuration = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    if (mins === 0) return `${remaining}s`;
    return `${mins}m ${remaining}s`;
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const isCompleted = session.status === 'COMPLETED';

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col justify-between hover:border-slate-350 dark:hover:border-slate-700 transition-all duration-150">
      
      <div className="space-y-3">
        <div className="flex justify-between items-start gap-4">
          <span className="text-[9px] uppercase font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
            {session.domain.replace('_', ' ')}
          </span>
          
          <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
            isCompleted
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
              : 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 animate-pulse'
          }`}>
            {session.status.replace('_', ' ')}
          </span>
        </div>

        <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm md:text-md">
          {session.title}
        </h3>
      </div>

      <div className="mt-5 pt-4 border-t border-slate-150 dark:border-slate-850/60 flex items-center justify-between gap-3 text-[10px] text-slate-500 dark:text-slate-450">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {formatDate(session.createdAt)}
          </span>

          {isCompleted && (
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {formatDuration(session.durationSeconds)}
            </span>
          )}
        </div>

        {isCompleted ? (
          <Link
            to={`/interviews/${session.id}`}
            className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-450 hover:underline font-semibold"
          >
            <FileText className="w-3.5 h-3.5" /> Review Results
          </Link>
        ) : (
          <Link
            to={`/interviews/workspace/${session.id}`}
            className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-450 hover:underline font-semibold"
          >
            <Play className="w-3.5 h-3.5 fill-current" /> Resume Practice
          </Link>
        )}
      </div>

    </div>
  );
};
export default InterviewCard;
