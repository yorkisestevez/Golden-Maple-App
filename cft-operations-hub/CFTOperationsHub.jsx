/* eslint-disable */
// CFT Operations Hub — single-file React demo
// Concrete Floor Tek (CFT), Bolton ON. Proof-of-concept for Randy Simpson.

const { useState, useEffect, useRef, useReducer, useCallback, useMemo } = React;

// =====================================================================
// Reference data
// =====================================================================

const CREWS = [
  { id: 'crewA', name: 'Crew A', members: 'Frank C. + Mike T.',  lead: 'Frank', specialty: 'Radiant heat specialists' },
  { id: 'crewB', name: 'Crew B', members: 'Randy S. + Dave M.',  lead: 'Randy', specialty: 'Floor toppings' },
  { id: 'crewC', name: 'Crew C', members: 'Jon K. + Carlos R.',  lead: 'Jon',   specialty: 'Underlayments' },
  { id: 'crewD', name: 'Crew D', members: 'Steve P. + Alex W.',  lead: 'Steve', specialty: 'Commercial leveling' },
];

const PRODUCT_TYPES = {
  'Levelrock RH Radiant Overpour':     { matRate: 3.20, laborRate: 1.85 },
  'Self-Leveling Floor Topping':       { matRate: 2.80, laborRate: 1.50 },
  'Sound Attenuation Underlayment':    { matRate: 2.20, laborRate: 1.20 },
  'Hollow-Core Slab Leveling':         { matRate: 2.50, laborRate: 1.60 },
};

const STATUS_META = {
  'Scheduled':   { bar: 'bg-cft-warning', text: 'text-cft-warning', dot: 'bg-cft-warning', ring: 'ring-cft-warning/30' },
  'In Progress': { bar: 'bg-cft-orange',  text: 'text-cft-orange',  dot: 'bg-cft-orange',  ring: 'ring-cft-orange/30'  },
  'Complete':    { bar: 'bg-cft-success', text: 'text-cft-success', dot: 'bg-cft-success', ring: 'ring-cft-success/30' },
};

// Inline SVG icon set
const Icon = ({ name, className = 'w-4 h-4' }) => {
  const paths = {
    grid:     <><rect x="3"  y="3" width="7"  height="7" rx="1.5"/><rect x="14" y="3" width="7"  height="7" rx="1.5"/><rect x="3"  y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></>,
    dollar:   <><path d="M12 3v18"/><path d="M16 7H10a2.5 2.5 0 0 0 0 5h4a2.5 2.5 0 0 1 0 5H8"/></>,
    plus:     <><path d="M12 5v14"/><path d="M5 12h14"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></>,
    chevronL: <path d="M15 18l-6-6 6-6"/>,
    chevronR: <path d="M9 18l6-6-6-6"/>,
    close:    <><path d="M18 6L6 18"/><path d="M6 6l12 12"/></>,
    sparkle:  <><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8"/></>,
    calendar: <><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></>,
    book:     <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></>,
    send:     <><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></>,
    map:      <><path d="M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4z"/><path d="M8 2v16M16 6v16"/></>,
    check:    <path d="M20 6L9 17l-5-5"/>,
    arrows:   <><path d="M8 7l-5 5 5 5"/><path d="M3 12h18"/><path d="M16 17l5-5-5-5"/></>,
    bolt:     <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>,
    bell:     <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/></>,
  };
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      {paths[name]}
    </svg>
  );
};

// =====================================================================
// Date helpers — week is Mon..Sat (concrete crews work Saturday)
// =====================================================================

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function startOfWeek(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  const dow = x.getDay(); // 0=Sun..6=Sat
  const offset = dow === 0 ? -6 : 1 - dow;
  x.setDate(x.getDate() + offset);
  return x;
}
function addDays(d, n) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }
function isoDay(d)   { return new Date(d).toISOString().slice(0, 10); }
function fmtShort(d) { return new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }); }
function fmtLong(d)  { return new Date(d).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }); }
function dayName(d)  { return new Date(d).toLocaleDateString(undefined, { weekday: 'long' }); }

const TODAY = new Date();
const THIS_WEEK = startOfWeek(TODAY);

// =====================================================================
// Seed jobs — GTA / Southern Ontario, realistic CFT services
// =====================================================================

const SEED_JOBS = [
  { id: 'J001', name: 'Maple Ave Townhomes',        address: '128 Maple Ave, Vaughan ON',         crewId: 'crewA', date: isoDay(addDays(THIS_WEEK, 0)), productType: 'Levelrock RH Radiant Overpour',  sqft: 4200,  quotedPrice: 28500, equipment: 1200, scope: '4 units, 1.5" radiant overpour over PEX. Prep + bond coat included.', status: 'In Progress' },
  { id: 'J002', name: 'King Street Lofts',          address: '450 King St W, Toronto ON',         crewId: 'crewB', date: isoDay(addDays(THIS_WEEK, 1)), productType: 'Self-Leveling Floor Topping',    sqft: 6800,  quotedPrice: 34000, equipment: 1500, scope: 'Topping over precast slab. 3/4" pour, prep and primer included.', status: 'Scheduled' },
  { id: 'J003', name: 'Bayview Medical Centre',     address: '2901 Bayview Ave, North York ON',   crewId: 'crewC', date: isoDay(addDays(THIS_WEEK, 2)), productType: 'Sound Attenuation Underlayment', sqft: 9200,  quotedPrice: 41500, equipment: 1500, scope: 'Acoustic underlayment, 2 floors. Sound mat install + 1/2" pour.', status: 'Scheduled' },
  { id: 'J004', name: 'Bolton Industrial Plant',    address: '85 Industrial Rd, Bolton ON',       crewId: 'crewD', date: isoDay(addDays(THIS_WEEK, 3)), productType: 'Hollow-Core Slab Leveling',      sqft: 12000, quotedPrice: 45000, equipment: 1500, scope: 'Warehouse retrofit. Level hollow-core slab to F-min 25.', status: 'Scheduled' },
  { id: 'J005', name: 'Queens Quay Condos T3',      address: '218 Queens Quay W, Toronto ON',     crewId: 'crewA', date: isoDay(addDays(THIS_WEEK, 4)), productType: 'Levelrock RH Radiant Overpour',  sqft: 3100,  quotedPrice: 22500, equipment: 1200, scope: 'Penthouse radiant overpour, 1.25" pour over PEX-AL-PEX.', status: 'Scheduled' },
  { id: 'J006', name: 'Mississauga Civic Square',   address: '300 City Centre Dr, Mississauga ON', crewId: 'crewB', date: isoDay(addDays(THIS_WEEK, 5)), productType: 'Self-Leveling Floor Topping',    sqft: 5400,  quotedPrice: 26800, equipment: 1500, scope: 'Lobby topping ahead of polished concrete finish.', status: 'Scheduled' },
  { id: 'J007', name: 'Aurora School Gymnasium',    address: '155 Wellington St E, Aurora ON',    crewId: 'crewC', date: isoDay(addDays(THIS_WEEK, 6)), productType: 'Sound Attenuation Underlayment', sqft: 2400,  quotedPrice: 12800, equipment: 900,  scope: 'Practice room acoustic underlayment.', status: 'Scheduled' },
  { id: 'J008', name: 'Yonge & Eg Retail Fit-Out',  address: '2300 Yonge St, Toronto ON',         crewId: 'crewD', date: isoDay(addDays(THIS_WEEK, 7)), productType: 'Self-Leveling Floor Topping',    sqft: 1850,  quotedPrice: 11200, equipment: 700,  scope: 'Retail unit prep for LVT install.',           status: 'Scheduled' },
  { id: 'J009', name: 'Brampton Warehouse Reno',    address: '40 Steelwell Rd, Brampton ON',      crewId: 'crewD', date: isoDay(addDays(THIS_WEEK, -2)), productType: 'Hollow-Core Slab Leveling',     sqft: 8800,  quotedPrice: 32000, equipment: 1500, scope: 'Warehouse 1 + Warehouse 2. Substrate prep, primer, level.', status: 'Complete' },
  { id: 'J010', name: 'Oakville Custom Home',       address: '1240 Lakeshore Rd W, Oakville ON',  crewId: 'crewA', date: isoDay(addDays(THIS_WEEK, -3)), productType: 'Levelrock RH Radiant Overpour', sqft: 980,   quotedPrice: 8400,  equipment: 800,  scope: 'Master suite radiant overpour, 1.25".',       status: 'Complete' },
  { id: 'J011', name: 'Vaughan Mills Phase 2',      address: '1 Bass Pro Mills Dr, Vaughan ON',   crewId: 'crewB', date: isoDay(addDays(THIS_WEEK, 8)), productType: 'Self-Leveling Floor Topping',    sqft: 4400,  quotedPrice: 23800, equipment: 1500, scope: 'Storefront topping prior to tile install.',   status: 'Scheduled' },
];

