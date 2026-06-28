import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Clock, 
  Calendar, 
  Shield, 
  HelpCircle, 
  AlertCircle, 
  RefreshCw, 
  AlertTriangle, 
  ThumbsUp, 
  ThumbsDown, 
  ListTodo 
} from 'lucide-react';
import { useInterview, useInterviewEvaluation, useRetryEvaluation } from '@/hooks/useInterviews';
import { SkeletonLine } from '@/components/Skeleton';
import { getDifficultyStyles } from '@/utils';
import { ROUTES } from '@/routes';

export const InterviewDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: session, isLoading, isError } = useInterview(id || '');
  const { data: evalData, isLoading: isEvalLoading, isError: isEvalError } = useInterviewEvaluation(id || '');
  const retryMutation = useRetryEvaluation();

  const formatDuration = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    if (mins === 0) return `${remaining}s`;
    return `${mins}m ${remaining}s`;
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto animate-pulse">
        <SkeletonLine width="w-24" height="h-4" />
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 h-96" />
      </div>
    );
  }

  if (isError || !session) {
    return (
      <div className="max-w-md mx-auto py-12 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto animate-bounce" />
        <h3 className="text-md font-bold text-slate-800 dark:text-slate-200">Session details not found</h3>
        <p className="text-xs text-slate-500 dark:text-slate-450">
          The requested simulated session records could not be loaded.
        </p>
        <Link to={ROUTES.INTERVIEWS} className="text-xs font-semibold text-emerald-600 dark:text-emerald-450 underline block">
          Back to Sessions
        </Link>
      </div>
    );
  }

  const questions = session.questions || [];
  const answers = session.answers || [];

  // Match question ID to userAnswer in answers list
  const getAnswerForQuestion = (qId: string) => {
    return answers.find((ans: any) => ans.interviewQuestionId === qId)?.userAnswer || '';
  };

  // Find individual question evaluation
  const getQuestionEvaluation = (qId: string) => {
    if (!evalData?.evaluation?.questionEvaluations) return null;
    return evalData.evaluation.questionEvaluations.find(
      (qe: any) => qe.interviewQuestionId === qId
    );
  };

  const renderEvaluationPanel = () => {
    if (isEvalLoading) {
      return (
        <div className="mx-6 my-4 p-5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 animate-pulse bg-slate-50 dark:bg-slate-900">
          <SkeletonLine width="w-48" height="h-4" />
          <SkeletonLine width="w-full" height="h-3" />
          <SkeletonLine width="w-3/4" height="h-3" />
        </div>
      );
    }

    if (isEvalError || !evalData) {
      return (
        <div className="mx-6 my-4 p-4 rounded-xl bg-red-500/5 border border-red-500/10 flex items-start gap-2.5">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-red-600 dark:text-red-450">Failed to Retrieve Evaluation</h4>
            <p className="text-[10px] text-slate-550 dark:text-slate-400">
              The system encountered an error fetching the evaluation job status.
            </p>
          </div>
        </div>
      );
    }

    const { status, job, evaluation, timeline } = evalData;

    if (status === 'NOT_STARTED' || status === 'PENDING') {
      return (
        <div className="mx-6 my-4 p-5 rounded-xl border border-yellow-500/10 bg-yellow-500/5 flex items-start gap-3">
          <RefreshCw className="w-5 h-5 text-yellow-500 shrink-0 animate-spin mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-yellow-600 dark:text-yellow-450">AI Evaluation Feedback Underway</h4>
            <p className="text-[10px] text-slate-550 dark:text-slate-400 leading-relaxed">
              We are currently running your answers against our rubric parameters (Technical Accuracy, Communication, Clarity, and Depth). This usually takes 10-30 seconds.
            </p>
            {job && job.retryCount > 0 && (
              <span className="inline-block text-[9px] font-semibold text-yellow-500 mt-1">
                Evaluation retry attempt {job.retryCount}/3...
              </span>
            )}
          </div>
        </div>
      );
    }

    if (status === 'FAILED') {
      return (
        <div className="mx-6 my-4 p-5 rounded-xl border border-red-500/15 bg-red-500/5 space-y-3">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-red-600 dark:text-red-450">AI Evaluation Failed</h4>
              <p className="text-[10px] text-slate-550 dark:text-slate-400 leading-relaxed">
                {job?.errorMessage || 'Gemini encountered a timeout or API quota limit while evaluating your transcript.'}
              </p>
            </div>
          </div>
          <button
            onClick={() => retryMutation.mutate(id || '')}
            disabled={retryMutation.isPending}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 dark:bg-red-700 text-white rounded-lg text-[10px] font-bold hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-3 h-3 ${retryMutation.isPending ? 'animate-spin' : ''}`} />
            {retryMutation.isPending ? 'Queueing retry...' : 'Retry Evaluation (Limit: 3)'}
          </button>
        </div>
      );
    }

    if (status === 'COMPLETED' && evaluation) {
      const rubrics = [
        { label: 'Technical Accuracy', value: evaluation.technicalAccuracy || 0, color: 'bg-emerald-500' },
        { label: 'Communication', value: evaluation.communication || 0, color: 'bg-blue-500' },
        { label: 'Clarity', value: evaluation.clarity || 0, color: 'bg-cyan-500' },
        { label: 'Depth', value: evaluation.depth || 0, color: 'bg-indigo-500' },
      ];

      const isPersonalized = session.interviewType === 'PERSONALIZED';

      return (
        <div className="mx-6 my-4 p-6 rounded-xl border border-slate-200 dark:border-slate-800 space-y-6 bg-slate-50/50 dark:bg-slate-950/20">
          
          {/* Personalized Mock Session Scores */}
          {isPersonalized && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-4 border-b border-slate-200/60 dark:border-slate-800/80">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center text-center shadow-sm">
                <span className="text-[9px] uppercase font-bold text-slate-450 dark:text-slate-500 tracking-wider">Resume Alignment</span>
                <span className="text-2xl font-extrabold text-blue-500 mt-1">{evaluation.resumeAlignmentScore ?? 0}%</span>
                <span className="text-[8px] text-slate-500 dark:text-slate-455 mt-1">Alignment with claimed skills</span>
              </div>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center text-center shadow-sm">
                <span className="text-[9px] uppercase font-bold text-slate-450 dark:text-slate-500 tracking-wider">Consistency Score</span>
                <span className="text-2xl font-extrabold text-amber-500 mt-1">{evaluation.consistencyScore ?? 0}%</span>
                <span className="text-[8px] text-slate-500 dark:text-slate-455 mt-1">Claims credibility check</span>
              </div>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center text-center shadow-sm">
                <span className="text-[9px] uppercase font-bold text-slate-450 dark:text-slate-500 tracking-wider">Confidence Score</span>
                <span className="text-2xl font-extrabold text-indigo-500 mt-1">{evaluation.confidenceScore ?? 0}%</span>
                <span className="text-[8px] text-slate-500 dark:text-slate-455 mt-1">Depth of project arguments</span>
              </div>
            </div>
          )}

          {/* Rubrics grid */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            
            {/* Overall Score widget */}
            <div className="md:col-span-2 flex flex-col items-center justify-center p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
              <span className="text-[10px] uppercase font-bold text-slate-455 dark:text-slate-500 tracking-wider">
                Overall Evaluation Score
              </span>
              <div className="mt-3 flex items-baseline justify-center">
                <span className="text-4xl font-extrabold text-emerald-600 dark:text-emerald-400">
                  {evaluation.overallScore}
                </span>
                <span className="text-sm font-semibold text-slate-400 dark:text-slate-500 ml-0.5">/100</span>
              </div>
              <span className="mt-2 text-[10px] text-slate-500 dark:text-slate-450 italic">
                {evaluation.overallScore >= 80 ? 'Excellent performance!' : evaluation.overallScore >= 60 ? 'Solid job, but room to grow.' : 'Needs focused practice.'}
              </span>
            </div>

            {/* Rubrics sliders */}
            <div className="md:col-span-3 space-y-3">
              <span className="text-[10px] uppercase font-bold text-slate-455 dark:text-slate-500 tracking-wider block">
                Rubric Criteria Performance
              </span>
              <div className="space-y-2.5">
                {rubrics.map((rubric) => (
                  <div key={rubric.label} className="space-y-1">
                    <div className="flex justify-between text-[11px] font-semibold text-slate-700 dark:text-slate-350">
                      <span>{rubric.label}</span>
                      <span>{rubric.value}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${rubric.color} transition-all duration-500`} 
                        style={{ width: `${rubric.value}%` }} 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* AI Personalized Insights Card */}
          {isPersonalized && evaluation.rawResponse && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4 shadow-sm">
              <span className="text-[10px] uppercase font-bold text-slate-450 dark:text-slate-500 tracking-wider block">
                AI Resume Coaching Insights
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-[11px] text-slate-655 dark:text-slate-400">
                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-850">
                    <span className="font-semibold text-slate-700 dark:text-slate-350">Strongest Claimed Skill</span>
                    <span className="px-2 py-0.5 font-bold rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
                      {evaluation.rawResponse.strongestClaimedSkill || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-850">
                    <span className="font-semibold text-slate-700 dark:text-slate-350">Weakest Claimed Skill</span>
                    <span className="px-2 py-0.5 font-bold rounded bg-rose-500/10 border border-rose-500/20 text-rose-500">
                      {evaluation.rawResponse.weakestClaimedSkill || 'N/A'}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="font-semibold text-slate-700 dark:text-slate-350 block">Most Convincing Project Discussion</span>
                    <p className="text-[10px] leading-relaxed italic text-slate-500">
                      {evaluation.rawResponse.mostConvincingProjectDiscussion || 'No project was discussed in detail.'}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <span className="font-semibold text-slate-700 dark:text-slate-350 block">Skills Requiring Verification</span>
                  <div className="flex flex-wrap gap-1.5">
                    {evaluation.rawResponse.skillsRequiringVerification && evaluation.rawResponse.skillsRequiringVerification.length > 0 ? (
                      evaluation.rawResponse.skillsRequiringVerification.map((skill: string, sIdx: number) => (
                        <span key={sIdx} className="px-2 py-1 font-bold rounded border border-amber-500/20 bg-amber-500/10 text-amber-500 text-[10px]">
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] text-slate-500 italic">None. All skills matched candidate responses.</span>
                    )}
                  </div>
                  <p className="text-[9px] text-slate-500 dark:text-slate-455 leading-relaxed pt-2">
                    *Skills requiring verification are technologies listed on your resume that were not clearly demonstrated or matched in your interview responses.
                  </p>
                </div>
              </div>
            </div>
          )}
          {/* Company Specific Insights Card */}
          {session.companyProfile && evaluation.rawResponse && (
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 to-slate-950 border border-slate-250 dark:border-slate-800 rounded-xl p-5 space-y-4 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded">
                    {session.companyProfile} Target
                  </span>
                  <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Company Alignment Analysis
                  </h3>
                </div>
                <div className="flex items-center gap-1.5 bg-indigo-500/10 border border-indigo-500/20 px-2 py-1 rounded">
                  <span className="text-[10px] font-semibold text-indigo-500">Readiness Score:</span>
                  <span className="text-xs font-extrabold text-indigo-500">{evaluation.overallScore}%</span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-[11px] text-slate-655 dark:text-slate-400">
                {/* Company Strengths */}
                <div className="space-y-2">
                  <span className="font-bold text-emerald-600 dark:text-emerald-450 flex items-center gap-1">
                    <ThumbsUp className="w-3.5 h-3.5" /> Company Strengths
                  </span>
                  <ul className="list-disc pl-4 space-y-1 text-slate-600 dark:text-slate-400 leading-normal">
                    {evaluation.rawResponse.companyStrengths && evaluation.rawResponse.companyStrengths.length > 0 ? (
                      evaluation.rawResponse.companyStrengths.map((str: string, sIdx: number) => (
                        <li key={sIdx}>{str}</li>
                      ))
                    ) : (
                      <li className="italic text-slate-500 list-none pl-0">No company-specific strengths identified.</li>
                    )}
                  </ul>
                </div>
                {/* Company Weaknesses */}
                <div className="space-y-2">
                  <span className="font-bold text-amber-600 dark:text-amber-500 flex items-center gap-1">
                    <ThumbsDown className="w-3.5 h-3.5" /> Company Gaps
                  </span>
                  <ul className="list-disc pl-4 space-y-1 text-slate-600 dark:text-slate-400 leading-normal">
                    {evaluation.rawResponse.companyWeaknesses && evaluation.rawResponse.companyWeaknesses.length > 0 ? (
                      evaluation.rawResponse.companyWeaknesses.map((weak: string, wIdx: number) => (
                        <li key={wIdx}>{weak}</li>
                      ))
                    ) : (
                      <li className="italic text-slate-500 list-none pl-0">No company-specific weaknesses identified.</li>
                    )}
                  </ul>
                </div>
                {/* Company Recommendations */}
                <div className="space-y-2">
                  <span className="font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                    <ListTodo className="w-3.5 h-3.5" /> Rubric Recommendations
                  </span>
                  <ul className="list-disc pl-4 space-y-1 text-slate-600 dark:text-slate-400 leading-normal">
                    {evaluation.rawResponse.companyRecommendations && evaluation.rawResponse.companyRecommendations.length > 0 ? (
                      evaluation.rawResponse.companyRecommendations.map((rec: string, rIdx: number) => (
                        <li key={rIdx}>{rec}</li>
                      ))
                    ) : (
                      <li className="italic text-slate-500 list-none pl-0">No company-specific recommendations provided.</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Feedback pillars (Strengths, Weaknesses, Recommendations) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-200/60 dark:border-slate-800/80">
            {/* Strengths */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-450">
                <ThumbsUp className="w-4 h-4" />
                <span>Strengths</span>
              </div>
              <div className="text-[11px] leading-relaxed text-slate-655 dark:text-slate-400 whitespace-pre-line p-3 bg-emerald-500/5 rounded-lg border border-emerald-500/10">
                {evaluation.strengths || 'No strengths logged.'}
              </div>
            </div>

            {/* Weaknesses */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-500">
                <ThumbsDown className="w-4 h-4" />
                <span>Weaknesses</span>
              </div>
              <div className="text-[11px] leading-relaxed text-slate-655 dark:text-slate-400 whitespace-pre-line p-3 bg-amber-500/5 rounded-lg border border-amber-500/10">
                {evaluation.weaknesses || 'No weaknesses logged.'}
              </div>
            </div>

            {/* Recommendations */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                <ListTodo className="w-4 h-4" />
                <span>Recommendations</span>
              </div>
              <div className="text-[11px] leading-relaxed text-slate-655 dark:text-slate-400 whitespace-pre-line p-3 bg-indigo-500/5 rounded-lg border border-indigo-500/10">
                {evaluation.recommendations || 'No recommendations logged.'}
              </div>
            </div>
          </div>

          {/* Timeline Metadata */}
          {timeline && (
            <div className="text-[9px] text-slate-400 dark:text-slate-500 pt-3 border-t border-slate-200/50 dark:border-slate-800/80 flex flex-wrap justify-between gap-2">
              <span>Job Queued: {new Date(timeline.createdAt).toLocaleTimeString()}</span>
              {timeline.startedAt && <span>Processing Started: {new Date(timeline.startedAt).toLocaleTimeString()}</span>}
              {timeline.completedAt && <span>Finished: {new Date(timeline.completedAt).toLocaleTimeString()}</span>}
              {timeline.durationMs && <span>Analysis Duration: {(timeline.durationMs / 1000).toFixed(1)}s</span>}
            </div>
          )}

        </div>
      );
    }

    return null;
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Navigation header */}
      <Link
        to={ROUTES.INTERVIEWS}
        className="inline-flex items-center gap-1.5 text-xs text-slate-550 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-250 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to AI Mock Sessions
      </Link>

      {/* Main card details */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm shadow-slate-100 dark:shadow-none">
        
        {/* Title metadata bar */}
        <div className="p-6 border-b border-slate-250/20 dark:border-slate-850 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h1 className="text-lg md:text-xl font-bold text-slate-800 dark:text-slate-200">
              {session.title}
            </h1>
            
            <span className={`text-[10px] px-2 py-0.5 rounded font-bold border tracking-wider uppercase shrink-0 ${getDifficultyStyles(session.difficulty)}`}>
              {session.difficulty}
            </span>
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-550 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4 text-slate-400" />
              Completed: <span className="font-semibold text-slate-700 dark:text-slate-300">{formatDate(session.createdAt)}</span>
            </span>

            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-slate-400" />
              Elapsed Duration: <span className="font-semibold text-slate-700 dark:text-slate-300">{formatDuration(session.durationSeconds)}</span>
            </span>

            <span className="flex items-center gap-1">
              <Shield className="w-4 h-4 text-slate-400" />
              AI Model: <span className="font-semibold text-slate-700 dark:text-slate-300">{session.modelName}</span>
            </span>
          </div>
        </div>

        {/* Dynamic Evaluations Banner */}
        {renderEvaluationPanel()}

        {/* Questions and Answers Review list */}
        <div className="p-6 space-y-6">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Simulator Transcript</h3>

          <div className="space-y-6">
            {questions.map((q: any, idx: number) => {
              const answerText = getAnswerForQuestion(q.id);
              const qEval = getQuestionEvaluation(q.id);

              return (
                <div key={q.id} className="p-4 rounded-xl border border-slate-150 dark:border-slate-850 space-y-3 bg-slate-50 dark:bg-slate-950">
                  <div className="flex items-start gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                    <HelpCircle className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                    <span>
                      Q{idx + 1}: {q.questionText}
                    </span>
                  </div>

                  <hr className="border-slate-200 dark:border-slate-850" />

                  <div className="text-xs leading-relaxed text-slate-650 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3">
                    <span className="text-[9px] uppercase font-bold text-slate-500 block mb-1">Your response:</span>
                    {answerText ? (
                      <p className="whitespace-pre-wrap font-mono text-[11px]">{answerText}</p>
                    ) : (
                      <span className="italic text-slate-500">No response provided. Question skipped.</span>
                    )}
                  </div>

                  {/* Question Evaluation Feedback */}
                  {qEval && (
                    <div className="mt-2.5 p-3 rounded-lg border border-emerald-500/10 bg-emerald-500/[0.02] space-y-1.5">
                      <div className="flex justify-between items-center text-[10px] font-bold text-emerald-600 dark:text-emerald-450">
                        <span>Question Score</span>
                        <span className="px-1.5 py-0.5 rounded border border-emerald-500/20 bg-emerald-500/10">
                          {qEval.score}/100
                        </span>
                      </div>
                      <p className="text-[10px] leading-relaxed text-slate-550 dark:text-slate-400">
                        {qEval.feedback}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};

export default InterviewDetails;
