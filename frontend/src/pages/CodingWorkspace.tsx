import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import {
  getSessionById,
  saveSessionCode,
  runSessionCode,
  submitSessionCode,
  CodingSession
} from '@/services/coding.service';
import {
  Play,
  CheckCircle,
  AlertCircle,
  FileCode,
  Sparkles,
  RefreshCw,
  ArrowLeft,
  Info,
  History
} from 'lucide-react';

export const CodingWorkspace: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [session, setSession] = useState<CodingSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Editor States
  const [code, setCode] = useState('');
  const [lastSavedCode, setLastSavedCode] = useState('');
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');

  // Execution States
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [runResult, setRunResult] = useState<any | null>(null);

  // Panel Tabs
  const [leftTab, setLeftTab] = useState<'problem' | 'history'>('problem');
  const [rightTab, setRightTab] = useState<'console' | 'ai'>('console');

  // Draft banner
  const [showDraftBanner, setShowDraftBanner] = useState(false);
  const [draftCode, setDraftCode] = useState('');

  // Save references
  const codeRef = useRef(code);
  const lastSavedCodeRef = useRef(lastSavedCode);

  useEffect(() => {
    codeRef.current = code;
  }, [code]);

  useEffect(() => {
    lastSavedCodeRef.current = lastSavedCode;
  }, [lastSavedCode]);

  // Load Session details
  const fetchSessionDetails = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await getSessionById(id);
      setSession(data);
      setCode(data.userCode);
      setLastSavedCode(data.userCode);

      // Check for local storage draft restoration
      const localDraft = localStorage.getItem(`coding-draft-${id}`);
      if (localDraft && localDraft !== data.userCode && data.status === 'IN_PROGRESS') {
        setDraftCode(localDraft);
        setShowDraftBanner(true);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve workspace details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchSessionDetails();
  }, [id, fetchSessionDetails]);

  // Autosave code every 5 seconds
  useEffect(() => {
    if (!id || !session || session.status !== 'IN_PROGRESS') return;

    const interval = setInterval(async () => {
      const currentCode = codeRef.current;
      const lastSaved = lastSavedCodeRef.current;

      if (currentCode !== lastSaved) {
        setSaveStatus('saving');
        try {
          await saveSessionCode(id, currentCode);
          setLastSavedCode(currentCode);
          setSaveStatus('saved');
          localStorage.setItem(`coding-draft-${id}`, currentCode);
        } catch (err) {
          setSaveStatus('unsaved');
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [id, session]);

  // Unsaved changes window prompt
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (code !== lastSavedCode && session?.status === 'IN_PROGRESS') {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes that will be lost.';
        return e.returnValue;
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [code, lastSavedCode, session]);

  const handleRestoreDraft = () => {
    setCode(draftCode);
    setSaveStatus('unsaved');
    setShowDraftBanner(false);
  };

  const handleDiscardDraft = () => {
    if (id) {
      localStorage.removeItem(`coding-draft-${id}`);
    }
    setShowDraftBanner(false);
  };

  const handleRunCode = async () => {
    if (!id || running || submitting) return;
    setRunning(true);
    setRightTab('console');
    setRunResult(null);
    try {
      const res = await runSessionCode(id, code);
      setRunResult(res);
      setLastSavedCode(code);
      setSaveStatus('saved');
    } catch (err: any) {
      setRunResult({
        success: false,
        compileError: err.message || 'Sandbox compilation failed',
        testResults: []
      });
    } finally {
      setRunning(false);
    }
  };

  const handleSubmitCode = async () => {
    if (!id || running || submitting) return;
    if (!window.confirm('Are you sure you want to submit your code for final evaluation? This will lock editing.')) {
      return;
    }
    setSubmitting(true);
    setRightTab('ai');
    try {
      const res = await submitSessionCode(id, code);
      setSession(res.session);
      setLastSavedCode(code);
      setSaveStatus('saved');
      localStorage.removeItem(`coding-draft-${id}`);
    } catch (err: any) {
      alert(err.message || 'Failed to submit and evaluate code');
    } finally {
      setSubmitting(false);
    }
  };

  const getMonacoLang = (lang: string) => {
    const l = lang.toLowerCase();
    if (l === 'js' || l === 'javascript') return 'javascript';
    if (l === 'py' || l === 'python') return 'python';
    if (l === 'java') return 'java';
    return 'plaintext';
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'EASY':
      case 'EASY_MEDIUM':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'MEDIUM':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'MEDIUM_HARD':
      case 'HARD':
      default:
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-slate-400">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
        <p className="text-sm">Configuring sandbox compiler & Monaco editor...</p>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 px-4 text-center">
        <AlertCircle className="w-16 h-16 text-rose-500 mb-4" />
        <h3 className="text-xl font-bold text-slate-200 mb-2">Workspace Unavailable</h3>
        <p className="text-slate-400 text-sm mb-6 max-w-md">{error || 'Session could not be loaded'}</p>
        <button onClick={() => navigate('/questions')} className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold transition-all">
          Back to Challenges
        </button>
      </div>
    );
  }

  const isCompleted = session.status === 'COMPLETED';

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-200 overflow-hidden font-sans">
      {/* Workspace Top bar */}
      <div className="flex items-center justify-between px-6 py-3 bg-slate-900 border-b border-slate-800/80 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/questions')}
            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-slate-250 rounded-lg transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              {session.title}
              <span className={`px-1.5 py-0.25 rounded text-[10px] uppercase border font-semibold ${getDifficultyColor(session.difficulty)}`}>
                {session.difficulty}
              </span>
            </h2>
            <p className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-wide">
              Language: {session.language} | Compiler status: sandbox online
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {session.status === 'IN_PROGRESS' && (
            <span className="text-[11px] font-medium flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${
                saveStatus === 'saved' ? 'bg-emerald-500 animate-pulse' : saveStatus === 'saving' ? 'bg-amber-500 animate-pulse' : 'bg-slate-500'
              }`} />
              <span className="text-slate-400 capitalize">{saveStatus === 'saved' ? 'Autosaved' : saveStatus === 'saving' ? 'Saving...' : 'Unsaved changes'}</span>
            </span>
          )}

          <div className="flex items-center gap-2">
            <button
              disabled={running || submitting}
              onClick={handleRunCode}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 rounded-lg text-xs font-semibold border border-slate-700 transition-all cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-slate-300" />
              Run Code
            </button>

            {!isCompleted ? (
              <button
                disabled={running || submitting}
                onClick={handleSubmitCode}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20 transition-all cursor-pointer"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                Submit Solution
              </button>
            ) : (
              <span className="px-3 py-1.5 bg-slate-800 text-slate-400 rounded-lg text-xs font-semibold border border-slate-700">
                Completed & Evaluated
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Local Draft Restorer banner */}
      {showDraftBanner && (
        <div className="flex justify-between items-center px-6 py-2.5 bg-indigo-950/40 border-b border-indigo-500/20 text-xs text-indigo-200 shrink-0">
          <span className="flex items-center gap-2">
            <Info className="w-4 h-4 text-indigo-400 shrink-0" />
            We found an unsaved local editor draft for this coding session. Would you like to restore it?
          </span>
          <div className="flex gap-2">
            <button
              onClick={handleRestoreDraft}
              className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-bold transition-all cursor-pointer"
            >
              Restore
            </button>
            <button
              onClick={handleDiscardDraft}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-750 text-slate-400 rounded font-bold transition-all cursor-pointer"
            >
              Discard
            </button>
          </div>
        </div>
      )}

      {/* Main Split Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left side panel: problem statements / executions history */}
        <div className="w-[40%] border-r border-slate-800/80 bg-slate-900/40 flex flex-col overflow-hidden">
          <div className="flex border-b border-slate-800/80 bg-slate-900/60 shrink-0">
            <button
              onClick={() => setLeftTab('problem')}
              className={`flex-1 py-3 text-xs font-bold border-b-2 transition-all ${
                leftTab === 'problem' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-300'
              }`}
            >
              Problem Description
            </button>
            <button
              onClick={() => setLeftTab('history')}
              className={`flex-1 py-3 text-xs font-bold border-b-2 transition-all ${
                leftTab === 'history' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-300'
              }`}
            >
              Execution History
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {leftTab === 'problem' ? (
              <div className="space-y-6 select-text">
                <div>
                  <h3 className="text-xl font-extrabold text-slate-200 mb-4">{session.codingProblem?.title}</h3>
                  <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap font-sans">
                    {session.codingProblem?.description}
                  </div>
                </div>

                {/* Example Test Cases */}
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Example Cases</h4>
                  <div className="space-y-3">
                    {session.codingProblem?.testCases && (session.codingProblem.testCases as any).slice(0, 2).map((tc: any, index: number) => (
                      <div key={tc.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800/60 font-mono text-xs">
                        <div className="mb-2">
                          <span className="text-indigo-400 font-semibold">Example {index + 1}:</span>
                        </div>
                        <div className="mb-1 text-slate-400">
                          <span className="font-semibold text-slate-350">Input:</span> {tc.input}
                        </div>
                        <div className="text-slate-400">
                          <span className="font-semibold text-slate-350">Expected Output:</span> {tc.expectedOutput}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Previous Runs</h4>
                {session.executions && session.executions.length > 0 ? (
                  session.executions.map((exec: any) => (
                    <div key={exec.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400">{new Date(exec.createdAt).toLocaleTimeString()}</span>
                        <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                          exec.passed ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}>
                          {exec.passed ? 'PASSED' : 'FAILED'}
                        </span>
                      </div>
                      <div className="bg-slate-950 p-2 rounded text-[11px] font-mono text-slate-400 overflow-x-auto whitespace-pre">
                        {exec.code.substring(0, 100)}...
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-12 flex flex-col items-center justify-center text-slate-500 text-xs">
                    <History className="w-8 h-8 mb-2 text-slate-650" />
                    <p>No executions run yet in this session.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right side panel: code editor + terminal output */}
        <div className="w-[60%] flex flex-col overflow-hidden">
          {/* Top Monaco Editor container */}
          <div className="flex-1 min-h-[50%] relative">
            <Editor
              height="100%"
              theme="vs-dark"
              language={getMonacoLang(session.language)}
              value={code}
              onChange={(val) => {
                if (val !== undefined && !isCompleted) {
                  setCode(val);
                  setSaveStatus('unsaved');
                }
              }}
              options={{
                readOnly: isCompleted,
                fontSize: 14,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                lineHeight: 22,
                fontFamily: 'Fira Code, Menlo, Monaco, Consolas, Courier New, monospace',
                padding: { top: 12 }
              }}
            />
          </div>

          {/* Bottom Tabs & Output Terminal */}
          <div className="h-[40%] border-t border-slate-800 bg-slate-950 flex flex-col overflow-hidden shrink-0">
            <div className="flex justify-between items-center border-b border-slate-800/80 bg-slate-900/60 px-6 shrink-0">
              <div className="flex">
                <button
                  onClick={() => setRightTab('console')}
                  className={`py-3 text-xs font-bold border-b-2 mr-6 transition-all ${
                    rightTab === 'console' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-350'
                  }`}
                >
                  Test Results
                </button>
                <button
                  onClick={() => setRightTab('ai')}
                  className={`py-3 text-xs font-bold border-b-2 transition-all ${
                    rightTab === 'ai' || session.evaluation ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-350'
                  }`}
                >
                  AI Review Critique
                </button>
              </div>

              {running && (
                <div className="flex items-center gap-1.5 text-xs text-indigo-400 font-semibold">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Sandbox executing...</span>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-6 font-mono text-xs text-slate-300">
              {rightTab === 'console' ? (
                runResult ? (
                  <div className="space-y-4">
                    {runResult.compileError ? (
                      <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl space-y-2">
                        <div className="font-bold flex items-center gap-1.5">
                          <AlertCircle className="w-4 h-4" /> Compilation / Sandbox Error
                        </div>
                        <pre className="text-xs overflow-x-auto whitespace-pre-wrap">{runResult.compileError}</pre>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 mb-2 font-bold text-slate-200">
                          {runResult.testResults.every((r: any) => r.passed) ? (
                            <span className="text-emerald-400 flex items-center gap-1.5">
                              <CheckCircle className="w-4 h-4" /> All Standard Test Cases Passed!
                            </span>
                          ) : (
                            <span className="text-rose-400 flex items-center gap-1.5">
                              <AlertCircle className="w-4 h-4" /> Some Test Cases Failed.
                            </span>
                          )}
                        </div>

                        {runResult.testResults.map((tr: any, idx: number) => (
                          <div
                            key={tr.testCaseId || idx}
                            className={`border rounded-xl p-4 space-y-2 ${
                              tr.passed ? 'bg-emerald-500/5 border-emerald-500/10' : 'bg-rose-500/5 border-rose-500/10'
                            }`}
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-slate-300">Case {idx + 1}</span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                tr.passed ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25' : 'bg-rose-500/10 text-rose-400 border border-rose-500/25'
                              }`}>
                                {tr.passed ? 'PASSED' : 'FAILED'}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-slate-400 mt-2">
                              <div>
                                <span className="font-bold text-slate-450">Input:</span>
                                <pre className="bg-slate-950 p-2 rounded border border-slate-900 text-[10px] overflow-x-auto mt-1">{tr.input}</pre>
                              </div>
                              <div>
                                <span className="font-bold text-slate-450">Expected:</span>
                                <pre className="bg-slate-950 p-2 rounded border border-slate-900 text-[10px] overflow-x-auto mt-1">{tr.expectedOutput}</pre>
                              </div>
                              <div className="md:col-span-2">
                                <span className="font-bold text-slate-450">Actual Output:</span>
                                <pre className={`bg-slate-950 p-2 rounded border text-[10px] overflow-x-auto mt-1 ${
                                  tr.passed ? 'border-emerald-500/20 text-emerald-300' : 'border-rose-500/20 text-rose-300'
                                }`}>{tr.actualOutput || 'Empty Output'}</pre>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs py-8">
                    <FileCode className="w-8 h-8 mb-2 text-slate-650" />
                    <p>Run your code to compile and validate standard test cases.</p>
                  </div>
                )
              ) : (
                /* AI evaluation reviews view */
                session.evaluation ? (
                  <div className="space-y-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                      <div>
                        <h4 className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" /> Final AI Review Critique
                        </h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Automated static AST analysis and Gemini AI LLM grading metrics.
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col items-center justify-center bg-indigo-600/10 border border-indigo-500/20 rounded-xl px-4 py-2">
                          <span className="text-xl font-black text-indigo-400">{session.evaluation.overallScore}%</span>
                          <span className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold mt-0.5">Overall Grade</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { name: 'Correctness', val: session.evaluation.correctnessScore },
                        { name: 'Quality', val: session.evaluation.codeQualityScore },
                        { name: 'Complexity', val: session.evaluation.complexityScore },
                        { name: 'Optimization', val: session.evaluation.optimizationScore },
                      ].map((stat, idx) => (
                        <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col items-center">
                          <span className="text-xs font-semibold text-slate-400">{stat.name}</span>
                          <span className="text-lg font-bold text-slate-200 mt-1">{stat.val}%</span>
                          <div className="w-full bg-slate-800 h-1 rounded-full mt-2 overflow-hidden">
                            <div className="bg-indigo-500 h-1 rounded-full" style={{ width: `${stat.val}%` }}></div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h5 className="font-bold text-emerald-400 mb-1">Strengths</h5>
                        <div className="text-slate-300 text-xs leading-relaxed whitespace-pre-wrap select-text pl-2 border-l border-emerald-500/20 font-sans">
                          {session.evaluation.strengths}
                        </div>
                      </div>
                      <div>
                        <h5 className="font-bold text-rose-400 mb-1">Weaknesses</h5>
                        <div className="text-slate-300 text-xs leading-relaxed whitespace-pre-wrap select-text pl-2 border-l border-rose-500/20 font-sans">
                          {session.evaluation.weaknesses}
                        </div>
                      </div>
                      <div>
                        <h5 className="font-bold text-indigo-400 mb-1">Recommendations & Optimization Guidelines</h5>
                        <div className="text-slate-300 text-xs leading-relaxed whitespace-pre-wrap select-text pl-2 border-l border-indigo-500/20 font-sans">
                          {session.evaluation.recommendations}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : submitting ? (
                  <div className="flex flex-col items-center justify-center text-indigo-400 py-12">
                    <RefreshCw className="w-8 h-8 animate-spin mb-3" />
                    <span className="text-xs font-bold">Submitting and generating AI reviews via Gemini...</span>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs py-8">
                    <Sparkles className="w-8 h-8 mb-2 text-slate-650" />
                    <p>Submit your final solution to receive an AI critique and code grades.</p>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default CodingWorkspace;
