import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Sparkles } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  // Support boot loading/splash screen before deciding redirect path
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4">
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 rounded-full border-t-2 border-emerald-500 animate-spin"></div>
          <Sparkles className="absolute w-6 h-6 text-emerald-400 animate-pulse" />
        </div>
        <div className="space-y-1 text-center">
          <h2 className="text-sm font-semibold text-slate-200">Verifying session...</h2>
          <p className="text-xs text-slate-500">Securing your interview workspace</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
