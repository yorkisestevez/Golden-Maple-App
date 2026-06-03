/* ==========================================================================
   Northbound Dispatch — Dispatch Tracker (React, localStorage-backed)
   No backend. All data persists to the browser's localStorage.
   ========================================================================== */
const { useState, useEffect, useMemo, useCallback } = React;

/* ---------------------------------------------------------------- enums --- */
const EQUIPMENT = ["dry_van", "flatbed", "reefer", "step_deck", "other"];
const CARRIER_STATUS = ["prospect", "onboarding", "active", "paused", "terminated"];
const LOAD_SOURCE = ["loadlink", "dat", "direct", "referral"];
const LOAD_STATUS = ["available", "offered", "confirmed", "in_transit", "delivered", "cancelled", "issue"];
const PIPELINE = ["available", "offered", "confirmed", "in_transit", "delivered"];
const INVOICE_STATUS = ["draft", "sent", "paid", "overdue"];
const DEFAULT_FEE_PCT = 8;

const label = (s) => (s || "").replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

/* ------------------------------------------------------------- helpers --- */
const money = (n) =>
  "$" + (Number(n) || 0).toLocaleString("en-CA", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const money0 = (n) =>
  "$" + Math.round(Number(n) || 0).toLocaleString("en-CA");
const todayISO = () => new Date().toISOString().slice(0, 10);
const daysBetween = (a, b) => Math.round((new Date(b) - new Date(a)) / 86400000);
const uid = (p) => p + "_" + Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-3);

function startOfWeek(d) {
  const dt = new Date(d);
  const day = (dt.getDay() + 6) % 7; // Monday = 0
  dt.setDate(dt.getDate() - day);
  dt.setHours(0, 0, 0, 0);
  return dt;
}
function weekKey(d) {
  return startOfWeek(d).toISOString().slice(0, 10);
}

/* Derived load economics */
function netToCarrier(load) {
  const gross = Number(load.gross_rate) || 0;
  const fee = Number(load.dispatch_fee) || 0;
  return Math.max(0, gross - fee);
}
function ratePerMile(load) {
  const miles = Number(load.loaded_miles) || 0;
  if (!miles) return null;
  return (Number(load.gross_rate) || 0) / miles;
}

/* -------------------------------------------------------------- storage --- */
const KEY = "northbound_dispatch_v1";
function loadState() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) { /* ignore */ }
  return null;
}
function persist(state) {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* ignore */ }
}

/* ----------------------------------------------------------- seed data --- */
function seed() {
  const carriers = [
    { carrier_id: "car_a1", name: "Doug Pratt", phone: "705-555-1122", email: "doug@example.ca",
      mc_cvor_number: "CVOR 123-456-789", equipment_type: "dry_van", num_trucks: 1,
      preferred_lanes: "GTA local, ON-QC", home_base: "Barrie, ON", rate_minimum_per_mile: 2.10,
      insurance_expiry: addDays(20), status: "active", notes: "Reliable, prefers morning calls.",
      date_added: addDays(-40), last_load_date: addDays(-2) },
    { carrier_id: "car_b2", name: "Singh Transport", phone: "905-555-3344", email: "raj@singhtransport.ca",
      mc_cvor_number: "MC 998877", equipment_type: "reefer", num_trucks: 2,
      preferred_lanes: "Toronto-Detroit, ON-OH", home_base: "Brampton, ON", rate_minimum_per_mile: 2.45,
      insurance_expiry: addDays(75), status: "active", notes: "Cross-border ready, FAST card.",
      date_added: addDays(-30), last_load_date: addDays(-1) },
    { carrier_id: "car_c3", name: "Maple Flat Haul", phone: "705-555-7788", email: "ops@mapleflat.ca",
      mc_cvor_number: "CVOR 555-222-111", equipment_type: "flatbed", num_trucks: 1,
      preferred_lanes: "ON-QC, Sudbury-GTA", home_base: "Orillia, ON", rate_minimum_per_mile: 2.65,
      insurance_expiry: addDays(8), status: "active", notes: "Steel + lumber. Tarps available.",
      date_added: addDays(-22), last_load_date: addDays(-9) },
    { carrier_id: "car_d4", name: "Northway Owner-Op", phone: "613-555-9090", email: "k@northway.ca",
      mc_cvor_number: "CVOR 777-333-222", equipment_type: "step_deck", num_trucks: 1,
      preferred_lanes: "Ottawa-GTA, ON-NY", home_base: "Ottawa, ON", rate_minimum_per_mile: 2.50,
      insurance_expiry: addDays(120), status: "onboarding", notes: "Paperwork in progress.",
      date_added: addDays(-5), last_load_date: null },
  ];
  const loads = [
    mkLoad("car_a1", "loadlink", "TQL Logistics", "Barrie, ON", "Mississauga, ON", 1450, 95, "delivered", addDays(-2)),
    mkLoad("car_b2", "dat", "Echo Global", "Brampton, ON", "Detroit, MI", 2850, 245, "in_transit", addDays(-1)),
    mkLoad("car_b2", "loadlink", "Coyote", "Windsor, ON", "Toronto, ON", 1320, 230, "delivered", addDays(-4)),
    mkLoad("car_c3", "direct", "Maple Steel Co", "Hamilton, ON", "Sudbury, ON", 2100, 240, "confirmed", addDays(0)),
    mkLoad(null, "loadlink", "RXO", "Toronto, ON", "Montreal, QC", 1680, 335, "available", addDays(0)),
    mkLoad(null, "dat", "Landstar", "London, ON", "Buffalo, NY", 1990, 210, "offered", addDays(0)),
    mkLoad("car_a1", "referral", "Local Shipper", "Vaughan, ON", "Barrie, ON", 720, 48, "delivered", addDays(-7)),
  ];
  const invoices = [];
  return { carriers, loads, invoices, ui: { feePct: DEFAULT_FEE_PCT } };
}
function addDays(n) {
  const d = new Date(); d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}
