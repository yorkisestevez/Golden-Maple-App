
import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { UserRole, AppMode, CompanyConfig, Lead, Job, User as UserType, LeadStatus, Estimate, Proposal, CalendarEvent, Crew, CalendarEventType, EstimateStatus, ProposalStatus, JobStatus } from './types';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import SetupWizard from './components/onboarding/SetupWizard';
import Dashboard from './components/Dashboard';
import LeadsModule from './components/Leads/LeadsModule';
import JobsModule from './components/Jobs/JobsModule';
import JobWorkspace from './components/Jobs/JobWorkspace';
import DailyLogsModule from './components/Logs/DailyLogsModule';
import DailyLogEditor from './components/Logs/DailyLogEditor';
import EstimatesModule from './components/Estimates/EstimatesModule';
import ProposalsModule from './components/Proposals/ProposalsModule';
import ScheduleModule from './components/Schedule/ScheduleModule';
import PhotosModule from './components/Photos/PhotosModule';
import ChangeOrdersModule from './components/ChangeOrders/ChangeOrdersModule';
import InvoicesModule from './components/Invoices/InvoicesModule';
import WarrantyModule from './components/Warranty/WarrantyModule';
import VendorsModule from './components/Vendors/VendorsModule';
import TemplatesModule from './components/Templates/TemplatesModule';
import SettingsModule from './components/Settings/SettingsModule';
import ReportsModule from './components/Reports/ReportsModule';
import DataCenterModule from './components/DataCenter/DataCenterModule';
import KBModule from './components/KB/KBModule';
import { getGlobalSettings, getActiveProfile, applyBranding } from './lib/settings';
import { hydratePresets, PRESET_NAMES, savePreset } from './lib/presets';
import { STORAGE_KEYS, getJSON } from './lib/storage';

const INITIAL_USER: UserType = {
  id: 'u1',
  name: 'John Owner',
  role: UserRole.OWNER,
  email: 'john@greenlandscape.com'
};

const MOCK_CREWS: Crew[] = [
  { id: 'c1', name: 'Team Alpha', color: 'bg-emerald-500', leadId: 'u1', memberIds: [] },
  { id: 'c2', name: 'Team Beta', color: 'bg-blue-500', leadId: 'u2', memberIds: [] },
];

const MOCK_LEADS: Lead[] = [
  { id: 'L101', clientName: 'Alice Cooper', address: '101 Rock Ave', status: LeadStatus.WON, createdDate: '2024-10-23', projectType: 'Patio', source: 'Referral', phone: '555-0101', email: 'alice@rock.com', budgetRange: '$10k - $25k', timeline: '1-3 Months', notes: 'Interested in natural stone.' },
  { id: 'L102', clientName: 'Bob Dylan', address: '42 Folk Ln', status: LeadStatus.CONTACTED, createdDate: '2024-10-22', projectType: 'Retaining Wall', source: 'Google Search', phone: '555-0102', email: 'bob@folk.com', budgetRange: '$5k - $10k', timeline: 'Immediate', notes: 'Needs urgent wall repair.' },
];

const MOCK_JOBS: Job[] = [
  { 
    id: 'J101', clientName: 'Alice Cooper', address: '101 Rock Ave', status: JobStatus.READY_TO_START, 
    crewIds: ['c1'], fieldLeadId: 'u1', budgetTotal: 25000, hidePricingFromField: true, warnings: [],
    locatesConfirmed: true, materialsOrdered: true, depositPaid: true, planUploaded: true, gateOverrides: {},
    progressPercent: 0, 
    metrics: { plannedLaborHours: 100, actualLaborHours: 0, plannedUnits: 500, actualUnitsCompleted: 0, plannedDays: 5, actualDaysElapsed: 0 },
    siteLat: 43.6426, siteLng: -79.3871, geofenceRadiusMeters: 120 // Near CN Tower
  },
  { 
    id: 'J102', clientName: 'Bob Dylan', address: '42 Folk Ln', status: JobStatus.IN_PROGRESS, 
    crewIds: ['c2'], fieldLeadId: 'u2', budgetTotal: 12000, hidePricingFromField: true, warnings: [],
    locatesConfirmed: true, materialsOrdered: true, depositPaid: true, planUploaded: true, gateOverrides: {},
    progressPercent: 35, 
    metrics: { plannedLaborHours: 60, actualLaborHours: 22, plannedUnits: 200, actualUnitsCompleted: 70, plannedDays: 3, actualDaysElapsed: 1 },
    siteLat: 43.6450, siteLng: -79.3800, geofenceRadiusMeters: 120 // Nearby park
  }
];

const INITIAL_EVENTS: CalendarEvent[] = [
  { id: 'e1', type: CalendarEventType.JOB, title: 'Alice Cooper Patio', start: new Date().toISOString(), end: new Date().toISOString(), allDay: true, jobId: 'J101', crewId: 'c1', address: '101 Rock Ave' }
];

