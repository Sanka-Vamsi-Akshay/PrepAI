import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Sparkles, LogOut } from 'lucide-react';
import { NAVIGATION_ITEMS } from '@/config/navigation';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/routes';

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const activePath = location.pathname;

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.LOGIN);
  };

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between hidden md:flex">
      {/* Brand Header */}
      <div>
        <div className="h-16 flex items-center px-6 border-b border-slate-100 dark:border-slate-850 gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-slate-950 font-bold" />
          </div>
          <span className="font-semibold text-md tracking-wider bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-300 bg-clip-text text-transparent">
            PrepAI
          </span>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-1">
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
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-l-2 border-emerald-550'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850 hover:text-slate-800 dark:hover:text-slate-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Signout button */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-850">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold text-red-500 hover:bg-red-500/5 transition-colors text-left"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
};
