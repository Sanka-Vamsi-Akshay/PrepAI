import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, Eye } from 'lucide-react';
import { useNotifications, useMarkNotificationAsRead, useMarkAllNotificationsAsRead } from '@/hooks/useNotifications';

export const NotificationCenter: React.FC = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: notifications = [] } = useNotifications();
  const markAsReadMutation = useMarkNotificationAsRead();
  const markAllAsReadMutation = useMarkAllNotificationsAsRead();

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = async (id: string, link?: string) => {
    await markAsReadMutation.mutateAsync(id);
    setIsOpen(false);
    if (link) {
      navigate(link);
    }
  };

  const handleMarkAllRead = () => {
    markAllAsReadMutation.mutate();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-350 transition-colors cursor-pointer"
      >
        <Bell className="w-4 h-4 text-slate-500 hover:text-slate-300" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[8px] font-bold text-slate-950 dark:text-slate-900">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown list */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-55 overflow-hidden">
          <div className="flex items-center justify-between p-3.5 border-b border-slate-150 dark:border-slate-850">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-250">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                disabled={markAllAsReadMutation.isPending}
                className="text-[10px] text-emerald-500 hover:text-emerald-600 font-bold flex items-center gap-1 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-850">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-xs">
                No notifications yet.
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n.id, n.link)}
                  className={`p-3 text-left transition-colors cursor-pointer flex gap-2 ${
                    n.isRead
                      ? 'bg-transparent hover:bg-slate-50 dark:hover:bg-slate-850'
                      : 'bg-emerald-500/5 hover:bg-emerald-500/10 border-l-2 border-emerald-500'
                  }`}
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex justify-between items-start gap-1">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1 leading-snug">
                        {n.title}
                      </h4>
                      {!n.isRead && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1" />
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-450 leading-relaxed line-clamp-2">
                      {n.message}
                    </p>
                    <span className="text-[8px] text-slate-550 dark:text-slate-500 uppercase tracking-wider font-semibold block pt-1">
                      {new Date(n.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  {n.link && (
                    <div className="self-center text-slate-400">
                      <Eye className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
export default NotificationCenter;
