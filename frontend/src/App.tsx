import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { PageLoader } from '@/components/PageLoader';

// Lazy load page components to improve bundle splitting
const Dashboard = lazy(() => import('@/pages/Dashboard').then(m => ({ default: m.Dashboard })));
const Questions = lazy(() => import('@/pages/Questions').then(m => ({ default: m.Questions })));
const QuestionDetails = lazy(() => import('@/pages/QuestionDetails').then(m => ({ default: m.QuestionDetails })));
const Interviews = lazy(() => import('@/pages/Interviews').then(m => ({ default: m.Interviews })));
const InterviewDetails = lazy(() => import('@/pages/InterviewDetails').then(m => ({ default: m.InterviewDetails })));
const InterviewWorkspace = lazy(() => import('@/pages/InterviewWorkspace').then(m => ({ default: m.InterviewWorkspace })));
const Submissions = lazy(() => import('@/pages/Submissions').then(m => ({ default: m.Submissions })));
const SubmissionDetails = lazy(() => import('@/pages/SubmissionDetails').then(m => ({ default: m.SubmissionDetails })));
const Profile = lazy(() => import('@/pages/Profile').then(m => ({ default: m.Profile })));
const Login = lazy(() => import('@/pages/Login').then(m => ({ default: m.Login })));
const Register = lazy(() => import('@/pages/Register').then(m => ({ default: m.Register })));
const Analytics = lazy(() => import('@/pages/Analytics').then(m => ({ default: m.Analytics })));
const ResumeAnalyzer = lazy(() => import('@/pages/ResumeAnalyzer').then(m => ({ default: m.ResumeAnalyzer })));
const CodingProblems = lazy(() => import('@/pages/CodingProblems').then(m => ({ default: m.CodingProblems })));
const CodingWorkspace = lazy(() => import('@/pages/CodingWorkspace').then(m => ({ default: m.CodingWorkspace })));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <ThemeProvider>
          <AuthProvider>
            <BrowserRouter>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  {/* Public Auth Routes */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />

                  {/* Protected Dashboard Workspace */}
                  <Route
                    path="/"
                    element={
                      <ProtectedRoute>
                        <DashboardLayout />
                      </ProtectedRoute>
                    }
                  >
                    <Route index element={<Dashboard />} />
                    <Route path="questions" element={<Questions />} />
                    <Route path="questions/:id" element={<QuestionDetails />} />
                    <Route path="coding/problems" element={<CodingProblems />} />
                    <Route path="coding/workspace/:id" element={<CodingWorkspace />} />
                    <Route path="interviews" element={<Interviews />} />
                    <Route path="interviews/:id" element={<InterviewDetails />} />
                    <Route path="interviews/workspace/:id" element={<InterviewWorkspace />} />
                    <Route path="submissions" element={<Submissions />} />
                    <Route path="submissions/:id" element={<SubmissionDetails />} />
                    <Route path="analytics" element={<Analytics />} />
                    <Route path="resume" element={<ResumeAnalyzer />} />
                    <Route path="profile" element={<Profile />} />
                  </Route>

                  {/* Wildcard Fallback */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </AuthProvider>
        </ThemeProvider>
      </ErrorBoundary>
    </QueryClientProvider>
  );
};
export default App;
