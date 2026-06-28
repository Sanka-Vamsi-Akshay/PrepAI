import React, { useState } from 'react';
import { Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { useCreateInterview } from '@/hooks/useInterviews';
import { useNavigate, Link } from 'react-router-dom';

interface InterviewSetupFormProps {
  onClose: () => void;
}

const DOMAINS = [
  { value: 'JAVA', label: 'Java Development' },
  { value: 'PYTHON', label: 'Python Development' },
  { value: 'DSA', label: 'Algorithms & Data Structures (DSA)' },
  { value: 'SQL', label: 'Database Design & SQL' },
  { value: 'SYSTEM_DESIGN', label: 'System Design & Architecture' },
  { value: 'BEHAVIORAL', label: 'Behavioral Screener (STAR method)' },
  { value: 'FRONTEND', label: 'Frontend Engineering' },
  { value: 'BACKEND', label: 'Backend Engineering' },
  { value: 'FULL_STACK', label: 'Full Stack Engineering' },
];

const DIFFICULTIES = [
  { value: 'EASY', label: 'Easy (Junior / Associate)' },
  { value: 'EASY_MEDIUM', label: 'Easy-Medium' },
  { value: 'MEDIUM', label: 'Medium (Mid-level / Senior)' },
  { value: 'MEDIUM_HARD', label: 'Medium-Hard' },
  { value: 'HARD', label: 'Hard (Staff / Principal)' },
];

const COMPANY_DIFFICULTY_MAP: Record<string, string> = {
  GOOGLE: 'HARD',
  META: 'HARD',
  AMAZON: 'MEDIUM_HARD',
  MICROSOFT: 'MEDIUM_HARD',
  STARTUP: 'MEDIUM',
  ACCENTURE: 'EASY_MEDIUM',
  TCS: 'EASY',
  INFOSYS: 'EASY',
  WIPRO: 'EASY',
};

import { useResumes } from '@/hooks/useResumes';

export const InterviewSetupForm: React.FC<InterviewSetupFormProps> = ({ onClose }) => {
  const [domain, setDomain] = useState('DSA');
  const [difficulty, setDifficulty] = useState('MEDIUM');
  const [companyProfile, setCompanyProfile] = useState('');
  const [useResumeContext, setUseResumeContext] = useState(false);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [error, setError] = useState<string | null>(null);

  const createMutation = useCreateInterview();
  const navigate = useNavigate();

  const handleCompanyChange = (val: string) => {
    setCompanyProfile(val);
    if (val && COMPANY_DIFFICULTY_MAP[val]) {
      setDifficulty(COMPANY_DIFFICULTY_MAP[val]);
    }
  };
  const { data: resumes = [], isLoading: isResumesLoading } = useResumes();

  // Auto-select latest resume
  React.useEffect(() => {
    if (resumes.length > 0 && !selectedResumeId) {
      setSelectedResumeId(resumes[0].id);
    }
  }, [resumes, selectedResumeId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (useResumeContext && !selectedResumeId) {
      setError('Please upload or select a resume to start a personalized interview.');
      return;
    }

    try {
      const session = await createMutation.mutateAsync({
        domain,
        difficulty,
        interviewType: useResumeContext ? 'PERSONALIZED' : 'STANDARD',
        resumeId: useResumeContext ? selectedResumeId : null,
        companyProfile: companyProfile || null,
      });
      onClose();
      // Redirect to active workspace simulator
      navigate(`/interviews/workspace/${session.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to generate interview. Check connection.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Select Domain */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-500">Interview Domain</label>
        <select
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg p-2.5 text-xs text-slate-800 dark:text-slate-205 outline-none focus:border-emerald-500"
        >
          {DOMAINS.map((dom) => (
            <option key={dom.value} value={dom.value}>
              {dom.label}
            </option>
          ))}
        </select>
      </div>

      {/* Select Company Profile */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-500">Company Target (Optional)</label>
        <select
          value={companyProfile}
          onChange={(e) => handleCompanyChange(e.target.value)}
          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg p-2.5 text-xs text-slate-800 dark:text-slate-205 outline-none focus:border-emerald-500"
        >
          <option value="">None (Standard Interview)</option>
          <option value="GOOGLE">Google (DSA, System Design)</option>
          <option value="AMAZON">Amazon (Leadership principles, DSA)</option>
          <option value="MICROSOFT">Microsoft (Design, Collaboration, Coding)</option>
          <option value="META">Meta (Coding speed, Product Thinking)</option>
          <option value="TCS">TCS (Fundamentals, HR questions)</option>
          <option value="INFOSYS">Infosys (Fundamentals, Aptitude)</option>
          <option value="WIPRO">Wipro (Fundamentals, Aptitude)</option>
          <option value="ACCENTURE">Accenture (Fundamentals, Aptitude)</option>
          <option value="STARTUP">Startup (MVP delivery, Debugging)</option>
        </select>
      </div>

      {/* Select Difficulty */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-500">Target Difficulty</label>
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg p-2.5 text-xs text-slate-800 dark:text-slate-205 outline-none focus:border-emerald-500"
        >
          {DIFFICULTIES.map((diff) => (
            <option key={diff.value} value={diff.value}>
              {diff.label}
            </option>
          ))}
        </select>
      </div>

      {/* Use Resume Context Toggle */}
      <div className="pt-2 space-y-3">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="useResumeContext"
            checked={useResumeContext}
            onChange={(e) => setUseResumeContext(e.target.checked)}
            className="w-3.5 h-3.5 accent-emerald-500 cursor-pointer rounded"
          />
          <label htmlFor="useResumeContext" className="text-xs font-bold text-slate-700 dark:text-slate-350 cursor-pointer select-none">
            Use Resume Context (Personalized Coach)
          </label>
        </div>

        {useResumeContext && (
          <div className="space-y-1.5 animate-fadeIn">
            <label className="text-[10px] font-semibold text-slate-450 dark:text-slate-500 uppercase tracking-wider block">
              Select Resume Profile
            </label>
            {isResumesLoading ? (
              <div className="text-[10px] text-slate-450 italic">Loading resumes list...</div>
            ) : resumes.length === 0 ? (
              <div className="p-3 border border-yellow-500/20 bg-yellow-500/5 rounded-lg text-[10px] text-yellow-600 dark:text-yellow-450 leading-normal">
                No resumes uploaded. Please upload a resume first under the{' '}
                <Link to="/resume" onClick={onClose} className="underline font-bold hover:text-emerald-500">
                  Resume Analyzer
                </Link>{' '}
                page to generate personalized coach runs.
              </div>
            ) : (
              <select
                value={selectedResumeId}
                onChange={(e) => setSelectedResumeId(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg p-2.5 text-xs text-slate-800 dark:text-slate-205 outline-none focus:border-emerald-500"
              >
                {resumes.map((res) => (
                  <option key={res.id} value={res.id}>
                    {res.fileName} ({new Date(res.createdAt).toLocaleDateString()})
                  </option>
                ))}
              </select>
            )}
          </div>
        )}
      </div>

      {/* Action triggers */}
      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-850">
        <button
          type="button"
          onClick={onClose}
          disabled={createMutation.isPending}
          className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-650 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-855"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={createMutation.isPending || (useResumeContext && resumes.length === 0)}
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:text-slate-500 dark:disabled:text-slate-600 disabled:cursor-not-allowed text-slate-950 dark:text-slate-900 text-xs font-bold rounded-lg transition-colors cursor-pointer"
        >
          {createMutation.isPending ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Generating Questions...
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" /> Start Simulation
            </>
          )}
        </button>
      </div>

    </form>
  );
};
export default InterviewSetupForm;
