import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useBlocker } from 'react-router-dom';
import { Loader2, Video, CheckCircle, HelpCircle, ArrowRight, AlertCircle } from 'lucide-react';
import { useInterview, useEndInterview } from '@/hooks/useInterviews';
import { InterviewQuestionCard } from '@/components/InterviewQuestionCard';
import { InterviewTimer } from '@/components/InterviewTimer';

export const InterviewWorkspace: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: session, isLoading, isError } = useInterview(id || '');
  const endMutation = useEndInterview();

  // Active question index
  const [activeIndex, setActiveIndex] = useState(0);
  
  // Accumulated duration ticking
  const [duration, setDuration] = useState(0);

  // End mutation error message
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Track unsaved changes state
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    if (session && session.status === 'COMPLETED') {
      navigate(`/interviews/${session.id}`);
    }
  }, [session, navigate]);

  // 1. Browser Tab Close / Refresh Blocker
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  // 2. React Router SPA Route Navigation Blocker
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      hasUnsavedChanges && currentLocation.pathname !== nextLocation.pathname
  );

  useEffect(() => {
    if (blocker.state === 'blocked') {
      const proceed = window.confirm(
        'You have unsaved changes in your response. Are you sure you want to discard them and leave?'
      );
      if (proceed) {
        blocker.proceed();
      } else {
        blocker.reset();
      }
    }
  }, [blocker]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
        <p className="text-xs text-slate-550">Entering simulator environment...</p>
      </div>
    );
  }

  if (isError || !session) {
    return (
      <div className="max-w-md mx-auto py-12 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto animate-bounce" />
        <h3 className="text-md font-bold text-slate-800 dark:text-slate-200">Simulator session not found</h3>
        <p className="text-xs text-slate-500 dark:text-slate-450">
          The requested simulated workspace details could not be established.
        </p>
      </div>
    );
  }

  const questions = session.questions || [];
  const answers = session.answers || [];
  const currentQuestion = questions[activeIndex];
  const isBehavioral = session.domain === 'BEHAVIORAL';

  const handleEndInterview = async () => {
    if (!id) return;
    setErrorMsg(null);
    try {
      // Temporarily bypass changes warning for submit completion
      setHasUnsavedChanges(false);
      
      await endMutation.mutateAsync({
        id,
        durationSeconds: duration,
      });
      navigate(`/interviews/${id}`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to complete interview session. Please try again.');
    }
  };

  const isQuestionAnswered = (qId: string) => {
    return answers.some((ans: any) => ans.interviewQuestionId === qId);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* End Session Error Banner */}
      {errorMsg && (
        <div className="flex items-center gap-2 p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-650 dark:text-red-400">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Header bar: Title, timer, End CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
            <Video className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-slate-800 dark:text-slate-200">{session.title}</h2>
            <span className="text-[10px] text-slate-550 dark:text-slate-450 uppercase font-semibold">Active Practice Run</span>
          </div>
        </div>

        {/* Stopwatch timer + End session triggers */}
        <div className="flex items-center gap-3 justify-between sm:justify-end">
          <InterviewTimer isActive={true} onDurationChange={(sec) => setDuration(sec)} />

          <button
            onClick={handleEndInterview}
            disabled={endMutation.isPending}
            className="flex items-center gap-1 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-650 dark:text-red-400 border border-red-500/20 text-xs font-bold rounded-lg transition-colors cursor-pointer"
          >
            {endMutation.isPending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <>
                End Session <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main split-screen layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Question List Sidebar Navigator */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4 shadow-sm shadow-slate-100 dark:shadow-none">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Simulator Checklist</h3>
          
          <div className="space-y-2">
            {questions.map((q: any, idx: number) => {
              const active = idx === activeIndex;
              const answered = isQuestionAnswered(q.id);
              
              return (
                <button
                  key={q.id}
                  onClick={() => setActiveIndex(idx)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg border text-left text-xs transition-all duration-150 ${
                    active
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                      : 'bg-transparent border-slate-150 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  <span className="font-semibold truncate max-w-44">
                    {idx + 1}. {q.questionText}
                  </span>
                  
                  {answered ? (
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                  ) : (
                    <HelpCircle className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side: Question Card Slider and Text input response decks */}
        {currentQuestion && (
          <div className="lg:col-span-2">
            <InterviewQuestionCard
              sessionId={session.id}
              question={currentQuestion}
              index={activeIndex}
              total={questions.length}
              savedAnswer={
                answers.find((ans: any) => ans.interviewQuestionId === currentQuestion.id)?.userAnswer || ''
              }
              isBehavioral={isBehavioral}
              onNext={() => setActiveIndex((prev) => Math.min(questions.length - 1, prev + 1))}
              onPrev={() => setActiveIndex((prev) => Math.max(0, prev - 1))}
              onUnsavedChangesChange={setHasUnsavedChanges}
            />
          </div>
        )}

      </div>
    </div>
  );
};
export default InterviewWorkspace;