// =====================================================================
// Cost / margin helpers
// =====================================================================

function jobCosts(job) {
  const rate = PRODUCT_TYPES[job.productType] || { matRate: 2.5, laborRate: 1.5 };
  const materials = +(rate.matRate * job.sqft).toFixed(0);
  const labor     = +(rate.laborRate * job.sqft).toFixed(0);
  const equipment = job.equipment || 0;
  const total     = materials + labor + equipment;
  const margin    = job.quotedPrice > 0 ? (job.quotedPrice - total) / job.quotedPrice : 0;
  return { materials, labor, equipment, total, margin, profit: job.quotedPrice - total };
}
const money = (n) => `$${Math.round(n).toLocaleString()}`;
const pct   = (n) => `${(n * 100).toFixed(1)}%`;

// =====================================================================
// jobs reducer
// =====================================================================

function jobsReducer(state, action) {
  switch (action.type) {
    case 'add':
      return [...state, action.job];
    case 'move':
      return state.map((j) =>
        j.id === action.jobId ? { ...j, crewId: action.crewId ?? j.crewId, date: action.date ?? j.date } : j
      );
    case 'update':
      return state.map((j) => (j.id === action.jobId ? { ...j, ...action.patch } : j));
    case 'remove':
      return state.filter((j) => j.id !== action.jobId);
    default:
      return state;
  }
}

// =====================================================================
// Top-level App
// =====================================================================

function App() {
  const [jobs, dispatch] = useReducer(jobsReducer, SEED_JOBS);
  const [view, setView] = useState('board');           // board | financials
  const [weekOffset, setWeekOffset] = useState(0);
  const [scale, setScale] = useState('week');          // week | day
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [showAddJob, setShowAddJob] = useState(false);
  const [showChat, setShowChat] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('cft_anthropic_key') || '');

  const weekStart = useMemo(() => addDays(THIS_WEEK, weekOffset * 7), [weekOffset]);
  const weekDays  = useMemo(() => Array.from({ length: 6 }, (_, i) => addDays(weekStart, i)), [weekStart]);

  const pushToast = useCallback((msg, kind = 'success') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, msg, kind }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);

  const addJob = (job) => {
    const id = 'J' + String(Date.now()).slice(-5);
    dispatch({ type: 'add', job: { ...job, id, status: job.status || 'Scheduled' } });
    pushToast(`Job created: ${job.name}`);
    return id;
  };
  const moveJob   = (jobId, { crewId, date }) => dispatch({ type: 'move', jobId, crewId, date });
  const updateJob = (jobId, patch) => dispatch({ type: 'update', jobId, patch });

  const selectedJob = jobs.find((j) => j.id === selectedJobId) || null;

  return (
    <div className="h-full flex flex-col text-cft-text">
      <Topbar
        onOpenSettings={() => setShowSettings(true)}
        weekStart={weekStart}
        weekOffset={weekOffset}
        view={view}
      />

      <div className="flex-1 flex min-h-0">
        <Sidebar view={view} setView={setView} onAddJob={() => setShowAddJob(true)} />

        <main className="flex-1 min-w-0 flex">
          <div className="flex-1 min-w-0 overflow-auto scrollbar-thin">
            {view === 'board' ? (
              <BoardView
                jobs={jobs}
                crews={CREWS}
                weekDays={weekDays}
                scale={scale}
                setScale={setScale}
                weekOffset={weekOffset}
                setWeekOffset={setWeekOffset}
                onSelect={setSelectedJobId}
                onMove={(jobId, target) => {
                  moveJob(jobId, target);
                  pushToast('Job rescheduled • Calendar synced');
                }}
                onAddJob={() => setShowAddJob(true)}
              />
            ) : (
              <FinancialsView jobs={jobs} weekStart={weekStart} onSelect={setSelectedJobId} pushToast={pushToast} />
            )}
          </div>

          {view === 'board' && (
            <CalendarPanel jobs={jobs.filter((j) => new Date(j.date) >= weekStart && new Date(j.date) < addDays(weekStart, 7))} />
          )}
        </main>

        <ChatPanel
          open={showChat}
          setOpen={setShowChat}
          jobs={jobs}
          crews={CREWS}
          apiKey={apiKey}
          weekStart={weekStart}
          dispatch={dispatch}
          addJob={addJob}
          moveJob={moveJob}
          updateJob={updateJob}
          pushToast={pushToast}
          onOpenSettings={() => setShowSettings(true)}
        />
      </div>

      {selectedJob && (
        <JobDetailModal
          job={selectedJob}
          onClose={() => setSelectedJobId(null)}
          onUpdate={(patch) => updateJob(selectedJob.id, patch)}
          onPushQBO={() => pushToast(`Invoice created in QuickBooks for ${selectedJob.name}`)}
        />
      )}

      {showAddJob && (
        <AddJobModal
          weekDays={weekDays}
          onClose={() => setShowAddJob(false)}
          onCreate={(job) => { addJob(job); setShowAddJob(false); }}
        />
      )}

      {showSettings && (
        <SettingsModal
          apiKey={apiKey}
          setApiKey={(k) => { setApiKey(k); localStorage.setItem('cft_anthropic_key', k); }}
          onClose={() => setShowSettings(false)}
        />
      )}

      <Toaster toasts={toasts} />

      <div className="fixed bottom-4 left-4 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cft-orange/10 border border-cft-orange/30 text-cft-orange text-[10px] font-display font-bold tracking-[0.25em] uppercase backdrop-blur">
        <span className="w-1.5 h-1.5 rounded-full bg-cft-orange pulse-dot" />
        Demo Mode
      </div>
    </div>
  );
}

// =====================================================================
// Top bar
// =====================================================================

