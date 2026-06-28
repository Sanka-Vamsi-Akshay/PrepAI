import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { BookOpen, RefreshCw, AlertCircle } from 'lucide-react';
import { useQuestions } from '@/hooks/useQuestions';
import { QuestionCard } from '@/components/QuestionCard';
import { QuestionFilters } from '@/components/QuestionFilters';
import { QuestionPagination } from '@/components/QuestionPagination';
import { SkeletonCard } from '@/components/Skeleton';

export const Questions: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Extract query filters from URL search params (supporting persistence)
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '9', 10); // 3x3 Grid
  const search = searchParams.get('search') || '';
  const difficulty = searchParams.get('difficulty') || '';
  const category = searchParams.get('category') || '';
  const bookmarked = searchParams.get('bookmarked') || '';

  // Trigger query hook
  const { data, isLoading, isError, refetch } = useQuestions({
    page,
    limit,
    search,
    difficulty,
    category,
    bookmarked,
  });

  const handleFilterChange = (newFilters: { search?: string; difficulty?: string; category?: string; bookmarked?: string }) => {
    const updatedParams = new URLSearchParams(searchParams);
    
    // Always reset to page 1 on filter changes
    updatedParams.set('page', '1');

    if (newFilters.search !== undefined) {
      if (newFilters.search) {
        updatedParams.set('search', newFilters.search);
      } else {
        updatedParams.delete('search');
      }
    }

    if (newFilters.difficulty !== undefined) {
      if (newFilters.difficulty) {
        updatedParams.set('difficulty', newFilters.difficulty);
      } else {
        updatedParams.delete('difficulty');
      }
    }

    if (newFilters.category !== undefined) {
      if (newFilters.category) {
        updatedParams.set('category', newFilters.category);
      } else {
        updatedParams.delete('category');
      }
    }

    if (newFilters.bookmarked !== undefined) {
      if (newFilters.bookmarked) {
        updatedParams.set('bookmarked', newFilters.bookmarked);
      } else {
        updatedParams.delete('bookmarked');
      }
    }

    setSearchParams(updatedParams);
  };

  const handlePageChange = (newPage: number) => {
    const updatedParams = new URLSearchParams(searchParams);
    updatedParams.set('page', newPage.toString());
    setSearchParams(updatedParams);
  };

  const questions = data?.questions || [];
  const metadata = data?.metadata || { page: 1, limit: 9, total: 0, totalPages: 0 };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Practice Question Bank</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Browse coding tasks, database queries, system design scenarios, or behavioral questions.
          </p>
        </div>
      </div>

      {/* Reusable Filters */}
      <QuestionFilters
        search={search}
        difficulty={difficulty}
        category={category}
        bookmarked={bookmarked}
        onFilterChange={handleFilterChange}
      />

      {/* Error state */}
      {isError && (
        <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-650 dark:text-red-400">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>Failed to retrieve questions from server. Check your database or API connection.</span>
          <button onClick={() => refetch()} className="ml-auto underline flex items-center gap-1 font-semibold cursor-pointer">
            <RefreshCw className="w-3.5 h-3.5" /> Retry
          </button>
        </div>
      )}

      {/* Grid listing */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, idx) => (
            <SkeletonCard key={idx} />
          ))}
        </div>
      ) : questions.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-12 px-4 text-center space-y-3">
          <BookOpen className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">No matching questions</h3>
          <p className="text-xs text-slate-500 dark:text-slate-455 max-w-sm mx-auto">
            Try adjusting your keyword searches or filter selections to check other topics.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {questions.map((q) => (
            <QuestionCard key={q.id} question={q} />
          ))}
        </div>
      )}

      {/* Pagination widget */}
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
export default Questions;
