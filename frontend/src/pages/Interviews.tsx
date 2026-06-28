import React, { useState } from 'react';
import { Sparkles, Video, RefreshCw, AlertCircle, Plus, X } from 'lucide-react';
import { useInterviews } from '@/hooks/useInterviews';
import { InterviewCard } from '@/components/InterviewCard';
import { InterviewSetupForm } from '@/components/InterviewSetupForm';
import { SkeletonCard } from '@/components/Skeleton';

export const Interviews: React.FC = () => {
  const [setupOpen, setSetupOpen] = useState(false);

  // Fetch interviews
  const { data, isLoading, isError, refetch } = useInterviews();

  const sessions = data?.sessions || [];

  return (
    <div className="space-y-6">
      {/* Header with action */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">AI Interview Simulator</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Generate custom behavioral, coding, or design question runs powered by Gemini AI.
          </p>
        </div>

        <button
          onClick={() => setSetupOpen(true)}
          className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 dark:text-slate-900 font-bold rounded-lg text-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" /> New Session
        </button>
      </div>

      {/* Error state */}
      {isError && (
        <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-650 dark:text-red-400">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>Failed to retrieve interview logs from server. Check DB or API connection.</span>
          <button onClick={() => refetch()} className="ml-auto underline flex items-center gap-1 font-semibold">
            <RefreshCw className="w-3.5 h-3.5" /> Retry
          </button>
        </div>
      )}

      {/* Listing grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, idx) => (
            <SkeletonCard key={idx} />
          ))}
        </div>
      ) : sessions.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-12 px-4 text-center space-y-3">
          <Video className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">No simulator runs recorded</h3>
          <p className="text-xs text-slate-500 dark:text-slate-450 max-w-sm mx-auto">
            Click **New Session** at the top, select your engineering track and difficulty, and launch your first AI mock session.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessions.map((session: any) => (
            <InterviewCard key={session.id} session={session} />
          ))}
        </div>
      )}

      {/* Popover dialog setup modal */}
      {setupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSetupOpen(false)} />
          
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-md relative z-10 shadow-xl">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-850 mb-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-500" /> Customise Mock Simulator
              </h3>
              <button
                onClick={() => setSetupOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-450"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <InterviewSetupForm onClose={() => setSetupOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
};
export default Interviews;