function Topbar({ onOpenSettings, weekStart, weekOffset, view }) {
  return (
    <header className="h-16 shrink-0 flex items-center justify-between px-6 glass border-b hairline relative z-20">
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-3">
          <div className="relative w-9 h-9 rounded-lg bg-gradient-to-br from-cft-orange to-cft-orange2 grid place-items-center shadow-glow-orange">
            <div className="font-display font-black text-white text-base tracking-tighter leading-none">CFT</div>
            <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-cft-success ring-2 ring-cft-bg" />
          </div>
          <div className="leading-tight">
            <div className="font-display font-bold text-[15px] tracking-wide uppercase text-cft-text">Operations Hub</div>
            <div className="text-[10px] font-display tracking-[0.25em] uppercase text-cft-muted">Concrete Floor Tek</div>
          </div>
        </div>

        <div className="hidden md:block h-7 w-px bg-white/10" />

        <div className="hidden md:flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/5 border hairline">
            <Icon name={view === 'board' ? 'calendar' : 'dollar'} className="w-3.5 h-3.5 text-cft-orange" />
            <span className="text-[11px] font-display font-semibold tracking-widest uppercase text-cft-text">
              {view === 'board' ? `Week of ${fmtShort(weekStart)}` : 'Financials'}
            </span>
            {weekOffset !== 0 && view === 'board' && (
              <span className="text-[10px] font-display font-bold text-cft-orange">{weekOffset > 0 ? `+${weekOffset}W` : `${weekOffset}W`}</span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <ConnectionPill label="Google Calendar" />
        <ConnectionPill label="QuickBooks Online" />
        <button
          onClick={onOpenSettings}
          className="lift flex items-center gap-1.5 text-[11px] font-display font-semibold tracking-widest uppercase text-cft-muted hover:text-cft-text px-2.5 py-1.5 rounded-md border hairline hover:border-white/20 bg-white/5"
          title="Settings"
        >
          <Icon name="settings" className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
}

function ConnectionPill({ label }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border hairline">
      <span className="relative flex w-2 h-2">
        <span className="absolute inset-0 rounded-full bg-cft-success opacity-60 pulse-dot" />
        <span className="relative w-2 h-2 rounded-full bg-cft-success" />
      </span>
      <span className="text-[10px] font-display font-semibold tracking-widest uppercase text-cft-muted2">{label}</span>
    </div>
  );
}

// =====================================================================
// Sidebar
// =====================================================================

function Sidebar({ view, setView, onAddJob }) {
  const NavItem = ({ id, label, icon }) => {
    const active = view === id;
    return (
      <button
        onClick={() => setView(id)}
        className={
          'relative w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left lift group ' +
          (active
            ? 'bg-gradient-to-r from-cft-orange/20 to-transparent text-cft-text'
            : 'text-cft-muted hover:text-cft-text hover:bg-white/5')
        }
      >
        {active && <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full bg-cft-orange shadow-glow-orange" />}
        <Icon name={icon} className={'w-4 h-4 ' + (active ? 'text-cft-orange' : 'text-cft-muted group-hover:text-cft-text')} />
        <span className="font-display font-semibold text-[13px] tracking-wider uppercase">{label}</span>
      </button>
    );
  };

  return (
    <aside className="w-56 shrink-0 border-r hairline bg-cft-surface/30 p-3 flex flex-col gap-1 relative z-10">
      <div className="px-2 pt-1 pb-2 text-[10px] font-display font-bold tracking-[0.25em] uppercase text-cft-muted">Workspace</div>
      <NavItem id="board"      label="Crew Board" icon="grid" />
      <NavItem id="financials" label="Financials" icon="dollar" />

      <div className="mt-4 pt-4 border-t hairline">
        <button
          onClick={onAddJob}
          className="ai-button w-full px-3 py-2.5 rounded-lg text-white font-display font-bold text-[13px] tracking-wider uppercase lift flex items-center justify-center gap-2"
        >
          <Icon name="plus" className="w-4 h-4" />
          <span>Add Job</span>
        </button>
      </div>

      <div className="mt-4 px-2">
        <div className="text-[10px] font-display font-bold tracking-[0.25em] uppercase text-cft-muted mb-2">Connected</div>
        <div className="space-y-1.5">
          <SourcePill icon="calendar" label="Google Calendar" />
          <SourcePill icon="book"     label="QuickBooks" />
        </div>
      </div>

      <div className="mt-auto pt-4 border-t hairline px-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-gradient-to-br from-cft-orange to-cft-orange2 grid place-items-center text-white font-display font-black text-[10px]">RS</div>
          <div className="leading-tight">
            <div className="text-[11px] font-display font-semibold text-cft-text">Randy Simpson</div>
            <div className="text-[9px] font-display tracking-widest uppercase text-cft-muted">Project Manager</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

function SourcePill({ icon, label }) {
  return (
    <div className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-white/5 border hairline">
      <Icon name={icon} className="w-3.5 h-3.5 text-cft-muted" />
      <span className="text-[10px] font-display font-semibold tracking-widest uppercase text-cft-muted2 flex-1">{label}</span>
      <span className="w-1.5 h-1.5 rounded-full bg-cft-success pulse-dot" />
    </div>
  );
}

// =====================================================================
// Board view (crew schedule)
// =====================================================================

function BoardView({ jobs, crews, weekDays, scale, setScale, weekOffset, setWeekOffset, onSelect, onMove, onAddJob }) {
  const [dayIndex, setDayIndex] = useState(0);
  const visibleDays = scale === 'day' ? [weekDays[dayIndex]] : weekDays;
  const todayIso = isoDay(TODAY);

  const weekJobs = jobs.filter((j) => new Date(j.date) >= weekDays[0] && new Date(j.date) <= weekDays[5]);
  const weekSf   = weekJobs.reduce((a, j) => a + j.sqft, 0);
  const weekVal  = weekJobs.reduce((a, j) => a + j.quotedPrice, 0);

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex items-end justify-between mb-5">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-display font-bold tracking-[0.3em] uppercase text-cft-orange mb-1">
            <span className="w-6 h-px bg-cft-orange" />
            <span>Scheduling</span>
          </div>
          <div className="font-display font-black text-[2.6rem] leading-none tracking-tight">Crew Board</div>
          <div className="text-sm text-cft-muted2 mt-1.5">{fmtLong(weekDays[0])} → {fmtLong(weekDays[5])}</div>
        </div>

        <div className="flex items-center gap-2">
          <MiniStat label="Jobs"     value={weekJobs.length} />
          <MiniStat label="Sq Ft"    value={weekSf.toLocaleString()} />
          <MiniStat label="Pipeline" value={'$' + (weekVal / 1000).toFixed(0) + 'k'} accent />
        </div>
      </div>

      {/* Controls bar */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border hairline bg-white/5 overflow-hidden p-0.5">
            <SegBtn active={scale === 'week'} onClick={() => setScale('week')}>Week</SegBtn>
            <SegBtn active={scale === 'day'}  onClick={() => setScale('day')}>Day</SegBtn>
          </div>

          {scale === 'day' && (
            <div className="flex items-center gap-1 text-cft-muted bg-white/5 rounded-lg border hairline px-1">
              <IconBtn onClick={() => setDayIndex(Math.max(0, dayIndex - 1))} icon="chevronL" />
              <div className="font-display font-bold uppercase tracking-widest text-[11px] text-cft-text px-2">
                {DAY_LABELS[dayIndex]} · {fmtShort(weekDays[dayIndex])}
              </div>
              <IconBtn onClick={() => setDayIndex(Math.min(5, dayIndex + 1))} icon="chevronR" />
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 bg-white/5 rounded-lg border hairline px-1">
          <IconBtn onClick={() => setWeekOffset(weekOffset - 1)} icon="chevronL" />
          <button onClick={() => setWeekOffset(0)} className="px-3 py-1.5 text-[11px] font-display font-bold tracking-widest uppercase hover:text-cft-orange text-cft-muted2">This Week</button>
          <IconBtn onClick={() => setWeekOffset(weekOffset + 1)} icon="chevronR" />
        </div>
      </div>

      {/* Board */}
      <div className="rounded-2xl glass overflow-hidden card">
        <div className="grid" style={{ gridTemplateColumns: `240px repeat(${visibleDays.length}, minmax(0, 1fr))` }}>
          {/* Corner */}
          <div className="px-4 py-3.5 border-b border-r hairline bg-white/5">
            <div className="font-display font-bold text-[10px] tracking-[0.25em] uppercase text-cft-muted">Crew</div>
          </div>
          {/* Day headers */}
          {visibleDays.map((d, i) => {
            const isToday = isoDay(d) === todayIso;
            return (
              <div key={i} className={'px-3 py-3.5 border-b hairline ' + (isToday ? 'bg-cft-orange/10' : 'bg-white/5')}>
                <div className={'flex items-center justify-between'}>
                  <div className="font-display font-bold text-[10px] tracking-[0.25em] uppercase text-cft-muted">
                    {DAY_LABELS[scale === 'day' ? dayIndex : i]}
                  </div>
                  {isToday && <span className="text-[9px] font-display font-bold tracking-widest uppercase text-cft-orange px-1.5 py-0.5 rounded bg-cft-orange/20">Today</span>}
                </div>
                <div className={'text-[15px] mt-0.5 font-display font-semibold ' + (isToday ? 'text-cft-orange' : 'text-cft-text')}>{fmtShort(d)}</div>
              </div>
            );
          })}

          {/* Rows */}
          {crews.map((crew, ci) => (
            <React.Fragment key={crew.id}>
              <div className={'px-4 py-3.5 border-r hairline ' + (ci < crews.length - 1 ? 'border-b' : '')}>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-md bg-gradient-to-br from-white/10 to-white/5 border hairline grid place-items-center font-display font-black text-cft-orange text-sm">{crew.name.slice(-1)}</div>
                  <div className="min-w-0">
                    <div className="font-display font-bold text-[14px] text-cft-text tracking-wide leading-tight">{crew.name}</div>
                    <div className="text-[11px] text-cft-muted2 truncate">{crew.members}</div>
                  </div>
                </div>
                <div className="text-[9px] text-cft-orange/80 font-display tracking-[0.2em] uppercase mt-1.5 truncate">{crew.specialty}</div>
              </div>

              {visibleDays.map((d, i) => {
                const dayIso = isoDay(d);
                const cellJobs = jobs.filter((j) => j.crewId === crew.id && j.date === dayIso);
                const isToday = dayIso === todayIso;
                return (
                  <DropCell
                    key={crew.id + '-' + i}
                    crewId={crew.id}
                    date={dayIso}
                    isToday={isToday}
                    isLast={ci === crews.length - 1}
                    onDropJob={onMove}
                  >
                    {cellJobs.length === 0 ? (
                      <div className="h-full min-h-[96px] flex items-center justify-center text-cft-muted/30 text-[11px] uppercase tracking-widest font-display">— available —</div>
                    ) : (
                      cellJobs.map((job) => (
                        <JobCard key={job.id} job={job} onClick={() => onSelect(job.id)} />
                      ))
                    )}
                  </DropCell>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-between text-[11px] font-display tracking-[0.2em] uppercase text-cft-muted px-1">
        <div className="flex items-center gap-5">
          {Object.entries(STATUS_META).map(([k, m]) => (
            <div key={k} className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${m.dot}`} />
              <span>{k}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-1.5 text-cft-muted">
          <Icon name="arrows" className="w-3.5 h-3.5 text-cft-orange" />
          <span>Drag any job card to reschedule</span>
        </div>
      </div>
    </div>
  );
}

function SegBtn({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={'px-3 py-1.5 text-[11px] font-display font-bold tracking-widest uppercase rounded-md transition ' +
        (active ? 'bg-cft-orange text-white shadow-glow-orange' : 'text-cft-muted hover:text-cft-text')}
    >{children}</button>
  );
}
function IconBtn({ onClick, icon }) {
  return (
    <button onClick={onClick} className="px-1.5 py-1.5 rounded-md hover:bg-white/5 text-cft-muted hover:text-cft-text">
      <Icon name={icon} className="w-3.5 h-3.5" />
    </button>
  );
}
function MiniStat({ label, value, accent }) {
  return (
    <div className="px-3.5 py-2 rounded-lg bg-white/5 border hairline">
      <div className="text-[9px] font-display font-bold tracking-[0.25em] uppercase text-cft-muted">{label}</div>
      <div className={'font-display font-bold text-base num ' + (accent ? 'text-cft-orange' : 'text-cft-text')}>{value}</div>
    </div>
  );
}

function DropCell({ crewId, date, isToday, isLast, children, onDropJob }) {
  const ref = useRef(null);
  return (
    <div
      ref={ref}
      className={'min-h-[112px] p-2 border-r hairline space-y-2 transition ' + (isLast ? '' : 'border-b ') + (isToday ? 'bg-cft-orange/[0.025]' : '')}
      onDragOver={(e) => { e.preventDefault(); ref.current?.classList.add('drag-over'); }}
      onDragLeave={() => ref.current?.classList.remove('drag-over')}
      onDrop={(e) => {
        e.preventDefault();
        ref.current?.classList.remove('drag-over');
        const jobId = e.dataTransfer.getData('text/job-id');
        if (jobId) onDropJob(jobId, { crewId, date });
      }}
    >
      {children}
    </div>
  );
}

function JobCard({ job, onClick }) {
  const meta = STATUS_META[job.status];
  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('text/job-id', job.id);
        e.dataTransfer.effectAllowed = 'move';
        e.currentTarget.classList.add('dragging');
      }}
      onDragEnd={(e) => e.currentTarget.classList.remove('dragging')}
      onClick={onClick}
      className="job-card fade-in relative cursor-grab active:cursor-grabbing rounded-lg bg-cft-surface2/80 hover:bg-cft-surface2 border hairline hover:border-white/20 hover:shadow-card pl-3 pr-2.5 py-2 overflow-hidden"
      title="Drag to reschedule"
    >
      <span className={'accent-bar ' + meta.bar} />
      <div className="flex items-center justify-between gap-2">
        <div className={'flex items-center gap-1.5 text-[9px] font-display font-bold tracking-[0.2em] uppercase ' + meta.text}>
          <span className={'w-1.5 h-1.5 rounded-full ' + meta.dot} />
          {job.status}
        </div>
        <span className="text-[10px] text-cft-muted font-mono num">{job.sqft.toLocaleString()} sf</span>
      </div>
      <div className="font-display font-bold text-[13px] leading-tight mt-1 text-cft-text truncate">{job.name}</div>
      <div className="text-[11px] text-cft-muted2 truncate">{job.address}</div>
      <div className="flex items-center justify-between mt-1.5">
        <div className="text-[9px] text-cft-orange/90 font-display tracking-[0.15em] uppercase truncate">{job.productType}</div>
        <div className="text-[10px] text-cft-muted font-mono num">${(job.quotedPrice / 1000).toFixed(1)}k</div>
      </div>
    </div>
  );
}

// =====================================================================
// Calendar sync panel
// =====================================================================

function CalendarPanel({ jobs }) {
  const sorted = [...jobs].sort((a, b) => a.date.localeCompare(b.date));
  const grouped = sorted.reduce((acc, j) => { (acc[j.date] = acc[j.date] || []).push(j); return acc; }, {});
  return (
    <aside className="hidden lg:flex flex-col w-80 shrink-0 border-l hairline bg-cft-surface/20 relative">
      <div className="px-4 py-3.5 border-b hairline flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-md bg-gradient-to-br from-cft-orange/20 to-cft-orange/0 border border-cft-orange/30 grid place-items-center text-cft-orange">
            <Icon name="calendar" className="w-4 h-4" />
          </div>
          <div>
            <div className="font-display font-bold text-[13px] tracking-widest uppercase text-cft-text">Google Calendar</div>
            <div className="text-[9px] text-cft-muted font-display tracking-[0.2em] uppercase">Live mirror · this week</div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-cft-success/10 border border-cft-success/30">
          <span className="w-1.5 h-1.5 rounded-full bg-cft-success pulse-dot" />
          <span className="text-[9px] font-display font-bold tracking-widest uppercase text-cft-success">Synced</span>
        </div>
      </div>

      <div className="flex-1 overflow-auto scrollbar-thin p-3 space-y-3">
        {sorted.length === 0 && <div className="text-cft-muted text-xs italic px-1 mt-2">No events this week.</div>}
        {Object.keys(grouped).sort().map((d) => (
          <div key={d}>
            <div className="flex items-center gap-2 mb-1.5 px-1">
              <div className="text-[10px] font-display font-bold tracking-[0.25em] uppercase text-cft-orange">{dayName(d)}</div>
              <div className="text-[10px] text-cft-muted font-mono num">{fmtShort(d)}</div>
              <div className="flex-1 h-px bg-white/5" />
              <div className="text-[9px] text-cft-muted font-mono num">{grouped[d].length} event{grouped[d].length > 1 ? 's' : ''}</div>
            </div>
            <div className="space-y-1.5">
              {grouped[d].map((job) => {
                const crew = CREWS.find((c) => c.id === job.crewId);
                const meta = STATUS_META[job.status];
                return (
                  <div key={job.id} className="lift relative rounded-lg bg-white/5 border hairline hover:border-white/20 px-3 py-2.5 fade-in overflow-hidden">
                    <span className={'accent-bar ' + meta.bar} />
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <div className="font-display font-bold text-[13px] leading-tight text-cft-text truncate">{job.name}</div>
                      <Icon name="check" className="w-3 h-3 text-cft-success shrink-0" />
                    </div>
                    <div className="text-[11px] text-cft-muted2 truncate">{crew?.name} · {crew?.members}</div>
                    <div className="text-[10px] text-cft-muted truncate">{job.address}</div>
                    <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-white/5">
                      <div className="text-[9px] text-cft-muted font-mono num">07:00 – 16:30</div>
                      <div className="text-[9px] text-cft-muted2 font-display tracking-widest uppercase">All-day block</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="px-3 py-2.5 border-t hairline">
        <div className="text-[9px] text-cft-muted/70 font-mono flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-cft-success" />
          <span>POST /calendar/v3/events → 200 OK</span>
        </div>
      </div>
    </aside>
  );
}

// =====================================================================
// Financials view
// =====================================================================

function FinancialsView({ jobs, weekStart, onSelect, pushToast }) {
  const weekEnd = addDays(weekStart, 7);
  const inWeek  = jobs.filter((j) => new Date(j.date) >= weekStart && new Date(j.date) < weekEnd);
  const allCompleted = jobs.filter((j) => j.status === 'Complete');

  const sumRevenue = inWeek.reduce((a, j) => a + j.quotedPrice, 0);
  const sumCost    = inWeek.reduce((a, j) => a + jobCosts(j).total, 0);
  const margin     = sumRevenue ? (sumRevenue - sumCost) / sumRevenue : 0;
  const completedCount = allCompleted.length;

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      <div className="flex items-end justify-between mb-5">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-display font-bold tracking-[0.3em] uppercase text-cft-orange mb-1">
            <span className="w-6 h-px bg-cft-orange" />
            <span>Financials</span>
          </div>
          <div className="font-display font-black text-[2.6rem] leading-none tracking-tight">Job Costing</div>
          <div className="text-sm text-cft-muted2 mt-1.5">Week of {fmtShort(weekStart)} · pulled from QuickBooks</div>
        </div>
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white/5 border hairline">
          <Icon name="book" className="w-4 h-4 text-cft-success" />
          <div>
            <div className="text-[9px] font-display font-bold tracking-[0.25em] uppercase text-cft-muted">QuickBooks Online</div>
            <div className="text-[11px] text-cft-success font-display font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cft-success pulse-dot" /> Connected
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
        <StatCard label="Revenue"      value={money(sumRevenue)} accent="text-cft-text"    sub="Quoted this week"        glow="from-cft-orange/10" />
        <StatCard label="Total Costs"  value={money(sumCost)}    accent="text-cft-warning" sub="Materials + labor + equip" glow="from-cft-warning/10" />
        <StatCard label="Gross Margin" value={pct(margin)}       accent="text-cft-success" sub={money(sumRevenue - sumCost) + ' profit'} glow="from-cft-success/10" badge={pct(margin)} />
        <StatCard label="Completed"    value={completedCount}    accent="text-cft-orange"  sub="Lifetime in system"      glow="from-cft-orange/10" />
      </div>

      <div className="rounded-2xl glass overflow-hidden card">
        <div className="grid grid-cols-12 px-5 py-3 bg-white/5 border-b hairline text-[10px] font-display font-bold tracking-[0.25em] uppercase text-cft-muted">
          <div className="col-span-4">Job</div>
          <div className="col-span-1 text-right">SF</div>
          <div className="col-span-2 text-right">Materials</div>
          <div className="col-span-1 text-right">Labor</div>
          <div className="col-span-1 text-right">Total Cost</div>
          <div className="col-span-1 text-right">Quoted</div>
          <div className="col-span-1 text-right">Margin</div>
          <div className="col-span-1 text-right">Action</div>
        </div>

        {jobs.map((j, idx) => {
          const c = jobCosts(j);
          const marginColor = c.margin >= 0.30 ? 'text-cft-success' : c.margin >= 0.20 ? 'text-cft-warning' : 'text-cft-danger';
          const meta = STATUS_META[j.status];
          return (
            <div key={j.id} className={'grid grid-cols-12 px-5 py-3.5 items-center hover:bg-white/5 transition group relative ' + (idx < jobs.length - 1 ? 'border-b hairline' : '')}>
              <div className="col-span-4 cursor-pointer flex items-center gap-2.5" onClick={() => onSelect(j.id)}>
                <span className={'w-1 h-8 rounded-full ' + meta.bar} />
                <div className="min-w-0">
                  <div className="font-display font-semibold text-[14px] text-cft-text group-hover:text-cft-orange transition">{j.name}</div>
                  <div className="text-[11px] text-cft-muted2 truncate">{j.address}</div>
                </div>
              </div>
              <div className="col-span-1 text-right text-cft-muted2 font-mono text-xs num">{j.sqft.toLocaleString()}</div>
              <div className="col-span-2 text-right font-mono text-sm num text-cft-text">{money(c.materials)}</div>
              <div className="col-span-1 text-right font-mono text-sm num text-cft-text">{money(c.labor)}</div>
              <div className="col-span-1 text-right font-mono text-sm num text-cft-text">{money(c.total)}</div>
              <div className="col-span-1 text-right font-mono text-sm num text-cft-text">{money(j.quotedPrice)}</div>
              <div className={`col-span-1 text-right font-display font-bold text-[15px] num ${marginColor}`}>{pct(c.margin)}</div>
              <div className="col-span-1 text-right">
                <button
                  onClick={() => pushToast(`Invoice created in QuickBooks for ${j.name}`)}
                  className="lift text-[10px] font-display font-bold tracking-widest uppercase px-2.5 py-1.5 rounded-md border border-cft-orange/40 text-cft-orange hover:bg-cft-orange/10 hover:border-cft-orange/70"
                >
                  Push QBO
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatCard({ label, value, accent = 'text-cft-text', sub, glow = 'from-white/5', badge }) {
  return (
    <div className="relative rounded-2xl glass card overflow-hidden p-5 lift">
      <div className={'absolute inset-x-0 -top-12 h-24 bg-gradient-to-b ' + glow + ' to-transparent pointer-events-none'} />
      <div className="relative flex items-center justify-between">
        <div className="text-[10px] font-display font-bold tracking-[0.25em] uppercase text-cft-muted">{label}</div>
        {badge && <div className={'text-[10px] font-display font-bold px-2 py-0.5 rounded-full bg-white/5 ' + accent}>{badge}</div>}
      </div>
      <div className={`relative font-display font-black text-4xl mt-2 num ${accent}`}>{value}</div>
      {sub && <div className="relative text-[11px] text-cft-muted2 mt-1">{sub}</div>}
    </div>
  );
}

// =====================================================================
// Job detail modal
// =====================================================================

function JobDetailModal({ job, onClose, onUpdate, onPushQBO }) {
  const crew = CREWS.find((c) => c.id === job.crewId);
  const c = jobCosts(job);
  const meta = STATUS_META[job.status];

  return (
    <Modal onClose={onClose} maxWidth="max-w-2xl">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/5 border hairline text-[10px] font-display font-bold tracking-widest uppercase ' + meta.text}>
              <span className={'w-1.5 h-1.5 rounded-full ' + meta.dot} />
              {job.status}
            </span>
            <div className="text-[10px] font-display font-bold tracking-widest uppercase text-cft-muted font-mono">{job.id}</div>
          </div>
          <div className="font-display font-black text-2xl tracking-tight leading-tight">{job.name}</div>
          <div className="text-cft-muted2 text-sm flex items-center gap-1.5 mt-1"><Icon name="map" className="w-3.5 h-3.5" />{job.address}</div>
        </div>
        <select
          value={job.status}
          onChange={(e) => onUpdate({ status: e.target.value })}
          className={'bg-white/5 border hairline text-cft-text font-display font-bold text-xs tracking-widest uppercase px-3 py-2 rounded-lg cursor-pointer focus:outline-none focus:border-cft-orange/60'}
        >
          {Object.keys(STATUS_META).map((s) => <option key={s} value={s} className="bg-cft-surface text-cft-text">{s}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-2.5 mb-4">
        <Field label="Crew">{crew?.name} — {crew?.members}</Field>
        <Field label="Scheduled">{fmtLong(job.date)}</Field>
        <Field label="Product">{job.productType}</Field>
        <Field label="Square Feet"><span className="num">{job.sqft.toLocaleString()}</span> sf</Field>
      </div>

      <div className="rounded-xl border hairline bg-white/5 p-3.5 mb-4">
        <div className="font-display font-bold text-[10px] tracking-[0.25em] uppercase text-cft-muted mb-1.5">Scope / Notes</div>
        <div className="text-sm text-cft-text leading-relaxed">{job.scope}</div>
      </div>

      <div className="grid grid-cols-5 gap-2 mb-5">
        <Stat small label="Materials" value={money(c.materials)} />
        <Stat small label="Labor"     value={money(c.labor)} />
        <Stat small label="Equipment" value={money(c.equipment)} />
        <Stat small label="Quoted"    value={money(job.quotedPrice)} accent="text-cft-text" />
        <Stat small label="Margin"    value={pct(c.margin)} accent={c.margin >= 0.30 ? 'text-cft-success' : c.margin >= 0.20 ? 'text-cft-warning' : 'text-cft-danger'} />
      </div>

      <div className="flex items-center justify-end gap-2">
        <button onClick={onPushQBO} className="lift px-3.5 py-2 rounded-lg border border-cft-orange/40 text-cft-orange font-display font-bold text-xs tracking-widest uppercase hover:bg-cft-orange/10 hover:border-cft-orange/70 flex items-center gap-1.5">
          <Icon name="book" className="w-3.5 h-3.5" />
          Push to QuickBooks
        </button>
        <button onClick={onClose} className="ai-button lift px-4 py-2 rounded-lg text-white font-display font-bold text-xs tracking-widest uppercase">
          Done
        </button>
      </div>
    </Modal>
  );
}

function Field({ label, children }) {
  return (
    <div className="rounded-xl border hairline bg-white/5 p-3">
      <div className="text-[10px] font-display font-bold tracking-[0.25em] uppercase text-cft-muted">{label}</div>
      <div className="text-sm text-cft-text mt-0.5">{children}</div>
    </div>
  );
}
function Stat({ label, value, accent = 'text-cft-text', small }) {
  return (
    <div className="rounded-xl border hairline bg-white/5 p-2.5 text-center">
      <div className="text-[9px] font-display font-bold tracking-[0.2em] uppercase text-cft-muted">{label}</div>
      <div className={`font-display font-bold ${small ? 'text-base' : 'text-xl'} num ${accent} mt-0.5`}>{value}</div>
    </div>
  );
}

// =====================================================================
// Add job modal
// =====================================================================

function AddJobModal({ weekDays, onClose, onCreate }) {
  const [form, setForm] = useState({
    name: '', address: '', scope: '',
    crewId: CREWS[0].id,
    date: isoDay(weekDays[0]),
    productType: Object.keys(PRODUCT_TYPES)[0],
    sqft: 3000,
    quotedPrice: 15000,
    equipment: 1200,
    status: 'Scheduled',
  });
  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.address.trim()) return;
    onCreate({
      ...form,
      sqft: Number(form.sqft) || 0,
      quotedPrice: Number(form.quotedPrice) || 0,
      equipment: Number(form.equipment) || 0,
    });
  };

  return (
    <Modal onClose={onClose} maxWidth="max-w-xl">
      <div className="mb-5">
        <div className="flex items-center gap-2 text-[10px] font-display font-bold tracking-[0.3em] uppercase text-cft-orange mb-1">
          <Icon name="plus" className="w-3.5 h-3.5" />
          <span>New Pour</span>
        </div>
        <div className="font-display font-black text-2xl tracking-tight">Add Job</div>
        <div className="text-cft-muted2 text-sm">Schedule a new pour and sync to Calendar + QuickBooks</div>
      </div>

      <form onSubmit={submit} className="space-y-3">
        <Input label="Job Name"   value={form.name}    onChange={(v) => update('name', v)}    placeholder="e.g. Maple Ave Townhomes" />
        <Input label="Site Address" value={form.address} onChange={(v) => update('address', v)} placeholder="128 Maple Ave, Vaughan ON" />
        <div className="grid grid-cols-2 gap-3">
          <Select label="Crew" value={form.crewId} onChange={(v) => update('crewId', v)}>
            {CREWS.map((c) => <option key={c.id} value={c.id}>{c.name} — {c.lead}</option>)}
          </Select>
          <Select label="Date" value={form.date} onChange={(v) => update('date', v)}>
            {weekDays.map((d, i) => <option key={i} value={isoDay(d)}>{DAY_LABELS[i]} · {fmtShort(d)}</option>)}
          </Select>
          <Select label="Product Type" value={form.productType} onChange={(v) => update('productType', v)}>
            {Object.keys(PRODUCT_TYPES).map((p) => <option key={p}>{p}</option>)}
          </Select>
          <Input label="Square Feet" type="number" value={form.sqft} onChange={(v) => update('sqft', v)} />
          <Input label="Quoted Price ($)" type="number" value={form.quotedPrice} onChange={(v) => update('quotedPrice', v)} />
          <Input label="Equipment ($)" type="number" value={form.equipment} onChange={(v) => update('equipment', v)} />
        </div>
        <Textarea label="Scope / Notes" value={form.scope} onChange={(v) => update('scope', v)} placeholder='e.g. 4 units, 1.5" pour, prep included' />

        <div className="flex items-center justify-end gap-2 pt-3">
          <button type="button" onClick={onClose} className="lift px-3.5 py-2 rounded-lg border hairline text-cft-muted2 font-display font-bold text-xs tracking-widest uppercase hover:text-cft-text hover:border-white/20">Cancel</button>
          <button type="submit" className="ai-button lift px-4 py-2 rounded-lg text-white font-display font-bold text-xs tracking-widest uppercase flex items-center gap-1.5">
            <Icon name="plus" className="w-3.5 h-3.5" />
            Create Job
          </button>
        </div>
      </form>
    </Modal>
  );
}

const inputBase = "w-full bg-white/5 border hairline rounded-lg px-3 py-2.5 text-sm text-cft-text placeholder-cft-muted/60 focus:outline-none focus:border-cft-orange/60 focus:bg-white/10 transition";
const labelBase = "text-[10px] font-display font-bold tracking-[0.25em] uppercase text-cft-muted mb-1.5";

function Input({ label, value, onChange, type = 'text', placeholder }) {
  return (
    <label className="block">
      <div className={labelBase}>{label}</div>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={inputBase} />
    </label>
  );
}
function Select({ label, value, onChange, children }) {
  return (
    <label className="block">
      <div className={labelBase}>{label}</div>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={inputBase + ' cursor-pointer'}>
        {children}
      </select>
    </label>
  );
}
function Textarea({ label, value, onChange, placeholder }) {
  return (
    <label className="block">
      <div className={labelBase}>{label}</div>
      <textarea rows={3} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={inputBase} />
    </label>
  );
}

// =====================================================================
// AI chat panel
// =====================================================================

const ANTHROPIC_MODEL = 'claude-opus-4-6';

function ChatPanel({ open, setOpen, jobs, crews, apiKey, weekStart, dispatch, addJob, moveJob, updateJob, pushToast, onOpenSettings }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: "Hey, I'm your CFT Operations Agent. Ask me about crews, jobs, margins, or tell me to schedule something." },
  ]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, open]);

  const buildSystemPrompt = () => {
    const state = {
      today: isoDay(TODAY),
      week_start: isoDay(weekStart),
      crews: crews.map((c) => ({ id: c.id, name: c.name, members: c.members, lead: c.lead, specialty: c.specialty })),
      jobs: jobs.map((j) => ({ ...j, costs: jobCosts(j) })),
    };
    return [
      'You are the CFT Operations Agent for Concrete Floor Tek (Bolton, Ontario). You help operate a concrete floor pouring business.',
      'You have full, real-time visibility into the crew schedule, job details, and financials below.',
      'Crews work Monday through Saturday (6-day week). Dates are ISO YYYY-MM-DD.',
      '',
      'When the user asks a question, answer concisely in plain text — no markdown headers.',
      'When the user asks to change the schedule or create a job, return a JSON block at the end of your reply in this format:',
      '```actions',
      '[ { "type": "move_job", "jobId": "J001", "crewId": "crewB", "date": "2026-05-15" } ]',
      '```',
      'Supported actions:',
      ' - move_job: { type, jobId, crewId?, date? }',
      ' - add_job:  { type, name, address, crewId, date, productType, sqft, quotedPrice, equipment?, scope? }',
      ' - update_status: { type, jobId, status }  // status: Scheduled | In Progress | Complete',
      '',
      'Valid productType values: ' + Object.keys(PRODUCT_TYPES).map((p) => '"' + p + '"').join(', ') + '.',
      'Quoted price rule of thumb: $5–$8/sf for radiant overpour, $4–$6/sf for topping, $4–$6/sf for underlayment, $3–$5/sf for slab leveling.',
      'Equipment runs $800–$1,500 per job.',
      '',
      'CURRENT OPERATIONS STATE (live):',
      JSON.stringify(state, null, 2),
    ].join('\n');
  };

  const parseActions = (text) => {
    const m = text.match(/```actions\s*([\s\S]*?)```/);
    if (!m) return { actions: [], cleanText: text };
    try {
      const actions = JSON.parse(m[1].trim());
      return { actions: Array.isArray(actions) ? actions : [actions], cleanText: text.replace(m[0], '').trim() };
    } catch (e) {
      return { actions: [], cleanText: text };
    }
  };

  const applyActions = (actions) => {
    let applied = 0;
    actions.forEach((a) => {
      if (a.type === 'move_job' && a.jobId) {
        moveJob(a.jobId, { crewId: a.crewId, date: a.date });
        applied++;
      } else if (a.type === 'update_status' && a.jobId && a.status) {
        updateJob(a.jobId, { status: a.status });
        applied++;
      } else if (a.type === 'add_job' && a.name && a.address && a.crewId && a.date && a.productType && a.sqft) {
        addJob({
          name: a.name,
          address: a.address,
          crewId: a.crewId,
          date: a.date,
          productType: a.productType,
          sqft: Number(a.sqft),
          quotedPrice: Number(a.quotedPrice || a.sqft * 6),
          equipment: Number(a.equipment || 1200),
          scope: a.scope || '',
          status: 'Scheduled',
        });
        applied++;
      }
    });
    if (applied > 0) pushToast(`${applied} change${applied > 1 ? 's' : ''} applied • Calendar synced`);
  };

  const sendToAnthropic = async (userText) => {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: 1024,
        system: buildSystemPrompt(),
        messages: [{ role: 'user', content: userText }],
      }),
    });
    if (!res.ok) throw new Error(`API ${res.status}`);
    const data = await res.json();
    const text = data?.content?.[0]?.text || '';
    return text;
  };

  const send = async (overrideText) => {
    const text = (overrideText ?? input).trim();
    if (!text || busy) return;
    setMessages((m) => [...m, { role: 'user', text }]);
    setInput('');
    setBusy(true);

    try {
      let reply;
      if (apiKey) {
        try {
          reply = await sendToAnthropic(text);
        } catch (e) {
          reply = localAgent(text, { jobs, crews, weekStart });
        }
      } else {
        reply = localAgent(text, { jobs, crews, weekStart });
      }

      const { actions, cleanText } = parseActions(reply);
      setMessages((m) => [...m, { role: 'assistant', text: cleanText || reply }]);
      if (actions.length) applyActions(actions);
    } finally {
      setBusy(false);
    }
  };

  const suggestions = [
    "What jobs are running this week?",
    "Who's available next Tuesday?",
    "What's our margin on the King Street project?",
    "Move Crew B's Thursday job to Friday",
  ];

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="ai-button fixed bottom-20 right-5 z-30 px-5 py-3 rounded-full text-white font-display font-bold text-xs tracking-[0.2em] uppercase flex items-center gap-2 lift"
      >
        <Icon name="sparkle" className="w-4 h-4" />
        <span>Ask the Agent</span>
      </button>
    );
  }

  return (
    <aside className="w-[400px] shrink-0 border-l hairline glass flex flex-col relative">
      {/* Header */}
      <div className="px-4 py-3 border-b hairline flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="relative w-9 h-9 rounded-lg ai-button grid place-items-center">
            <Icon name="sparkle" className="w-4 h-4 text-white" />
          </div>
          <div className="leading-tight">
            <div className="font-display font-bold text-[13px] tracking-widest uppercase text-cft-text">Operations Agent</div>
            <div className="text-[9px] text-cft-muted font-display tracking-[0.2em] uppercase">
              {apiKey ? (
                <span className="text-cft-success">● Claude · {ANTHROPIC_MODEL}</span>
              ) : (
                <span className="text-cft-warning cursor-pointer hover:underline" onClick={onOpenSettings}>● Local mode — add API key</span>
              )}
            </div>
          </div>
        </div>
        <button onClick={() => setOpen(false)} className="w-7 h-7 grid place-items-center rounded-md hover:bg-white/5 text-cft-muted hover:text-cft-text" title="Close">
          <Icon name="close" className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-auto scrollbar-thin p-4 space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-2 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={'shrink-0 w-7 h-7 rounded-md grid place-items-center mt-0.5 ' + (m.role === 'user' ? 'bg-cft-orange/20 text-cft-orange' : 'bg-white/5 text-cft-muted2 border hairline')}>
              {m.role === 'user' ? <span className="font-display font-black text-[10px]">RS</span> : <Icon name="sparkle" className="w-3.5 h-3.5" />}
            </div>
            <div className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed whitespace-pre-wrap fade-in ${
              m.role === 'user'
                ? 'bg-gradient-to-br from-cft-orange to-cft-orange2 text-white rounded-tr-sm shadow-glow-orange'
                : 'bg-white/5 border hairline text-cft-text rounded-tl-sm'
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        {busy && (
          <div className="flex gap-2">
            <div className="shrink-0 w-7 h-7 rounded-md grid place-items-center mt-0.5 bg-white/5 text-cft-muted2 border hairline">
              <Icon name="sparkle" className="w-3.5 h-3.5" />
            </div>
            <div className="bg-white/5 border hairline rounded-2xl rounded-tl-sm px-3.5 py-3 text-sm text-cft-muted flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-cft-orange pulse-dot" />
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-cft-orange pulse-dot" style={{ animationDelay: '0.2s' }} />
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-cft-orange pulse-dot" style={{ animationDelay: '0.4s' }} />
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Suggestions + input */}
      <div className="px-3 pt-2 border-t hairline bg-white/5">
        <div className="text-[9px] font-display font-bold tracking-[0.25em] uppercase text-cft-muted mb-2">Try</div>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="lift text-[10px] font-display font-semibold tracking-wider px-2.5 py-1.5 rounded-full border hairline text-cft-muted2 hover:text-cft-orange hover:border-cft-orange/50 hover:bg-cft-orange/5"
            >
              {s}
            </button>
          ))}
        </div>
        <form onSubmit={(e) => { e.preventDefault(); send(); }} className="flex gap-2 pb-3 items-center">
          <div className="flex-1 relative">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask the agent…"
              className="w-full bg-white/5 border hairline rounded-lg pl-3.5 pr-3 py-2.5 text-[13px] text-cft-text placeholder-cft-muted/70 focus:outline-none focus:border-cft-orange/60 focus:bg-white/5 transition"
            />
          </div>
          <button type="submit" disabled={busy} className="ai-button w-10 h-10 rounded-lg grid place-items-center text-white hover:brightness-110 disabled:opacity-50 lift">
            <Icon name="send" className="w-4 h-4" />
          </button>
        </form>
      </div>
    </aside>
  );
}

// =====================================================================
// Local fallback agent — handles the demo queries deterministically
// =====================================================================

function localAgent(text, { jobs, crews, weekStart }) {
  const q = text.toLowerCase().trim();
  const matchCrew = (s) => {
    if (/\bcrew a\b/.test(s) || /\bfrank\b/.test(s) || /\bmike\b/.test(s)) return crews.find((c) => c.id === 'crewA');
    if (/\bcrew b\b/.test(s) || /\brandy\b/.test(s) || /\bdave\b/.test(s))  return crews.find((c) => c.id === 'crewB');
    if (/\bcrew c\b/.test(s) || /\bjon\b/.test(s)   || /\bcarlos\b/.test(s)) return crews.find((c) => c.id === 'crewC');
    if (/\bcrew d\b/.test(s) || /\bsteve\b/.test(s) || /\balex\b/.test(s))  return crews.find((c) => c.id === 'crewD');
    return null;
  };
  const dayNames = { sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6 };
  const matchDay = (s) => {
    for (const [n, i] of Object.entries(dayNames)) {
      if (new RegExp('\\b' + n + '\\b').test(s)) return i === 0 ? 6 : i - 1; // index into Mon..Sat (Sun→Sat)
    }
    return -1;
  };
  const nextWeek = /\bnext week\b|\bnext\b/.test(q);
  const baseWeek = nextWeek ? addDays(weekStart, 7) : weekStart;

  // "What jobs are running this week"
  if (/(jobs?|running|scheduled|this week|on the (board|schedule))/.test(q) && !/move|reschedule|margin|spend|cost/.test(q)) {
    const inWeek = jobs.filter((j) => new Date(j.date) >= weekStart && new Date(j.date) < addDays(weekStart, 7));
    if (inWeek.length === 0) return "No jobs scheduled this week.";
    const byDay = {};
    inWeek.forEach((j) => { (byDay[j.date] = byDay[j.date] || []).push(j); });
    const lines = Object.keys(byDay).sort().map((d) => {
      const crewLines = byDay[d].map((j) => {
        const crew = crews.find((c) => c.id === j.crewId);
        return `  • ${crew?.name}: ${j.name} (${j.sqft.toLocaleString()} sf, ${j.status})`;
      });
      return `${dayName(d)} ${fmtShort(d)}:\n${crewLines.join('\n')}`;
    });
    return `Here's the week — ${inWeek.length} jobs across ${Object.keys(byDay).length} days:\n\n${lines.join('\n\n')}`;
  }

  // "Who's available [day]"
  if (/who'?s? (free|available|open)/.test(q)) {
    const dIdx = matchDay(q);
    if (dIdx < 0) return "Which day? e.g. 'Who's available Tuesday?'";
    const targetDate = isoDay(addDays(baseWeek, dIdx));
    const busy = new Set(jobs.filter((j) => j.date === targetDate).map((j) => j.crewId));
    const free = crews.filter((c) => !busy.has(c.id));
    if (free.length === 0) return `Every crew is booked on ${dayName(targetDate)} ${fmtShort(targetDate)}.`;
    return `Available ${dayName(targetDate)} ${fmtShort(targetDate)}:\n${free.map((c) => `• ${c.name} — ${c.members} (${c.specialty})`).join('\n')}`;
  }

  // "How much did we spend on X" / "margin on X"
  if (/(spend|cost|margin|profit).+\b(on|for)\b/.test(q) || /\bmargin\b/.test(q) || /\bcost(s)?\b/.test(q)) {
    const job = jobs.find((j) => q.includes(j.name.toLowerCase()))
              || jobs.find((j) => j.name.toLowerCase().split(/\W+/).some((w) => w.length > 3 && q.includes(w)));
    if (!job) return "I couldn't find that job. Try the full name like 'King Street Lofts'.";
    const c = jobCosts(job);
    return `${job.name} — ${money(job.quotedPrice)} quoted.\nMaterials ${money(c.materials)} • Labor ${money(c.labor)} • Equipment ${money(c.equipment)}\nTotal cost: ${money(c.total)}\nMargin: ${pct(c.margin)} (${money(c.profit)} profit)`;
  }

  // "Move [crew]'s [day] job to [day]"
  const moveMatch = q.match(/move\s+(crew\s*[abcd]|[a-z]+'s)\s+(\w+)(?:'s)?\s+job\s+to\s+(\w+)/i)
                 || q.match(/move\s+(.+?)\s+to\s+(\w+day)/i);
  if (moveMatch || /\bmove\b/.test(q)) {
    const crew = matchCrew(q);
    const days = [...q.matchAll(/(sun|mon|tues|wednes|thurs|fri|satur)day/g)].map((m) => m[0]);
    if (crew && days.length >= 2) {
      const fromIdx = matchDay(days[0]);
      const toIdx   = matchDay(days[1]);
      const fromDate = isoDay(addDays(weekStart, fromIdx));
      const toDate   = isoDay(addDays(weekStart, toIdx));
      const job = jobs.find((j) => j.crewId === crew.id && j.date === fromDate);
      if (job) {
        return `Moving ${job.name} from ${dayName(fromDate)} to ${dayName(toDate)}.\n\n` +
          '```actions\n' + JSON.stringify([{ type: 'move_job', jobId: job.id, date: toDate }]) + '\n```';
      }
      return `No job found for ${crew.name} on ${days[0]}.`;
    }
  }

  // "Schedule a new job at <address> for <day>, <crew>, <product>, <sqft>"
  if (/\b(schedule|create|add|book)\b.+\b(job|pour)\b/.test(q) || /\bschedule a new\b/.test(q)) {
    const crew = matchCrew(q) || crews[0];
    const dIdx = matchDay(q);
    const date = isoDay(addDays(baseWeek, dIdx >= 0 ? dIdx : 0));
    const sqftMatch = q.match(/(\d{3,5})\s*(?:sf|sqft|square|sq\s*ft)/);
    const sqft = sqftMatch ? Number(sqftMatch[1]) : 2500;
    const addrMatch = text.match(/at\s+([^,]+?(?:Ave|St|Rd|Blvd|Dr|Way|Lane|Cres|Crt|Pl)[^,\.]*)/i);
    const address = addrMatch ? addrMatch[1].trim() + ', ON' : 'TBD address, ON';
    let productType = 'Self-Leveling Floor Topping';
    if (/radiant|levelrock|overpour/.test(q))         productType = 'Levelrock RH Radiant Overpour';
    else if (/sound|acoustic|underlayment/.test(q))   productType = 'Sound Attenuation Underlayment';
    else if (/hollow|slab\s*leveling/.test(q))        productType = 'Hollow-Core Slab Leveling';
    const rate = productType === 'Levelrock RH Radiant Overpour' ? 6.8 : 5.2;
    const quotedPrice = Math.round(sqft * rate / 100) * 100;
    const action = {
      type: 'add_job',
      name: `New Pour — ${address.split(',')[0]}`,
      address, crewId: crew.id, date, productType, sqft, quotedPrice, equipment: 1200,
      scope: `${productType}, ${sqft.toLocaleString()} sf`,
    };
    return `Scheduling a ${productType} for ${crew.name} on ${dayName(date)} ${fmtShort(date)} — ${sqft.toLocaleString()} sf at ${address}, quoted ~${money(quotedPrice)}.\n\n` +
      '```actions\n' + JSON.stringify([action]) + '\n```';
  }

  return "I can help with crew availability, job status, costs, margins, scheduling, and rescheduling. Try one of the suggested prompts below.";
}

// =====================================================================
// Settings modal — API key
// =====================================================================

function SettingsModal({ apiKey, setApiKey, onClose }) {
  const [draft, setDraft] = useState(apiKey);
  return (
    <Modal onClose={onClose} maxWidth="max-w-md">
      <div className="flex items-center gap-2 text-[10px] font-display font-bold tracking-[0.3em] uppercase text-cft-orange mb-1">
        <Icon name="settings" className="w-3.5 h-3.5" />
        <span>Settings</span>
      </div>
      <div className="font-display font-black text-2xl tracking-tight">AI Connection</div>
      <div className="text-cft-muted2 text-sm mb-5">Connect the agent to Claude for live answers.</div>

      <Input label="Anthropic API Key" value={draft} onChange={setDraft} placeholder="sk-ant-..." />
      <div className="text-[11px] text-cft-muted2 mt-2.5 leading-relaxed flex items-start gap-1.5">
        <span className="text-cft-warning">⚠</span>
        <span>Stored locally in your browser for this demo only. Without a key, the agent runs in local mode and still handles every demo query.</span>
      </div>

      <div className="flex items-center justify-end gap-2 mt-5">
        <button onClick={onClose} className="lift px-3.5 py-2 rounded-lg border hairline text-cft-muted2 font-display font-bold text-xs tracking-widest uppercase hover:text-cft-text">Cancel</button>
        <button onClick={() => { setApiKey(draft); onClose(); }} className="ai-button lift px-4 py-2 rounded-lg text-white font-display font-bold text-xs tracking-widest uppercase">Save</button>
      </div>
    </Modal>
  );
}

// =====================================================================
// Generic modal + toaster
// =====================================================================

function Modal({ onClose, maxWidth = 'max-w-lg', children }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md fade-in" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className={`w-full ${maxWidth} relative glass rounded-2xl card p-7`}>
        <button onClick={onClose} className="absolute top-4 right-4 w-7 h-7 grid place-items-center rounded-md hover:bg-white/5 text-cft-muted hover:text-cft-text" title="Close">
          <Icon name="close" className="w-4 h-4" />
        </button>
        {children}
      </div>
    </div>
  );
}

function Toaster({ toasts }) {
  return (
    <div className="fixed top-20 right-5 z-50 space-y-2">
      {toasts.map((t) => (
        <div key={t.id} className="flex items-center gap-2 pl-3 pr-4 py-2.5 rounded-lg border border-cft-success/40 bg-cft-success/10 text-cft-success text-sm font-display font-semibold tracking-wide fade-in shadow-glow-soft backdrop-blur">
          <span className="w-5 h-5 rounded-full bg-cft-success/20 grid place-items-center"><Icon name="check" className="w-3 h-3" /></span>
          <span>{t.msg}</span>
        </div>
      ))}
    </div>
  );
}

// =====================================================================
// Mount
// =====================================================================

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
