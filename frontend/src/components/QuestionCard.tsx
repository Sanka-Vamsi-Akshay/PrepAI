import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, ArrowRight, Building, Bookmark } from 'lucide-react';
import { Question } from '@/types';
import { getDifficultyStyles } from '@/utils';
import { useToggleBookmark } from '@/hooks/useBookmarks';

interface QuestionCardProps {
  question: Question;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({ question }) => {
  const toggleBookmarkMutation = useToggleBookmark();
  const isBookmarked = (question as any).isBookmarked;

  const handleBookmarkToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleBookmarkMutation.mutate(question.id);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col justify-between hover:border-slate-350 dark:hover:border-slate-700 hover:shadow-md hover:shadow-slate-100 dark:hover:shadow-none transition-all duration-150">
      
      {/* Upper Section */}
      <div className="space-y-3">
        <div className="flex justify-between items-start gap-2">
          {/* Category & Topic */}
          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400">
            <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 font-semibold uppercase">
              {question.category}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 font-semibold uppercase">
              {question.topic}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Bookmark button */}
            <button
              onClick={handleBookmarkToggle}
              disabled={toggleBookmarkMutation.isPending}
              title={isBookmarked ? 'Remove Bookmark' : 'Bookmark Question'}
              className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                isBookmarked
                  ? 'bg-amber-500/10 text-amber-500 border-amber-500/30'
                  : 'bg-transparent text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-300 dark:hover:text-slate-200'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-amber-500 text-amber-500' : ''}`} />
            </button>

            {/* Difficulty Tag */}
            <span className={`text-[9px] px-2 py-0.5 rounded font-bold border tracking-wider ${getDifficultyStyles(question.difficulty)}`}>
              {question.difficulty}
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm md:text-md line-clamp-1">
          {question.title}
        </h3>

        {/* Description preview */}
        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
          {question.description}
        </p>
      </div>

      {/* Lower Section: Companies + Time + Action */}
      <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-850 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Companies list */}
        <div className="flex items-center gap-1 overflow-hidden max-w-full">
          {question.companies.length > 0 && (
            <>
              <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <div className="flex gap-1 overflow-hidden truncate">
                {question.companies.slice(0, 2).map((company, idx) => (
                  <span key={idx} className="text-[9px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950 px-1.5 py-0.5 rounded border border-slate-150 dark:border-slate-880">
                    {company}
                  </span>
                ))}
                {question.companies.length > 2 && (
                  <span className="text-[8px] text-slate-400 bg-slate-50 dark:bg-slate-950 px-1 py-0.5 rounded border border-slate-150 dark:border-slate-880 font-semibold">
                    +{question.companies.length - 2}
                  </span>
                )}
              </div>
            </>
          )}
        </div>

        {/* Estimated Time & Practice Link */}
        <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
          <span className="text-[10px] text-slate-555 dark:text-slate-450 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {question.estimatedTime} min
          </span>

          <Link
            to={`/questions/${question.id}`}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 dark:hover:bg-emerald-450 text-slate-950 dark:text-slate-900 text-xs font-semibold rounded-lg transition-colors"
          >
            Practice <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

    </div>
  );
};
export default QuestionCard;
