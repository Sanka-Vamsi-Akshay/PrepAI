import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Calendar, RefreshCw, ArrowRight } from 'lucide-react';
import { SubmissionStatusBadge } from './SubmissionStatusBadge';
import { getDifficultyStyles } from '@/utils';

interface SubmissionCardProps {
  submission: {
    id: string;
    status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
    timeSpent: number;
    attemptCount: number;
    completedAt: string | null;
    reflection: string | null;
    question: {
      title: string;
      difficulty: 'EASY' | 'MEDIUM' | 'HARD';
      topic: string;
    };
  };
}

export const SubmissionCard: React.FC<SubmissionCardProps> = ({ submission }) => {
  // Format accumulated seconds into readable format (e.g. 15m 30s)
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    if (mins === 0) return `${remainingSecs}s`;
    return `${mins}m ${remainingSecs}s`;
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 hover:border-slate-350 dark:hover:border-slate-700 transition-all duration-150">
      
      {/* Upper header */}
      <div className="flex justify-between items-start gap-4 mb-3">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[9px] uppercase font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
              {submission.question.topic}
            </span>
            <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold border tracking-wider uppercase ${getDifficultyStyles(submission.question.difficulty)}`}>
              {submission.question.difficulty}
            </span>
          </div>

          <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm md:text-md line-clamp-1 pt-1.5">
            {submission.question.title}
          </h3>
        </div>

        <SubmissionStatusBadge status={submission.status} />
      </div>

      {/* Reflection excerpt */}
      {submission.reflection && (
        <p className="text-xs italic text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg border border-slate-150 dark:border-slate-850 line-clamp-1 mb-4">
          "{submission.reflection}"
        </p>
      )}

      {/* Footer stats: Time, Attempt count, completed date */}
      <div className="pt-4 border-t border-slate-150 dark:border-slate-850/60 flex flex-wrap items-center justify-between gap-3 text-[10px] text-slate-500 dark:text-slate-450">
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {formatTime(submission.timeSpent)}
          </span>

          <span className="flex items-center gap-1">
            <RefreshCw className="w-3.5 h-3.5" />
            Attempts: {submission.attemptCount}
          </span>

          {submission.completedAt && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              Done: {formatDate(submission.completedAt)}
            </span>
          )}
        </div>

        <Link
          to={`/submissions/${submission.id}`}
          className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-450 hover:underline font-semibold"
        >
          Open Workspace <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

    </div>
  );
};
export default SubmissionCard;
