import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { FileText, RefreshCw, AlertCircle } from 'lucide-react';
import { useSubmissions } from '@/hooks/useSubmissions';
import { SubmissionCard } from '@/components/SubmissionCard';
import { SubmissionFilters } from '@/components/SubmissionFilters';
import { QuestionPagination } from '@/components/QuestionPagination';
import { SkeletonCard } from '@/components/Skeleton';

export const Submissions: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Extract filters from URL search parameters
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '9', 10);
  const status = searchParams.get('status') || '';
  const topic = searchParams.get('topic') || '';

  // Query submissions via hook
  const { data, isLoading, isError, refetch } = useSubmissions({
    page,
    limit,
    status,
    topic,
  });

  const handleFilterChange = (newFilters: { status?: string; topic?: string }) => {
    const updatedParams = new URLSearchParams(searchParams);
    
    // Reset to page 1 on filter changes
    updatedParams.set('page', '1');

    if (newFilters.status !== undefined) {
      if (newFilters.status) {
        updatedParams.set('status', newFilters.status);
      } else {
        updatedParams.delete('status');
      }
    }

    if (newFilters.topic !== undefined) {
      if (newFilters.topic) {
        updatedParams.set('topic', newFilters.topic);
      } else {
        updatedParams.delete('topic');
      }
    }

    setSearchParams(updatedParams);
  };

  const handlePageChange = (newPage: number) => {
    const updatedParams = new URLSearchParams(searchParams);
    updatedParams.set('page', newPage.toString());
    setSearchParams(updatedParams);
  };

  const submissions = data?.submissions || [];
  const metadata = data?.metadata || { page: 1, limit: 9, total: 0, totalPages: 0 };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Practice Submission History</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Review your practice metrics, duration records, and study reflections for questions.
        </p>
      </div>

      {/* Filters */}
      <SubmissionFilters
        status={status}
        topic={topic}
        onFilterChange={handleFilterChange}
      />

      {/* Error state */}
      {isError && (
        <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-650 dark:text-red-400">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>Failed to retrieve submissions from server. Check your database or API connection.</span>
          <button onClick={() => refetch()} className="ml-auto underline flex items-center gap-1 font-semibold">
            <RefreshCw className="w-3.5 h-3.5" /> Retry
          </button>
        </div>
      )}

      {/* Submissions list */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, idx) => (
            <SkeletonCard key={idx} />
          ))}
        </div>
      ) : submissions.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-12 px-4 text-center space-y-3">
          <FileText className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">No submissions recorded</h3>
          <p className="text-xs text-slate-500 dark:text-slate-450 max-w-sm mx-auto">
            Choose a coding or system design task in the Question Bank and click **Start Practice** to record attempts.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {submissions.map((sub) => (
            <SubmissionCard key={sub.id} submission={sub} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!isLoading && !isError && (
        <QuestionPagination
          page={metadata.page}
          totalPages={metadata.totalPages}
          total={metadata.total}
          limit={metadata.limit}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};
export default Submissions;
