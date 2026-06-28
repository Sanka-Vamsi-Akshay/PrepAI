import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { DIFFICULTIES } from '@/constants/difficulties';
import { CATEGORIES } from '@/constants/categories';

interface QuestionFiltersProps {
  search: string;
  difficulty: string;
  category: string;
  bookmarked: string;
  onFilterChange: (filters: { search?: string; difficulty?: string; category?: string; bookmarked?: string }) => void;
}

export const QuestionFilters: React.FC<QuestionFiltersProps> = ({
  search: initialSearch,
  difficulty,
  category,
  bookmarked,
  onFilterChange,
}) => {
  const [localSearch, setLocalSearch] = useState(initialSearch);

  // Debounce search input by 400ms
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== initialSearch) {
        onFilterChange({ search: localSearch });
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [localSearch, initialSearch, onFilterChange]);

  // Keep local input in sync with external URL resets
  useEffect(() => {
    setLocalSearch(initialSearch);
  }, [initialSearch]);

  const handleClearFilters = () => {
    setLocalSearch('');
    onFilterChange({ search: '', difficulty: '', category: '', bookmarked: '' });
  };

  const hasActiveFilters = initialSearch || difficulty || category || bookmarked === 'true';

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm shadow-slate-100 dark:shadow-none">
      
      {/* Filters options block */}
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-4 gap-3">
        {/* Search Field */}
        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg px-3 py-2">
          <Search className="w-4 h-4 text-slate-450 shrink-0" />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search question name..."
            className="bg-transparent border-none text-xs text-slate-800 dark:text-slate-200 placeholder-slate-500 outline-none w-full"
          />
        </div>

        {/* Category Select */}
        <select
          value={category}
          onChange={(e) => onFilterChange({ category: e.target.value })}
          className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg px-3 py-2 text-xs text-slate-700 dark:text-slate-300 outline-none focus:border-emerald-500 cursor-pointer"
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        {/* Difficulty Select */}
        <select
          value={difficulty}
          onChange={(e) => onFilterChange({ difficulty: e.target.value })}
          className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg px-3 py-2 text-xs text-slate-700 dark:text-slate-300 outline-none focus:border-emerald-500 cursor-pointer"
        >
          <option value="">All Difficulties</option>
          {DIFFICULTIES.map((diff) => (
            <option key={diff} value={diff}>
              {diff}
            </option>
          ))}
        </select>

        {/* Bookmarked toggle */}
        <div className="flex items-center gap-2 px-3 py-2 border border-slate-205 dark:border-slate-850 bg-slate-50 dark:bg-slate-955 rounded-lg select-none">
          <input
            type="checkbox"
            id="bookmarked-only"
            checked={bookmarked === 'true'}
            onChange={(e) => onFilterChange({ bookmarked: e.target.checked ? 'true' : '' })}
            className="w-3.5 h-3.5 accent-emerald-500 rounded border-slate-300 text-emerald-500 cursor-pointer"
          />
          <label htmlFor="bookmarked-only" className="text-xs font-semibold text-slate-500 dark:text-slate-400 cursor-pointer w-full">
            Bookmarked Only
          </label>
        </div>
      </div>

      {/* Clear triggers */}
      {hasActiveFilters && (
        <button
          onClick={handleClearFilters}
          className="flex items-center justify-center gap-1.5 px-3 py-2 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-lg transition-colors duration-150 shrink-0 cursor-pointer"
        >
          <X className="w-3.5 h-3.5" /> Clear Filters
        </button>
      )}

    </div>
  );
};
export default QuestionFilters;
