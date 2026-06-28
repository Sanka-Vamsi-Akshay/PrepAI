import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogOut, User as UserIcon, Settings, ChevronDown } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/routes';

export const UserMenu: React.FC = () => {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.LOGIN);
  };

  const userInitials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase()
    : 'U';

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      >
        <div className="w-8 h-8 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center border border-emerald-500/20">
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
            {userInitials}
          </span>
        </div>
        <div className="hidden md:block text-left">
          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
            {user?.name || 'Developer User'}
          </p>
          <p className="text-[10px] text-slate-500 truncate max-w-28">
            {user?.email || 'candidate@prepai.dev'}
          </p>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden md:block" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg shadow-slate-200 dark:shadow-none p-1.5 z-50">
          <Link
            to={ROUTES.PROFILE}
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-255 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-lg transition-colors"
          >
            <UserIcon className="w-4 h-4 text-slate-450" />
            My Profile
          </Link>
          
          <Link
            to={ROUTES.PROFILE}
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-255 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-lg transition-colors"
          >
            <Settings className="w-4 h-4 text-slate-455" />
            Settings
          </Link>

          <hr className="my-1.5 border-slate-100 dark:border-slate-800" />

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-red-500 hover:bg-red-500/5 rounded-lg transition-colors text-left"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
};