const App: React.FC = () => {
  const [user] = useState<UserType>(INITIAL_USER);
  const [mode, setMode] = useState<AppMode>(AppMode.OPS);
  const [config, setConfig] = useState<CompanyConfig | null>(null);
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [leads, setLeads] = useState<Lead[]>(MOCK_LEADS);
  const [jobs, setJobs] = useState<Job[]>(MOCK_JOBS);
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>(INITIAL_EVENTS);
  const [crews] = useState<Crew[]>(MOCK_CREWS);

  const addEvent = useCallback((newEvent: Omit<CalendarEvent, 'id'>) => {
    const eventWithId = { ...newEvent, id: `e${Math.random().toString(36).substr(2, 9)}` };
    setEvents(prev => [...prev, eventWithId]);
  }, []);

  const updateLeadStatus = useCallback((leadId: string, newStatus: LeadStatus) => {
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus } : l));
  }, []);

  const updateEstimateStatus = useCallback((id: string, status: EstimateStatus) => {
    setEstimates(prev => prev.map(e => e.id === id ? { ...e, status } : e));
  }, []);

  const updateProposalStatus = useCallback((id: string, status: ProposalStatus) => {
    setProposals(prev => prev.map(p => p.id === id ? { ...p, status } : p));
  }, []);

  useEffect(() => {
    const init = async () => {
      const profile = getActiveProfile();
      applyBranding(profile.branding);

      await hydratePresets();

      const savedProposals = getJSON<Proposal[]>(STORAGE_KEYS.PROPOSALS, []);
      setProposals(savedProposals);

      const savedConfig = localStorage.getItem('synkops_config');
      if (savedConfig) {
        setConfig(JSON.parse(savedConfig));
        setIsSetupComplete(true);
      } else {
        const settings = getGlobalSettings();
        if (settings.profiles.length > 0) {
          setIsSetupComplete(true);
          const active = getActiveProfile();
          setConfig({
            name: active.business.displayName,
            hstPercent: active.financial.taxRatePercent,
            depositPercent: active.financial.deposit.percent,
            warrantyPeriod: '5 years',
            laborRates: {
              crew: 45,
              lead: 65,
              operator: 75
            },
            markupRules: {
              materials: active.estimating.pricingStrategy.markupMaterialsPercent,
              subs: active.estimating.pricingStrategy.markupSubPercent
            },
            googleCalendarConnected: active.integrations.google.enabled,
            currency: active.financial.currencyCode,
            taxEnabled: active.financial.taxEnabled,
            roundingRule: active.financial.rounding.totalsTo === 'none' ? 'none' : active.financial.rounding.totalsTo as any,
            minJobSize: active.financial.minJobSize || 0
          });
        }
      }
    };

    init();
  }, []);

  const handleSetupComplete = (newConfig: CompanyConfig) => {
    setConfig({ ...newConfig, googleCalendarConnected: true }); 
    setIsSetupComplete(true);
    localStorage.setItem('synkops_config', JSON.stringify(newConfig));
    void savePreset(PRESET_NAMES.CONFIG, newConfig);
  };

  if (!isSetupComplete) {
    return <SetupWizard onComplete={handleSetupComplete} />;
  }

  if (!config) return <div className="h-screen flex items-center justify-center font-black text-slate-400 uppercase tracking-[0.3em] animate-pulse">Initializing System...</div>;

  return (
    <HashRouter>
      <div className="flex h-screen bg-slate-50 overflow-hidden">
        <Sidebar role={user.role} mode={mode} onModeChange={setMode} />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Topbar user={user} companyName={config.name || 'SynkOps'} />
          <main className="flex-1 overflow-y-auto p-4 md:p-6 no-scrollbar">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" />} />
              <Route path="/dashboard" element={<Dashboard leads={leads} jobs={jobs} events={events} />} />
              <Route path="/leads" element={<LeadsModule leads={leads} setLeads={setLeads} updateLeadStatus={updateLeadStatus} />} />
              <Route path="/estimates" element={<EstimatesModule estimates={estimates} setEstimates={setEstimates} updateEstimateStatus={updateEstimateStatus} config={config} />} />
              <Route path="/proposals" element={<ProposalsModule proposals={proposals} setProposals={setProposals} updateProposalStatus={updateProposalStatus} estimates={estimates} config={config} />} />
              <Route path="/proposals/:id" element={<ProposalsModule proposals={proposals} setProposals={setProposals} updateProposalStatus={updateProposalStatus} estimates={estimates} config={config} />} />
              <Route path="/schedule" element={<ScheduleModule events={events} onAddEvent={addEvent} jobs={jobs} leads={leads} crews={crews} proposals={proposals} />} />
              <Route path="/jobs" element={<JobsModule jobs={jobs} setJobs={setJobs} />} />
              <Route path="/jobs/:id/*" element={<JobWorkspace user={user} />} />
              <Route path="/datacenter" element={<DataCenterModule user={user} />} />
              <Route path="/logs" element={<DailyLogsModule />} />
              <Route path="/logs/edit/:id" element={<DailyLogEditor job={jobs[0]} />} />
              <Route path="/photos" element={<PhotosModule user={user} jobs={jobs} />} />
              <Route path="/change-orders" element={<ChangeOrdersModule user={user} jobs={jobs} />} />
              <Route path="/invoices" element={<InvoicesModule user={user} jobs={jobs} config={config} />} />
              <Route path="/warranty" element={<WarrantyModule user={user} jobs={jobs} />} />
              <Route path="/vendors" element={<VendorsModule user={user} />} />
              <Route path="/templates" element={<TemplatesModule user={user} />} />
              <Route path="/settings" element={<SettingsModule user={user} />} />
              <Route path="/reports" element={<ReportsModule user={user} />} />
              <Route path="/kb/*" element={<KBModule user={user} />} />
              <Route path="*" element={<div className="p-8 text-center text-slate-500 uppercase font-black text-xs">Feature under construction</div>} />
            </Routes>
          </main>
        </div>
      </div>
    </HashRouter>
  );
};

export default App;
