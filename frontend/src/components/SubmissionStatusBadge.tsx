import React from 'react';

interface SubmissionStatusBadgeProps {
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
}

export const SubmissionStatusBadge: React.FC<SubmissionStatusBadgeProps> = ({ status }) => {
  let styleClasses = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700';

  if (status === 'IN_PROGRESS') {
    styleClasses = 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20';
  } else if (status === 'COMPLETED') {
    styleClasses = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20';
  }

  return (
    <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${styleClasses}`}>
      {status.replace('_', ' ')}
    </span>
  );
};
export default SubmissionStatusBadge;
