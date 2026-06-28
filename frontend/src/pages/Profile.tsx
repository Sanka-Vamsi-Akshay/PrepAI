import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { User as UserIcon, Mail, Shield, CheckCircle } from 'lucide-react';

export const Profile: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6 md:space-y-8 max-w-3xl">
      <div>
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">My Profile</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">Manage your credentials, platform settings, and security preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Card */}
        <div className="md:col-span-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-550 flex items-center justify-center">
            <UserIcon className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 dark:text-slate-200">{user?.name || 'Developer User'}</h3>
            <p className="text-[10px] text-slate-550 dark:text-slate-450 uppercase font-semibold tracking-wider mt-1">{user?.role || 'USER'}</p>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-semibold flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> Active Session
          </span>
        </div>

        {/* Credentials Details */}
        <div className="md:col-span-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-6">
          <h3 className="text-sm font-semibold text-slate-850 dark:text-slate-250 border-b border-slate-100 dark:border-slate-850 pb-2">Account Details</h3>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-slate-400" />
              <div>
                <span className="text-[10px] text-slate-500 block">Email Address</span>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-350">{user?.email || 'candidate@prepai.dev'}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Shield className="w-4 h-4 text-slate-400" />
              <div>
                <span className="text-[10px] text-slate-500 block">Security Level</span>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-350">JWT Protected Session</span>
              </div>
            </div>
          </div>

          <h3 className="text-sm font-semibold text-slate-850 dark:text-slate-250 border-b border-slate-100 dark:border-slate-850 pb-2 pt-2">Simulator Settings</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-500">Default Difficulty</label>
              <select className="w-full bg-white dark:bg-slate-950 border border-slate-205 dark:border-slate-800 rounded-lg p-2 text-xs outline-none">
                <option>Easy</option>
                <option>Medium</option>
                <option>Hard</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-500">Video Simulation</label>
              <select className="w-full bg-white dark:bg-slate-950 border border-slate-205 dark:border-slate-800 rounded-lg p-2 text-xs outline-none">
                <option>Audio + Video (AI analysis)</option>
                <option>Audio Only</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Profile;
