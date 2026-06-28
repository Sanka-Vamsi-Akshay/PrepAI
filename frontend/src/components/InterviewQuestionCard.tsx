import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Save, CheckCircle, AlertCircle } from 'lucide-react';
import { useSubmitAnswer } from '@/hooks/useInterviews';

interface Question {
  id: string;
  questionText: string;
  order: number;
}

interface InterviewQuestionCardProps {
  sessionId: string;
  question: Question;
  index: number;
  total: number;
  savedAnswer?: string;
  isBehavioral?: boolean;
  onNext: () => void;
  onPrev: () => void;
  onUnsavedChangesChange?: (hasUnsaved: boolean) => void;
}

export const InterviewQuestionCard: React.FC<InterviewQuestionCardProps> = ({
  sessionId,
  question,
  index,
  total,
  savedAnswer = '',
  isBehavioral = false,
  onNext,
  onPrev,
  onUnsavedChangesChange,
}) => {
  const [answer, setAnswer] = useState(savedAnswer);
  const [lastSavedDraft, setLastSavedDraft] = useState('');
  const [showDraftSaved, setShowDraftSaved] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [starActive, setStarActive] = useState(false);
  
  const submitMutation = useSubmitAnswer();
  const draftKey = `prepai_draft:${sessionId}:${question.id}`;
  
  const starTemplate = `[Situation]
Describe the context, challenge, or project.

[Task]
Explain your specific responsibility and goals.

[Action]
Detail the step-by-step actions you took.

[Result]
Highlight the outcome, metrics, and key learnings.`;

  // 1. Restore draft automatically on mount or question swap
  useEffect(() => {
    const draft = localStorage.getItem(draftKey);
    if (draft) {
      setAnswer(draft);
      setLastSavedDraft(draft);
    } else {
      setAnswer(savedAnswer);
      setLastSavedDraft('');
    }
    setSuccess(false);
    setErrorMsg(null);
    setStarActive(false);
  }, [question, savedAnswer, draftKey]);

  // 2. Track unsaved changes for parent navigation guard
  useEffect(() => {
    const hasUnsaved = answer.trim() !== savedAnswer.trim();
    onUnsavedChangesChange?.(hasUnsaved);
  }, [answer, savedAnswer, onUnsavedChangesChange]);

  // 3. Auto-save local draft every 3 seconds ONLY when content has changed
  useEffect(() => {
    if (answer.trim() === savedAnswer.trim() || answer.trim() === lastSavedDraft.trim()) {
      return;
    }

    let fadeTimer: any;
    const timer = setTimeout(() => {
      localStorage.setItem(draftKey, answer);
      setLastSavedDraft(answer);
      setShowDraftSaved(true);
      
      fadeTimer = setTimeout(() => setShowDraftSaved(false), 1500);
    }, 3000);

    return () => {
      clearTimeout(timer);
      if (fadeTimer) {
        clearTimeout(fadeTimer);
      }
    };
  }, [answer, savedAnswer, lastSavedDraft, draftKey]);

  // 4. Save answer to Database and clear draft
  const handleSaveAnswer = async () => {
    if (!answer.trim()) return;
    setErrorMsg(null);
    try {
      await submitMutation.mutateAsync({
        id: sessionId,
        questionId: question.id,
        userAnswer: answer,
      });
      
      // Clear local storage draft upon successful save
      localStorage.removeItem(draftKey);
      setLastSavedDraft('');
      onUnsavedChangesChange?.(false);
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save answer. Try again.');
    }
  };

  const handleToggleStar = () => {
    if (!starActive) {
      if (!answer.trim()) {
        setAnswer(starTemplate);
      }
      setStarActive(true);
    } else {
      if (answer.trim() === starTemplate.trim()) {
        setAnswer('');
      }
      setStarActive(false);
    }
  };

  const handleCopyTemplate = () => {
    navigator.clipboard.writeText(starTemplate);
    alert('STAR template copied to clipboard!');
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-6 shadow-sm shadow-slate-100 dark:shadow-none">
      
      {/* Index indicator & Draft status alerts */}
      <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-850">
        <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
          Question {index + 1} of {total}
        </span>
        
        <div className="flex items-center gap-3">
          {showDraftSaved && (
            <span className="text-[10px] text-emerald-500 font-semibold flex items-center gap-1 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Draft saved
            </span>
          )}

          {submitMutation.isSuccess && success && (
            <span className="text-[10px] text-emerald-500 font-semibold flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" /> Answer saved successfully
            </span>
          )}

          {errorMsg && (
            <span className="text-[10px] text-red-500 font-semibold flex items-center gap-1 animate-pulse">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {errorMsg}
            </span>
          )}
        </div>
      </div>

      {/* Question prompt text */}
      <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-150 dark:border-slate-850 text-xs font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">
        {question.questionText}
      </div>

      {/* Answer textarea with STAR template support */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-500">Your Response</label>
          
          {isBehavioral && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleToggleStar}
                className={`px-2 py-0.5 text-[9px] font-bold rounded border transition-all cursor-pointer ${
                  starActive
                    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                    : 'bg-transparent text-slate-400 border-slate-700 hover:text-slate-200'
                }`}
              >
                {starActive ? 'Disable STAR' : 'Format as STAR'}
              </button>
              {starActive && (
                <button
                  type="button"
                  onClick={handleCopyTemplate}
                  className="px-2 py-0.5 text-[9px] font-bold rounded border bg-transparent text-slate-400 border-slate-700 hover:text-slate-200 cursor-pointer"
                >
                  Copy STAR Template
                </button>
              )}
            </div>
          )}
        </div>
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          disabled={submitMutation.isPending}
          placeholder="Type your detailed answer or design choices here..."
          className="w-full h-56 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl p-4 text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-emerald-500 resize-none leading-relaxed transition-colors"
        />
      </div>

      {/* Action Deck */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-850">
        
        {/* Nav arrows */}
        <div className="flex gap-1.5 w-full sm:w-auto">
          <button
            onClick={onPrev}
            disabled={index === 0}
            className="flex-1 sm:flex-initial flex items-center justify-center p-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-850 disabled:opacity-50 disabled:hover:bg-transparent rounded-lg text-slate-500 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <button
            onClick={onNext}
            disabled={index === total - 1}
            className="flex-1 sm:flex-initial flex items-center justify-center p-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-850 disabled:opacity-50 disabled:hover:bg-transparent rounded-lg text-slate-500 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Save CTA */}
        <button
          onClick={handleSaveAnswer}
          disabled={submitMutation.isPending || !answer.trim()}
          className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-800 text-slate-950 dark:text-slate-900 text-xs font-bold rounded-lg transition-colors cursor-pointer"
        >
          <Save className="w-4 h-4" /> Save Answer
        </button>

      </div>

    </div>
  );
};
export default InterviewQuestionCard;
