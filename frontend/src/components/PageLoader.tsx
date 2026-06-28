import React from 'react';
import { Loader2 } from 'lucide-react';

export const PageLoader: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] w-full py-12 space-y-4 animate-in fade-in duration-300">
      <div className="relative">
        <div className="absolute inset-0 bg-indigo-500 rounded-full blur-xl opacity-20 animate-pulse" />
        <Loader2 className="w-12 h-12 text-indigo-650 dark:text-indigo-400 animate-spin relative" style={{ color: '#4f46e5' }} />
      </div>
      <p className="text-slate-500 dark:text-slate-400 font-medium text-sm animate-pulse">
        Loading workspace assets...
      </p>
    </div>
  );
};
export default PageLoader;
