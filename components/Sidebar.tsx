
import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { UserRole, AppMode } from '../types';
import { OPS_NAVIGATION, KB_NAVIGATION, ICONS } from '../constants';
import { getActiveProfile } from '../lib/settings';

interface SidebarProps {
  role: UserRole;
  mode: AppMode;
  onModeChange: (mode: AppMode) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ role, mode, onModeChange }) => {
  const navigate = useNavigate();
  const [appName, setAppName] = useState(getActiveProfile().branding.appName);

  useEffect(() => {
    const handleUpdate = () => {
      setAppName(getActiveProfile().branding.appName);
    };
    window.addEventListener('synkops-settings-updated', handleUpdate);
    return () => window.removeEventListener('synkops-settings-updated', handleUpdate);
  }, []);

  const activeNav = mode === AppMode.OPS ? OPS_NAVIGATION : KB_NAVIGATION;

  const handleModeToggle = () => {
    const nextMode = mode === AppMode.OPS ? AppMode.KB : AppMode.OPS;
    onModeChange(nextMode);
    if (nextMode === AppMode.KB) navigate('/kb');
    else navigate('/dashboard');
  };

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 hidden lg:flex flex-col border-r border-slate-800 shrink-0">
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-emerald-500/20">
            {appName.charAt(0)}
          </div>
          <span className="text-xl font-black text-white tracking-tight uppercase truncate">{appName}</span>
        </div>
      </div>
      
      <div className="px-4 mb-4">
         <div className="bg-slate-800/50 p-1 rounded-xl flex">
            <button 
              onClick={() => { onModeChange(AppMode.OPS); navigate('/dashboard'); }}
              className={`flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${mode === AppMode.OPS ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >OPS</button>
            <button 
              onClick={() => { onModeChange(AppMode.KB); navigate('/kb'); }}
              className={`flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${mode === AppMode.KB ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >KB</button>
         </div>
      </div>

      <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto no-scrollbar">
        <div className="text-[9px] font-black text-slate-500 uppercase tracking-[0.25em] px-3 mb-2 flex items-center gap-2">
           <div className={`w-1 h-1 rounded-full ${mode === AppMode.OPS ? 'bg-emerald-500' : 'bg-blue-500'}`}></div>
           {mode === AppMode.OPS ? 'Production Hub' : 'Knowledge Base'}
        </div>
        
        {activeNav.map((item) => {
          if (role === UserRole.CREW && ['reports', 'settings', 'templates'].includes(item.id)) {
            return null;
          }

          return (
            <NavLink
              key={item.id}
              to={`/${item.id}`}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group
                ${isActive 
                  ? 'bg-slate-800 text-white font-black shadow-lg ring-1 ring-white/5' 
                  : 'hover:bg-slate-800/50 hover:text-slate-100 text-slate-400'
                }
              `}
            >
              {({ isActive }) => (
                <>
                  <span className={`transition-colors ${isActive ? (mode === AppMode.OPS ? 'text-emerald-400' : 'text-blue-400') : 'group-hover:text-slate-100'}`}>{item.icon}</span>
                  <span className="text-[11px] font-black uppercase tracking-widest">{item.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button 
          onClick={handleModeToggle}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all font-black text-[10px] uppercase tracking-widest ${mode === AppMode.OPS ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20 hover:bg-blue-600 hover:text-white' : 'bg-emerald-600/10 text-emerald-400 border border-emerald-600/20 hover:bg-emerald-600 hover:text-white'}`}
        >
          <span>Switch to {mode === AppMode.OPS ? 'KB' : 'OPS'}</span>
          {mode === AppMode.OPS ? <ICONS.BookOpen size={14} /> : <ICONS.LayoutDashboard size={14} />}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
