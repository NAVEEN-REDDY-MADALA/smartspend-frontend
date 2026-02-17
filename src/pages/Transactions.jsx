import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// ─── Shared design system ─────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --sidebar-bg:     #2d1b69;
    --sidebar-hover:  rgba(255,255,255,0.08);
    --sidebar-active: rgba(255,255,255,0.15);
    --sidebar-text:   rgba(255,255,255,0.75);
    --sidebar-muted:  rgba(255,255,255,0.4);
    --accent:         #7c5cbf;
    --bg:             #f7f7f8;
    --surface:        #ffffff;
    --border:         #e5e7eb;
    --ink:            #111827;
    --ink2:           #374151;
    --ink3:           #6b7280;
    --ink4:           #9ca3af;
    --green:          #059669;
    --green-bg:       #ecfdf5;
    --red:            #dc2626;
    --red-bg:         #fef2f2;
    --amber:          #d97706;
    --amber-bg:       #fffbeb;
    --blue:           #2563eb;
    --blue-bg:        #eff6ff;
  }
  html, body { font-family: 'Inter', system-ui, sans-serif; background: var(--bg); color: var(--ink); -webkit-font-smoothing: antialiased; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }
  @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
  @keyframes spin   { to { transform:rotate(360deg); } }
  @keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:.4} }
  .fade { animation: fadeIn .3s ease both; }
  .f1   { animation: fadeIn .3s .05s ease both; }
  .f2   { animation: fadeIn .3s .10s ease both; }
  .slink       { transition: background .15s, color .15s; cursor: pointer; }
  .slink:hover { background: var(--sidebar-hover) !important; color: #fff !important; }
  .slink.active{ background: var(--sidebar-active) !important; color: #fff !important; }
  .inp { padding:8px 12px; border-radius:7px; border:1px solid var(--border); font-size:13px; font-family:inherit; color:var(--ink); outline:none; background:var(--surface); transition:border-color .15s; }
  .inp:focus { border-color: var(--accent); }
  .txrow { transition: background .12s; }
  .txrow:hover { background: #f9fafb !important; }
  .badge { display:inline-flex; align-items:center; gap:4px; padding:2px 8px; border-radius:99px; font-size:11px; font-weight:500; }
  .pulse { animation: pulse 2s infinite; }
`;

function injectCSS() {
  if (typeof document === "undefined" || document.getElementById("__ent__")) return;
  const s = document.createElement("style"); s.id = "__ent__"; s.textContent = CSS;
  document.head.appendChild(s);
}

const fmt = n => new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);
const isAutoTx = t => t.is_auto === true || t.is_auto === 1 || t.is_auto === "true" || t.is_auto === "1";

const CAT_EMOJI = { Food:"🍜", Transport:"🚗", Shopping:"🛍️", Entertainment:"🎬", Health:"💊", Utilities:"⚡", Groceries:"🛒", Coffee:"☕", Books:"📚", Bills:"📃", Travel:"✈️", Medicine:"💊", Other:"💳" };

// ─── Icon ─────────────────────────────────────────────────────────────────────
const Icon = ({ d, size = 14, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);
const ICONS = {
  home:     "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10",
  tx:       "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",
  analytics:"M18 20V10M12 20V4M6 20v-6",
  goals:    "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
  budget:   "M12 1v22M17 5H9.5a3.5 3.5 0 100 7h5a3.5 3.5 0 110 7H6",
  detect:   "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
  reminder: "M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0",
  logout:   "M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9",
  refresh:  "M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15",
  search:   "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
  x:        "M18 6L6 18M6 6l12 12",
};

// ─── Sidebar ──────────────────────────────────────────────────────────────────
const NAV_SECTIONS = [
  { label: null, items: [{ to:"/dashboard", label:"Home", icon:"home" }] },
  {
    label: "Track Money",
    items: [
      { to:"/transactions", label:"Transactions", icon:"tx"       },
      { to:"/analytics",    label:"Analytics",    icon:"analytics"},
      { to:"/goals",        label:"My Goals",     icon:"goals"    },
      { to:"/budgets",      label:"My Budgets",   icon:"budget"   },
    ]
  },
  {
    label: "Auto Features",
    items: [
      { to:"/detected-transactions", label:"SMS Detected", icon:"detect"   },
      { to:"/reminders",             label:"Reminders",    icon:"reminder" },
    ]
  },
];

function Sidebar({ onLogout }) {
  const path = window.location.pathname;
  return (
    <aside style={{ width:200, flexShrink:0, background:"var(--sidebar-bg)", display:"flex", flexDirection:"column", height:"100vh", position:"sticky", top:0, overflow:"hidden" }}>
      <div style={{ padding:"20px 18px 16px", borderBottom:"1px solid rgba(255,255,255,.08)", display:"flex", alignItems:"center", gap:9 }}>
        <div style={{ width:30, height:30, borderRadius:8, background:"linear-gradient(135deg,#7c5cbf,#a78bfa)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:700, color:"#fff" }}>S</div>
        <div>
          <div style={{ fontSize:14, fontWeight:700, color:"#fff", lineHeight:1 }}>SmartSpend</div>
          <div style={{ fontSize:10, color:"var(--sidebar-muted)", marginTop:2 }}>Student Finance</div>
        </div>
      </div>
      <nav style={{ flex:1, overflowY:"auto", padding:"10px" }}>
        {NAV_SECTIONS.map((sec, si) => (
          <div key={si} style={{ marginBottom:6 }}>
            {sec.label && <div style={{ fontSize:10, fontWeight:600, color:"var(--sidebar-muted)", letterSpacing:"1px", textTransform:"uppercase", padding:"8px 8px 4px" }}>{sec.label}</div>}
            {sec.items.map(item => (
              <a key={item.to} href={item.to}
                className={`slink${path===item.to?" active":""}`}
                style={{ display:"flex", alignItems:"center", gap:9, padding:"8px 10px", borderRadius:7, color:"var(--sidebar-text)", fontSize:13, textDecoration:"none", marginBottom:1 }}>
                <Icon d={ICONS[item.icon]} size={14} />{item.label}
              </a>
            ))}
          </div>
        ))}
      </nav>
      <div style={{ padding:"10px", borderTop:"1px solid rgba(255,255,255,.08)" }}>
        <button onClick={onLogout} className="slink"
          style={{ width:"100%", display:"flex", alignItems:"center", gap:9, padding:"8px 10px", borderRadius:7, background:"transparent", border:"none", color:"var(--sidebar-text)", fontSize:13, cursor:"pointer", fontFamily:"inherit" }}>
          <Icon d={ICONS.logout} size={14} /> Sign Out
        </button>
      </div>
    </aside>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Transactions() {
  injectCSS();
  const navigate   = useNavigate();
  const token      = localStorage.getItem("token");

  const [all, setAll]           = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch]     = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate]         = useState("");
  const [loading, setLoading]   = useState(true);
  const [lastSync, setLastSync] = useState(null);
  const [spinning, setSpinning] = useState(false);

  const CATEGORIES = ["Food","Bills","Shopping","Entertainment","Travel","Medicine","Groceries","Other"];
  const API = "https://smartspend-backend-aupt.onrender.com";

  useEffect(() => {
    if (!token) { navigate("/", { replace:true }); return; }
    load();
    const iv = setInterval(load, 5000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => { applyFilters(); }, [search, category, date, all]);

  async function load() {
    try {
      const r = await fetch(`${API}/api/expenses/`, { headers:{ Authorization:`Bearer ${token}` } });
      if (!r.ok) { localStorage.removeItem("token"); navigate("/", { replace:true }); return; }
      const data = await r.json();
      // Sort by id desc (newest first); fallback to created_at/date
      data.sort((a, b) => {
        if (b.id && a.id && b.id !== a.id) return b.id - a.id;
        const da = new Date((a.created_at || a.date || "").replace(" ","T") + "Z");
        const db = new Date((b.created_at || b.date || "").replace(" ","T") + "Z");
        return db - da;
      });
      setAll(data);
      setLastSync(new Date());
    } finally {
      setLoading(false);
      setSpinning(false);
    }
  }

  function manualRefresh() { setSpinning(true); load(); }

  function applyFilters() {
    let list = [...all];
    if (search)   list = list.filter(t => t.category?.toLowerCase().includes(search.toLowerCase()));
    if (category) list = list.filter(t => t.category === category);
    if (date)     list = list.filter(t => new Date(t.date).toLocaleDateString("en-CA") === date);
    setFiltered(list);
  }

  function clearFilters() { setSearch(""); setCategory(""); setDate(""); }
  const hasFilters = search || category || date;

  function logout() { localStorage.removeItem("token"); navigate("/", { replace:true }); }

  // Stats
  const autoCount   = filtered.filter(isAutoTx).length;
  const manualCount = filtered.length - autoCount;
  const totalAmt    = filtered.reduce((s,t) => s + t.amount, 0);

  if (loading) return (
    <div style={{ display:"flex", height:"100vh", alignItems:"center", justifyContent:"center", background:"var(--bg)" }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ width:28, height:28, border:"2.5px solid var(--border)", borderTopColor:"var(--accent)", borderRadius:"50%", animation:"spin .7s linear infinite", margin:"0 auto 12px" }} />
        <div style={{ fontSize:12, color:"var(--ink3)" }}>Loading your transactions…</div>
      </div>
    </div>
  );

  return (
    <div style={{ display:"flex", minHeight:"100vh" }}>
      <Sidebar onLogout={logout} />

      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>

        {/* Header */}
        <div style={{ background:"var(--surface)", borderBottom:"1px solid var(--border)", padding:"16px 28px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <div style={{ fontSize:20, fontWeight:700, color:"var(--ink)" }}>My Transactions 💸</div>
            <div style={{ fontSize:13, color:"var(--ink3)", marginTop:2 }}>Every rupee you've spent, all in one place</div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            {lastSync && (
              <div style={{ fontSize:11, color:"var(--ink4)", textAlign:"right" }}>
                <span style={{ display:"inline-block", width:6, height:6, borderRadius:"50%", background:"var(--green)", marginRight:5 }} className="pulse" />
                Synced {lastSync.toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit", second:"2-digit" })}
              </div>
            )}
            <button onClick={manualRefresh} style={{
              display:"flex", alignItems:"center", gap:6,
              padding:"7px 14px", borderRadius:7,
              border:"1px solid var(--border)", background:"var(--surface)",
              color:"var(--ink2)", fontSize:12, fontWeight:500,
              cursor:"pointer", fontFamily:"inherit",
            }}>
              <span style={{ display:"inline-block", animation: spinning?"spin .7s linear infinite":"none" }}>
                <Icon d={ICONS.refresh} size={13} />
              </span>
              Refresh
            </button>
          </div>
        </div>

        <div style={{ flex:1, overflowY:"auto", padding:"24px 28px", background:"var(--bg)" }}>

          {/* Stats row */}
          <div className="fade" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, marginBottom:20 }}>
            {[
              { label:"Total transactions shown", val: filtered.length, sub:"matching your filters",   col:"var(--ink)",   bg:"var(--surface)" },
              { label:"Detected from SMS automatically", val: autoCount, sub:"saved you time logging",  col:"var(--blue)",  bg:"var(--blue-bg)"  },
              { label:"Added by you manually",           val: manualCount, sub:"you logged these yourself", col:"var(--amber)", bg:"var(--amber-bg)" },
            ].map(s => (
              <div key={s.label} style={{ background:s.bg, border:"1px solid var(--border)", borderRadius:10, padding:"16px 20px", boxShadow:"0 1px 4px rgba(0,0,0,.04)" }}>
                <div style={{ fontSize:11, fontWeight:600, color:"var(--ink3)", marginBottom:8 }}>{s.label}</div>
                <div style={{ fontSize:26, fontWeight:700, color:s.col, marginBottom:2 }}>{s.val}</div>
                <div style={{ fontSize:11, color:"var(--ink4)" }}>{s.sub}</div>
              </div>
            ))}
          </div>

          {/* Filter bar */}
          <div className="f1" style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:10, padding:"14px 18px", marginBottom:16, display:"flex", gap:10, alignItems:"center", flexWrap:"wrap" }}>
            {/* Search */}
            <div style={{ position:"relative", flex:1, minWidth:160 }}>
              <span style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }}>
                <Icon d={ICONS.search} size={13} color="var(--ink4)" />
              </span>
              <input placeholder="Search by category…" value={search} onChange={e=>setSearch(e.target.value)}
                className="inp" style={{ paddingLeft:30, width:"100%" }} />
            </div>

            {/* Category */}
            <select value={category} onChange={e=>setCategory(e.target.value)} className="inp" style={{ minWidth:150 }}>
              <option value="">All categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            {/* Date */}
            <input type="date" value={date} onChange={e=>setDate(e.target.value)} className="inp" />

            {/* Clear */}
            {hasFilters && (
              <button onClick={clearFilters} style={{
                display:"flex", alignItems:"center", gap:5,
                padding:"8px 12px", borderRadius:7,
                background:"var(--red-bg)", border:"1px solid #fecaca",
                color:"var(--red)", fontSize:12, fontWeight:500,
                cursor:"pointer", fontFamily:"inherit",
              }}>
                <Icon d={ICONS.x} size={12} color="var(--red)" /> Clear filters
              </button>
            )}

            <div style={{ fontSize:11, color:"var(--ink4)", marginLeft:"auto", whiteSpace:"nowrap" }}>
              {filtered.length} of {all.length} shown · Total: ₹{fmt(totalAmt)}
            </div>
          </div>

          {/* Table */}
          <div className="f2" style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:10, overflow:"hidden", boxShadow:"0 1px 4px rgba(0,0,0,.04)" }}>

            {/* Column headers */}
            <div style={{ display:"grid", gridTemplateColumns:"44px 1fr 110px 140px 90px", padding:"8px 20px", background:"#f9fafb", borderBottom:"1px solid var(--border)" }}>
              {["","Category","Amount","Date & Time","Type"].map(h => (
                <div key={h} style={{ fontSize:11, fontWeight:600, color:"var(--ink3)", textTransform:"uppercase", letterSpacing:".5px" }}>{h}</div>
              ))}
            </div>

            {filtered.length === 0 ? (
              <div style={{ padding:"48px 20px", textAlign:"center" }}>
                <div style={{ fontSize:32, marginBottom:8 }}>🔍</div>
                <div style={{ fontSize:14, fontWeight:500, color:"var(--ink2)", marginBottom:4 }}>No transactions found</div>
                <div style={{ fontSize:12, color:"var(--ink3)" }}>
                  {hasFilters ? "Try changing your filters" : "You haven't logged any expenses yet"}
                </div>
                {hasFilters && (
                  <button onClick={clearFilters} style={{ marginTop:12, padding:"7px 16px", borderRadius:7, background:"var(--accent)", border:"none", color:"#fff", fontSize:12, cursor:"pointer", fontFamily:"inherit" }}>
                    Clear all filters
                  </button>
                )}
              </div>
            ) : filtered.map((t, i) => {
              const auto = isAutoTx(t);
              return (
                <div key={t.id||i} className="txrow" style={{
                  display:"grid", gridTemplateColumns:"44px 1fr 110px 140px 90px",
                  padding:"11px 20px", alignItems:"center",
                  borderBottom: i < filtered.length-1 ? "1px solid var(--border)" : "none",
                  borderLeft: `3px solid ${auto ? "var(--blue)" : "transparent"}`,
                }}>
                  {/* Emoji icon */}
                  <div style={{ width:30, height:30, borderRadius:7, background: auto?"var(--blue-bg)":"#f5f3ff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>
                    {CAT_EMOJI[t.category] || "💳"}
                  </div>

                  {/* Category */}
                  <div style={{ fontSize:13, fontWeight:500, color:"var(--ink)" }}>{t.category}</div>

                  {/* Amount */}
                  <div style={{ fontSize:13, fontWeight:600, color:"var(--ink)" }}>₹{fmt(t.amount)}</div>

                  {/* Date */}
                  <div style={{ fontSize:12, color:"var(--ink3)" }}>{t.date?.slice(0,10)}</div>

                  {/* Badge */}
                  <div>
                    <span className="badge" style={{
                      background: auto ? "var(--blue-bg)" : "var(--amber-bg)",
                      color:      auto ? "var(--blue)"   : "var(--amber)",
                      border:    `1px solid ${auto ? "#bfdbfe" : "#fde68a"}`,
                      fontSize:10,
                    }}>
                      {auto ? "🤖 Auto" : "✍️ Manual"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Auto-refresh note */}
          <div style={{ textAlign:"center", marginTop:12, fontSize:11, color:"var(--ink4)", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
            <span className="pulse" style={{ display:"inline-block", width:6, height:6, borderRadius:"50%", background:"var(--green)" }} />
            Automatically updates every 5 seconds — you don't need to refresh manually
          </div>

        </div>
      </div>
    </div>
  );
}