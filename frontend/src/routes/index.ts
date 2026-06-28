export const ROUTES = {
  DASHBOARD: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  QUESTIONS: '/questions',
  INTERVIEWS: '/interviews',
  SUBMISSIONS: '/submissions',
  PROFILE: '/profile',
  ANALYTICS: '/analytics',
  RESUME: '/resume',
  CODING_PROBLEMS: '/coding/problems',
  CODING_WORKSPACE: '/coding/workspace/:id',
} as const;

export type RouteKeys = keyof typeof ROUTES;
export type RoutePaths = typeof ROUTES[RouteKeys];
