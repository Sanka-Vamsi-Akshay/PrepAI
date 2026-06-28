import React from 'react';
import { SkeletonLine } from '@/components/Skeleton';
import { Sparkles, Trophy, AlertTriangle, Compass, Target } from 'lucide-react';

interface InsightCardProps {
  strongestTopic: string | null;
  weakestTopic: string | null;
  suggestedNextTopic: string | null;
  recommendedFocusArea: string | null;
  isLoading?: boolean;
}

export const InsightCard: React.FC<InsightCardProps> = ({
  strongestTopic,
  weakestTopic,
  suggestedNextTopic,
  recommendedFocusArea,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4 animate-pulse shadow-sm">
        <SkeletonLine width="w-32" height="h-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="p-4 bg-slate-50 dark:bg-slate-850 rounded-lg space-y-2">
              <SkeletonLine width="w-24" height="h-3" />
              <SkeletonLine width="w-full" height="h-4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const items = [
    {
      title: 'Strongest Topic',
      value: strongestTopic || 'N/A',
      icon: Trophy,
      color: 'text-emerald-500 bg-emerald-500/10',
      description: 'You have shown high rating scores in this technical field.',
    },
    {
      title: 'Weakest Topic',
      value: weakestTopic || 'N/A',
      icon: AlertTriangle,
      color: 'text-amber-500 bg-amber-500/10',
      description: 'Rating scores indicate focused practice is recommended here.',
    },
    {
      title: 'Suggested Next Topic',
      value: suggestedNextTopic || 'N/A',
      icon: Compass,
      color: 'text-blue-500 bg-blue-500/10',
      description: 'Expand your coverage by practicing this topic next.',
    },
    {
      title: 'Recommended Focus Area',
      value: recommendedFocusArea || 'Practice more to see focus area suggestions.',
      icon: Target,
      color: 'text-indigo-500 bg-indigo-500/10',
      description: 'Work on this rubric parameter to boost overall scores.',
      fullWidth: true,
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm shadow-slate-100 dark:shadow-none space-y-5">
      <div className="flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-emerald-500 animate-pulse" />
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
          AI Preparation Insights
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div 
              key={item.title} 
              className={`p-4 rounded-xl border border-slate-150 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 flex gap-4 ${
                item.fullWidth ? 'md:col-span-2' : ''
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-450 dark:text-slate-500 tracking-wider">
                  {item.title}
                </span>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-snug">
                  {item.value}
                </p>
                <span className="text-[10px] text-slate-500 dark:text-slate-450 block">
                  {item.description}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default InsightCard;
