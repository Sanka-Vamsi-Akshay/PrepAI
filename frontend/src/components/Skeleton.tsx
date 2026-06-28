import React from 'react';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => {
  return (
    <div
      className={`animate-pulse bg-slate-200 dark:bg-slate-800 rounded-lg ${className}`}
    />
  );
};

export const SkeletonCircle: React.FC<SkeletonProps> = ({ className = '' }) => {
  return <Skeleton className={`rounded-full ${className}`} />;
};

export const SkeletonLine: React.FC<SkeletonProps & { width?: string; height?: string }> = ({
  className = '',
  width = 'w-full',
  height = 'h-4',
}) => {
  return <Skeleton className={`${width} ${height} ${className}`} />;
};

export const SkeletonCard: React.FC = () => {
  return (
    <div className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4">
      <div className="flex justify-between items-start">
        <SkeletonLine width="w-24" height="h-3" />
        <SkeletonCircle className="w-8 h-8" />
      </div>
      <SkeletonLine width="w-16" height="h-7" />
      <SkeletonLine width="w-32" height="h-3" />
    </div>
  );
};
