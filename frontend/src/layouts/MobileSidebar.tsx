import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Sparkles, LogOut, X } from 'lucide-react';
import { NAVIGATION_ITEMS } from '@/config/navigation';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/routes';

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileSidebar: React.FC<MobileSidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const activePath = location.pathname;

  if (!isOpen) return null;

  const handleLogout = async () => {
    onClose();
    await logout();
    navigate(ROUTES.LOGIN);
  };

  return (
    <div className="fixed inset-0 z-50 flex md:hidden">
      {/* Background Overlay */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
      />

      {/* Drawer Panel */}
      <div className="relative flex w-full max-w-xs flex-col bg-white dark:bg-slate-900 py-4 shadow-xl">
        {/* Header brand + Close icon */}
        <div className="flex items-center justify-between px-6 pb-4 border-b border-slate-100 dark:border-slate-850">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-slate-950 font-bold" />
            </div>
            <span className="font-semibold text-md bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-300 bg-clip-text text-transparent">
              PrepAI
            </span>
          </div>
          
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {NAVIGATION_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.path === '/'
                ? activePath === '/'
                : activePath.startsWith(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-l-2 border-emerald-550'
                    : 'text-slate-550 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850 hover:text-slate-800 dark:hover:text-slate-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Signout button */}
        <div className="px-4 border-t border-slate-100 dark:border-slate-850 pt-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold text-red-500 hover:bg-red-500/5 transition-colors text-left"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};
