import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProblems, createSession, CodingProblem } from '@/services/coding.service';
import { Play, Code, BookOpen, Clock, AlertCircle } from 'lucide-react';

export const CodingProblems: React.FC = () => {
  const [problems, setProblems] = useState<CodingProblem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedTopic, setSelectedTopic] = useState<string>('ALL');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('ALL');

  // Language Modal State
  const [showLangModal, setShowLangModal] = useState(false);
  const [activeProblem, setActiveProblem] = useState<CodingProblem | null>(null);
  const [selectedLang, setSelectedLang] = useState<string>('python');
  const [creatingSession, setCreatingSession] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        setLoading(true);
        const data = await getProblems();
        setProblems(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load coding problems');
      } finally {
        setLoading(false);
      }
    };
    fetchProblems();
  }, []);

  const handleStartChallenge = (problem: CodingProblem) => {
    setActiveProblem(problem);
    setShowLangModal(true);
  };

  const handleConfirmStart = async () => {
    if (!activeProblem) return;
    try {
      setCreatingSession(true);
      const session = await createSession(activeProblem.id, selectedLang);
      setShowLangModal(false);
      navigate(`/coding/workspace/${session.id}`);
    } catch (err: any) {
      alert(err.message || 'Failed to start coding session');
    } finally {
      setCreatingSession(false);
    }
  };

  // Filter logic
  const filteredProblems = problems.filter(p => {
    const topicMatch = selectedTopic === 'ALL' || p.topic === selectedTopic;
    const diffMatch = selectedDifficulty === 'ALL' || p.difficulty === selectedDifficulty;
    return topicMatch && diffMatch;
  });

  const topics = ['ALL', 'ARRAYS', 'STRINGS', 'HASHING', 'LINKED_LISTS', 'TREES', 'GRAPHS', 'DYNAMIC_PROGRAMMING', 'GREEDY', 'SQL'];
  const difficulties = ['ALL', 'EASY', 'MEDIUM', 'HARD'];

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

  const formatTopicName = (t: string) => {
    return t.replace('_', ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
        <p className="text-sm font-medium">Loading coding challenges...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-md mx-auto text-center px-4">
        <AlertCircle className="w-16 h-16 text-rose-500 mb-4" />
        <h3 className="text-xl font-bold text-slate-200 mb-2">Failed to load challenges</h3>
        <p className="text-slate-400 text-sm mb-6">{error}</p>
        <button onClick={() => window.location.reload()} className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold transition-all">
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800/80 backdrop-blur-md">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Coding Challenges
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Hone your data structures, algorithms, and SQL capabilities with our sandbox compiler and AI review engine.
          </p>
        </div>
      </div>

      {/* Filter panel */}
      <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-800/80 backdrop-blur-sm space-y-4">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Filter by Topic</label>
          <div className="flex flex-wrap gap-2">
            {topics.map(t => (
              <button
                key={t}
                onClick={() => setSelectedTopic(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  selectedTopic === t
                    ? 'bg-indigo-600/20 text-indigo-400 border-indigo-500/40 shadow-lg shadow-indigo-500/10'
                    : 'bg-slate-850/60 text-slate-400 border-slate-800/50 hover:bg-slate-800/50'
                }`}
              >
                {t === 'ALL' ? 'All Topics' : formatTopicName(t)}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Filter by Difficulty</label>
          <div className="flex flex-wrap gap-2">
            {difficulties.map(d => (
              <button
                key={d}
                onClick={() => setSelectedDifficulty(d)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  selectedDifficulty === d
                    ? 'bg-indigo-600/20 text-indigo-400 border-indigo-500/40 shadow-lg shadow-indigo-500/10'
                    : 'bg-slate-850/60 text-slate-400 border-slate-800/50 hover:bg-slate-800/50'
                }`}
              >
                {d === 'ALL' ? 'All Difficulties' : formatTopicName(d)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Challenges list */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProblems.map(p => (
          <div
            key={p.id}
            className="flex flex-col bg-slate-900/40 rounded-2xl border border-slate-800/80 hover:border-slate-700/60 transition-all duration-300 p-6 backdrop-blur-sm group"
          >
            <div className="flex justify-between items-start gap-4 mb-4">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase border ${getDifficultyColor(p.difficulty)}`}>
                {p.difficulty}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700/50">
                {formatTopicName(p.topic)}
              </span>
            </div>

            <h3 className="text-lg font-bold text-slate-200 group-hover:text-indigo-400 transition-colors mb-2 line-clamp-1">
              {p.title}
            </h3>

            <p className="text-slate-400 text-sm line-clamp-3 mb-6 flex-grow">
              {p.description.replace(/[`#_*[\]()]/g, '')}
            </p>

            <div className="flex justify-between items-center pt-4 border-t border-slate-800/60 mt-auto">
              <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                <Clock className="w-3.5 h-3.5" />
                <span>20 mins</span>
              </div>

              <button
                onClick={() => handleStartChallenge(p)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20 transition-all cursor-pointer"
              >
                <Play className="w-3 h-3 fill-current" />
                Solve
              </button>
            </div>
          </div>
        ))}

        {filteredProblems.length === 0 && (
          <div className="col-span-full py-12 flex flex-col items-center justify-center text-slate-500">
            <BookOpen className="w-12 h-12 mb-3 text-slate-600" />
            <p className="text-sm font-medium">No challenges matching filter criteria</p>
          </div>
        )}
      </div>

      {/* Language Selection Modal */}
      {showLangModal && activeProblem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800/80 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-800/60">
              <h3 className="text-xl font-bold text-slate-200">Select Sandbox Language</h3>
              <p className="text-slate-400 text-xs mt-1">
                Choose the language you wish to solve <strong className="text-slate-300">{activeProblem.title}</strong> in.
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'python', name: 'Python 3', icon: '🐍' },
                  { id: 'javascript', name: 'JavaScript', icon: '🟨' },
                  { id: 'java', name: 'Java', icon: '☕' },
                ].map(l => (
                  <button
                    key={l.id}
                    onClick={() => setSelectedLang(l.id)}
                    className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border text-sm font-semibold transition-all ${
                      selectedLang === l.id
                        ? 'bg-indigo-600/10 text-indigo-400 border-indigo-500/50'
                        : 'bg-slate-850 hover:bg-slate-800 text-slate-300 border-slate-800'
                    }`}
                  >
                    <span className="text-2xl">{l.icon}</span>
                    <span>{l.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 bg-slate-900/50 border-t border-slate-800/60">
              <button
                disabled={creatingSession}
                onClick={() => setShowLangModal(false)}
                className="px-4 py-2 bg-slate-805 hover:bg-slate-800 text-slate-400 hover:text-slate-350 rounded-lg text-xs font-semibold transition-all border border-slate-800"
              >
                Cancel
              </button>
              <button
                disabled={creatingSession}
                onClick={handleConfirmStart}
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white rounded-lg text-xs font-semibold shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20 transition-all"
              >
                {creatingSession ? 'Starting...' : 'Launch Workspace'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default CodingProblems;
