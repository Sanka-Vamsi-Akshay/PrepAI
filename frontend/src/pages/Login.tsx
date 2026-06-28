import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface LoginFormInputs {
  email: string;
  password: LogFormPassword;
}

type LogFormPassword = string;

export const Login: React.FC = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormInputs>();
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const navigate = useNavigate();

  React.useEffect(() => {
    if (isAuthenticated && !authLoading) {
      navigate('/');
    }
  }, [isAuthenticated, authLoading, navigate]);

  const onSubmit = async (data: LoginFormInputs) => {
    setLoading(true);
    setApiError(null);
    try {
      await login(data);
      navigate('/');
    } catch (err: any) {
      setApiError(err.message || 'Failed to authenticate. Verify credentials or check API server.');
    } finally {
      setLoading(false);
    }
  };

  // Dev mode bypass for local UI sandbox checking
  const handleBypass = () => {
    localStorage.setItem('token', 'mock_dev_token_value');
    // Force a reload or update state to let AuthGuard pass in dev.
    // In our cookie architecture, we will write a mock token to document.cookie
    document.cookie = "token=mock_dev_token_value; path=/;";
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-6 shadow-xl shadow-slate-950">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-xl bg-emerald-500 items-center justify-center mb-2">
            <Sparkles className="w-6 h-6 text-slate-950" />
          </div>
          <h1 className="text-2xl font-bold text-slate-100">Welcome to PrepAI</h1>
          <p className="text-xs text-slate-400">Log in to your dashboard to start practicing</p>
        </div>

        {apiError && (
          <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{apiError}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400">Email Address</label>
            <input
              type="email"
              {...register('email', {
                required: 'Email is required',
                pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' },
              })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-xs text-slate-200 outline-none focus:border-emerald-500 transition-colors duration-150"
              placeholder="name@company.com"
            />
            {errors.email && (
              <span className="text-[10px] text-red-400 font-medium block">{errors.email.message}</span>
            )}
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-slate-400">Password</label>
            </div>
            <input
              type="password"
              {...register('password', {
                required: 'Password is required',
              })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-xs text-slate-200 outline-none focus:border-emerald-500 transition-colors duration-150"
              placeholder="••••••••"
            />
            {errors.password && (
              <span className="text-[10px] text-red-400 font-medium block">{errors.password.message}</span>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-800 disabled:cursor-not-allowed text-slate-950 font-semibold rounded-lg text-xs transition-colors duration-150"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Logging in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-slate-500">
          Don't have an account?{' '}
          <Link to="/register" className="text-emerald-400 hover:text-emerald-350 font-semibold transition-colors">
            Register
          </Link>
        </div>

        {/* Bypass for dev */}
        <div className="pt-4 border-t border-slate-800/60 text-center space-y-3">
          <p className="text-[10px] text-slate-500">Need immediate sandbox access without a database setup?</p>
          <button
            onClick={handleBypass}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold underline decoration-2 transition-all duration-150"
          >
            Bypass & Enter Developer Workspace
          </button>
        </div>
      </div>
    </div>
  );
};
