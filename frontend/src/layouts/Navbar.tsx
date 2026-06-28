import React from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, Sun, Moon } from 'lucide-react';
import { UserMenu } from './UserMenu';
import { NotificationCenter } from '@/components/NotificationCenter';
import { useTheme } from '@/context/ThemeContext';
import { NAVIGATION_ITEMS } from '@/config/navigation';

interface NavbarProps {
  onMenuClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
  const location = useLocation();
  const activePath = location.pathname;
  const { theme, toggleTheme } = useTheme();

  const pageTitle = NAVIGATION_ITEMS.find((item) =>
    item.path === '/' ? activePath === '/' : activePath.startsWith(item.path)
  )?.name || 'Dashboard';

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 z-10">
      
      {/* Left side: Hamburger (mobile) + Page Title */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 md:hidden transition-colors cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        <h2 className="font-semibold text-slate-800 dark:text-slate-200 hidden md:block">
          {pageTitle}
        </h2>
      </div>

      {/* Right side: Toggler, Notifications, UserMenu */}
      <div className="flex items-center gap-3">
        {/* Theme toggler */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors cursor-pointer"
          title="Toggle Light/Dark Mode"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Stateful Notification Center */}
        <NotificationCenter />

        {/* Vertical divider */}
        <span className="w-px h-6 bg-slate-200 dark:bg-slate-800" />

        {/* User Account menu */}
        <UserMenu />
      </div>
    </header>
  );
};
export default Navbar;
