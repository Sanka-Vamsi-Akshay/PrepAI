import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface QuestionPaginationProps {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
}

export const QuestionPagination: React.FC<QuestionPaginationProps> = ({
  page,
  totalPages,
  total,
  limit,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  // Generate pagination page numbers range
  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  };

  const startOffset = (page - 1) * limit + 1;
  const endOffset = Math.min(page * limit, total);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 border-t border-slate-200 dark:border-slate-850">
      
      {/* Counters metadata info */}
      <span className="text-xs text-slate-500 dark:text-slate-450">
        Showing <span className="font-semibold text-slate-800 dark:text-slate-200">{startOffset}</span> to{' '}
        <span className="font-semibold text-slate-800 dark:text-slate-200">{endOffset}</span> of{' '}
        <span className="font-semibold text-slate-800 dark:text-slate-200">{total}</span> results
      </span>

      {/* Pagination controls deck */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="p-2 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-850 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {getPageNumbers().map((num) => (
          <button
            key={num}
            onClick={() => onPageChange(num)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-150 ${
              num === page
                ? 'bg-emerald-500 text-slate-950 border-emerald-500'
                : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-300'
            }`}
          >
            {num}
          </button>
        ))}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="p-2 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-850 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
export default QuestionPagination;
