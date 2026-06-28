import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Building, FileText, AlertCircle, RefreshCw, Play, CheckCircle, Bookmark } from 'lucide-react';
import { useQuestion } from '@/hooks/useQuestion';
import { useSubmissions, useCreateSubmission, useUpdateSubmission } from '@/hooks/useSubmissions';
import { useToggleBookmark } from '@/hooks/useBookmarks';
import { SkeletonLine } from '@/components/Skeleton';
import { SubmissionStatusBadge } from '@/components/SubmissionStatusBadge';
import { getDifficultyStyles } from '@/utils';
import { ROUTES } from '@/routes';

export const QuestionDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: question, isLoading: isQuestionLoading, isError, refetch } = useQuestion(id || '');
  const { data: submissionsData, isLoading: isSubmissionsLoading } = useSubmissions({ limit: 100 });
  
  const createMutation = useCreateSubmission();
  const updateMutation = useUpdateSubmission();
  const toggleBookmarkMutation = useToggleBookmark();

  const [actionError, setActionError] = useState<string | null>(null);

  const isBookmarked = (question as any)?.isBookmarked;

  const handleBookmarkToggle = () => {
    if (!id) return;
    toggleBookmarkMutation.mutate(id);
  };

  // Find existing submission matching this question
  const activeSubmission = submissionsData?.submissions?.find(
    (s: any) => s.questionId === id
  );

  const handleStartPractice = async () => {
    if (!id) return;
    setActionError(null);
    try {
      const sub = await createMutation.mutateAsync({ questionId: id });
      // Direct redirect to workspace Details page
      navigate(`/submissions/${sub.id}`);
    } catch (err: any) {
      setActionError(err.message || 'Failed to start practice session.');
    }
  };

  const handleMarkComplete = async () => {
    if (!activeSubmission) return;
    setActionError(null);
    try {
      await updateMutation.mutateAsync({
        id: activeSubmission.id,
        data: { status: 'COMPLETED' },
      });
    } catch (err: any) {
      setActionError(err.message || 'Failed to complete practice session.');
    }
  };

  const isLoading = isQuestionLoading || isSubmissionsLoading;

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl">
        <SkeletonLine width="w-24" height="h-4" />
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-6 animate-pulse">
          <div className="space-y-3">
            <SkeletonLine width="w-48" height="h-6" />
            <div className="flex gap-2">
              <SkeletonLine width="w-16" height="h-4" />
              <SkeletonLine width="w-20" height="h-4" />
            </div>
          </div>
          <hr className="border-slate-100 dark:border-slate-850" />
          <div className="space-y-2">
            <SkeletonLine width="w-full" height="h-4" />
            <SkeletonLine width="w-full" height="h-4" />
            <SkeletonLine width="w-4/5" height="h-4" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !question) {
    return (
      <div className="max-w-md mx-auto py-12 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
        <h3 className="text-md font-bold text-slate-800 dark:text-slate-200">Question not found</h3>
        <p className="text-xs text-slate-500 dark:text-slate-450">
          The requested task profile is invalid or has been removed from the practice directory.
        </p>
        <div className="flex justify-center gap-3">
          <Link to={ROUTES.QUESTIONS} className="text-xs font-semibold text-emerald-600 dark:text-emerald-450 underline">
            Back to Directory
          </Link>
          <button onClick={() => refetch()} className="text-xs font-semibold text-slate-500 underline flex items-center gap-1">
            <RefreshCw className="w-3.5 h-3.5" /> Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Navigation header */}
      <Link
        to={ROUTES.QUESTIONS}
        className="inline-flex items-center gap-1.5 text-xs text-slate-550 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Question Bank
      </Link>

      {actionError && (
        <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Main card profile */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm shadow-slate-100 dark:shadow-none">
        {/* Title details bar */}
        <div className="p-6 border-b border-slate-250/20 dark:border-slate-850 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 font-semibold uppercase">
                  {question.category}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 font-semibold uppercase">
                  {question.topic}
                </span>
                {activeSubmission && (
                  <SubmissionStatusBadge status={activeSubmission.status} />
                )}
              </div>
              <h1 className="text-lg md:text-xl font-bold text-slate-800 dark:text-slate-200 pt-1">
                {question.title}
              </h1>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              {/* Bookmark Action */}
              <button
                onClick={handleBookmarkToggle}
                disabled={toggleBookmarkMutation.isPending}
                title={isBookmarked ? 'Remove Bookmark' : 'Bookmark Question'}
                className={`p-2 rounded-lg border transition-all cursor-pointer ${
                  isBookmarked
                    ? 'bg-amber-500/10 text-amber-500 border-amber-500/30'
                    : 'bg-transparent text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-200'
                }`}
              >
                <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-500 text-amber-500' : ''}`} />
              </button>

              <span className={`text-[10px] px-2 py-0.5 rounded font-bold border tracking-wider uppercase shrink-0 ${getDifficultyStyles(question.difficulty)}`}>
                {question.difficulty}
              </span>

              {/* Dynamic practice actions CTA */}
              {!activeSubmission ? (
                <button
                  onClick={handleStartPractice}
                  disabled={createMutation.isPending}
                  className="flex items-center gap-1 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-800 text-slate-950 dark:text-slate-900 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" /> Start Practice
                </button>
              ) : activeSubmission.status === 'IN_PROGRESS' ? (
                <div className="flex items-center gap-2">
                  <Link
                    to={`/submissions/${activeSubmission.id}`}
                    className="flex items-center gap-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold rounded-lg transition-colors"
                  >
                    Continue Practice
                  </Link>
                  <button
                    onClick={handleMarkComplete}
                    disabled={updateMutation.isPending}
                    className="flex items-center gap-1 px-4 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-350 text-xs font-bold rounded-lg transition-colors"
                  >
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> Mark Complete
                  </button>
                </div>
              ) : (
                <Link
                  to={`/submissions/${activeSubmission.id}`}
                  className="flex items-center gap-1 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-lg transition-colors"
                >
                  Open Workspace
                </Link>
              )}
            </div>
          </div>

          {/* Details tag list */}
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-550 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <FileText className="w-4 h-4 text-slate-400" />
              Topic: <span className="font-semibold text-slate-750 dark:text-slate-300">{question.topic}</span>
            </span>

            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-slate-400" />
              Est. Practice Time: <span className="font-semibold text-slate-750 dark:text-slate-300">{question.estimatedTime} min</span>
            </span>
          </div>
        </div>

        {/* Description body */}
        <div className="p-6 space-y-6">
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Task Profile</h3>
            <div className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed whitespace-pre-wrap bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-150 dark:border-slate-850 max-h-96 overflow-y-auto">
              {question.description}
            </div>
          </div>

          {/* Target Company targets */}
          {question.companies.length > 0 && (
            <div className="space-y-3 pt-2">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Building className="w-4 h-4 text-slate-400" /> Linked Companies
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {question.companies.map((company, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-semibold text-slate-650 dark:text-slate-300 bg-slate-100 dark:bg-slate-850 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-805"
                  >
                    {company}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* CTA warning banner */}
          <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 flex items-start gap-2.5 mt-6">
            <AlertCircle className="w-5 h-5 text-emerald-500 shrink-0" />
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Simulation Workspace Integration</h4>
              <p className="text-[10px] text-slate-505 dark:text-slate-450 leading-relaxed">
                Clicking **Start Practice** generates an active workspace that tracks your time spent, records notes/reflection logs, and coordinates attempts.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
export default QuestionDetails;
