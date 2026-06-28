import React from 'react';
import { X } from 'lucide-react';
import { TOPICS } from '@/constants/categories';

interface SubmissionFiltersProps {
  status: string;
  topic: string;
  onFilterChange: (filters: { status?: string; topic?: string }) => void;
}

export const SubmissionFilters: React.FC<SubmissionFiltersProps> = ({
  status,
  topic,
  onFilterChange,
}) => {
  const hasActiveFilters = status || topic;

  const handleClearFilters = () => {
    onFilterChange({ status: '', topic: '' });
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm shadow-slate-100 dark:shadow-none">
      
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Status Filter */}
        <select
          value={status}
          onChange={(e) => onFilterChange({ status: e.target.value })}
          className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg px-3 py-2 text-xs text-slate-700 dark:text-slate-300 outline-none focus:border-emerald-500"
        >
          <option value="">All Statuses</option>
          <option value="NOT_STARTED">Not Started</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
        </select>

        {/* Topic Filter */}
        <select
          value={topic}
          onChange={(e) => onFilterChange({ topic: e.target.value })}
          className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg px-3 py-2 text-xs text-slate-700 dark:text-slate-300 outline-none focus:border-emerald-500"
        >
          <option value="">All Topics</option>
          {TOPICS.map((top) => (
            <option key={top} value={top}>
              {top}
            </option>
          ))}
        </select>
      </div>

      {hasActiveFilters && (
        <button
          onClick={handleClearFilters}
          className="flex items-center justify-center gap-1.5 px-3 py-2 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-650 dark:text-slate-305 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-lg transition-colors shrink-0"
        >
          <X className="w-3.5 h-3.5" /> Clear
        </button>
      )}

    </div>
  );
};
export default SubmissionFilters;
