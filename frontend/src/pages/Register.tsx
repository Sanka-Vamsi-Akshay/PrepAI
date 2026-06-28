import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { Sparkles, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface RegisterFormInputs {
  name?: string;
  email: string;
  password: RegisterFormPassword;
  confirmPassword: RegisterFormPassword;
}

type RegisterFormPassword = string;

export const Register: React.FC = () => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterFormInputs>();
  const { register: registerUser, isAuthenticated, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const navigate = useNavigate();

  React.useEffect(() => {
    if (isAuthenticated && !authLoading) {
      navigate('/');
    }
  }, [isAuthenticated, authLoading, navigate]);

  const passwordVal = watch('password');

  const onSubmit = async (data: RegisterFormInputs) => {
    setLoading(true);
    setApiError(null);
    try {
      await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
      });
      navigate('/');
    } catch (err: any) {
      setApiError(err.message || 'Failed to register account. Check server connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-6 shadow-xl shadow-slate-950">
        
        {/* Header */}
        <div className="space-y-2">
          <Link to="/login" className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-350 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
          </Link>
          <div className="text-center space-y-2 pt-2">
            <div className="inline-flex w-12 h-12 rounded-xl bg-emerald-500 items-center justify-center mb-2">
              <Sparkles className="w-6 h-6 text-slate-950" />
            </div>
            <h1 className="text-2xl font-bold text-slate-100">Create account</h1>
            <p className="text-xs text-slate-400">Join PrepAI to elevate your technical interview game</p>
          </div>
        </div>

        {apiError && (
          <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400 animate-pulse">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{apiError}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400">Full Name</label>
            <input
              type="text"
              {...register('name')}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-xs text-slate-200 outline-none focus:border-emerald-500 transition-colors duration-150"
              placeholder="Alex Johnson"
            />
          </div>

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
            <label className="text-xs font-semibold text-slate-400">Password</label>
            <input
              type="password"
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 8, message: 'Password must be at least 8 characters' },
                pattern: {
                  value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                  message: 'Must contain at least one uppercase letter, one lowercase letter, and one number',
                },
              })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-xs text-slate-200 outline-none focus:border-emerald-500 transition-colors duration-150"
              placeholder="••••••••"
            />
            {errors.password && (
              <span className="text-[10px] text-red-400 font-medium block">{errors.password.message}</span>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400">Confirm Password</label>
            <input
              type="password"
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (value) => value === passwordVal || 'Passwords do not match',
              })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-xs text-slate-200 outline-none focus:border-emerald-500 transition-colors duration-150"
              placeholder="••••••••"
            />
            {errors.confirmPassword && (
              <span className="text-[10px] text-red-400 font-medium block">{errors.confirmPassword.message}</span>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-800 disabled:cursor-not-allowed text-slate-950 font-semibold rounded-lg text-xs transition-colors duration-150"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Registering...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-slate-800/60 text-center text-xs text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="text-emerald-400 hover:text-emerald-350 font-semibold transition-colors">
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
};
