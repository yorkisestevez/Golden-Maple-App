
import React from 'react';
import { AppNotification } from '../../types';
import { ICONS } from '../../constants';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onDismiss: (id: string) => void;
}

const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose, notifications, onDismiss }) => {
  return (
    <div className={`fixed inset-0 z-[100] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className={`absolute right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl transition-transform duration-500 ease-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <header className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Operational Feed</h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{notifications.length} Alerts Active</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white rounded-2xl text-slate-400 transition-all hover:shadow-sm">
            <ICONS.Plus className="rotate-45" size={24} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
          {notifications.map(n => (
            <div key={n.id} className={`p-6 rounded-[32px] border-2 transition-all relative group ${n.severity === 'high' ? 'bg-red-50 border-red-100 shadow-red-500/5' : 'bg-slate-50 border-slate-100 shadow-sm'}`}>
              <div className="flex gap-4">
                 <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${n.severity === 'high' ? 'bg-red-600 text-white' : 'bg-slate-900 text-white'}`}>
                    {n.severity === 'high' ? <ICONS.AlertCircle size={20}/> : <ICONS.Bell size={20}/>}
                 </div>
                 <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                       <p className={`text-[10px] font-black uppercase tracking-widest ${n.severity === 'high' ? 'text-red-600' : 'text-slate-400'}`}>{n.type.replace('_', ' ')}</p>
                       <p className="text-[9px] font-bold text-slate-300 uppercase">{n.timestamp ? new Date(n.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Now'}</p>
                    </div>
                    <p className="text-sm font-black text-slate-900 leading-tight mb-2">{n.message}</p>
                    <div className="flex gap-3 mt-4">
                       <button className="text-[9px] font-black text-slate-900 bg-white px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 shadow-sm">VIEW JOB</button>
                       <button onClick={() => onDismiss(n.id)} className="text-[9px] font-black text-slate-400 hover:text-slate-900">DISMISS</button>
                    </div>
                 </div>
              </div>
            </div>
          ))}
          {notifications.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-slate-300 py-20 text-center">
               <ICONS.CheckCircle2 size={64} className="mb-6 opacity-10" />
               <p className="text-[10px] font-black uppercase tracking-[0.3em]">All Clear — Dashboard Green</p>
            </div>
          )}
        </div>

        <footer className="p-8 border-t border-slate-100 bg-slate-50/50">
           <button onClick={() => notifications.forEach(n => onDismiss(n.id))} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl">Mark All Read</button>
        </footer>
      </div>
    </div>
  );
};

export default NotificationDrawer;
