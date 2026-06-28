import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Save, CheckCircle, Play, Pause, AlertCircle } from 'lucide-react';
import { useSubmission, useUpdateSubmission } from '@/hooks/useSubmissions';
import { SubmissionNotesEditor } from '@/components/SubmissionNotesEditor';
import { SubmissionStatusBadge } from '@/components/SubmissionStatusBadge';
import { getDifficultyStyles } from '@/utils';
import { ROUTES } from '@/routes';

export const SubmissionDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: submission, isLoading, isError } = useSubmission(id || '');
  const updateMutation = useUpdateSubmission();

  // Local state for workspace inputs
  const [notes, setNotes] = useState('');
  const [reflection, setReflection] = useState('');
  const [attempts, setAttempts] = useState(1);
  const [status, setStatus] = useState<'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'>('IN_PROGRESS');
  
  // Stopwatch states
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [timerActive, setTimerActive] = useState(true);

  // Synchronise local states once data is fetched
  useEffect(() => {
    if (submission) {
      setNotes(submission.notes || '');
      setReflection(submission.reflection || '');
      setAttempts(submission.attemptCount || 1);
      setStatus(submission.status);
      setSessionSeconds(0); // Reset session timer on load
      setTimerActive(submission.status === 'IN_PROGRESS');
    }
  }, [submission]);

  // Stopwatch ticking interval
  useEffect(() => {
    let interval: any = null;
    if (timerActive && status === 'IN_PROGRESS') {
      interval = setInterval(() => {
        setSessionSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerActive, status]);

  const formatSeconds = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSave = async (isMarkingComplete = false) => {
    if (!id || !submission) return;
    
    // Accumulate time spent: database initial value + session ticker
    const finalTimeSpent = submission.timeSpent + sessionSeconds;
    const finalStatus = isMarkingComplete ? 'COMPLETED' : status;

    try {
      await updateMutation.mutateAsync({
        id,
        data: {
          notes,
          reflection,
          attemptCount: attempts,
          status: finalStatus,
          timeSpent: finalTimeSpent,
        },
      });

      // Reset stopwatch session seconds since changes are committed
      setSessionSeconds(0);
      
      if (isMarkingComplete) {
        navigate(ROUTES.SUBMISSIONS);
      }
    } catch (err) {
      // Handled by react query
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse max-w-7xl mx-auto">
        <div className="w-24 h-4 bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 h-96 rounded-xl border border-slate-200 dark:border-slate-800" />
          <div className="bg-white dark:bg-slate-900 h-96 rounded-xl border border-slate-200 dark:border-slate-800" />
        </div>
      </div>
    );
  }

  if (isError || !submission) {
    return (
      <div className="max-w-md mx-auto py-12 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
        <h3 className="text-md font-bold text-slate-800 dark:text-slate-200">Submission not found</h3>
        <p className="text-xs text-slate-500 dark:text-slate-450">
          The requested submission details could not be loaded. Verify user session or connection.
        </p>
        <Link to={ROUTES.SUBMISSIONS} className="text-xs font-semibold text-emerald-600 dark:text-emerald-450 underline block">
          Back to History
        </Link>
      </div>
    );
  }

  const question = submission.question;
  const totalAccumulatedSeconds = submission.timeSpent + sessionSeconds;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header back button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          to={ROUTES.SUBMISSIONS}
          className="inline-flex items-center gap-1.5 text-xs text-slate-550 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-250 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to History
        </Link>

        {updateMutation.isSuccess && (
          <span className="text-[10px] text-emerald-500 font-semibold flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" /> Workspace changes saved successfully!
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Side: Question Task Details Panel */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 flex flex-col justify-between space-y-6 shadow-sm shadow-slate-100 dark:shadow-none">
          <div className="space-y-4">
            <div className="flex justify-between items-start gap-4">
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                  {question.topic}
                </span>
                <h2 className="text-md md:text-lg font-bold text-slate-800 dark:text-slate-200 mt-2">
                  {question.title}
                </h2>
              </div>
              
              <span className={`text-[9px] px-2 py-0.5 rounded font-bold border tracking-wider uppercase shrink-0 ${getDifficultyStyles(question.difficulty)}`}>
                {question.difficulty}
              </span>
            </div>

            <hr className="border-slate-100 dark:border-slate-850" />

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-350">Problem Description</h4>
              <div className="text-xs leading-relaxed text-slate-650 dark:text-slate-400 whitespace-pre-wrap bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-150 dark:border-slate-850 max-h-96 overflow-y-auto font-sans">
                {question.description}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-850 flex items-center gap-3">
            <SubmissionStatusBadge status={submission.status} />
            <span className="text-[10px] text-slate-450">
              Practice initiated: {new Date(submission.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Right Side: Active Workspace notepad, Stopwatch and Complete switches */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-6 shadow-sm shadow-slate-100 dark:shadow-none">
          
          {/* Header toolbar: Timer + Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl">
            {/* Stopwatch ticker */}
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[9px] text-slate-500 uppercase font-bold block">Active Duration</span>
                <span className="text-lg font-mono font-bold text-slate-800 dark:text-slate-200">
                  {formatSeconds(totalAccumulatedSeconds)}
                </span>
              </div>
              
              {/* Play/Pause for timer */}
              {status === 'IN_PROGRESS' && (
                <button
                  onClick={() => setTimerActive(!timerActive)}
                  className="p-1 rounded bg-slate-200 dark:bg-slate-850 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors ml-2"
                >
                  {timerActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-emerald-500" />}
                </button>
              )}
            </div>

            {/* Attempts incremental counter */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-500 font-bold uppercase">Attempts:</span>
              <div className="flex items-center border border-slate-200 dark:border-slate-850 rounded-lg bg-white dark:bg-slate-900 overflow-hidden">
                <button
                  onClick={() => setAttempts(Math.max(1, attempts - 1))}
                  className="px-2.5 py-1 text-xs hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
                >
                  -
                </button>
                <span className="px-3 text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                  {attempts}
                </span>
                <button
                  onClick={() => setAttempts(attempts + 1)}
                  className="px-2.5 py-1 text-xs hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Notes Editor (Zod validation limits to 5000 chars) */}
          <SubmissionNotesEditor
            value={notes}
            onChange={(val) => setNotes(val)}
            disabled={updateMutation.isPending}
          />

          {/* Reflection Notepad */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-850 dark:text-slate-250 block">AI Self-Reflection</label>
            <input
              type="text"
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              placeholder="Summarize key lessons or areas of improvement in one sentence..."
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-4 py-2.5 text-xs text-slate-200 outline-none focus:border-emerald-500"
            />
          </div>

          {/* Save & Complete Trigger Deck */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-850">
            {status !== 'COMPLETED' && (
              <button
                onClick={() => handleSave(true)}
                disabled={updateMutation.isPending || notes.length > 5000}
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-800 text-slate-950 font-bold rounded-lg text-xs transition-colors shrink-0 cursor-pointer"
              >
                <CheckCircle className="w-4 h-4" /> Mark as Completed
              </button>
            )}

            <button
              onClick={() => handleSave(false)}
              disabled={updateMutation.isPending || notes.length > 5000}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 border border-slate-200 dark:border-slate-800 text-slate-650 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-850 font-bold rounded-lg text-xs transition-colors"
            >
              <Save className="w-4 h-4 text-emerald-500" /> Save Workspace
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
export default SubmissionDetails;