function mkLoad(carrierId, source, broker, pu, del, gross, miles, status, created) {
  const fee = +(gross * DEFAULT_FEE_PCT / 100).toFixed(2);
  return {
    load_id: uid("load"), source, broker_name: broker, broker_contact: "",
    pickup_location: pu, pickup_date: created, delivery_location: del,
    delivery_date: addDaysFrom(created, 1), commodity: "General freight", weight: "20,000 lb",
    equipment_required: "dry_van", gross_rate: gross, dispatch_fee: fee,
    assigned_carrier_id: carrierId, status, deadhead_miles: Math.round(miles * 0.15),
    loaded_miles: miles, notes: "", created_at: created, updated_at: created,
  };
}
function addDaysFrom(iso, n) {
  const d = new Date(iso); d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

/* ============================================================== STORE ==== */
function useStore() {
  const [state, setState] = useState(() => loadState() || { carriers: [], loads: [], invoices: [], ui: { feePct: DEFAULT_FEE_PCT } });
  useEffect(() => persist(state), [state]);

  const api = useMemo(() => ({
    state,
    setFeePct: (pct) => setState((s) => ({ ...s, ui: { ...s.ui, feePct: Number(pct) || DEFAULT_FEE_PCT } })),

    upsertCarrier: (c) => setState((s) => {
      const exists = s.carriers.some((x) => x.carrier_id === c.carrier_id);
      const carriers = exists
        ? s.carriers.map((x) => (x.carrier_id === c.carrier_id ? c : x))
        : [...s.carriers, { ...c, carrier_id: uid("car"), date_added: todayISO() }];
      return { ...s, carriers };
    }),
    deleteCarrier: (id) => setState((s) => ({
      ...s,
      carriers: s.carriers.filter((c) => c.carrier_id !== id),
      loads: s.loads.map((l) => (l.assigned_carrier_id === id ? { ...l, assigned_carrier_id: null } : l)),
    })),

    upsertLoad: (l) => setState((s) => {
      const exists = s.loads.some((x) => x.load_id === l.load_id);
      const stamped = { ...l, updated_at: todayISO() };
      let loads = exists
        ? s.loads.map((x) => (x.load_id === l.load_id ? stamped : x))
        : [...s.loads, { ...stamped, load_id: uid("load"), created_at: todayISO() }];
      // when a load is delivered, advance the carrier's last_load_date
      let carriers = s.carriers;
      if (l.assigned_carrier_id && l.status === "delivered") {
        carriers = carriers.map((c) =>
          c.carrier_id === l.assigned_carrier_id
            ? { ...c, last_load_date: maxDate(c.last_load_date, l.delivery_date || todayISO()) }
            : c);
      }
      return { ...s, loads, carriers };
    }),
    deleteLoad: (id) => setState((s) => ({ ...s, loads: s.loads.filter((l) => l.load_id !== id) })),

    addInvoice: (inv) => setState((s) => ({ ...s, invoices: [...s.invoices, { ...inv, invoice_id: uid("inv") }] })),
    updateInvoice: (inv) => setState((s) => ({
      ...s, invoices: s.invoices.map((i) => (i.invoice_id === inv.invoice_id ? inv : i)),
    })),
    deleteInvoice: (id) => setState((s) => ({ ...s, invoices: s.invoices.filter((i) => i.invoice_id !== id) })),

    loadSeed: () => setState(seed()),
    reset: () => setState({ carriers: [], loads: [], invoices: [], ui: { feePct: DEFAULT_FEE_PCT } }),
    importState: (obj) => setState(obj),
  }), [state]);

  return api;
}
function maxDate(a, b) {
  if (!a) return b;
  if (!b) return a;
  return a > b ? a : b;
}

/* =========================================================== COMPONENTS == */

function Sidebar({ tab, setTab, store }) {
  const nav = [
    ["dashboard", "▤", "Dashboard"],
    ["carriers", "⛟", "Carriers"],
    ["loads", "▣", "Loads"],
    ["invoices", "$", "Invoices"],
  ];
  const exportData = () => {
    const blob = new Blob([JSON.stringify(store.state, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "northbound-dispatch-export-" + todayISO() + ".json";
    a.click();
  };
  const importData = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const r = new FileReader();
    r.onload = () => { try { store.importState(JSON.parse(r.result)); } catch (err) { alert("Invalid file."); } };
    r.readAsText(file);
  };
  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-word">NORTHBOUND</span>
        <span className="brand-sub">DISPATCH</span>
      </div>
      {nav.map(([id, ico, name]) => (
        <button key={id} className={"nav-item" + (tab === id ? " active" : "")} onClick={() => setTab(id)}>
          <span className="ico">{ico}</span> {name}
        </button>
      ))}
      <div className="nav-foot">
        <button className="btn btn-sm btn-ghost" onClick={exportData}>⭳ Export JSON</button>
        <label className="btn btn-sm btn-ghost" style={{ display: "block", textAlign: "center" }}>
          ⭱ Import JSON
          <input type="file" accept="application/json" onChange={importData} style={{ display: "none" }} />
        </label>
        {store.state.carriers.length === 0 && (
          <button className="btn btn-sm btn-teal" onClick={store.loadSeed}>Load sample data</button>
        )}
        <button className="btn btn-sm btn-ghost btn-danger" onClick={() => {
          if (confirm("Erase all dispatch data? This cannot be undone.")) store.reset();
        }}>Reset all</button>
      </div>
    </aside>
  );
}

function KPI({ label, value, sub, accent, mono }) {
  return (
    <div className={"kpi" + (accent ? " " + accent : "")}>
      <div className="label">{label}</div>
      <div className={"value" + (mono ? " mono" : "")}>{value}</div>
      {sub && <div className="sub">{sub}</div>}
    </div>
  );
}

function Badge({ value }) {
  return <span className={"badge " + value}>{label(value)}</span>;
}

/* ----------------------------------------------------------- DASHBOARD --- */
function Dashboard({ store }) {
  const { carriers, loads } = store.state;
  const carrierName = (id) => carriers.find((c) => c.carrier_id === id)?.name || "—";

  const activeCarriers = carriers.filter((c) => c.status === "active" || c.status === "onboarding");
  const thisWeek = weekKey(todayISO());

  // pipeline counts
  const pipeCounts = PIPELINE.map((st) => ({
    status: st, loads: loads.filter((l) => l.status === st),
  }));

  // weekly revenue (fees earned) per carrier, delivered loads this week
  const deliveredThisWeek = loads.filter(
    (l) => l.status === "delivered" && weekKey(l.delivery_date || l.created_at) === thisWeek);
  const feesByCarrier = {};
  deliveredThisWeek.forEach((l) => {
    const k = l.assigned_carrier_id || "unassigned";
    feesByCarrier[k] = (feesByCarrier[k] || 0) + (Number(l.dispatch_fee) || 0);
  });
  const totalFeesWeek = Object.values(feesByCarrier).reduce((a, b) => a + b, 0);
  const grossWeek = deliveredThisWeek.reduce((a, l) => a + (Number(l.gross_rate) || 0), 0);

  // utilization: loads per carrier this week (any status created this week)
  const utilization = activeCarriers.map((c) => {
    const wk = loads.filter((l) => l.assigned_carrier_id === c.carrier_id &&
      weekKey(l.created_at) === thisWeek).length;
    return { carrier: c, count: wk };
  }).sort((a, b) => b.count - a.count);

  // insurance expiries within 30 days
  const expiring = carriers
    .filter((c) => c.insurance_expiry)
    .map((c) => ({ c, days: daysBetween(todayISO(), c.insurance_expiry) }))
    .filter((x) => x.days <= 30)
    .sort((a, b) => a.days - b.days);

  return (
    <div>
      <div className="topbar">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-sub">Week of {thisWeek} · live snapshot</p>
        </div>
      </div>

      <div className="kpi-grid">
        <KPI label="Active Carriers" value={carriers.filter((c) => c.status === "active").length}
             sub={`${activeCarriers.length} incl. onboarding`} accent="teal-accent" />
        <KPI label="Open Loads" value={loads.filter((l) => ["available", "offered"].includes(l.status)).length}
             sub="available + offered" />
        <KPI label="In Transit" value={loads.filter((l) => l.status === "in_transit").length} />
        <KPI label="Fees This Week" value={money0(totalFeesWeek)} mono accent="accent"
             sub={`on ${money0(grossWeek)} gross`} />
        <KPI label="Expiring Insurance" value={expiring.length}
             sub="within 30 days" accent={expiring.length ? "accent" : null} />
      </div>

      {/* Pipeline */}
      <div className="panel">
        <h2>Loads Pipeline</h2>
        <div className="pipeline">
          {pipeCounts.map(({ status, loads: ls }) => (
            <div className="pipe-col" key={status}>
              <h3>{label(status)}</h3>
              <div className="big">{ls.length}</div>
              {ls.slice(0, 4).map((l) => (
                <div className="pipe-card" key={l.load_id}>
                  <div>{l.pickup_location.split(",")[0]} → {l.delivery_location.split(",")[0]}</div>
                  <div className="lane mono">{money0(l.gross_rate)} · {carrierName(l.assigned_carrier_id)}</div>
                </div>
              ))}
              {ls.length > 4 && <div className="pipe-card lane">+{ls.length - 4} more</div>}
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22 }} className="dash-cols">
        {/* Active carriers */}
        <div className="panel">
          <h2>Active Carriers <span className="count">{activeCarriers.length}</span></h2>
          <div className="tbl-wrap">
            <table className="data">
              <thead><tr><th>Carrier</th><th>Equip</th><th>Status</th><th>Last Load</th></tr></thead>
              <tbody>
                {activeCarriers.length === 0 && <tr><td colSpan="4" className="empty">No active carriers yet.</td></tr>}
                {activeCarriers.map((c) => (
                  <tr key={c.carrier_id}>
                    <td>{c.name}</td>
                    <td>{label(c.equipment_type)}</td>
                    <td><Badge value={c.status} /></td>
                    <td className="mono">{c.last_load_date || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Weekly revenue per carrier */}
        <div className="panel">
          <h2>Weekly Revenue <span className="count">fees earned</span></h2>
          <div className="tbl-wrap">
            <table className="data">
              <thead><tr><th>Carrier</th><th className="num">Loads</th><th className="num">Fees</th></tr></thead>
              <tbody>
                {Object.keys(feesByCarrier).length === 0 && <tr><td colSpan="3" className="empty">No delivered loads this week.</td></tr>}
                {Object.entries(feesByCarrier).map(([id, fee]) => (
                  <tr key={id}>
                    <td>{id === "unassigned" ? "— Unassigned —" : carrierName(id)}</td>
                    <td className="num">{deliveredThisWeek.filter((l) => (l.assigned_carrier_id || "unassigned") === id).length}</td>
                    <td className="num">{money(fee)}</td>
                  </tr>
                ))}
                {Object.keys(feesByCarrier).length > 0 && (
                  <tr style={{ fontWeight: 700 }}>
                    <td>Total</td>
                    <td className="num">{deliveredThisWeek.length}</td>
                    <td className="num ok-text">{money(totalFeesWeek)}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Utilization */}
        <div className="panel">
          <h2>Carrier Utilization <span className="count">loads / week</span></h2>
          <div className="tbl-wrap">
            <table className="data">
              <thead><tr><th>Carrier</th><th>Trucks</th><th className="num">Loads this wk</th></tr></thead>
              <tbody>
                {utilization.length === 0 && <tr><td colSpan="3" className="empty">No active carriers.</td></tr>}
                {utilization.map(({ carrier, count }) => (
                  <tr key={carrier.carrier_id}>
                    <td>{carrier.name}</td>
                    <td className="mono">{carrier.num_trucks}</td>
                    <td className="num">{count === 0 ? <span className="warn-text">0</span> : count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Insurance expiries */}
        <div className="panel">
          <h2>Insurance Expiries <span className="count">30-day warning</span></h2>
          <div className="tbl-wrap">
            <table className="data">
              <thead><tr><th>Carrier</th><th>Expiry</th><th className="num">Days</th></tr></thead>
              <tbody>
                {expiring.length === 0 && <tr><td colSpan="3" className="empty">No expiries in the next 30 days. ✓</td></tr>}
                {expiring.map(({ c, days }) => (
                  <tr key={c.carrier_id} className="warn-row">
                    <td>{c.name}</td>
                    <td className="mono">{c.insurance_expiry}</td>
                    <td className={"num " + (days < 0 ? "danger-text" : days <= 7 ? "danger-text" : "warn-text")}>
                      {days < 0 ? `${Math.abs(days)}d ago` : `${days}d`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ CARRIERS --- */
const BLANK_CARRIER = {
  carrier_id: null, name: "", phone: "", email: "", mc_cvor_number: "",
  equipment_type: "dry_van", num_trucks: 1, preferred_lanes: "", home_base: "",
  rate_minimum_per_mile: "", insurance_expiry: "", status: "prospect", notes: "",
  last_load_date: null,
};

function Carriers({ store }) {
  const { carriers } = store.state;
  const [editing, setEditing] = useState(null);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const filtered = carriers.filter((c) => {
    const matchQ = !q || (c.name + c.preferred_lanes + c.home_base + c.mc_cvor_number).toLowerCase().includes(q.toLowerCase());
    const matchS = !statusFilter || c.status === statusFilter;
    return matchQ && matchS;
  });

  return (
    <div>
      <div className="topbar">
        <div><h1 className="page-title">Carriers</h1><p className="page-sub">{carriers.length} total</p></div>
        <button className="btn btn-primary" onClick={() => setEditing({ ...BLANK_CARRIER })}>+ Add Carrier</button>
      </div>
      <div className="toolbar">
        <input type="search" placeholder="Search name, lane, MC/CVOR…" value={q} onChange={(e) => setQ(e.target.value)} />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All statuses</option>
          {CARRIER_STATUS.map((s) => <option key={s} value={s}>{label(s)}</option>)}
        </select>
      </div>
      <div className="panel">
        <div className="tbl-wrap">
          <table className="data">
            <thead><tr>
              <th>Name</th><th>Equip</th><th>Trucks</th><th>Lanes</th><th>Home Base</th>
              <th className="num">Min $/mi</th><th>Insurance</th><th>Status</th><th></th>
            </tr></thead>
            <tbody>
              {filtered.length === 0 && <tr><td colSpan="9" className="empty">No carriers. Add one or load sample data.</td></tr>}
              {filtered.map((c) => {
                const days = c.insurance_expiry ? daysBetween(todayISO(), c.insurance_expiry) : null;
                return (
                  <tr key={c.carrier_id}>
                    <td><strong>{c.name}</strong><br /><span className="lane mono" style={{ fontSize: ".72rem", color: "var(--muted)" }}>{c.phone}</span></td>
                    <td>{label(c.equipment_type)}</td>
                    <td className="mono">{c.num_trucks}</td>
                    <td style={{ maxWidth: 160 }}>{c.preferred_lanes || "—"}</td>
                    <td>{c.home_base || "—"}</td>
                    <td className="num">{c.rate_minimum_per_mile ? "$" + Number(c.rate_minimum_per_mile).toFixed(2) : "—"}</td>
                    <td className="mono">
                      {c.insurance_expiry || "—"}
                      {days !== null && days <= 30 && <span className={days <= 7 ? " danger-text" : " warn-text"}> ({days}d)</span>}
                    </td>
                    <td><Badge value={c.status} /></td>
                    <td><div className="row-actions">
                      <button className="link-btn" onClick={() => setEditing({ ...c })}>Edit</button>
                      <button className="link-btn" onClick={() => { if (confirm("Delete " + c.name + "?")) store.deleteCarrier(c.carrier_id); }}>Del</button>
                    </div></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      {editing && <CarrierModal carrier={editing} onClose={() => setEditing(null)}
        onSave={(c) => { store.upsertCarrier(c); setEditing(null); }} />}
    </div>
  );
}

function CarrierModal({ carrier, onSave, onClose }) {
  const [f, setF] = useState(carrier);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const submit = (e) => {
    e.preventDefault();
    if (!f.name.trim()) return alert("Name is required.");
    onSave({ ...f, num_trucks: Number(f.num_trucks) || 1,
      rate_minimum_per_mile: f.rate_minimum_per_mile === "" ? "" : Number(f.rate_minimum_per_mile) });
  };
  return (
    <div className="modal-back" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form className="modal" onSubmit={submit}>
        <h2>{carrier.carrier_id ? "Edit Carrier" : "New Carrier"}</h2>
        <div className="form-grid">
          <div className="field full"><label>Name *</label><input value={f.name} onChange={set("name")} required /></div>
          <div className="field"><label>Phone</label><input value={f.phone} onChange={set("phone")} /></div>
          <div className="field"><label>Email</label><input type="email" value={f.email} onChange={set("email")} /></div>
          <div className="field"><label>MC / CVOR #</label><input value={f.mc_cvor_number} onChange={set("mc_cvor_number")} /></div>
          <div className="field"><label>Equipment</label>
            <select value={f.equipment_type} onChange={set("equipment_type")}>
              {EQUIPMENT.map((x) => <option key={x} value={x}>{label(x)}</option>)}
            </select></div>
          <div className="field"><label># Trucks</label><input type="number" min="1" value={f.num_trucks} onChange={set("num_trucks")} /></div>
          <div className="field"><label>Min $/mile</label><input type="number" step="0.01" value={f.rate_minimum_per_mile} onChange={set("rate_minimum_per_mile")} /></div>
          <div className="field full"><label>Preferred Lanes</label><input value={f.preferred_lanes} onChange={set("preferred_lanes")} placeholder="ON-QC, Toronto-Detroit, GTA local" /></div>
          <div className="field"><label>Home Base</label><input value={f.home_base} onChange={set("home_base")} /></div>
          <div className="field"><label>Insurance Expiry</label><input type="date" value={f.insurance_expiry} onChange={set("insurance_expiry")} /></div>
          <div className="field"><label>Status</label>
            <select value={f.status} onChange={set("status")}>
              {CARRIER_STATUS.map((x) => <option key={x} value={x}>{label(x)}</option>)}
            </select></div>
          <div className="field full"><label>Notes</label><textarea rows="2" value={f.notes} onChange={set("notes")} /></div>
        </div>
        <div className="modal-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary">Save Carrier</button>
        </div>
      </form>
    </div>
  );
}

/* --------------------------------------------------------------- LOADS --- */
function blankLoad(feePct) {
  return {
    load_id: null, source: "loadlink", broker_name: "", broker_contact: "",
    pickup_location: "", pickup_date: todayISO(), delivery_location: "", delivery_date: todayISO(),
    commodity: "", weight: "", equipment_required: "dry_van", gross_rate: "", dispatch_fee: "",
    assigned_carrier_id: null, status: "available", deadhead_miles: "", loaded_miles: "",
    notes: "", _feePct: feePct,
  };
}

function Loads({ store }) {
  const { loads, carriers } = store.state;
  const [editing, setEditing] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const carrierName = (id) => carriers.find((c) => c.carrier_id === id)?.name || "—";

  const filtered = loads
    .filter((l) => !statusFilter || l.status === statusFilter)
    .sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""));

  return (
    <div>
      <div className="topbar">
        <div><h1 className="page-title">Loads</h1><p className="page-sub">{loads.length} total</p></div>
        <button className="btn btn-primary" onClick={() => setEditing(blankLoad(store.state.ui.feePct))}>+ Add Load</button>
      </div>
      <div className="toolbar">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All statuses</option>
          {LOAD_STATUS.map((s) => <option key={s} value={s}>{label(s)}</option>)}
        </select>
        <div className="spacer"></div>
        <span className="page-sub mono">Default fee: {store.state.ui.feePct}% ·
          <input type="number" style={{ width: 60, marginLeft: 6 }} value={store.state.ui.feePct}
                 onChange={(e) => store.setFeePct(e.target.value)} /></span>
      </div>
      <div className="panel">
        <div className="tbl-wrap">
          <table className="data">
            <thead><tr>
              <th>Lane</th><th>Pickup</th><th>Delivery</th><th>Carrier</th><th>Source</th>
              <th className="num">Gross</th><th className="num">Fee</th><th className="num">Net</th>
              <th className="num">$/mi</th><th>Status</th><th></th>
            </tr></thead>
            <tbody>
              {filtered.length === 0 && <tr><td colSpan="11" className="empty">No loads. Add one or load sample data.</td></tr>}
              {filtered.map((l) => {
                const rpm = ratePerMile(l);
                return (
                  <tr key={l.load_id}>
                    <td><strong>{l.pickup_location.split(",")[0] || "?"} → {l.delivery_location.split(",")[0] || "?"}</strong>
                      <br /><span style={{ fontSize: ".72rem", color: "var(--muted)" }}>{l.broker_name}</span></td>
                    <td className="mono">{l.pickup_date}</td>
                    <td className="mono">{l.delivery_date}</td>
                    <td>{carrierName(l.assigned_carrier_id)}</td>
                    <td>{label(l.source)}</td>
                    <td className="num">{money0(l.gross_rate)}</td>
                    <td className="num">{money0(l.dispatch_fee)}</td>
                    <td className="num">{money0(netToCarrier(l))}</td>
                    <td className="num">{rpm ? "$" + rpm.toFixed(2) : "—"}</td>
                    <td><Badge value={l.status} /></td>
                    <td><div className="row-actions">
                      <button className="link-btn" onClick={() => setEditing({ ...l, _feePct: store.state.ui.feePct })}>Edit</button>
                      <button className="link-btn" onClick={() => { if (confirm("Delete this load?")) store.deleteLoad(l.load_id); }}>Del</button>
                    </div></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      {editing && <LoadModal load={editing} carriers={carriers} feePct={store.state.ui.feePct}
        onClose={() => setEditing(null)} onSave={(l) => { store.upsertLoad(l); setEditing(null); }} />}
    </div>
  );
}

function LoadModal({ load, carriers, feePct, onClose, onSave }) {
  const [f, setF] = useState(load);
  // auto-calc dispatch fee from gross when user hasn't manually overridden
  const set = (k) => (e) => {
    const v = e.target.value;
    setF((prev) => {
      const next = { ...prev, [k]: v };
      if (k === "gross_rate") {
        const g = Number(v) || 0;
        next.dispatch_fee = +(g * feePct / 100).toFixed(2);
      }
      return next;
    });
  };
  const net = netToCarrier(f);
  const rpm = ratePerMile(f);
  const submit = (e) => {
    e.preventDefault();
    onSave({
      ...f,
      gross_rate: Number(f.gross_rate) || 0,
      dispatch_fee: Number(f.dispatch_fee) || 0,
      loaded_miles: f.loaded_miles === "" ? "" : Number(f.loaded_miles),
      deadhead_miles: f.deadhead_miles === "" ? "" : Number(f.deadhead_miles),
      assigned_carrier_id: f.assigned_carrier_id || null,
    });
  };
  return (
    <div className="modal-back" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form className="modal" onSubmit={submit}>
        <h2>{load.load_id ? "Edit Load" : "New Load"}</h2>
        <div className="form-grid">
          <div className="field"><label>Source</label>
            <select value={f.source} onChange={set("source")}>{LOAD_SOURCE.map((x) => <option key={x} value={x}>{label(x)}</option>)}</select></div>
          <div className="field"><label>Status</label>
            <select value={f.status} onChange={set("status")}>{LOAD_STATUS.map((x) => <option key={x} value={x}>{label(x)}</option>)}</select></div>
          <div className="field"><label>Broker Name</label><input value={f.broker_name} onChange={set("broker_name")} /></div>
          <div className="field"><label>Broker Contact</label><input value={f.broker_contact} onChange={set("broker_contact")} /></div>
          <div className="field"><label>Pickup Location</label><input value={f.pickup_location} onChange={set("pickup_location")} placeholder="City, ON" /></div>
          <div className="field"><label>Pickup Date</label><input type="date" value={f.pickup_date} onChange={set("pickup_date")} /></div>
          <div className="field"><label>Delivery Location</label><input value={f.delivery_location} onChange={set("delivery_location")} placeholder="City, ON" /></div>
          <div className="field"><label>Delivery Date</label><input type="date" value={f.delivery_date} onChange={set("delivery_date")} /></div>
          <div className="field"><label>Commodity</label><input value={f.commodity} onChange={set("commodity")} /></div>
          <div className="field"><label>Weight</label><input value={f.weight} onChange={set("weight")} placeholder="20,000 lb" /></div>
          <div className="field"><label>Equipment Required</label>
            <select value={f.equipment_required} onChange={set("equipment_required")}>{EQUIPMENT.map((x) => <option key={x} value={x}>{label(x)}</option>)}</select></div>
          <div className="field"><label>Assign Carrier</label>
            <select value={f.assigned_carrier_id || ""} onChange={set("assigned_carrier_id")}>
              <option value="">— Unassigned —</option>
              {carriers.map((c) => <option key={c.carrier_id} value={c.carrier_id}>{c.name}</option>)}
            </select></div>
          <div className="field"><label>Gross Rate ($)</label><input type="number" step="0.01" value={f.gross_rate} onChange={set("gross_rate")} />
            <div className="hint">fee auto-calcs @ {feePct}%</div></div>
          <div className="field"><label>Dispatch Fee ($)</label><input type="number" step="0.01" value={f.dispatch_fee} onChange={set("dispatch_fee")} />
            <div className="hint">net to carrier: {money(net)}</div></div>
          <div className="field"><label>Loaded Miles</label><input type="number" value={f.loaded_miles} onChange={set("loaded_miles")} />
            <div className="hint">{rpm ? "$" + rpm.toFixed(2) + "/mi" : "—"}</div></div>
          <div className="field"><label>Deadhead Miles</label><input type="number" value={f.deadhead_miles} onChange={set("deadhead_miles")} /></div>
          <div className="field full"><label>Notes</label><textarea rows="2" value={f.notes} onChange={set("notes")} /></div>
        </div>
        <div className="modal-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary">Save Load</button>
        </div>
      </form>
    </div>
  );
}

/* ------------------------------------------------------------ INVOICES --- */
function Invoices({ store }) {
  const { invoices, loads, carriers } = store.state;
  const carrierName = (id) => carriers.find((c) => c.carrier_id === id)?.name || "—";
  const [genOpen, setGenOpen] = useState(false);

  return (
    <div>
      <div className="topbar">
        <div><h1 className="page-title">Invoices</h1><p className="page-sub">{invoices.length} total · weekly billing</p></div>
        <button className="btn btn-primary" onClick={() => setGenOpen(true)}>+ Generate Weekly Invoices</button>
      </div>
      <div className="panel">
        <div className="tbl-wrap">
          <table className="data">
            <thead><tr>
              <th>Carrier</th><th>Period</th><th className="num">Loads</th><th className="num">Gross</th>
              <th className="num">Fees Earned</th><th>Due</th><th>Status</th><th></th>
            </tr></thead>
            <tbody>
              {invoices.length === 0 && <tr><td colSpan="8" className="empty">No invoices yet. Generate them for delivered loads.</td></tr>}
              {invoices.slice().sort((a, b) => (b.period_end || "").localeCompare(a.period_end)).map((inv) => (
                <tr key={inv.invoice_id}>
                  <td>{carrierName(inv.carrier_id)}</td>
                  <td className="mono">{inv.period_start} → {inv.period_end}</td>
                  <td className="num">{inv.total_loads}</td>
                  <td className="num">{money(inv.total_gross)}</td>
                  <td className="num ok-text">{money(inv.total_fees_earned)}</td>
                  <td className="mono">{inv.due_date}</td>
                  <td>
                    <select className="badge" value={inv.status}
                      style={{ background: "transparent", color: "inherit", border: "1px solid var(--border)" }}
                      onChange={(e) => store.updateInvoice({ ...inv, status: e.target.value,
                        paid_date: e.target.value === "paid" ? todayISO() : inv.paid_date })}>
                      {INVOICE_STATUS.map((s) => <option key={s} value={s}>{label(s)}</option>)}
                    </select>
                  </td>
                  <td><button className="link-btn" onClick={() => { if (confirm("Delete invoice?")) store.deleteInvoice(inv.invoice_id); }}>Del</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {genOpen && <GenerateInvoicesModal store={store} onClose={() => setGenOpen(false)} />}
    </div>
  );
}

function GenerateInvoicesModal({ store, onClose }) {
  const { loads, carriers } = store.state;
  const monday = weekKey(todayISO());
  const [start, setStart] = useState(monday);
  const [end, setEnd] = useState(addDaysFrom(monday, 6));

  // delivered loads per carrier within range
  const preview = carriers.map((c) => {
    const ls = loads.filter((l) => l.assigned_carrier_id === c.carrier_id && l.status === "delivered"
      && (l.delivery_date || l.created_at) >= start && (l.delivery_date || l.created_at) <= end);
    const gross = ls.reduce((a, l) => a + (Number(l.gross_rate) || 0), 0);
    const fees = ls.reduce((a, l) => a + (Number(l.dispatch_fee) || 0), 0);
    return { carrier: c, loads: ls.length, gross, fees };
  }).filter((p) => p.loads > 0);

  const generate = () => {
    preview.forEach((p) => {
      store.addInvoice({
        carrier_id: p.carrier.carrier_id, period_start: start, period_end: end,
        total_loads: p.loads, total_gross: p.gross, total_fees_earned: p.fees,
        status: "draft", due_date: addDaysFrom(end, 7), paid_date: null, notes: "",
      });
    });
    onClose();
  };

  return (
    <div className="modal-back" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <h2>Generate Weekly Invoices</h2>
        <p className="page-sub">One invoice per carrier with delivered loads in the period.</p>
        <div className="form-grid" style={{ marginTop: 12 }}>
          <div className="field"><label>Period Start</label><input type="date" value={start} onChange={(e) => setStart(e.target.value)} /></div>
          <div className="field"><label>Period End</label><input type="date" value={end} onChange={(e) => setEnd(e.target.value)} /></div>
        </div>
        <div className="tbl-wrap" style={{ marginTop: 16 }}>
          <table className="data">
            <thead><tr><th>Carrier</th><th className="num">Loads</th><th className="num">Gross</th><th className="num">Fees</th></tr></thead>
            <tbody>
              {preview.length === 0 && <tr><td colSpan="4" className="empty">No delivered loads in this period.</td></tr>}
              {preview.map((p) => (
                <tr key={p.carrier.carrier_id}>
                  <td>{p.carrier.name}</td><td className="num">{p.loads}</td>
                  <td className="num">{money(p.gross)}</td><td className="num ok-text">{money(p.fees)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" disabled={preview.length === 0} onClick={generate}>
            Generate {preview.length || ""} Invoice{preview.length === 1 ? "" : "s"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================================================================ APP ==== */
function App() {
  const store = useStore();
  const [tab, setTab] = useState("dashboard");
  return (
    <div className="app">
      <Sidebar tab={tab} setTab={setTab} store={store} />
      <main className="main">
        {tab === "dashboard" && <Dashboard store={store} />}
        {tab === "carriers" && <Carriers store={store} />}
        {tab === "loads" && <Loads store={store} />}
        {tab === "invoices" && <Invoices store={store} />}
      </main>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
