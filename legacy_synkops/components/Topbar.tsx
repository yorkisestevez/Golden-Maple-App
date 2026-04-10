
import React, { useState, useEffect } from 'react';
import { User as UserType, AppNotification } from '../types';
import { ICONS } from '../constants';
import { getActiveProfile } from '../lib/settings';
import NotificationDrawer from './Notifications/NotificationDrawer';
import { getJSON, setJSON } from '../lib/storage';

interface TopbarProps {
  user: UserType;
  companyName: string;
}

const Topbar: React.FC<TopbarProps> = ({ user }) => {
  const [profile, setProfile] = useState(getActiveProfile());
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  useEffect(() => {
    const handleUpdate = () => {
      setProfile(getActiveProfile());
      const notes = getJSON<AppNotification[]>('synkops_notifications_v1', []);
      setNotifications(notes.filter(n => !n.dismissed));
    };
    
    handleUpdate();
    window.addEventListener('synkops-settings-updated', handleUpdate);
    const interval = setInterval(handleUpdate, 10000); // Check for alerts

    return () => {
      window.removeEventListener('synkops-settings-updated', handleUpdate);
      clearInterval(interval);
    };
  }, []);

  const handleDismiss = (id: string) => {
    const all = getJSON<AppNotification[]>('synkops_notifications_v1', []);
    const updated = all.map(n => n.id === id ? { ...n, dismissed: true } : n);
    setJSON('synkops_notifications_v1', updated);
    setNotifications(updated.filter(n => !n.dismissed));
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-40">
      <div className="flex items-center gap-4 flex-1">
        <button className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-all">
          <ICONS.MoreVertical size={20} />
        </button>
        <div className="flex items-center gap-4">
           <span className="hidden xl:block text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] border-r border-slate-100 pr-4">{profile.branding.appName}</span>
           <div className="relative max-w-md w-full hidden sm:block">
            <ICONS.Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search leads, jobs, or docs..." 
              className="w-80 bg-slate-50 border-none rounded-full py-2.5 pl-10 pr-4 text-xs font-bold focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <button 
          onClick={() => setIsDrawerOpen(true)}
          className="relative p-2.5 text-slate-500 hover:bg-slate-100 rounded-full transition-colors"
        >
          <ICONS.Bell size={20} />
          {notifications.length > 0 && (
            <span className="absolute top-2.5 right-2.5 w-4 h-4 bg-red-500 text-white text-[8px] font-black rounded-full border-2 border-white flex items-center justify-center animate-bounce">
              {notifications.length}
            </span>
          )}
        </button>
        
        <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-black text-slate-900 uppercase leading-none mb-1">{user.name}</p>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-tighter opacity-70">
              {profile.business.displayName} — {user.role.replace('_', ' ')}
            </p>
          </div>
          <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white font-black border-2 border-slate-50 shadow-md">
            {user.name.charAt(0)}
          </div>
        </div>
      </div>

      <NotificationDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        notifications={notifications}
        onDismiss={handleDismiss}
      />
    </header>
  );
};

export default Topbar;
