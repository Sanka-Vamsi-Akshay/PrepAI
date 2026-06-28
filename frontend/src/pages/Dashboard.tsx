import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { BrainCircuit, Video, Target, Flame, RefreshCw, Play, Loader2 } from 'lucide-react';
import { StatCard } from '@/components/StatCard';
import { RecentActivity } from '@/components/RecentActivity';
import { UpcomingInterviews } from '@/components/UpcomingInterviews';
import { SkeletonCard } from '@/components/Skeleton';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/services/api';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSimulatingLoad, setIsSimulatingLoad] = useState(false);

  // Quick Start Practice run mutation
  const quickStartMutation = useMutation({
    mutationFn: async () => {
      const response = await apiClient.post('/interviews/quick-start');
      return response.data.data.session;
    },
    onSuccess: (session) => {
      navigate(`/interviews/workspace/${session.id}`);
    },
    onError: (err: any) => {
      alert(err.message || 'Failed to start quick practice run.');
    },
  });

  const handleQuickStart = () => {
    quickStartMutation.mutate();
  };

  // Trigger loading state for 1.5 seconds when requested
  const triggerSimulation = () => {
    setIsSimulatingLoad(true);
    setTimeout(() => {
      setIsSimulatingLoad(false);
    }, 1500);
  };

  // Mock Queries data
  const stats = [
    {
      title: 'Questions Solved',
      value: '47 / 150',
      icon: BrainCircuit,
      trend: { value: '+12 this week', direction: 'up' as const },
      colorClass: 'from-emerald-500 to-teal-500',
    },
    {
      title: 'Interviews Completed',
      value: '12 sessions',
      icon: Video,
      trend: { value: '+2 sessions', direction: 'up' as const },
      colorClass: 'from-blue-500 to-indigo-500',
    },
    {
      title: 'Success Rate',
      value: '82%',
      icon: Target,
      trend: { value: '-1.5% from last run', direction: 'down' as const },
      colorClass: 'from-amber-500 to-orange-500',
    },
    {
      title: 'Study Streak',
      value: '6 days',
      icon: Flame,
      trend: { value: 'Keep it up!', direction: 'neutral' as const },
      colorClass: 'from-fuchsia-500 to-pink-500',
    },
  ];

  const mockActivities = [
    { id: '1', question: 'Two Sum', type: 'Coding', date: '2 hours ago', score: 88 },
    { id: '2', question: 'Tell me about yourself', type: 'Behavioral', date: '1 day ago', score: 94 },
    { id: '3', question: 'Validate Binary Search Tree', type: 'Coding', date: '3 days ago', score: 62 },
  ];

  const mockInterviews = [
    { id: '1', title: 'System Design: Cache Architecture', date: 'June 25, 2:00 PM', status: 'SCHEDULED' as const },
    { id: '2', title: 'Behavioral Prep: Leadership', date: 'Active Now', status: 'IN_PROGRESS' as const },
  ];

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-6 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border border-slate-200 dark:border-emerald-500/15">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-100 mb-1">
            Welcome back, {user?.name || 'Candidate'}!
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm">
            Simulate mock interviews, study technical questions, and get detailed AI feedback reports.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleQuickStart}
            disabled={quickStartMutation.isPending}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-800 text-slate-950 dark:text-slate-900 text-xs font-bold rounded-lg transition-all cursor-pointer shadow-sm shadow-emerald-500/20"
          >
            {quickStartMutation.isPending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-slate-950 dark:fill-slate-900" /> Quick Start Practice
              </>
            )}
          </button>

          <button
            onClick={triggerSimulation}
            className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-650 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSimulatingLoad ? 'animate-spin' : ''}`} />
            Simulate Load
          </button>
        </div>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, idx) =>
          isSimulatingLoad ? (
            <SkeletonCard key={idx} />
          ) : (
            <StatCard
              key={idx}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              trend={stat.trend}
              colorClass={stat.colorClass}
            />
          )
        )}
      </div>

      {/* Main widgets sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Recent Activity Widget */}
        <div className="lg:col-span-2">
          <RecentActivity activities={mockActivities} isLoading={isSimulatingLoad} />
        </div>

        {/* Right Side: Upcoming Interviews Widget */}
        <div className="lg:col-span-1">
          <UpcomingInterviews interviews={mockInterviews} isLoading={isSimulatingLoad} />
        </div>
      </div>
    </div>
  );
};
export default Dashboard;
