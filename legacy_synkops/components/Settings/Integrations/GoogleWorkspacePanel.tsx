
import React, { useState, useEffect } from 'react';
import { ICONS } from '../../../constants';
import { GoogleIntegrationSettings, GoogleStatus, User, UserRole } from '../../../types';
import { 
  startGoogleConnect, 
  disconnectGoogle, 
  testGoogleConnection,
  listCalendars
} from '../../../lib/integrations/google/client';
import Toggle from '../../ui/Toggle';
import Select from '../../ui/Select';

interface GoogleWorkspacePanelProps {
  user: User;
  settings: GoogleIntegrationSettings;
  onUpdate: (updates: Partial<GoogleIntegrationSettings>) => void;
}

const GoogleWorkspacePanel: React.FC<GoogleWorkspacePanelProps> = ({ user, settings, onUpdate }) => {
  const [isTesting, setIsTesting] = useState(false);
  const [testResults, setTestResults] = useState<Record<string, boolean> | null>(null);
  const [calendars, setCalendars] = useState<{label: string, value: string}[]>([]);

  useEffect(() => {
    if (settings.status === 'connected') {
      listCalendars().then(list => setCalendars(list.map(c => ({ label: c.name, value: c.id }))));
    }
  }, [settings.status]);

  const handleConnect = async () => {
    // The startGoogleConnect function handles updating the global settings store internally
    await startGoogleConnect(user);
  };

  const handleDisconnect = async () => {
    const success = await disconnectGoogle(user);
    if (success) {
      setTestResults(null);
    }
  };

  const handleTest = async () => {
    setIsTesting(true);
    setTestResults(null);
    const results = await testGoogleConnection();
    setTestResults(results);
    setIsTesting(false);
    onUpdate({ lastHealthCheckAt: new Date().toISOString() });
  };

  const toggleService = (service: keyof GoogleIntegrationSettings['enabledServices']) => {
    onUpdate({
      enabledServices: {
        ...settings.enabledServices,
        [service]: !settings.enabledServices[service]
      }
    });
  };

  const isConnected = settings.status === 'connected';

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* 1. Connection Header */}
      <section className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-6">
             <div className={`w-20 h-20 rounded-3xl flex items-center justify-center border-4 transition-all duration-500 ${isConnected ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : settings.status === 'error' ? 'bg-red-50 border-red-100 text-red-600' : 'bg-slate-50 border-slate-100 text-slate-300'}`}>
                <ICONS.Construction size={40} className={isConnected ? 'scale-110' : ''} />
             </div>
             <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Google Workspace</h3>
                <div className="flex items-center gap-3 mt-1">
                   <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors ${isConnected ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                      {settings.status.replace('_', ' ')}
                   </span>
                   {settings.connectedEmail && (
                     <span className="text-[11px] font-bold text-slate-400 truncate max-w-[200px] border-l border-slate-200 pl-3 ml-1">{settings.connectedEmail}</span>
                   )}
                </div>
             </div>
          </div>

          <div className="flex gap-2">
             {!isConnected ? (
               <button 
                onClick={handleConnect}
                className="px-8 py-3.5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 shadow-xl transition-all flex items-center gap-3 active:scale-95"
               >
                 <ICONS.Unlock size={16} />
                 Connect Google
               </button>
             ) : (
               <>
                 <button 
                  onClick={handleTest}
                  disabled={isTesting}
                  className="px-6 py-3.5 bg-white border border-slate-200 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-3 shadow-sm active:scale-95"
                 >
                   {isTesting ? <ICONS.RefreshCcw className="animate-spin" size={16} /> : <ICONS.ShieldCheck size={16} className="text-emerald-500" />}
                   {isTesting ? 'Verifying...' : 'Test Connection'}
                 </button>
                 <button 
                  onClick={handleDisconnect}
                  className="px-6 py-3.5 bg-red-50 text-red-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-100 transition-all border border-red-100"
                 >
                   Disconnect
                 </button>
               </>
             )}
          </div>
        </div>

        {isConnected && settings.lastHealthCheckAt && (
           <div className="mt-8 pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <p className="flex items-center gap-2">
                <ICONS.Clock size={12} />
                Last Connection Sync: {new Date(settings.lastHealthCheckAt).toLocaleString()}
              </p>
              <div className="flex gap-4">
                 {['calendar', 'gmail', 'drive', 'sheets'].map(svc => {
                   const ok = testResults ? testResults[svc] : true;
                   return (
                    <span key={svc} className={`flex items-center gap-1.5 transition-all ${ok ? 'text-emerald-500' : 'text-red-500'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${ok ? 'bg-emerald-500' : 'bg-red-500'}`} />
                        {svc}
                    </span>
                   );
                 })}
              </div>
           </div>
        )}
      </section>

      {/* 2. Service Toggles */}
      <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 transition-all duration-700 ${!isConnected ? 'opacity-30 pointer-events-none grayscale' : ''}`}>
         {/* Calendar */}
         <section className={`bg-white p-8 rounded-[40px] border transition-all duration-500 ${settings.enabledServices.calendar ? 'border-blue-200 shadow-blue-500/5 shadow-xl' : 'border-slate-200 shadow-sm'}`}>
            <div className="flex items-center justify-between border-b border-slate-50 pb-6 mb-6">
               <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${settings.enabledServices.calendar ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                    <ICONS.Calendar size={20} />
                  </div>
                  <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Google Calendar</h4>
               </div>
               <Toggle 
                enabled={settings.enabledServices.calendar} 
                onChange={() => toggleService('calendar')} 
               />
            </div>
            
            {settings.enabledServices.calendar ? (
              <div className="space-y-6 animate-in slide-in-from-top-2 duration-300">
                 <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Target Operations Calendar</label>
                    <Select 
                      options={calendars.length ? calendars : [{label: 'Loading calendars...', value: ''}]} 
                      value={settings.calendar.calendarId || ''}
                      onChange={e => onUpdate({ calendar: { ...settings.calendar, calendarId: e.target.value }})}
                    />
                 </div>
                 <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Sync Rules</label>
                    <div className="flex gap-2 p-1.5 bg-slate-50 rounded-2xl border border-slate-200">
                       {['manual', 'one-way', 'two-way'].map(mode => (
                         <button 
                          key={mode}
                          onClick={() => onUpdate({ calendar: { ...settings.calendar, syncMode: mode as any }})}
                          className={`flex-1 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${settings.calendar.syncMode === mode ? 'bg-white text-slate-900 shadow-md ring-1 ring-slate-100' : 'text-slate-400 hover:text-slate-600'}`}
                         >
                           {mode.replace('-', ' ')}
                         </button>
                       ))}
                    </div>
                 </div>
              </div>
            ) : (
              <p className="text-[10px] font-bold text-slate-400 uppercase leading-relaxed px-1">
                Enable to sync project start dates and site consultations directly to your field crew's Google devices.
              </p>
            )}
         </section>

         {/* Gmail */}
         <section className={`bg-white p-8 rounded-[40px] border transition-all duration-500 ${settings.enabledServices.gmail ? 'border-red-200 shadow-red-500/5 shadow-xl' : 'border-slate-200 shadow-sm'}`}>
            <div className="flex items-center justify-between border-b border-slate-50 pb-6 mb-6">
               <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${settings.enabledServices.gmail ? 'bg-red-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                    <ICONS.Mail size={20} />
                  </div>
                  <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Gmail Integration</h4>
               </div>
               <Toggle 
                enabled={settings.enabledServices.gmail} 
                onChange={() => toggleService('gmail')} 
               />
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase leading-relaxed px-1">
               Send professional proposals, change orders, and invoices directly from your {settings.connectedEmail || 'authorized'} address.
            </p>
         </section>

         {/* Drive */}
         <section className={`bg-white p-8 rounded-[40px] border transition-all duration-500 ${settings.enabledServices.drive ? 'border-amber-200 shadow-amber-500/5 shadow-xl' : 'border-slate-200 shadow-sm'}`}>
            <div className="flex items-center justify-between border-b border-slate-50 pb-6 mb-6">
               <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${settings.enabledServices.drive ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                    <ICONS.Layers size={20} />
                  </div>
                  <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Google Drive</h4>
               </div>
               <Toggle 
                enabled={settings.enabledServices.drive} 
                onChange={() => toggleService('drive')} 
               />
            </div>
            {settings.enabledServices.drive ? (
               <div className="animate-in slide-in-from-top-2 duration-300">
                  <button className="w-full py-4 border-2 border-dashed border-slate-200 rounded-3xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:border-emerald-300 hover:bg-emerald-50/20 hover:text-emerald-700 transition-all flex items-center justify-center gap-3 group">
                     <ICONS.Search size={14} className="group-hover:scale-110 transition-transform" />
                     {settings.drive.rootFolderId ? 'Documents Folder Linked' : 'Link Storage Folder'}
                  </button>
               </div>
            ) : (
               <p className="text-[10px] font-bold text-slate-400 uppercase leading-relaxed px-1">
                  Automatically backup project photos and signed PDFs to a dedicated Workspace folder.
               </p>
            )}
         </section>

         {/* Sheets */}
         <section className={`bg-white p-8 rounded-[40px] border transition-all duration-500 ${settings.enabledServices.sheets ? 'border-emerald-200 shadow-emerald-500/5 shadow-xl' : 'border-slate-200 shadow-sm'}`}>
            <div className="flex items-center justify-between border-b border-slate-50 pb-6 mb-6">
               <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${settings.enabledServices.sheets ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                    <ICONS.Receipt size={20} />
                  </div>
                  <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Google Sheets</h4>
               </div>
               <Toggle 
                enabled={settings.enabledServices.sheets} 
                onChange={() => toggleService('sheets')} 
               />
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase leading-relaxed px-1">
               Import vendor pricebooks and export deep-dive financial reports directly to your spreadsheets.
            </p>
         </section>
      </div>

      {/* 3. Permissions Info */}
      {isConnected && (
        <section className="bg-slate-900 p-10 rounded-[48px] text-white shadow-2xl relative overflow-hidden group">
           <div className="relative z-10">
              <div className="flex items-center gap-3 mb-8">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                 <h4 className="text-[10px] font-black uppercase tracking-[0.25em] opacity-50">Active API Scopes</h4>
              </div>
              <div className="flex flex-wrap gap-2.5">
                 {['openid', 'email', 'calendar.events', 'gmail.send', 'drive.file', 'spreadsheets'].map(scope => (
                   <span key={scope} className="px-4 py-2 bg-white/5 rounded-2xl text-[10px] font-mono border border-white/10 text-white/80 hover:bg-white/10 hover:text-white transition-all cursor-default">
                      {scope}
                   </span>
                 ))}
              </div>
              <p className="text-[10px] font-bold text-white/30 mt-12 leading-relaxed uppercase tracking-widest">
                 SynkOps manages OAuth security server-side. <button onClick={handleConnect} className="text-emerald-400 hover:text-emerald-300 font-black underline decoration-2 underline-offset-4">Re-authenticate</button> to refresh permissions or switch accounts.
              </p>
           </div>
           <ICONS.Lock className="absolute -bottom-12 -right-12 opacity-5 rotate-12 transition-transform duration-1000 group-hover:rotate-0 group-hover:scale-110" size={240} />
        </section>
      )}
    </div>
  );
};

export default GoogleWorkspacePanel;
