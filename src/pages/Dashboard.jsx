import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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
    --accent-light:   #a78bfa;
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

  html, body {
    font-family: 'Inter', system-ui, sans-serif;
    background: var(--bg);
    color: var(--ink);
    -webkit-font-smoothing: antialiased;
  }

  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }

  @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
  @keyframes spin   { to { transform:rotate(360deg); } }
  @keyframes dot    { 0%,100%{opacity:1} 50%{opacity:.3} }

  .fade  { animation: fadeIn .3s ease both; }
  .f1    { animation: fadeIn .3s .05s ease both; }
  .f2    { animation: fadeIn .3s .10s ease both; }
  .f3    { animation: fadeIn .3s .15s ease both; }
  .f4    { animation: fadeIn .3s .20s ease both; }
  .f5    { animation: fadeIn .3s .25s ease both; }

  .slink         { transition: background .15s, color .15s; cursor: pointer; }
  .slink:hover   { background: var(--sidebar-hover) !important; color: #fff !important; }
  .slink.active  { background: var(--sidebar-active) !important; color: #fff !important; }

  .statcard      { transition: box-shadow .2s; }
  .statcard:hover{ box-shadow: 0 4px 20px rgba(0,0,0,.08) !important; }

  .txrow         { transition: background .12s; }
  .txrow:hover   { background: var(--bg) !important; }

  .badge { display:inline-flex; align-items:center; gap:4px; padding:2px 8px; border-radius:99px; font-size:11px; font-weight:500; }

  .live-dot { width:7px;height:7px;border-radius:50%;background:#10b981;display:inline-block;animation:dot 2s infinite; }
`;

function injectCSS() {
  if (typeof document === "undefined" || document.getElementById("__ent__")) return;
  const s = document.createElement("style");
  s.id = "__ent__"; s.textContent = CSS;
  document.head.appendChild(s);
}

const fmt  = n => new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);
const fmtK = n => n >= 100000 ? `${(n/100000).toFixed(2)}L` : n >= 1000 ? `${(n/1000).toFixed(1)}K` : fmt(n);

const Icon = ({ d, size = 15, color = "currentColor" }) => (
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
  chevron:  "M9 18l6-6-6-6",
  up:       "M18 15l-6-6-6 6",
  down:     "M6 9l6 6 6-6",
  warning:  "M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01",
  income:   "M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6",
};

const NAV_SECTIONS = [
  { label: null, items: [{ to:"/dashboard", label:"Home", icon:"home" }] },
  {
    label: "Track Money",
    items: [
      { to:"/transactions",          label:"Transactions",  icon:"tx"       },
      { to:"/analytics",             label:"Analytics",     icon:"analytics"},
      { to:"/goals",                 label:"My Goals",      icon:"goals"    },
      { to:"/budgets",               label:"My Budgets",    icon:"budget"   },
    ]
  },
  {
    label: "Auto Features",
    items: [
      { to:"/detected-transactions", label:"SMS Detected",  icon:"detect"   },
      { to:"/reminders",             label:"Reminders",     icon:"reminder" },
    ]
  },
];

function Sidebar({ onLogout, pendingCount }) {
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
      <nav style={{ flex:1, overflowY:"auto", padding:"10px 10px" }}>
        {NAV_SECTIONS.map((sec, si) => (
          <div key={si} style={{ marginBottom:6 }}>
            {sec.label && <div style={{ fontSize:10, fontWeight:600, color:"var(--sidebar-muted)", letterSpacing:"1px", textTransform:"uppercase", padding:"8px 8px 4px" }}>{sec.label}</div>}
            {sec.items.map(item => (
              <a key={item.to} href={item.to}
                className={`slink${path===item.to?" active":""}`}
                style={{ display:"flex", alignItems:"center", gap:9, padding:"8px 10px", borderRadius:7, color:"var(--sidebar-text)", fontSize:13, textDecoration:"none", marginBottom:1, justifyContent:"space-between" }}>
                <div style={{ display:"flex", alignItems:"center", gap:9 }}>
                  <Icon d={ICONS[item.icon]} size={14} color="currentColor" />
                  {item.label}
                </div>
                {item.to === "/detected-transactions" && pendingCount > 0 && (
                  <span style={{ background:"#ef4444", color:"#fff", fontSize:10, fontWeight:700, borderRadius:99, padding:"1px 6px", minWidth:18, textAlign:"center" }}>{pendingCount}</span>
                )}
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

function StatCard({ label, value, prefix="₹", sub, change, changeLabel, icon, iconBg, ani }) {
  const pos = change >= 0;
  return (
    <div className={`statcard ${ani}`} style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:10, padding:"18px 20px", boxShadow:"0 1px 4px rgba(0,0,0,.04)" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
        <div style={{ fontSize:12, fontWeight:500, color:"var(--ink3)" }}>{label}</div>
        <div style={{ width:32, height:32, borderRadius:8, background:iconBg||"#f3f4f6", display:"flex", alignItems:"center", justifyContent:"center", fontSize:15 }}>{icon}</div>
      </div>
      <div style={{ fontSize:24, fontWeight:700, color:"var(--ink)", lineHeight:1, marginBottom:6 }}>{prefix}{fmtK(value)}</div>
      {sub && <div style={{ fontSize:11, color:"var(--ink4)" }}>{sub}</div>}
      {change !== undefined && (
        <div style={{ display:"inline-flex", alignItems:"center", gap:3, marginTop:8, fontSize:11, fontWeight:500, color:pos?"var(--green)":"var(--red)" }}>
          <Icon d={pos?ICONS.up:ICONS.down} size={11} color={pos?"var(--green)":"var(--red)"} />
          {Math.abs(change)}% {changeLabel || "vs last month"}
        </div>
      )}
    </div>
  );
}

function Spark({ data, color, h=28, w=70 }) {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data, 1);
  const pts = data.map((v,i)=>`${(i/(data.length-1))*w},${h-(v/max)*h*.8}`).join(" ");
  return (
    <svg width={w} height={h} style={{ overflow:"visible" }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity=".9" />
    </svg>
  );
}

const CAT_EMOJI = { Food:"🍜", Transport:"🚗", Shopping:"🛍️", Entertainment:"🎬", Health:"💊", Utilities:"⚡", Groceries:"🛒", Coffee:"☕", Books:"📚", Bills:"📃", Travel:"✈️", Medicine:"💊", Other:"💳" };
const BAR_COLORS = ["#7c5cbf","#a78bfa","#60a5fa","#34d399","#fb923c"];

const isAutoTx = t => t.is_auto === true || t.is_auto === 1 || t.is_auto === "true" || t.is_auto === "1";

function fmtTxDate(raw) {
  if (!raw) return "—";
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw.trim())) {
    const [y,m,d] = raw.split("-");
    const dt = new Date(+y,+m-1,+d);
    const isToday = dt.toDateString() === new Date().toDateString();
    return isToday ? "Today" : dt.toLocaleDateString("en-IN", { day:"2-digit", month:"short" });
  }
  const utc = (raw.endsWith("Z") || raw.includes("+")) ? raw : raw.replace(" ","T") + "Z";
  return new Date(utc).toLocaleString("en-IN", { day:"2-digit", month:"short", hour:"2-digit", minute:"2-digit", hour12:true });
}

export default function Dashboard() {
  injectCSS();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [loading, setLoading]           = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [suggestions, setSuggestions]   = useState([]);
  const [totalExpense, setTotalExpense] = useState(0);
  const [prediction, setPrediction]     = useState(0);
  const [totalIncome, setTotalIncome]   = useState(0);
  const [savings, setSavings]           = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [budgetRisks, setBudgetRisks]   = useState([]);

  const API = "https://smartspend-backend-aupt.onrender.com";

  useEffect(() => {
    if (!token) { navigate("/", { replace:true }); return; }
    loadAll();
  }, []);

  useEffect(() => {
    const h = () => loadAll();
    window.addEventListener("transaction-confirmed", h);
    return () => window.removeEventListener("transaction-confirmed", h);
  }, []);

  async function loadAll() {
    try { await Promise.all([loadExpenses(), loadSuggestions(), loadBudgetRisks(), loadSummary(), loadPendingCount()]); }
    finally { setLoading(false); }
  }
  async function loadExpenses() {
    const r = await fetch(`${API}/api/expenses/`, { headers:{ Authorization:`Bearer ${token}` } });
    if (!r.ok) { logout(); return; }
    const d = await r.json(); setTransactions(d);
    const tot = d.reduce((s,e)=>s+e.amount,0);
    setTotalExpense(Math.round(tot)); setPrediction(tot*1.12);
  }
  async function loadSuggestions() {
    const r = await fetch(`${API}/api/suggestions/`, { headers:{ Authorization:`Bearer ${token}` } });
    if (r.ok) setSuggestions(await r.json());
  }
  async function loadSummary() {
    const r = await fetch(`${API}/api/summary/`, { headers:{ Authorization:`Bearer ${token}` } });
    if (r.ok) { const d = await r.json(); setTotalIncome(Math.round(d.total_income||0)); setSavings(Math.round(d.savings||0)); }
  }
  async function loadPendingCount() {
    const r = await fetch(`${API}/api/detected/pending/count`, { headers:{ Authorization:`Bearer ${token}` } });
    if (r.ok) { const d = await r.json(); setPendingCount(d.count||0); }
  }
  async function loadBudgetRisks() {
    const r = await fetch(`${API}/api/ai/risk`, { headers:{ Authorization:`Bearer ${token}` } });
    if (r.ok) setBudgetRisks(await r.json());
  }
  async function confirmSuggestion(id) {
    await fetch(`${API}/api/suggestions/${id}/confirm`, { method:"POST", headers:{ Authorization:`Bearer ${token}` } });
    loadAll();
  }
  async function rejectSuggestion(id) {
    await fetch(`${API}/api/suggestions/${id}/reject`, { method:"POST", headers:{ Authorization:`Bearer ${token}` } });
    setSuggestions(suggestions.filter(s=>s.id!==id));
  }
  function logout() { localStorage.removeItem("token"); navigate("/", { replace:true }); }

  const last7 = Array.from({length:7},(_,i)=>{
    const d = new Date(); d.setDate(d.getDate()-(6-i));
    return transactions.filter(t=>t.date?.slice(0,10)===d.toISOString().slice(0,10)).reduce((s,t)=>s+t.amount,0);
  });

  const catMap = {};
  transactions.forEach(t=>{ catMap[t.category]=(catMap[t.category]||0)+t.amount; });
  const topCats = Object.entries(catMap).sort((a,b)=>b[1]-a[1]).slice(0,5);

  const budgets = JSON.parse(localStorage.getItem("budgets")||"[]");
  const alerts = budgets.map(b=>{
    const spent = transactions.filter(e=>e.category===b.category).reduce((s,e)=>s+e.amount,0);
    const p = Math.round((spent/b.limit)*100);
    if (p>=90) return { msg:`${b.category} — ${p}% used`, level:"high", pct:p };
    if (p>=70) return { msg:`${b.category} — ${p}% used`, level:"warn", pct:p };
    return null;
  }).filter(Boolean);

  const recent = [...transactions]
    .sort((a, b) => {
      if (b.id && a.id && b.id !== a.id) return b.id - a.id;
      const da = new Date((a.created_at || a.date || "").replace(" ","T") + (!(a.created_at||"").includes("Z") && !(a.created_at||"").includes("+") ? "Z" : ""));
      const db = new Date((b.created_at || b.date || "").replace(" ","T") + (!(b.created_at||"").includes("Z") && !(b.created_at||"").includes("+") ? "Z" : ""));
      return db - da;
    })
    .slice(0, 8);

  if (loading) return (
    <div style={{ display:"flex", height:"100vh", alignItems:"center", justifyContent:"center", background:"var(--bg)", fontFamily:"Inter,sans-serif" }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ width:28,height:28,border:"2.5px solid var(--border)",borderTopColor:"var(--accent)",borderRadius:"50%",animation:"spin .7s linear infinite",margin:"0 auto 12px" }}/>
        <div style={{ fontSize:12,color:"var(--ink3)" }}>Loading…</div>
      </div>
    </div>
  );

  // Grid columns for dashboard recent tx table
  // icon | category | merchant | amount | date | type
  const TX_COLS = "36px 120px 1fr 90px 160px 80px";

  return (
    <div style={{ display:"flex", minHeight:"100vh" }}>
      <Sidebar onLogout={logout} pendingCount={pendingCount} />

      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
        {/* Header */}
        <div style={{ background:"var(--surface)", borderBottom:"1px solid var(--border)", padding:"16px 28px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <div style={{ fontSize:20, fontWeight:700, color:"var(--ink)" }}>
              {new Date().getHours()<12?"Good morning ☀️":new Date().getHours()<17?"Good afternoon 👋":"Good evening 🌙"}
            </div>
            <div style={{ fontSize:13, color:"var(--ink3)", marginTop:2 }}>Here's where your money stands today</div>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <a href="/add-income" style={{ padding:"8px 16px", borderRadius:7, border:"1px solid var(--border)", background:"var(--surface)", color:"var(--ink2)", fontSize:13, fontWeight:500, textDecoration:"none", display:"flex", alignItems:"center", gap:6 }}>+ Add Income</a>
            <a href="/add-expense" style={{ padding:"8px 16px", borderRadius:7, background:"var(--accent)", border:"none", color:"#fff", fontSize:13, fontWeight:600, textDecoration:"none", display:"flex", alignItems:"center", gap:6 }}>+ Add Expense</a>
          </div>
        </div>

        {/* Pending banner */}
        {pendingCount > 0 && (
          <div style={{ background:"#eff6ff", borderBottom:"1px solid #bfdbfe", padding:"10px 28px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, fontSize:13, color:"var(--blue)" }}>
              <Icon d={ICONS.detect} size={14} color="var(--blue)" />
              <strong>{pendingCount}</strong> payment{pendingCount>1?"s":""} detected from your SMS — confirm or ignore them
            </div>
            <a href="/detected-transactions" style={{ fontSize:12, fontWeight:600, color:"var(--blue)", textDecoration:"none", borderBottom:"1px solid currentColor" }}>Review Now →</a>
          </div>
        )}

        {/* Content */}
        <div style={{ flex:1, overflowY:"auto", padding:"24px 28px", background:"var(--bg)" }}>

          {/* KPI row */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:20 }}>
            <StatCard label="Money received this month" value={totalIncome}            icon="💰" iconBg="#ecfdf5" change={4.2}  ani="f1" />
            <StatCard label="Money spent so far"        value={totalExpense}           icon="💸" iconBg="#faf5ff" change={-2.1} ani="f2" />
            <StatCard
              label="Money left to spend"
              value={Math.abs(savings)}
              prefix={savings<0?"-₹":"₹"}
              sub={savings>=0?"Still in budget 🎉":"You've gone over budget ⚠️"}
              icon={savings>=0?"✅":"⚠️"} iconBg={savings>=0?"#ecfdf5":"#fef2f2"}
              ani="f3"
            />
            <StatCard label="Expected spend by month end" value={Math.round(prediction)} icon="📅" iconBg="#fffbeb" sub="Based on your current pace" ani="f4" />
          </div>

          {/* Main grid */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 320px", gap:16 }}>

            {/* Recent Transactions panel */}
            <div className="f3" style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:10, overflow:"hidden", boxShadow:"0 1px 4px rgba(0,0,0,.04)" }}>
              <div style={{ padding:"14px 20px", borderBottom:"1px solid var(--border)", display:"flex", justifyContent:"space-between", alignItems:"center", background:"var(--surface)" }}>
                <div style={{ fontWeight:600, fontSize:13, color:"var(--ink)" }}>Recent Transactions</div>
                <a href="/transactions" style={{ fontSize:12, color:"var(--accent)", textDecoration:"none", fontWeight:500 }}>View All →</a>
              </div>

              {/* Table header */}
              <div style={{ display:"grid", gridTemplateColumns:TX_COLS, padding:"8px 16px", background:"#f9fafb", borderBottom:"1px solid var(--border)" }}>
                {["","Category","Merchant","Amount","Date & Time","Type"].map(h => (
                  <div key={h} style={{ fontSize:10, fontWeight:600, color:"var(--ink3)", textTransform:"uppercase", letterSpacing:".5px" }}>{h}</div>
                ))}
              </div>

              {recent.length === 0 ? (
                <div style={{ padding:"40px 20px", textAlign:"center", color:"var(--ink3)", fontSize:13 }}>No transactions yet.</div>
              ) : recent.map((t, i) => {
                const auto     = isAutoTx(t);
                const merchant = t.merchant || t.merchant_name || t.description || null;
                const dateStr  = fmtTxDate(t.created_at || t.date);
                return (
                  <div key={i} className="txrow" style={{
                    display:"grid", gridTemplateColumns:TX_COLS,
                    padding:"10px 16px",
                    borderBottom: i < recent.length-1 ? "1px solid var(--border)" : "none",
                    alignItems:"center",
                    borderLeft: `3px solid ${auto ? "var(--blue)" : "transparent"}`,
                  }}>
                    {/* Icon */}
                    <div style={{ width:28, height:28, borderRadius:7, background:auto?"var(--blue-bg)":"#f5f3ff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13 }}>
                      {CAT_EMOJI[t.category] || "💳"}
                    </div>

                    {/* Category */}
                    <div style={{ fontSize:13, fontWeight:600, color:"var(--ink)", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                      {t.category || "—"}
                    </div>

                    {/* Merchant */}
                    <div style={{ fontSize:12, color:"var(--ink3)", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                      {merchant || <span style={{ color:"var(--ink4)", fontStyle:"italic" }}>—</span>}
                    </div>

                    {/* Amount */}
                    <div style={{ fontSize:13, fontWeight:700, color:"var(--ink)" }}>₹{fmt(t.amount)}</div>

                    {/* Date & Time */}
                    <div style={{ fontSize:11, color:"var(--ink3)" }}>{dateStr}</div>

                    {/* Type badge */}
                    <div>
                      <span className="badge" style={{
                        background: auto ? "var(--blue-bg)"  : "#f9fafb",
                        color:      auto ? "var(--blue)"     : "var(--ink3)",
                        border:    `1px solid ${auto ? "#bfdbfe" : "var(--border)"}`,
                        fontSize:10,
                      }}>
                        {auto ? "🤖 Auto" : "✍️ Manual"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right column */}
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>

              {/* Spending breakdown */}
              <div className="f4" style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:10, padding:"16px 18px", boxShadow:"0 1px 4px rgba(0,0,0,.04)" }}>
                <div style={{ fontSize:13, fontWeight:600, color:"var(--ink)", marginBottom:14 }}>Where am I spending? 🤔</div>
                {topCats.length===0 ? (
                  <div style={{ fontSize:12, color:"var(--ink3)" }}>No data yet.</div>
                ) : topCats.map(([cat,amt],i) => {
                  const pct = totalExpense>0?(amt/totalExpense)*100:0;
                  return (
                    <div key={cat} style={{ marginBottom:12 }}>
                      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                        <span style={{ fontSize:12, color:"var(--ink2)" }}>{CAT_EMOJI[cat]||"·"} {cat}</span>
                        <span style={{ fontSize:12, fontWeight:600, color:"var(--ink)" }}>₹{fmtK(amt)}</span>
                      </div>
                      <div style={{ height:5, background:"#f3f4f6", borderRadius:99 }}>
                        <div style={{ height:"100%", width:`${pct}%`, borderRadius:99, background:BAR_COLORS[i]||"var(--accent)", transition:"width .9s ease" }}/>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Budget risks */}
              {budgetRisks.length > 0 && (
                <div className="f4" style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:10, padding:"16px 18px", boxShadow:"0 1px 4px rgba(0,0,0,.04)" }}>
                  <div style={{ fontSize:13, fontWeight:600, color:"var(--ink)", marginBottom:12 }}>Am I overspending anywhere? 📊</div>
                  {budgetRisks.slice(0,3).map((r,i) => {
                    const high = r.risk_level==="HIGH";
                    const med  = r.risk_level==="MEDIUM";
                    const bg   = high?"var(--red-bg)":med?"var(--amber-bg)":"var(--green-bg)";
                    const col  = high?"var(--red)":med?"var(--amber)":"var(--green)";
                    return (
                      <div key={i} style={{ padding:"9px 11px", borderRadius:7, marginBottom:8, background:bg, border:`1px solid ${high?"#fecaca":med?"#fde68a":"#bbf7d0"}` }}>
                        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
                          <span style={{ fontSize:12, fontWeight:600, color:col }}>{r.category}</span>
                          <span className="badge" style={{ background:"transparent", color:col, fontSize:10 }}>{r.risk_level}</span>
                        </div>
                        <div style={{ fontSize:11, color:"var(--ink3)" }}>
                          ₹{fmtK(r.expected_spend)} / ₹{fmtK(r.budget_limit)} · {Math.round(r.probability*100)}% probability
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Alerts */}
              {alerts.length > 0 && (
                <div className="f5" style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:10, padding:"16px 18px", boxShadow:"0 1px 4px rgba(0,0,0,.04)" }}>
                  <div style={{ fontSize:13, fontWeight:600, color:"var(--ink)", marginBottom:10 }}>🔔 Heads up!</div>
                  {alerts.map((a,i) => (
                    <div key={i} style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 0", borderBottom:i<alerts.length-1?"1px solid var(--border)":"none" }}>
                      <Icon d={ICONS.warning} size={13} color={a.level==="high"?"var(--red)":"var(--amber)"} />
                      <span style={{ fontSize:12, color:a.level==="high"?"var(--red)":"var(--amber)" }}>{a.msg}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Suggestions */}
              {suggestions.length > 0 && (
                <div className="f5" style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:10, padding:"16px 18px", boxShadow:"0 1px 4px rgba(0,0,0,.04)" }}>
                  <div style={{ fontSize:13, fontWeight:600, color:"var(--ink)", marginBottom:10 }}>🤖 Quick add — did you forget these?</div>
                  {suggestions.slice(0,2).map(s => (
                    <div key={s.id} style={{ padding:"10px 12px", borderRadius:8, marginBottom:8, border:"1px solid var(--border)" }}>
                      <div style={{ fontSize:12, color:"var(--ink2)", marginBottom:9 }}>
                        Add <strong>₹{fmt(s.suggested_amount)}</strong> for {s.category}?
                      </div>
                      <div style={{ display:"flex", gap:7 }}>
                        <button onClick={()=>confirmSuggestion(s.id)} style={{ flex:1, padding:"6px", borderRadius:6, cursor:"pointer", background:"var(--accent)", border:"none", color:"#fff", fontSize:12, fontWeight:500, fontFamily:"inherit" }}>Confirm</button>
                        <button onClick={()=>rejectSuggestion(s.id)} style={{ flex:1, padding:"6px", borderRadius:6, cursor:"pointer", background:"transparent", border:"1px solid var(--border)", color:"var(--ink3)", fontSize:12, fontFamily:"inherit" }}>Dismiss</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}