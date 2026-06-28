/**
 * Formats an ISO date string into a clean, human-readable format.
 */
export const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date);
  } catch (error) {
    return dateString;
  }
};

/**
 * Returns CSS classes for highlighting question difficulties.
 */
export const getDifficultyStyles = (difficulty: 'EASY' | 'MEDIUM' | 'HARD'): string => {
  switch (difficulty) {
    case 'EASY':
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    case 'MEDIUM':
      return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    case 'HARD':
      return 'bg-red-500/10 text-red-400 border-red-500/20';
    default:
      return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  }
};
