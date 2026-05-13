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
  'Scheduled':   { bg: 'bg-cft-warning/20',  border: 'border-cft-warning/60',  text: 'text-cft-warning',  dot: 'bg-cft-warning'  },
  'In Progress': { bg: 'bg-cft-orange/20',   border: 'border-cft-orange/70',   text: 'text-cft-orange',   dot: 'bg-cft-orange'   },
  'Complete':    { bg: 'bg-cft-success/15',  border: 'border-cft-success/60',  text: 'text-cft-success',  dot: 'bg-cft-success'  },
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
    <div className="h-full flex flex-col bg-cft-bg text-cft-text">
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

      <div className="fixed bottom-3 right-3 z-10 px-2.5 py-1 rounded-full bg-cft-orange/15 border border-cft-orange/40 text-cft-orange text-[10px] font-display font-bold tracking-widest uppercase">
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
    <header className="h-14 shrink-0 flex items-center justify-between px-5 border-b border-cft-line bg-cft-surface/70 backdrop-blur">
      <div className="flex items-center gap-5">
        <div className="flex items-baseline gap-2">
          <div className="font-display font-black text-2xl tracking-wider text-cft-orange">CFT</div>
          <div className="font-display font-semibold text-xs tracking-[0.25em] uppercase text-cft-muted">Operations Hub</div>
        </div>
        <div className="hidden md:block h-6 w-px bg-cft-line" />
        <div className="hidden md:flex items-center gap-2 text-[11px] uppercase tracking-widest text-cft-muted font-display font-semibold">
          <span>{view === 'board' ? `Week of ${fmtShort(weekStart)}` : 'Financials'}</span>
          {weekOffset !== 0 && view === 'board' && (
            <span className="text-cft-orange">• {weekOffset > 0 ? `+${weekOffset}w` : `${weekOffset}w`}</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <ConnectionPill label="Google Calendar" />
        <ConnectionPill label="QuickBooks Online" />
        <button
          onClick={onOpenSettings}
          className="text-[11px] font-display font-semibold tracking-widest uppercase text-cft-muted hover:text-cft-text px-2 py-1 rounded border border-cft-line"
        >
          Settings
        </button>
      </div>
    </header>
  );
}

function ConnectionPill({ label }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-cft-bg border border-cft-line">
      <span className="w-2 h-2 rounded-full bg-cft-success pulse-dot" />
      <span className="text-[10px] font-display font-semibold tracking-widest uppercase text-cft-muted">{label}</span>
    </div>
  );
}

// =====================================================================
// Sidebar
// =====================================================================

function Sidebar({ view, setView, onAddJob }) {
  const NavItem = ({ id, label, icon }) => (
    <button
      onClick={() => setView(id)}
      className={
        'w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-left transition ' +
        (view === id
          ? 'bg-cft-orange/15 text-cft-orange border border-cft-orange/40'
          : 'text-cft-muted hover:text-cft-text hover:bg-cft-surface border border-transparent')
      }
    >
      <span className="text-base">{icon}</span>
      <span className="font-display font-semibold text-sm tracking-wider uppercase">{label}</span>
    </button>
  );

  return (
    <aside className="w-52 shrink-0 border-r border-cft-line bg-cft-surface/40 p-3 flex flex-col gap-1">
      <NavItem id="board"      label="Crew Board" icon="▦" />
      <NavItem id="financials" label="Financials" icon="$" />

      <div className="mt-3 pt-3 border-t border-cft-line">
        <button
          onClick={onAddJob}
          className="w-full px-3 py-2.5 rounded-md bg-cft-orange text-white font-display font-bold text-sm tracking-wider uppercase hover:brightness-110 transition shadow-lg shadow-cft-orange/20"
        >
          + Add Job
        </button>
      </div>

      <div className="mt-auto pt-4 border-t border-cft-line text-[10px] text-cft-muted font-display tracking-widest uppercase leading-relaxed">
        <div>Concrete Floor Tek</div>
        <div className="text-cft-muted/70">Bolton, Ontario</div>
      </div>
    </aside>
  );
}

// =====================================================================
// Board view (crew schedule)
// =====================================================================

