import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  UploadCloud, 
  Trash2, 
  Award, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Calendar, 
  Briefcase, 
  BookOpen, 
  ChevronRight,
  Info
} from 'lucide-react';
import { 
  useResumes, 
  useResume, 
  useResumeGapAnalysis, 
  useUploadResume, 
  useDeleteResume, 
  ResumeData 
} from '@/hooks/useResumes';

export const ResumeAnalyzer: React.FC = () => {
  const { data: resumes = [], isLoading: isListLoading, refetch: refetchList } = useResumes();
  const uploadMutation = useUploadResume();
  const deleteMutation = useDeleteResume();

  // Active selected resume ID on the frontend (defaults to latest upload)
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
  
  // Selected domain for gap analysis
  const [selectedDomain, setSelectedDomain] = useState<string>('FRONTEND');

  // Drag-and-drop visual states
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Tab state in parsed details viewer
  const [activeTab, setActiveTab] = useState<'experience' | 'projects' | 'education' | 'certifications'>('experience');

  // Set default selected ID when resumes list loads
  useEffect(() => {
    if (resumes.length > 0 && !selectedId) {
      setSelectedId(resumes[0].id);
    }
  }, [resumes, selectedId]);

  // Fetch active resume details
  const { data: resume, isLoading: isResumeLoading } = useResume(selectedId);

  // Fetch domain gap analysis details
  const { data: gapAnalysis, isLoading: isGapLoading } = useResumeGapAnalysis(selectedId, selectedDomain);

  // Handle Drag Over
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  // Handle Drag Leave
  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  // Simulate file upload progress
  const startProgressSimulation = (callback: () => void) => {
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev === null) return 0;
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 10;
      });
    }, 150);

    return () => {
      clearInterval(interval);
      setUploadProgress(100);
      setTimeout(() => setUploadProgress(null), 500);
      callback();
    };
  };

  // Upload Resume handler
  const processUpload = async (file: File) => {
    setUploadError(null);
    
    // File validation: PDF or DOCX and <= 5MB
    const allowedExtensions = ['.pdf', '.docx'];
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    const isValidExt = allowedExtensions.includes(ext);
    
    if (!isValidExt) {
      setUploadError('Unsupported file type. Only PDF and DOCX files are allowed.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File size exceeds the 5MB limit.');
      return;
    }

    const completeProgress = startProgressSimulation(async () => {
      try {
        const formData = new FormData();
        formData.append('resume', file);
        
        const newResume = await uploadMutation.mutateAsync(formData);
        setSelectedId(newResume.id);
        refetchList();
      } catch (err: any) {
        setUploadError(err.message || 'Failed to upload and parse resume.');
      }
    });

    // Simulate completion
    setTimeout(() => {
      completeProgress();
    }, 1000);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processUpload(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processUpload(file);
    }
  };

  // Delete resume profile handler
  const handleDeleteResume = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this resume? This cannot be undone.')) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(id);
      
      // If we deleted the active resume, pick the next available one
      const remaining = resumes.filter((r) => r.id !== id);
      if (remaining.length > 0) {
        setSelectedId(remaining[0].id);
      } else {
        setSelectedId(undefined);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete resume.');
    }
  };

  // Compute color styles for radial strength gauge
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-500 stroke-emerald-500';
    if (score >= 60) return 'text-amber-500 stroke-amber-500';
    return 'text-rose-500 stroke-rose-500';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-500/10 border-emerald-500/20';
    if (score >= 60) return 'bg-amber-500/10 border-amber-500/20';
    return 'bg-rose-500/10 border-rose-500/20';
  };

  const isUploading = uploadMutation.isPending || uploadProgress !== null;

  return (
    <div className="space-y-6 md:space-y-8 max-w-7xl mx-auto">
      
      {/* Welcome & Info */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-100">Resume Analyzer</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Upload your resume in PDF or DOCX formats to extract skills, evaluate profile strength, identify domain gaps, and build learning roadmaps.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Hand: Upload Deck & Selector */}
        <div className="space-y-6 lg:col-span-1">
          
          {/* Uploader Box */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4 shadow-sm shadow-slate-100 dark:shadow-none">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Upload Resume</h3>
            
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer relative flex flex-col items-center justify-center min-h-48 ${
                isDragOver
                  ? 'border-emerald-500 bg-emerald-500/5'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700 bg-transparent'
              }`}
            >
              <input
                type="file"
                id="resume-file-picker"
                onChange={handleFileChange}
                disabled={isUploading}
                accept=".pdf,.docx"
                className="hidden"
              />
              <label htmlFor="resume-file-picker" className="cursor-pointer w-full flex flex-col items-center gap-3">
                <UploadCloud className="w-10 h-10 text-slate-400 dark:text-slate-650" />
                
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-750 dark:text-slate-300">
                    Drag and drop or <span className="text-emerald-500">browse</span>
                  </p>
                  <p className="text-[10px] text-slate-500">Supports PDF & DOCX (Max 5MB)</p>
                </div>
              </label>

              {/* Progress Overlay */}
              {isUploading && (
                <div className="absolute inset-0 bg-slate-950/80 rounded-xl flex flex-col items-center justify-center p-4 space-y-3 z-10">
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-emerald-500 h-full rounded-full transition-all duration-150"
                      style={{ width: `${uploadProgress || 50}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider animate-pulse">
                    Extracting & Analyzing Resume...
                  </p>
                </div>
              )}
            </div>

            {/* Error notifications */}
            {uploadError && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-[10px] text-red-550 dark:text-red-400">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}
          </div>

          {/* Selector Dropdown / Resumes list */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4 shadow-sm shadow-slate-100 dark:shadow-none">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Select Profile</h3>
            
            {resumes.length === 0 ? (
              <p className="text-[10px] text-slate-500 italic text-center py-4">No resumes uploaded yet. Upload one to start analysis.</p>
            ) : (
              <div className="space-y-2">
                <label className="text-[10px] font-semibold text-slate-500 uppercase">Active Resume</label>
                <select
                  value={selectedId || ''}
                  onChange={(e) => setSelectedId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg px-3 py-2 text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-emerald-500 cursor-pointer"
                >
                  {resumes.map((r, idx) => (
                    <option key={r.id} value={r.id}>
                      {r.fileName} {idx === 0 ? '(Latest/Default)' : ''}
                    </option>
                  ))}
                </select>

                {/* Profiles Checklist navigator */}
                <div className="pt-2 divide-y divide-slate-150 dark:divide-slate-850 max-h-48 overflow-y-auto">
                  {resumes.map((r) => (
                    <div
                      key={r.id}
                      onClick={() => setSelectedId(r.id)}
                      className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all ${
                        selectedId === r.id
                          ? 'bg-slate-50 dark:bg-slate-850/50'
                          : 'bg-transparent hover:bg-slate-50/50 dark:hover:bg-slate-880/20'
                      }`}
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <FileText className={`w-3.5 h-3.5 shrink-0 ${selectedId === r.id ? 'text-emerald-500' : 'text-slate-400'}`} />
                        <span className="text-[10px] font-medium text-slate-700 dark:text-slate-350 truncate max-w-40">
                          {r.fileName}
                        </span>
                      </div>
                      <button
                        onClick={(e) => handleDeleteResume(r.id, e)}
                        disabled={deleteMutation.isPending}
                        className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-400 hover:text-red-500 transition-colors"
                        title="Delete Profile"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Right Hand: Resume Insights & Parsed details */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* If loading state active */}
          {isResumeLoading && selectedId && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center flex flex-col items-center justify-center gap-3">
              <UploadCloud className="w-8 h-8 text-emerald-500 animate-bounce" />
              <p className="text-xs text-slate-500 animate-pulse">Running resume intelligence analysis...</p>
            </div>
          )}

          {/* If no resume profile active */}
          {!selectedId && !isResumeLoading && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center space-y-3">
              <FileText className="w-12 h-12 text-slate-400 dark:text-slate-650 mx-auto" />
              <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">No Active Resume Profile</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Drag and drop your technical resume inside the upload zone to parse and unlock personalized insights.
              </p>
            </div>
          )}

          {/* Active resume details view */}
          {resume && !isResumeLoading && (
            <>
              {/* Profile Overview: Score Gauge + Strongest/Weakest Areas */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Radial Gauge */}
                <div className={`md:col-span-1 flex flex-col items-center justify-center p-5 border rounded-xl shadow-sm dark:shadow-none ${getScoreBgColor(resume.insights.strengthScore)}`}>
                  <span className="text-[10px] uppercase font-bold text-slate-550 dark:text-slate-400 mb-4">Strength Score</span>
                  
                  <div className="relative w-28 h-28 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-slate-200 dark:text-slate-800"
                        strokeWidth="3"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className={`transition-all duration-500 ${getScoreColor(resume.insights.strengthScore)}`}
                        strokeWidth="3"
                        strokeDasharray={`${resume.insights.strengthScore}, 100`}
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center">
                      <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">{resume.insights.strengthScore}</span>
                      <span className="text-[8px] text-slate-500 font-semibold uppercase">Grade</span>
                    </div>
                  </div>

                  <span className="text-[9px] text-slate-500 dark:text-slate-450 mt-4 text-center">
                    Based on skill variety, technical sections, and project descriptions.
                  </span>
                </div>

                {/* Strengths & Weaknesses areas list */}
                <div className="md:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col justify-between shadow-sm dark:shadow-none">
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-emerald-500" /> Focus Highlights
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      {/* Strong areas */}
                      <div className="space-y-2">
                        <span className="text-[9px] uppercase font-bold text-emerald-500 block">Strongest Pillars</span>
                        <ul className="space-y-1.5">
                          {resume.insights.strongestAreas.map((area, idx) => (
                            <li key={idx} className="text-xs text-slate-650 dark:text-slate-300 flex items-start gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                              <span>{area}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Weak areas */}
                      <div className="space-y-2">
                        <span className="text-[9px] uppercase font-bold text-rose-500 block">Identified Gaps</span>
                        <ul className="space-y-1.5">
                          {resume.insights.weakestAreas.map((area, idx) => (
                            <li key={idx} className="text-xs text-slate-650 dark:text-slate-300 flex items-start gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 mt-1.5" />
                              <span>{area}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-950 px-3 py-2 rounded-lg border border-slate-150 dark:border-slate-850 mt-4 text-[9px] text-slate-500">
                    <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Focus on Gaps to customize learning pathways in the Missing Skills section.</span>
                  </div>
                </div>

              </div>

              {/* Skills Inventory Section */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4 shadow-sm dark:shadow-none">
                <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Skills Inventory</h3>
                <div className="flex flex-wrap gap-1.5">
                  {resume.insights.skillInventory.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 text-[10px] font-semibold bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-slate-650 dark:text-slate-350"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Missing Skills & Gap analysis section */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4 shadow-sm dark:shadow-none">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-150 dark:border-slate-850 pb-3">
                  <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-500 animate-pulse" /> Skill Gap Analysis
                  </h3>
                  
                  {/* Domain selector dropdown */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-500 font-semibold uppercase">Target Domain:</span>
                    <select
                      value={selectedDomain}
                      onChange={(e) => setSelectedDomain(e.target.value)}
                      className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg px-2 py-1 text-[10px] font-bold text-slate-800 dark:text-slate-250 cursor-pointer"
                    >
                      <option value="FRONTEND">Frontend Web</option>
                      <option value="BACKEND">Backend Systems</option>
                      <option value="FULL_STACK">Full Stack Engineer</option>
                      <option value="DSA">DSA / Algorithms</option>
                      <option value="SQL">Database / SQL</option>
                      <option value="SYSTEM_DESIGN">System Design</option>
                    </select>
                  </div>
                </div>

                {isGapLoading ? (
                  <p className="text-[10px] text-slate-500 italic py-2 animate-pulse">Running gap comparison...</p>
                ) : gapAnalysis?.missingSkills.length === 0 ? (
                  <div className="flex items-center gap-2 text-emerald-500 text-xs font-semibold py-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Fantastic! Your profile aligns completely with the required domain skills.</span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-[10px] text-slate-500">
                      Based on your resume skills and the selected target domain, we recommend adding exposure in the following missing areas:
                    </p>
                    
                    <div className="flex flex-wrap gap-1.5">
                      {gapAnalysis?.missingSkills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 text-[10px] font-semibold bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-lg"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Tabbed Parsed Resume Viewer */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4 shadow-sm dark:shadow-none">
                <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Parsed Data Viewer</h3>
                
                {/* Tab select deck */}
                <div className="flex border-b border-slate-150 dark:border-slate-850 gap-2 overflow-x-auto">
                  {(['experience', 'projects', 'education', 'certifications'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-3 py-2 text-xs font-semibold capitalize border-b-2 transition-all cursor-pointer ${
                        activeTab === tab
                          ? 'border-emerald-500 text-emerald-500'
                          : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-350'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Tab content bodies */}
                <div className="pt-2 min-h-48">
                  {activeTab === 'experience' && (
                    <div className="space-y-4">
                      {resume.parsedData.experience.length === 0 ? (
                        <p className="text-xs text-slate-500 italic">No experience found.</p>
                      ) : (
                        resume.parsedData.experience.map((exp, idx) => (
                          <div key={idx} className="flex gap-4 items-start border-l-2 border-slate-150 dark:border-slate-850 pl-4 py-1 relative">
                            <div className="absolute -left-[6px] top-2 w-2.5 h-2.5 rounded-full bg-emerald-500" />
                            <div className="space-y-1">
                              <div className="flex flex-wrap items-baseline gap-2">
                                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">{exp.role}</h4>
                                <span className="text-[10px] text-slate-400 font-semibold">at {exp.company}</span>
                                <span className="text-[9px] text-slate-500 dark:text-slate-450 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-880 px-2 py-0.5 rounded ml-auto">
                                  {exp.duration}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed pt-1">
                                {exp.description}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {activeTab === 'projects' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {resume.parsedData.projects.length === 0 ? (
                        <p className="text-xs text-slate-500 italic col-span-2">No projects found.</p>
                      ) : (
                        resume.parsedData.projects.map((proj, idx) => (
                          <div key={idx} className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-150 dark:border-slate-850 space-y-2">
                            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-250 flex items-center gap-1">
                              <Briefcase className="w-3.5 h-3.5 text-emerald-500" /> {proj.title}
                            </h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                              {proj.description}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {activeTab === 'education' && (
                    <div className="space-y-3">
                      {resume.parsedData.education.length === 0 ? (
                        <p className="text-xs text-slate-500 italic">No education details found.</p>
                      ) : (
                        resume.parsedData.education.map((edu, idx) => (
                          <div key={idx} className="flex items-center gap-3 bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-150 dark:border-slate-850">
                            <BookOpen className="w-4 h-4 text-emerald-500" />
                            <div>
                              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">{edu.name}</h4>
                              <p className="text-[10px] text-slate-500">{edu.degree} &bull; Graduated {edu.year}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {activeTab === 'certifications' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {resume.parsedData.certifications.length === 0 ? (
                        <p className="text-xs text-slate-500 italic col-span-2">No certifications found.</p>
                      ) : (
                        resume.parsedData.certifications.map((cert, idx) => (
                          <div key={idx} className="flex items-center gap-2 p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-lg text-xs font-semibold text-slate-750 dark:text-slate-350">
                            <Award className="w-4 h-4 text-emerald-500 shrink-0" />
                            <span className="truncate">{cert}</span>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>

              </div>

              {/* Learning Roadmap timeline list */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4 shadow-sm dark:shadow-none">
                <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Suggested Learning Roadmap</h3>
                
                <div className="space-y-4 pt-2">
                  {resume.insights.learningRoadmap.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">No learning milestones suggested.</p>
                  ) : (
                    resume.insights.learningRoadmap.map((milestone, idx) => (
                      <div key={idx} className="flex gap-4 items-start relative pl-6 border-l-2 border-slate-150 dark:border-slate-850 pb-4 last:pb-0">
                        <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-emerald-500 bg-white dark:bg-slate-900 flex items-center justify-center text-[8px] font-bold text-emerald-500">
                          {idx + 1}
                        </div>
                        
                        <div className="space-y-2 -mt-1">
                          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-250">{milestone.title}</h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                            {milestone.description}
                          </p>
                          
                          <div className="flex flex-wrap gap-1">
                            {milestone.skills.map((skill, sIdx) => (
                              <span
                                key={sIdx}
                                className="px-2 py-0.5 text-[9px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/15 rounded"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </>
          )}

        </div>

      </div>

    </div>
  );
};
export default ResumeAnalyzer;
