import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// ─── Shared design system (same as Dashboard) ─────────────────────────────────
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
  }
  html, body { font-family: 'Inter', system-ui, sans-serif; background: var(--bg); color: var(--ink); -webkit-font-smoothing: antialiased; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }
  @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
  @keyframes spin   { to { transform:rotate(360deg); } }
  .fade { animation: fadeIn .3s ease both; }
  .f1   { animation: fadeIn .3s .05s ease both; }
  .f2   { animation: fadeIn .3s .10s ease both; }
  .f3   { animation: fadeIn .3s .15s ease both; }
  .slink       { transition: background .15s, color .15s; cursor: pointer; }
  .slink:hover { background: var(--sidebar-hover) !important; color: #fff !important; }
  .slink.active{ background: var(--sidebar-active) !important; color: #fff !important; }
  .inp { width:100%; padding:9px 12px; border-radius:7px; border:1px solid var(--border); font-size:13px; font-family:inherit; color:var(--ink); outline:none; background:var(--surface); transition:border-color .15s; }
  .inp:focus { border-color: var(--accent); }
  .bcard { transition: box-shadow .2s; }
  .bcard:hover { box-shadow: 0 4px 20px rgba(0,0,0,.07) !important; }
`;

function injectCSS() {
  if (typeof document === "undefined" || document.getElementById("__ent__")) return;
  const s = document.createElement("style");
  s.id = "__ent__"; s.textContent = CSS;
  document.head.appendChild(s);
}

const fmt = n => new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);

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
  trash:    "M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6",
  warning:  "M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01",
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
    <aside style={{
      width:200, flexShrink:0, background:"var(--sidebar-bg)",
      display:"flex", flexDirection:"column",
      height:"100vh", position:"sticky", top:0, overflow:"hidden",
    }}>
      {/* Logo */}
      <div style={{ padding:"20px 18px 16px", borderBottom:"1px solid rgba(255,255,255,.08)", display:"flex", alignItems:"center", gap:9 }}>
        <div style={{ width:30, height:30, borderRadius:8, background:"linear-gradient(135deg,#7c5cbf,#a78bfa)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:700, color:"#fff" }}>S</div>
        <div>
          <div style={{ fontSize:14, fontWeight:700, color:"#fff", lineHeight:1 }}>SmartSpend</div>
          <div style={{ fontSize:10, color:"var(--sidebar-muted)", marginTop:2 }}>Student Finance</div>
        </div>
      </div>
      {/* Nav */}
      <nav style={{ flex:1, overflowY:"auto", padding:"10px" }}>
        {NAV_SECTIONS.map((sec, si) => (
          <div key={si} style={{ marginBottom:6 }}>
            {sec.label && (
              <div style={{ fontSize:10, fontWeight:600, color:"var(--sidebar-muted)", letterSpacing:"1px", textTransform:"uppercase", padding:"8px 8px 4px" }}>
                {sec.label}
              </div>
            )}
            {sec.items.map(item => (
              <a key={item.to} href={item.to}
                className={`slink${path===item.to?" active":""}`}
                style={{ display:"flex", alignItems:"center", gap:9, padding:"8px 10px", borderRadius:7, color:"var(--sidebar-text)", fontSize:13, textDecoration:"none", marginBottom:1 }}>
                <Icon d={ICONS[item.icon]} size={14} />
                {item.label}
              </a>
            ))}
          </div>
        ))}
      </nav>
      {/* Sign out */}
      <div style={{ padding:"10px", borderTop:"1px solid rgba(255,255,255,.08)" }}>
        <button onClick={onLogout} className="slink"
          style={{ width:"100%", display:"flex", alignItems:"center", gap:9, padding:"8px 10px", borderRadius:7, background:"transparent", border:"none", color:"var(--sidebar-text)", fontSize:13, cursor:"pointer", fontFamily:"inherit" }}>
          <Icon d={ICONS.logout} size={14} /> Sign Out
        </button>
      </div>
    </aside>
  );
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────
function ProgressBar({ pct }) {
  const color = pct >= 90 ? "var(--red)" : pct >= 70 ? "var(--amber)" : "var(--accent)";
  return (
    <div style={{ height:8, background:"#f3f4f6", borderRadius:99, overflow:"hidden", margin:"10px 0 6px" }}>
      <div style={{ height:"100%", width:`${pct}%`, background:color, borderRadius:99, transition:"width 1s ease" }} />
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Budgets() {
  injectCSS();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [expenses, setExpenses]       = useState([]);
  const [budgetRisks, setBudgetRisks] = useState([]);
  const [budgets, setBudgets]         = useState([]);
  const [category, setCategory]       = useState("");
  const [limit, setLimit]             = useState("");
  const [message, setMessage]         = useState(null); // {text, ok}
  const [loading, setLoading]         = useState(true);

  const CATEGORIES = ["Food","Bills","Shopping","Entertainment","Travel","Medicine","Groceries","Other"];

  const now          = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear  = now.getFullYear();
  const monthLabel   = now.toLocaleString("default", { month:"long", year:"numeric" });

  useEffect(() => {
    if (!token) { navigate("/", { replace:true }); return; }
    loadData();
  }, []);

  async function loadData() {
    try {
      // expenses
      const r = await fetch("https://smartspend-backend-aupt.onrender.com/api/expenses/", {
        headers: { Authorization:`Bearer ${token}` }
      });
      setExpenses(await r.json());

      // budgets from localStorage (current month only)
      const saved = JSON.parse(localStorage.getItem("budgets") || "[]");
      const active = saved.filter(b => b.month === currentMonth && b.year === currentYear);
      localStorage.setItem("budgets", JSON.stringify(active));
      setBudgets(active);

      // AI risks
      const rr = await fetch("https://smartspend-backend-aupt.onrender.com/api/ai/risk", {
        headers: { Authorization:`Bearer ${token}` }
      });
      if (rr.ok) setBudgetRisks(await rr.json());
    } finally {
      setLoading(false);
    }
  }

  function saveBudget(e) {
    e.preventDefault();
    if (budgets.find(b => b.category === category)) {
      setMessage({ text:`You already have a budget for ${category} this month.`, ok:false });
      return;
    }
    const updated = [...budgets, { category, limit:parseFloat(limit), month:currentMonth, year:currentYear }];
    localStorage.setItem("budgets", JSON.stringify(updated));
    setBudgets(updated);
    setMessage({ text:`Budget set for ${category} — you're all set! 🎯`, ok:true });
    setCategory(""); setLimit("");
  }

  function deleteBudget(cat) {
    const updated = budgets.filter(b => b.category !== cat);
    localStorage.setItem("budgets", JSON.stringify(updated));
    setBudgets(updated);
  }

  function spentOn(cat) {
    return expenses.filter(e => e.category === cat).reduce((s, e) => s + e.amount, 0);
  }

  function logout() { localStorage.removeItem("token"); navigate("/", { replace:true }); }

  if (loading) return (
    <div style={{ display:"flex", height:"100vh", alignItems:"center", justifyContent:"center", background:"var(--bg)" }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ width:28, height:28, border:"2.5px solid var(--border)", borderTopColor:"var(--accent)", borderRadius:"50%", animation:"spin .7s linear infinite", margin:"0 auto 12px" }} />
        <div style={{ fontSize:12, color:"var(--ink3)" }}>Loading your budgets…</div>
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
            <div style={{ fontSize:20, fontWeight:700, color:"var(--ink)" }}>My Budgets 📋</div>
            <div style={{ fontSize:13, color:"var(--ink3)", marginTop:2 }}>
              Set spending limits so you don't overspend — {monthLabel}
            </div>
          </div>
        </div>

        <div style={{ flex:1, overflowY:"auto", padding:"24px 28px", background:"var(--bg)" }}>
          <div style={{ display:"grid", gridTemplateColumns:"340px 1fr", gap:20, alignItems:"start" }}>

            {/* ── Left: Add budget form ── */}
            <div className="fade" style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:10, overflow:"hidden", boxShadow:"0 1px 4px rgba(0,0,0,.04)" }}>
              <div style={{ padding:"14px 20px", borderBottom:"1px solid var(--border)", fontWeight:600, fontSize:13, color:"var(--ink)" }}>
                + Set a new spending limit
              </div>
              <div style={{ padding:"20px" }}>
                <form onSubmit={saveBudget}>

                  <div style={{ marginBottom:14 }}>
                    <label style={{ fontSize:12, fontWeight:500, color:"var(--ink2)", display:"block", marginBottom:5 }}>
                      What category? <span style={{ color:"var(--red)" }}>*</span>
                    </label>
                    <select required value={category} onChange={e=>setCategory(e.target.value)} className="inp">
                      <option value="">Pick a category…</option>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <div style={{ marginBottom:18 }}>
                    <label style={{ fontSize:12, fontWeight:500, color:"var(--ink2)", display:"block", marginBottom:5 }}>
                      Max I want to spend (₹) <span style={{ color:"var(--red)" }}>*</span>
                    </label>
                    <input
                      type="number" required min="1"
                      placeholder="e.g. 2000"
                      value={limit} onChange={e=>setLimit(e.target.value)}
                      className="inp"
                    />
                    <div style={{ fontSize:11, color:"var(--ink3)", marginTop:4 }}>
                      This is your limit for the whole month
                    </div>
                  </div>

                  <button type="submit" style={{
                    width:"100%", padding:"10px", borderRadius:7,
                    background:"var(--accent)", border:"none",
                    color:"#fff", fontSize:13, fontWeight:600,
                    cursor:"pointer", fontFamily:"inherit",
                  }}>
                    Save Budget
                  </button>
                </form>

                {message && (
                  <div style={{
                    marginTop:12, padding:"10px 13px", borderRadius:7, fontSize:12,
                    background: message.ok ? "var(--green-bg)" : "var(--red-bg)",
                    color: message.ok ? "var(--green)" : "var(--red)",
                    border:`1px solid ${message.ok ? "#bbf7d0" : "#fecaca"}`,
                  }}>
                    {message.text}
                  </div>
                )}
              </div>
            </div>

            {/* ── Right: Active budgets + AI risks ── */}
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

              {/* AI Risk panel */}
              {budgetRisks.filter(r => budgets.find(b => b.category === r.category)).length > 0 && (
                <div className="f1" style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:10, overflow:"hidden", boxShadow:"0 1px 4px rgba(0,0,0,.04)" }}>
                  <div style={{ padding:"14px 20px", borderBottom:"1px solid var(--border)", fontWeight:600, fontSize:13, color:"var(--ink)" }}>
                    🤖 AI is predicting — will you go over budget?
                  </div>
                  <div style={{ padding:"16px 20px", display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(200px,1fr))", gap:10 }}>
                    {budgetRisks.filter(r => budgets.find(b => b.category === r.category)).map((risk, i) => {
                      const high = risk.risk_level === "HIGH";
                      const med  = risk.risk_level === "MEDIUM";
                      const col  = high ? "var(--red)" : med ? "var(--amber)" : "var(--green)";
                      const bg   = high ? "var(--red-bg)" : med ? "var(--amber-bg)" : "var(--green-bg)";
                      const border = high ? "#fecaca" : med ? "#fde68a" : "#bbf7d0";
                      return (
                        <div key={i} style={{ padding:"12px 14px", borderRadius:8, background:bg, border:`1px solid ${border}` }}>
                          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                            <span style={{ fontSize:13, fontWeight:600, color:col }}>{risk.category}</span>
                            <span style={{ fontSize:10, fontWeight:700, color:col, background:"rgba(0,0,0,.05)", padding:"2px 6px", borderRadius:4 }}>
                              {risk.risk_level}
                            </span>
                          </div>
                          <div style={{ fontSize:12, color:"var(--ink3)" }}>
                            Expected to spend: <strong style={{ color:"var(--ink)" }}>₹{fmt(risk.expected_spend)}</strong>
                          </div>
                          <div style={{ fontSize:12, color:"var(--ink3)" }}>
                            Your limit: ₹{fmt(risk.budget_limit)}
                          </div>
                          <div style={{ fontSize:12, marginTop:4, color:col, fontWeight:500 }}>
                            {Math.round(risk.probability * 100)}% chance of going over
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Active budgets */}
              <div className="f2" style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:10, overflow:"hidden", boxShadow:"0 1px 4px rgba(0,0,0,.04)" }}>
                <div style={{ padding:"14px 20px", borderBottom:"1px solid var(--border)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <div style={{ fontWeight:600, fontSize:13, color:"var(--ink)" }}>
                    Active budgets for {monthLabel}
                  </div>
                  <span style={{ fontSize:12, color:"var(--ink3)" }}>{budgets.length} set</span>
                </div>

                {budgets.length === 0 ? (
                  <div style={{ padding:"40px 20px", textAlign:"center" }}>
                    <div style={{ fontSize:32, marginBottom:8 }}>📋</div>
                    <div style={{ fontSize:14, fontWeight:500, color:"var(--ink2)", marginBottom:4 }}>No budgets set yet</div>
                    <div style={{ fontSize:12, color:"var(--ink3)" }}>Use the form on the left to set your first spending limit!</div>
                  </div>
                ) : (
                  <>
                    {/* Table header */}
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 100px 100px 90px 36px", padding:"8px 20px", background:"#f9fafb", borderBottom:"1px solid var(--border)" }}>
                      {["Category","Limit","Spent","Progress",""].map(h => (
                        <div key={h} style={{ fontSize:11, fontWeight:600, color:"var(--ink3)", textTransform:"uppercase", letterSpacing:".5px" }}>{h}</div>
                      ))}
                    </div>

                    {budgets.map((b, i) => {
                      const used    = spentOn(b.category);
                      const pct     = Math.min(100, Math.round((used / b.limit) * 100));
                      const over    = pct >= 90;
                      const warn    = pct >= 70 && pct < 90;

                      return (
                        <div key={i} className="bcard" style={{
                          display:"grid", gridTemplateColumns:"1fr 100px 100px 90px 36px",
                          padding:"14px 20px", alignItems:"center",
                          borderBottom: i < budgets.length - 1 ? "1px solid var(--border)" : "none",
                          background: over ? "#fff8f8" : "var(--surface)",
                        }}>
                          {/* Category */}
                          <div>
                            <div style={{ fontSize:13, fontWeight:500, color:"var(--ink)" }}>{b.category}</div>
                            {over && <div style={{ fontSize:11, color:"var(--red)", marginTop:2 }}>⚠️ Almost at limit!</div>}
                            {warn && <div style={{ fontSize:11, color:"var(--amber)", marginTop:2 }}>🔔 Getting close</div>}
                          </div>

                          {/* Limit */}
                          <div style={{ fontSize:13, color:"var(--ink2)" }}>₹{fmt(b.limit)}</div>

                          {/* Spent */}
                          <div style={{ fontSize:13, fontWeight:600, color: over?"var(--red)":warn?"var(--amber)":"var(--ink)" }}>
                            ₹{fmt(used)}
                          </div>

                          {/* Progress */}
                          <div>
                            <div style={{ height:6, background:"#f3f4f6", borderRadius:99, overflow:"hidden" }}>
                              <div style={{ height:"100%", width:`${pct}%`, borderRadius:99, transition:"width 1s ease", background: over?"var(--red)":warn?"var(--amber)":"var(--accent)" }} />
                            </div>
                            <div style={{ fontSize:10, color:"var(--ink3)", marginTop:3 }}>{pct}% used</div>
                          </div>

                          {/* Delete */}
                          <button onClick={() => deleteBudget(b.category)} style={{
                            background:"transparent", border:"none", cursor:"pointer",
                            color:"var(--ink4)", padding:4, borderRadius:4,
                            display:"flex", alignItems:"center", justifyContent:"center",
                          }}>
                            <Icon d={ICONS.trash} size={13} />
                          </button>
                        </div>
                      );
                    })}
                  </>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}