function BoardView({ jobs, crews, weekDays, scale, setScale, weekOffset, setWeekOffset, onSelect, onMove, onAddJob }) {
  const [dayIndex, setDayIndex] = useState(0);
  const visibleDays = scale === 'day' ? [weekDays[dayIndex]] : weekDays;

  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="font-display font-bold text-3xl tracking-wide uppercase">Crew Board</div>
          <div className="text-sm text-cft-muted">{fmtLong(weekDays[0])} → {fmtLong(weekDays[weekDays.length - 1])}</div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-md border border-cft-line overflow-hidden">
            <button onClick={() => setScale('week')} className={`px-3 py-1.5 text-[11px] font-display font-bold tracking-widest uppercase ${scale === 'week' ? 'bg-cft-orange text-white' : 'text-cft-muted hover:text-cft-text'}`}>Week</button>
            <button onClick={() => setScale('day')}  className={`px-3 py-1.5 text-[11px] font-display font-bold tracking-widest uppercase ${scale === 'day'  ? 'bg-cft-orange text-white' : 'text-cft-muted hover:text-cft-text'}`}>Day</button>
          </div>

          {scale === 'day' && (
            <div className="flex items-center gap-1 text-cft-muted">
              <button onClick={() => setDayIndex(Math.max(0, dayIndex - 1))} className="px-2 py-1 hover:text-cft-text">◀</button>
              <div className="font-display font-semibold uppercase tracking-widest text-xs text-cft-text px-2">
                {DAY_LABELS[dayIndex]} • {fmtShort(weekDays[dayIndex])}
              </div>
              <button onClick={() => setDayIndex(Math.min(5, dayIndex + 1))} className="px-2 py-1 hover:text-cft-text">▶</button>
            </div>
          )}

          <div className="flex items-center gap-1 ml-2 text-cft-muted">
            <button onClick={() => setWeekOffset(weekOffset - 1)} className="px-2 py-1 hover:text-cft-text">◀</button>
            <button onClick={() => setWeekOffset(0)} className="px-3 py-1 text-[11px] font-display font-bold tracking-widest uppercase border border-cft-line rounded hover:text-cft-text">This Week</button>
            <button onClick={() => setWeekOffset(weekOffset + 1)} className="px-2 py-1 hover:text-cft-text">▶</button>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-cft-line bg-cft-surface/40 overflow-hidden">
        <div className="grid" style={{ gridTemplateColumns: `220px repeat(${visibleDays.length}, minmax(0, 1fr))` }}>
          <div className="px-4 py-3 border-b border-r border-cft-line bg-cft-surface/60">
            <div className="font-display font-bold text-xs tracking-widest uppercase text-cft-muted">Crew</div>
          </div>
          {visibleDays.map((d, i) => (
            <div key={i} className="px-3 py-3 border-b border-cft-line bg-cft-surface/60">
              <div className="font-display font-bold text-xs tracking-widest uppercase text-cft-muted">
                {DAY_LABELS[scale === 'day' ? dayIndex : i]}
              </div>
              <div className="text-cft-text text-sm">{fmtShort(d)}</div>
            </div>
          ))}

          {crews.map((crew) => (
            <React.Fragment key={crew.id}>
              <div className="px-4 py-3 border-r border-cft-line border-b border-cft-line bg-cft-surface/30">
                <div className="font-display font-bold text-base text-cft-text tracking-wide">{crew.name}</div>
                <div className="text-xs text-cft-muted">{crew.members}</div>
                <div className="text-[10px] text-cft-orange/80 font-display tracking-widest uppercase mt-0.5">{crew.specialty}</div>
              </div>

              {visibleDays.map((d, i) => {
                const dayIso = isoDay(d);
                const cellJobs = jobs.filter((j) => j.crewId === crew.id && j.date === dayIso);
                return (
                  <DropCell
                    key={crew.id + '-' + i}
                    crewId={crew.id}
                    date={dayIso}
                    onDropJob={onMove}
                  >
                    {cellJobs.length === 0 ? (
                      <div className="h-full min-h-[88px] flex items-center justify-center text-cft-muted/40 text-xs italic">— available —</div>
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

      <div className="mt-4 flex items-center gap-4 text-[11px] font-display tracking-widest uppercase text-cft-muted">
        {Object.entries(STATUS_META).map(([k, m]) => (
          <div key={k} className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${m.dot}`} />
            <span>{k}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DropCell({ crewId, date, children, onDropJob }) {
  const ref = useRef(null);
  return (
    <div
      ref={ref}
      className="min-h-[100px] p-2 border-r border-b border-cft-line space-y-2 transition"
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
      className={`fade-in cursor-grab active:cursor-grabbing rounded-md border ${meta.border} ${meta.bg} hover:brightness-125 transition px-2.5 py-2 group`}
      title="Drag to reschedule"
    >
      <div className="flex items-center justify-between gap-2">
        <span className={`text-[9px] font-display font-bold tracking-widest uppercase ${meta.text}`}>
          <span className={`inline-block w-1.5 h-1.5 rounded-full ${meta.dot} mr-1`} />
          {job.status}
        </span>
        <span className="text-[10px] text-cft-muted font-mono">{job.sqft.toLocaleString()} sf</span>
      </div>
      <div className="font-display font-bold text-sm leading-tight mt-1 text-cft-text">{job.name}</div>
      <div className="text-[11px] text-cft-muted truncate">{job.address}</div>
      <div className="text-[10px] text-cft-orange/80 mt-1 truncate">{job.productType}</div>
    </div>
  );
}

// =====================================================================
// Calendar sync panel
// =====================================================================

function CalendarPanel({ jobs }) {
  const sorted = [...jobs].sort((a, b) => a.date.localeCompare(b.date));
  return (
    <aside className="hidden lg:flex flex-col w-72 shrink-0 border-l border-cft-line bg-cft-surface/30">
      <div className="px-4 py-3 border-b border-cft-line flex items-center justify-between">
        <div>
          <div className="font-display font-bold text-sm tracking-widest uppercase text-cft-text">Google Calendar</div>
          <div className="text-[10px] text-cft-muted font-display tracking-widest uppercase">Live mirror</div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-cft-success pulse-dot" />
          <span className="text-[10px] font-display font-bold tracking-widest uppercase text-cft-success">Synced</span>
        </div>
      </div>

      <div className="flex-1 overflow-auto scrollbar-thin p-3 space-y-2">
        {sorted.length === 0 && <div className="text-cft-muted text-xs italic">No events this week.</div>}
        {sorted.map((job) => {
          const crew = CREWS.find((c) => c.id === job.crewId);
          return (
            <div key={job.id} className="rounded-md border border-cft-line bg-cft-bg/70 p-2.5 fade-in">
              <div className="flex items-center justify-between">
                <div className="text-[10px] font-display tracking-widest uppercase text-cft-orange">{dayName(job.date)} · {fmtShort(job.date)}</div>
                <div className="text-[10px] text-cft-success font-display tracking-widest uppercase">✓ Synced</div>
              </div>
              <div className="font-display font-bold text-sm mt-0.5 leading-tight">{job.name}</div>
              <div className="text-[11px] text-cft-muted">{crew?.name} • {crew?.members}</div>
              <div className="text-[11px] text-cft-muted truncate">{job.address}</div>
              <div className="text-[10px] text-cft-muted/70 mt-1 font-mono">07:00 – 16:30 • All-day block</div>
            </div>
          );
        })}
      </div>

      <div className="px-3 py-2.5 border-t border-cft-line text-[10px] text-cft-muted font-mono">
        POST /calendar/v3/events → 200 OK
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
    <div className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="font-display font-bold text-3xl tracking-wide uppercase">Financials</div>
          <div className="text-sm text-cft-muted">Job costing • week of {fmtShort(weekStart)}</div>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cft-bg border border-cft-line">
          <span className="w-2 h-2 rounded-full bg-cft-success pulse-dot" />
          <span className="text-[10px] font-display font-bold tracking-widest uppercase text-cft-muted">Connected to QuickBooks Online</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-5">
        <StatCard label="Total Revenue" value={money(sumRevenue)} accent="text-cft-text" sub="This week" />
        <StatCard label="Total Costs"   value={money(sumCost)}    accent="text-cft-warning" sub="Materials + labor + equip" />
        <StatCard label="Gross Margin"  value={pct(margin)}       accent="text-cft-success" sub={money(sumRevenue - sumCost) + ' profit'} />
        <StatCard label="Jobs Completed" value={completedCount}   accent="text-cft-orange" sub="Lifetime in system" />
      </div>

      <div className="rounded-lg border border-cft-line bg-cft-surface/40 overflow-hidden">
        <div className="grid grid-cols-12 px-4 py-3 bg-cft-surface/60 border-b border-cft-line text-[11px] font-display font-bold tracking-widest uppercase text-cft-muted">
          <div className="col-span-4">Job</div>
          <div className="col-span-1 text-right">SF</div>
          <div className="col-span-2 text-right">Materials</div>
          <div className="col-span-1 text-right">Labor</div>
          <div className="col-span-1 text-right">Total Cost</div>
          <div className="col-span-1 text-right">Quoted</div>
          <div className="col-span-1 text-right">Margin</div>
          <div className="col-span-1 text-right">Action</div>
        </div>

        {jobs.map((j) => {
          const c = jobCosts(j);
          const marginColor = c.margin >= 0.30 ? 'text-cft-success' : c.margin >= 0.20 ? 'text-cft-warning' : 'text-cft-danger';
          return (
            <div key={j.id} className="grid grid-cols-12 px-4 py-3 border-b border-cft-line items-center hover:bg-cft-surface/50 transition">
              <div className="col-span-4 cursor-pointer" onClick={() => onSelect(j.id)}>
                <div className="font-display font-semibold text-cft-text">{j.name}</div>
                <div className="text-[11px] text-cft-muted truncate">{j.address}</div>
              </div>
              <div className="col-span-1 text-right text-cft-muted font-mono text-xs">{j.sqft.toLocaleString()}</div>
              <div className="col-span-2 text-right font-mono text-sm">{money(c.materials)}</div>
              <div className="col-span-1 text-right font-mono text-sm">{money(c.labor)}</div>
              <div className="col-span-1 text-right font-mono text-sm">{money(c.total)}</div>
              <div className="col-span-1 text-right font-mono text-sm text-cft-text">{money(j.quotedPrice)}</div>
              <div className={`col-span-1 text-right font-display font-bold ${marginColor}`}>{pct(c.margin)}</div>
              <div className="col-span-1 text-right">
                <button
                  onClick={() => pushToast(`Invoice created in QuickBooks for ${j.name}`)}
                  className="text-[10px] font-display font-bold tracking-widest uppercase px-2 py-1 rounded border border-cft-orange/50 text-cft-orange hover:bg-cft-orange/10"
                >
                  Push to QBO
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatCard({ label, value, accent = 'text-cft-text', sub }) {
  return (
    <div className="rounded-lg border border-cft-line bg-cft-surface/40 p-4">
      <div className="text-[10px] font-display font-bold tracking-widest uppercase text-cft-muted">{label}</div>
      <div className={`font-display font-black text-3xl mt-1 ${accent}`}>{value}</div>
      {sub && <div className="text-[11px] text-cft-muted mt-0.5">{sub}</div>}
    </div>
  );
}

// =====================================================================
// Job detail modal
// =====================================================================

function JobDetailModal({ job, onClose, onUpdate, onPushQBO }) {
  const crew = CREWS.find((c) => c.id === job.crewId);
  const c = jobCosts(job);

  return (
    <Modal onClose={onClose} maxWidth="max-w-2xl">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <div className="text-[10px] font-display font-bold tracking-widest uppercase text-cft-muted">{job.id}</div>
          <div className="font-display font-bold text-2xl tracking-wide">{job.name}</div>
          <div className="text-cft-muted text-sm">{job.address}</div>
        </div>
        <select
          value={job.status}
          onChange={(e) => onUpdate({ status: e.target.value })}
          className={`bg-cft-bg border ${STATUS_META[job.status].border} ${STATUS_META[job.status].text} font-display font-bold text-xs tracking-widest uppercase px-3 py-1.5 rounded`}
        >
          {Object.keys(STATUS_META).map((s) => <option key={s} value={s} className="bg-cft-bg text-cft-text">{s}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <Field label="Crew">{crew?.name} — {crew?.members}</Field>
        <Field label="Scheduled">{fmtLong(job.date)}</Field>
        <Field label="Product">{job.productType}</Field>
        <Field label="Square Feet">{job.sqft.toLocaleString()} sf</Field>
      </div>

      <div className="rounded border border-cft-line p-3 mb-4">
        <div className="font-display font-bold text-xs tracking-widest uppercase text-cft-muted mb-2">Scope / Notes</div>
        <div className="text-sm text-cft-text">{job.scope}</div>
      </div>

      <div className="grid grid-cols-5 gap-2 mb-4">
        <Stat small label="Materials" value={money(c.materials)} />
        <Stat small label="Labor"     value={money(c.labor)} />
        <Stat small label="Equipment" value={money(c.equipment)} />
        <Stat small label="Quoted"    value={money(job.quotedPrice)} accent="text-cft-text" />
        <Stat small label="Margin"    value={pct(c.margin)} accent={c.margin >= 0.30 ? 'text-cft-success' : c.margin >= 0.20 ? 'text-cft-warning' : 'text-cft-danger'} />
      </div>

      <div className="flex items-center justify-end gap-2">
        <button onClick={onPushQBO} className="px-3 py-2 rounded border border-cft-orange/50 text-cft-orange font-display font-bold text-xs tracking-widest uppercase hover:bg-cft-orange/10">
          Push to QuickBooks
        </button>
        <button onClick={onClose} className="px-3 py-2 rounded bg-cft-orange text-white font-display font-bold text-xs tracking-widest uppercase hover:brightness-110">
          Done
        </button>
      </div>
    </Modal>
  );
}

function Field({ label, children }) {
  return (
    <div className="rounded border border-cft-line p-3">
      <div className="text-[10px] font-display font-bold tracking-widest uppercase text-cft-muted">{label}</div>
      <div className="text-sm text-cft-text mt-0.5">{children}</div>
    </div>
  );
}
function Stat({ label, value, accent = 'text-cft-text', small }) {
  return (
    <div className="rounded border border-cft-line p-2.5">
      <div className="text-[9px] font-display font-bold tracking-widest uppercase text-cft-muted">{label}</div>
      <div className={`font-display font-bold ${small ? 'text-base' : 'text-xl'} ${accent} mt-0.5`}>{value}</div>
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
      <div className="mb-4">
        <div className="font-display font-bold text-2xl tracking-wide">Add Job</div>
        <div className="text-cft-muted text-sm">Schedule a new pour</div>
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
        <Textarea label="Scope / Notes" value={form.scope} onChange={(v) => update('scope', v)} placeholder="e.g. 4 units, 1.5&quot; pour, prep included" />

        <div className="flex items-center justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="px-3 py-2 rounded border border-cft-line text-cft-muted font-display font-bold text-xs tracking-widest uppercase hover:text-cft-text">Cancel</button>
          <button type="submit" className="px-3 py-2 rounded bg-cft-orange text-white font-display font-bold text-xs tracking-widest uppercase hover:brightness-110">Create Job</button>
        </div>
      </form>
    </Modal>
  );
}

function Input({ label, value, onChange, type = 'text', placeholder }) {
  return (
    <label className="block">
      <div className="text-[10px] font-display font-bold tracking-widest uppercase text-cft-muted mb-1">{label}</div>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-cft-bg border border-cft-line rounded px-3 py-2 text-sm text-cft-text focus:outline-none focus:border-cft-orange"
      />
    </label>
  );
}
function Select({ label, value, onChange, children }) {
  return (
    <label className="block">
      <div className="text-[10px] font-display font-bold tracking-widest uppercase text-cft-muted mb-1">{label}</div>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-cft-bg border border-cft-line rounded px-3 py-2 text-sm text-cft-text focus:outline-none focus:border-cft-orange">
        {children}
      </select>
    </label>
  );
}
function Textarea({ label, value, onChange, placeholder }) {
  return (
    <label className="block">
      <div className="text-[10px] font-display font-bold tracking-widest uppercase text-cft-muted mb-1">{label}</div>
      <textarea
        rows={3}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-cft-bg border border-cft-line rounded px-3 py-2 text-sm text-cft-text focus:outline-none focus:border-cft-orange"
      />
    </label>
  );
}

// =====================================================================
// AI chat panel
// =====================================================================

const ANTHROPIC_MODEL = 'claude-sonnet-4-5';

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
        className="fixed bottom-16 right-4 z-10 px-4 py-2.5 rounded-full bg-cft-orange text-white font-display font-bold text-xs tracking-widest uppercase shadow-lg shadow-cft-orange/30 hover:brightness-110"
      >
        AI Agent ●
      </button>
    );
  }

  return (
    <aside className="w-96 shrink-0 border-l border-cft-line bg-cft-surface/50 flex flex-col">
      <div className="px-4 py-3 border-b border-cft-line flex items-center justify-between">
        <div>
          <div className="font-display font-bold text-sm tracking-widest uppercase text-cft-text">Operations Agent</div>
          <div className="text-[10px] text-cft-muted font-display tracking-widest uppercase">
            {apiKey ? `Claude • ${ANTHROPIC_MODEL}` : <span className="text-cft-warning cursor-pointer hover:underline" onClick={onOpenSettings}>Local mode — add API key</span>}
          </div>
        </div>
        <button onClick={() => setOpen(false)} className="text-cft-muted hover:text-cft-text text-lg leading-none">×</button>
      </div>

      <div className="flex-1 overflow-auto scrollbar-thin p-3 space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap fade-in ${
              m.role === 'user'
                ? 'bg-cft-orange text-white'
                : 'bg-cft-bg border border-cft-line text-cft-text'
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        {busy && (
          <div className="flex justify-start">
            <div className="bg-cft-bg border border-cft-line rounded-lg px-3 py-2 text-sm text-cft-muted">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-cft-orange pulse-dot mr-1" />
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-cft-orange pulse-dot mr-1" style={{ animationDelay: '0.2s' }} />
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-cft-orange pulse-dot" style={{ animationDelay: '0.4s' }} />
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="px-3 pt-2 border-t border-cft-line">
        <div className="flex flex-wrap gap-1.5 mb-2">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="text-[10px] font-display font-semibold tracking-widest uppercase px-2 py-1 rounded border border-cft-line text-cft-muted hover:text-cft-orange hover:border-cft-orange/60"
            >
              {s}
            </button>
          ))}
        </div>
        <form onSubmit={(e) => { e.preventDefault(); send(); }} className="flex gap-2 pb-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask the agent…"
            className="flex-1 bg-cft-bg border border-cft-line rounded px-3 py-2 text-sm text-cft-text focus:outline-none focus:border-cft-orange"
          />
          <button type="submit" disabled={busy} className="px-3 py-2 rounded bg-cft-orange text-white font-display font-bold text-xs tracking-widest uppercase hover:brightness-110 disabled:opacity-50">
            Send
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
      <div className="font-display font-bold text-2xl tracking-wide">Settings</div>
      <div className="text-cft-muted text-sm mb-4">Connect the AI agent to Claude.</div>

      <Input label="Anthropic API Key" value={draft} onChange={setDraft} placeholder="sk-ant-..." />
      <div className="text-[11px] text-cft-muted mt-2 leading-relaxed">
        Stored locally in your browser for this demo only. Without a key, the agent runs in local mode
        and still handles the standard demo queries.
      </div>

      <div className="flex items-center justify-end gap-2 mt-4">
        <button onClick={onClose} className="px-3 py-2 rounded border border-cft-line text-cft-muted font-display font-bold text-xs tracking-widest uppercase hover:text-cft-text">Cancel</button>
        <button onClick={() => { setApiKey(draft); onClose(); }} className="px-3 py-2 rounded bg-cft-orange text-white font-display font-bold text-xs tracking-widest uppercase hover:brightness-110">Save</button>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm fade-in" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className={`w-full ${maxWidth} bg-cft-surface border border-cft-line rounded-lg shadow-2xl p-6`}>
        {children}
      </div>
    </div>
  );
}

function Toaster({ toasts }) {
  return (
    <div className="fixed top-16 right-4 z-50 space-y-2">
      {toasts.map((t) => (
        <div key={t.id} className="px-3 py-2 rounded border border-cft-success/50 bg-cft-success/10 text-cft-success text-sm font-display font-semibold tracking-wide fade-in shadow-lg">
          ✓ {t.msg}
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
