import { LayoutDashboard, BookOpen, Clock, FileText, User, BarChart3, Briefcase, Code } from 'lucide-react';
import { ROUTES } from '@/routes';

export interface NavigationItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    name: 'Dashboard',
    path: ROUTES.DASHBOARD,
    icon: LayoutDashboard,
  },
  {
    name: 'Questions',
    path: ROUTES.QUESTIONS,
    icon: BookOpen,
  },
  {
    name: 'Coding Challenges',
    path: ROUTES.CODING_PROBLEMS,
    icon: Code,
  },
  {
    name: 'Interviews',
    path: ROUTES.INTERVIEWS,
    icon: Clock,
  },
  {
    name: 'Submissions',
    path: ROUTES.SUBMISSIONS,
    icon: FileText,
  },
  {
    name: 'Analytics',
    path: ROUTES.ANALYTICS,
    icon: BarChart3,
  },
  {
    name: 'Resume Analyzer',
    path: ROUTES.RESUME,
    icon: Briefcase,
  },
  {
    name: 'Profile',
    path: ROUTES.PROFILE,
    icon: User,
  },
];
